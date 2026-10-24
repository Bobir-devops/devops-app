/* cloud.js — bepul bulut sinxron (Firebase) va AI baholash (Gemini). Kalitlar faqat shu qurilmada saqlanadi. */
(function () {
  const FB_VER = '10.12.2';
  const K = { cfg: 'devops-cloud-cfg', key: 'devops-gemini-key', model: 'devops-gemini-model', last: 'devops-cloud-last' };
  const PRIVATE = new Set([K.cfg, K.key, K.model, K.last]);
  const ls = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { if (v == null || v === '') localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} } };
  const listeners = new Set();
  const state = { user: null, status: 'off', msg: '' };
  const emit = () => listeners.forEach((f) => { try { f(Object.assign({}, state)); } catch (e) {} });
  const setS = (o) => { Object.assign(state, o); emit(); };

  function dumpObj() { const o = {}; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (!PRIVATE.has(k) && !/^firebase:/.test(k)) o[k] = localStorage.getItem(k); } } catch (e) {} return o; }
  function dump() { return JSON.stringify({ app: 'devops-yol', v: 1, at: new Date().toISOString(), data: dumpObj() }); }
  function applyData(data) { let n = 0; Object.keys(data || {}).forEach((k) => { if (!PRIVATE.has(k)) { ls.set(k, data[k]); n++; } }); return n; }

  /* ---------- Firebase ---------- */
  let fb = null, lastPushed = '';
  function parseCfg(txt) {
    if (!txt) return null;
    let s = String(txt).trim();
    const m = s.match(/\{[\s\S]*\}/); if (m) s = m[0];
    try { return JSON.parse(s); } catch (e) {}
    try { return JSON.parse(s.replace(/([{,]\s*)([A-Za-z_]\w*)\s*:/g, '$1"$2":').replace(/'/g, '"').replace(/,\s*}/g, '}')); } catch (e) { return null; }
  }
  async function initFb() {
    if (fb) return fb;
    const cfg = parseCfg(ls.get(K.cfg));
    if (!cfg || !cfg.apiKey || !cfg.projectId) { setS({ status: 'off' }); return null; }
    try {
      const base = 'https://www.gstatic.com/firebasejs/' + FB_VER + '/';
      const [appM, authM, fsM] = await Promise.all([import(base + 'firebase-app.js'), import(base + 'firebase-auth.js'), import(base + 'firebase-firestore.js')]);
      const app = appM.getApps().length ? appM.getApp() : appM.initializeApp(cfg);
      const auth = authM.getAuth(app), db = fsM.getFirestore(app);
      fb = { authM, fsM, auth, db };
      authM.onAuthStateChanged(auth, (u) => { setS({ user: u ? { email: u.email, uid: u.uid } : null, status: u ? 'in' : 'out' }); if (u) pull(true); });
      return fb;
    } catch (e) { setS({ status: 'err', msg: 'Firebase yuklanmadi: ' + (e.message || e) }); return null; }
  }
  const errUz = (e) => { const c = (e && e.code) || ''; return ({ 'auth/invalid-email': 'Email noto‘g‘ri.', 'auth/missing-password': 'Parolni kiriting.', 'auth/weak-password': 'Parol kamida 6 belgi bo‘lsin.', 'auth/email-already-in-use': 'Bu email band — “Kirish”ni bosing.', 'auth/invalid-credential': 'Email yoki parol xato.', 'auth/wrong-password': 'Parol xato.', 'auth/user-not-found': 'Bunday foydalanuvchi yo‘q — avval ro‘yxatdan o‘ting.', 'auth/network-request-failed': 'Internet yo‘q.', 'auth/operation-not-allowed': 'Firebase’da Email/Password yoqilmagan.', 'permission-denied': 'Firestore qoidalari ruxsat bermadi.' })[c] || (e && e.message) || String(e); };
  async function signUp(email, pw) { const f = await initFb(); if (!f) throw new Error('Avval Firebase sozlamasini kiriting.'); try { await f.authM.createUserWithEmailAndPassword(f.auth, email, pw); await push(true); } catch (e) { throw new Error(errUz(e)); } }
  async function signIn(email, pw) { const f = await initFb(); if (!f) throw new Error('Avval Firebase sozlamasini kiriting.'); try { await f.authM.signInWithEmailAndPassword(f.auth, email, pw); } catch (e) { throw new Error(errUz(e)); } }
  async function signOut() { if (fb) await fb.authM.signOut(fb.auth); }
  async function push(force) {
    const f = await initFb(); if (!f || !f.auth.currentUser) return false;
    const data = dumpObj(), s = JSON.stringify(data);
    if (!force && s === lastPushed) return false;
    try {
      await f.fsM.setDoc(f.fsM.doc(f.db, 'users', f.auth.currentUser.uid), { data: s, at: Date.now() });
      lastPushed = s; ls.set(K.last, String(Date.now()));
      setS({ msg: '✓ Bulutga saqlandi · ' + new Date().toLocaleTimeString().slice(0, 5) }); return true;
    } catch (e) { setS({ msg: 'Saqlanmadi: ' + errUz(e) }); return false; }
  }
  async function pull(auto) {
    const f = await initFb(); if (!f || !f.auth.currentUser) return false;
    try {
      const snap = await f.fsM.getDoc(f.fsM.doc(f.db, 'users', f.auth.currentUser.uid));
      if (!snap.exists()) { await push(true); return false; }
      const d = snap.data(), localAt = +(ls.get(K.last) || 0);
      if (auto && d.at <= localAt) { lastPushed = JSON.stringify(dumpObj()); return false; }
      const n = applyData(JSON.parse(d.data)); ls.set(K.last, String(d.at)); lastPushed = JSON.stringify(dumpObj());
      setS({ msg: '✓ Bulutdan olindi: ' + n + ' ta yozuv' });
      window.dispatchEvent(new Event('devops-cloud-pulled'));
      return true;
    } catch (e) { setS({ msg: 'Olinmadi: ' + errUz(e) }); return false; }
  }
  setInterval(() => { if (state.status === 'in') push(false); }, 60000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && state.status === 'in') push(false); });

  /* ---------- Gemini ---------- */
  const MODELS = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-2.5-flash'];
  async function ai(prompt, json) {
    const key = ls.get(K.key); if (!key) throw new Error('Gemini kaliti kiritilmagan (Profil → Sozlamalar).');
    const list = [ls.get(K.model)].concat(MODELS).filter((v, i, a) => v && a.indexOf(v) === i);
    let lastErr = '';
    for (const m of list) {
      try {
        const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + m + ':generateContent?key=' + encodeURIComponent(key), {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: Object.assign({ temperature: 0.2 }, json ? { responseMimeType: 'application/json' } : {}) }),
        });
        const j = await r.json();
        if (!r.ok) { lastErr = (j.error && j.error.message) || r.status; if (r.status === 400 && /API key/i.test(lastErr)) break; continue; }
        const t = ((((j.candidates || [])[0] || {}).content || {}).parts || []).map((p) => p.text || '').join('');
        ls.set(K.model, m);
        return t;
      } catch (e) { lastErr = e.message || String(e); }
    }
    throw new Error('AI javob bermadi: ' + lastErr);
  }
  async function gradeSummary(topic, theory, summary) {
    const prompt = 'Sen DevOps o‘qituvchisisan. Talaba quyidagi nazariyani o‘qib, o‘z so‘zi bilan qisqacha xulosa yozdi. ' +
      'Xulosa nazariyaning asosiy g‘oyalarini qanchalik to‘g‘ri va to‘liq qamraganini 0–100 ball bilan bahola (80+ = mavzu o‘zlashtirilgan). ' +
      'Faqat ma’noga qara, imlo xatosiga emas. Noto‘g‘ri fikr bo‘lsa ballni pasaytir. Javobni FAQAT JSON qaytar: ' +
      '{"score": number, "missing": ["yetishmagan asosiy g‘oya", ...] (ko‘pi bilan 4 ta, o‘zbekcha, qisqa), "wrong": ["noto‘g‘ri tushunilgan joy", ...], "feedback": "2-3 jumla o‘zbekcha maslahat"}\n\n' +
      'MAVZU: ' + topic + '\n\nNAZARIYA:\n' + String(theory).slice(0, 9000) + '\n\nTALABA XULOSASI:\n' + summary;
    const t = await ai(prompt, true);
    let j; try { j = JSON.parse(t.replace(/^```(json)?|```$/g, '').trim()); } catch (e) { const m = t.match(/\{[\s\S]*\}/); j = m ? JSON.parse(m[0]) : null; }
    if (!j || typeof j.score !== 'number') throw new Error('AI javobini o‘qib bo‘lmadi.');
    j.score = Math.max(0, Math.min(100, Math.round(j.score)));
    j.missing = Array.isArray(j.missing) ? j.missing.slice(0, 4) : []; j.wrong = Array.isArray(j.wrong) ? j.wrong.slice(0, 3) : [];
    return j;
  }

  const claudeShim = { complete: (p) => ai(typeof p === 'string' ? p : ((p && p.messages) || []).map((m) => (typeof m.content === 'string' ? m.content : '')).join('\n')) };
  try { if (!window.claude) Object.defineProperty(window, 'claude', { configurable: true, get: () => (ls.get(K.key) ? claudeShim : undefined) }); } catch (e) {}
  window.DevopsCloud = {
    K, dump, applyData, parseCfg, initFb, signUp, signIn, signOut, push, pull, ai, gradeSummary,
    hasAI: () => !!ls.get(K.key), hasFb: () => !!parseCfg(ls.get(K.cfg)),
    getCfg: () => ls.get(K.cfg) || '', setCfg: (v) => { ls.set(K.cfg, v); fb = null; return initFb(); },
    getKey: () => ls.get(K.key) || '', setKey: (v) => ls.set(K.key, (v || '').trim()),
    state: () => Object.assign({}, state), on: (f) => { listeners.add(f); return () => listeners.delete(f); },
  };
  const DEFAULT_CFG = '{"apiKey":"AIzaSyDnh1D1fNrh4cgpIxO9-DJVMxQWWHlC4QA","authDomain":"devops-learning-5b45f.firebaseapp.com","projectId":"devops-learning-5b45f","storageBucket":"devops-learning-5b45f.firebasestorage.app","messagingSenderId":"514149358017","appId":"1:514149358017:web:0605ef827a9f01fd6c7740"}';
  if (!ls.get(K.cfg)) ls.set(K.cfg, DEFAULT_CFG);
  if (window.DevopsCloud.hasFb()) initFb();
})();
