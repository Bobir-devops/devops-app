/* gate.js — bosqichma-bosqich ochilish: har bo'lim oxirida test, 100% bo'lmasa keyingisi bloklanadi.
   window.Gate.init({ key, subject, ids }) — ids: theory bo'limlarining tartibdagi ro'yxati. */
(function () {
  const CY = 'oklch(calc(var(--lk) * 0.48 + var(--lb)) 0.11 68)', YE = 'oklch(calc(var(--lk) * 0.52 + var(--lb)) 0.077 40)', GR = 'oklch(calc(var(--lk) * 0.42 + var(--lb)) 0.15 150)', RD = 'oklch(calc(var(--lk) * 0.4 + var(--lb)) 0.19 25)';
  const SG = "Lora,ui-sans-serif,sans-serif", MO = "'IBM Plex Mono',monospace", NR = 'Lora,Georgia,serif';
  const el = (t, css, txt) => { const d = document.createElement(t); if (css) d.style.cssText = css; if (txt != null) d.textContent = txt; return d; };
  const norm = (t) => (t || '').toLowerCase().replace(/[‘’'`´]/g, '').replace(/[^a-z0-9\u0400-\u04ff\/\-\.\s]/g, ' ');
  const stem = (w) => w.slice(0, 5);
  const STOP = new Set(['nima', 'nimani', 'qanday', 'uchun', 'bilan', 'bolsa', 'boladi', 'kerak', 'mumkin', 'emas', 'ham', 'yoki', 'lekin', 'faqat', 'yani', 'degan', 'qiladi', 'qilish', 'qilib', 'boshqa', 'bitta', 'hamma', 'misol', 'masalan', 'birinchi', 'keyin', 'avval', 'holda', 'holat', 'qarab', 'orqali', 'kabi', 'uning', 'osha', 'ozi', 'ular', 'buni', 'hech', 'juda', 'katta', 'kichik', 'farqi', 'farq', 'ikki', 'sabab', 'natija', 'tekshirasiz', 'ishlaydi', 'beradi', 'oladi', 'odatda', 'birga', 'degani', 'deb', 'esa', 'bir', 'bolim', 'linux', 'docker', 'kubernetes']);

  let CFG = null, STATE = null;
  const TABSTATE = {};

  const load = () => { try { return JSON.parse(localStorage.getItem(CFG.key + '-gate') || '{}'); } catch (e) { return {}; } };

  /* qiynalgan joylar — xato javoblar shu yerda to'planadi */
  const weakKey = () => CFG.key + '-weak';
  const weakAll = () => { try { return JSON.parse(localStorage.getItem(weakKey()) || '[]'); } catch (e) { return []; } };
  const weakAdd = (item) => {
    try {
      const list = weakAll();
      const i = list.findIndex((x) => x.qid === item.qid);
      if (i >= 0) { list[i].miss = (list[i].miss || 1) + 1; list[i].at = Date.now(); }
      else list.push(Object.assign({ miss: 1, at: Date.now() }, item));
      localStorage.setItem(weakKey(), JSON.stringify(list));
    } catch (e) {}
  };
  const weakDrop = (qid) => {
    try {
      const list = weakAll().filter((x) => x.qid !== qid);
      localStorage.setItem(weakKey(), JSON.stringify(list));
    } catch (e) {}
  };
  const save = () => { try { localStorage.setItem(CFG.key + '-gate', JSON.stringify(STATE)); } catch (e) {} };

  /* arxitektura yo'nalishidagi savollarga ustunlik */
  const ARCH = ['arxitektura', 'qanday ishlaydi', 'ishlaydi', 'zanjir', "yo'l", 'model', 'komponent', 'qavat', 'tuzilishi', "bog'liq", 'nima uchun', 'farqi', 'orasida', 'mental', 'jarayon', 'nima qiladi', 'vazifasi', 'qaysi', 'oqim', 'tarkibi'];
  const archScore = (q) => {
    const t = norm(q.q);
    let s = 0;
    ARCH.forEach((a) => { if (t.indexOf(norm(a)) >= 0) s += 2; });
    if (/^(qanday|nega|nima uchun)/.test(t)) s += 2;
    return s;
  };

  /* bo'lim sarlavhasidan kalit so'z, shu bo'yicha bankdan savol tanlash */
  function pickQuiz(secEl, subject, used) {
    const bank = (window.DevOpsBank || { questions: [] }).questions.filter((q) => q.subject === subject);
    if (!bank.length) return [];
    const h2 = secEl.querySelector('h2');
    const title = h2 ? h2.textContent : '';
    const tag = (secEl.querySelector('h2') && secEl.querySelector('h2').previousElementSibling) ? secEl.querySelector('h2').previousElementSibling.textContent : '';
    // bo'lim ichidagi kod bloklaridan atamalar
    const codes = Array.from(secEl.querySelectorAll('pre, code')).map((c) => c.textContent).join(' ').slice(0, 1200);
    const keyWords = norm(title + ' ' + title + ' ' + codes).split(/\s+/).filter((w) => w.length >= 4 && !STOP.has(w));
    const kw = {};
    keyWords.forEach((w) => { const k = stem(w); kw[k] = (kw[k] || 0) + 1; });
    const scored = bank.map((q) => {
      const hayWords = norm(q.q + ' ' + q.q + ' ' + q.a).split(/\s+/).map(stem);
      const set = {};
      hayWords.forEach((x) => { set[x] = 1; });
      let sc = 0;
      Object.keys(kw).forEach((k) => { if (set[k]) sc += Math.min(3, kw[k]); });
      return { q: q, sc: sc + archScore(q), taken: !!used[q.qid] };
    });
    const NEED = 5;
    const strong = scored.filter((x) => !x.taken && x.sc >= 3).sort((a, b) => b.sc - a.sc).slice(0, NEED).map((x) => x.q);
    const out = strong.slice();
    if (out.length < NEED) {
      const rest = scored.filter((x) => !x.taken && out.indexOf(x.q) < 0).sort((a, b) => b.sc - a.sc);
      for (let i = 0; i < rest.length && out.length < NEED; i++) out.push(rest[i].q);
    }
    if (out.length < NEED) {
      for (let i = 0; i < bank.length && out.length < NEED; i++) {
        const q = bank[i];
        if (out.indexOf(q) >= 0) continue;
        out.push(q);
      }
    }
    out.forEach((q) => { used[q.qid] = 1; });
    // shu bo'lim uchun arxitektura savollari — majburiy, oldinga qo'yiladi
    const arch = ((window.ArchQ || {})[subject] || {})[secEl.id] || [];
    const archQ = arch.map((a, i) => ({ qid: 'arch-' + secEl.id + '-' + i, q: a.q, a: a.a, arch: true }));
    return archQ.concat(out.slice(0, Math.max(0, NEED - archQ.length)));
  }

  /* urg'u so'zlari — bular tushuncha emas, shuning uchun baholashga kirmaydi */
  const EMPH = new Set(['birinchi', 'ikkinchi', 'uchinchi', 'oxirgi', 'faqat', 'hamma', 'yoq', 'bor', 'emas', 'kerak', 'muhim', 'diqqat', 'eslang', 'lekin', 'shuning', 'aynan', 'bitta', 'ikki', 'uch', 'hech', 'juda', 'yaxshi', 'yomon', 'xavfli', 'ha', 'tez', 'sekin', 'ozi', 'ham', 'yana', 'endi', 'doim', 'katta', 'kichik']);

  function keywords(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const clean = (arr) => arr.filter((t) => {
      const n = norm(t).trim();
      if (!n || n.length < 4) return false;
      if (/^[\d\s.%\/]+$/.test(n)) return false;
      return !n.split(/\s+/).every((w) => EMPH.has(w) || STOP.has(w));
    });
    const bolds = clean(Array.from(tmp.querySelectorAll('strong')).map((b) => b.textContent.trim()));
    const codes = clean(Array.from(tmp.querySelectorAll('code')).map((c) => c.textContent.trim()));
    let core = bolds.concat(codes);
    const bonus = [];
    let soft = false;
    // tushuncha kam bo'lsa — javob matnidan mazmunli so'zlar bilan to'ldiramiz
    if (core.length < 3) {
      soft = true;
      const words = norm(tmp.textContent).split(/\s+/).filter((w) => w.length >= 5 && !STOP.has(w) && !EMPH.has(w));
      const seen = {};
      core.forEach((c) => norm(c).split(/\s+/).forEach((w) => { seen[stem(w)] = 1; }));
      words.forEach((w) => { const k = stem(w); if (!seen[k] && core.length < 6) { seen[k] = 1; core.push(w); } });
    }
    const concepts = [];
    core.slice(0, 8).forEach((c) => {
      const toks = norm(c).split(/\s+/).filter((w) => w.length >= 3 && !STOP.has(w) && !EMPH.has(w)).map(stem);
      if (toks.length) concepts.push(toks);
    });
    return { concepts: concepts, raw: core.slice(0, 8), bonus: bonus, soft: soft };
  }

  /* ---------- mantiqiy baholash (AI mavjud bo'lsa) ---------- */
  function aiFn() {
    try { if (window.claude && window.claude.complete) return window.claude; } catch (e) {}
    try { if (window.parent && window.parent.claude && window.parent.claude.complete) return window.parent.claude; } catch (e) {}
    return null;
  }
  function aiAvailable() { return !!aiFn(); }
  async function aiGrade(q, txt) {
    const ai = aiFn();
    if (!ai) return null;
    const tmp = document.createElement('div');
    tmp.innerHTML = q.a;
    const ref = tmp.textContent.replace(/\s+/g, ' ').trim();
    const prompt = "Siz DevOps suhbatida tajribali intervyuerisiz. Talaba javobini SO'ZLARIGA emas, MANTIQIGA qarab baholang: boshqa so'zlar, rus/ingliz atamalari, qisqa ifoda — mazmun to'g'ri bo'lsa hisoblanadi. Namuna javobdagi har bir muhim g'oyani talaba aytganmi — shuni tekshiring. Noto'g'ri da'vo bo'lsa ballni kamaytiring.\n\n" +
      'SAVOL: ' + q.q + '\n\nNAMUNA JAVOB: ' + ref + '\n\nTALABA JAVOBI: ' + txt + '\n\n' +
      "Faqat JSON qaytaring, boshqa hech narsa yozmang:\n" +
      '{"score": 0-100 butun son, "good": ["to\'g\'ri aytilgan g\'oyalar, qisqa"], "wrong": ["noto\'g\'ri fikrlar va nega xato"], "missing": ["yetmagan muhim g\'oya va uni bir jumlada tushuntirish"], "note": "1-2 jumla umumiy xulosa o\'zbek tilida"}';
    try {
      const raw = await ai.complete(prompt);
      const m = String(raw).match(/\{[\s\S]*\}/);
      if (!m) return null;
      const j = JSON.parse(m[0]);
      const sc = Math.max(0, Math.min(100, Math.round(+j.score || 0)));
      const arr = (x) => (Array.isArray(x) ? x : []).map(String).filter(Boolean).slice(0, 5);
      const good = arr(j.good), miss = arr(j.missing), wrong = arr(j.wrong);
      return { r: sc / 100, ai: true, good: good, miss: miss, wrong: wrong, note: String(j.note || ''), hit: good.length, need: good.length + miss.length, pass: PASS };
    } catch (e) { return null; }
  }

  /* sinonimlar — AI bo'lmaganda ham boshqa so'z bilan yozilgan javob hisoblansin */
  const SYN = [
    ['kernel', 'yadro', 'ядро'], ['xotira', 'memory', 'ram', 'памят'], ['process', 'jarayon', 'процесс', 'protses'],
    ['oldiradi', 'kill', 'toxtatadi', 'ochiradi', 'убива'], ['disk', 'storage', 'xotirada', 'диск'], ['fayl', 'file', 'файл'],
    ['tarmoq', 'network', 'сеть'], ['manzil', 'address', 'adres', 'адрес'], ['ulanish', 'connection', 'boglanish', 'соедин'],
    ['tasdiq', 'ack', 'tasdiqlaydi', 'podtverzh'], ['qayta', 'retransmit', 'retransmission', 'takror'], ['tartib', 'sequence', 'ketma'],
    ['konteyner', 'container', 'контейнер'], ['virtual', 'vm', 'hypervisor', 'gipervizor'], ['huquq', 'permission', 'ruxsat', 'prava'],
    ['xizmat', 'service', 'servis', 'сервис'], ['log', 'jurnal', 'journal'], ['sertifikat', 'certificate', 'cert', 'сертификат'],
    ['node', 'tugun', 'server', 'mashina'], ['boshqaruv', 'control', 'master'], ['tekshiradi', 'check', 'probe', 'proverka'],
    ['ishga', 'start', 'run', 'zapusk', 'boshla'], ['toxta', 'stop', 'chiq', 'exit', 'tugat'], ['qayta', 'restart', 'yana'],
    ['sozlama', 'config', 'konfig', 'nastroy'], ['kalit', 'key', 'secret', 'parol', 'password', 'sir'], ['shifr', 'encrypt', 'tls', 'ssl'],
    ['yuk', 'load', 'nagruz'], ['tez', 'fast', 'speed', 'tezlik'], ['sekin', 'slow', 'latency', 'kechik'], ['xato', 'error', 'oshib', 'fail', 'nosoz'],
    ['javob', 'response', 'otvet'], ['sorov', 'request', 'zapros'], ['paket', 'packet', 'segment'], ['port', 'eshik'],
    ['nusxa', 'replica', 'kopiya', 'copy'], ['ombor', 'registry', 'repo', 'storage'], ['izolyats', 'isolat', 'ajrat'],
    ['resurs', 'resource', 'cpu', 'limit'], ['tarix', 'history', 'commit'], ['yangila', 'update', 'upgrade'], ['qaytar', 'rollback', 'otkat', 'undo'],
    ['taqsim', 'balanc', 'distribut'], ['holat', 'state', 'status', 'sostoyan'], ['kuzat', 'monitor', 'observ', 'watch'],
  ];
  function expandSyn(tokens) {
    const out = Object.assign({}, tokens);
    SYN.forEach((g) => {
      const st = g.map((w) => stem(norm(w).trim()));
      if (st.some((s) => out[s])) st.forEach((s) => { out[s] = 1; });
    });
    return out;
  }

  function grade(html, text) {
    const k = keywords(html);
    const words = norm(text).split(/\s+/).filter(Boolean);
    if (words.length < 3) return { r: 0, miss: k.raw.slice(0, 5), hit: 0, need: k.concepts.length, pass: PASS };
    if (!k.concepts.length) return { r: words.length > 5 ? 1 : 0, miss: [], hit: 0, need: 0, pass: 0 };
    let mineToks = {};
    words.forEach((w) => { mineToks[stem(w)] = 1; });
    mineToks = expandSyn(mineToks);
    const mineList = Object.keys(mineToks);
    const mineRaw = norm(text);
    /* yumshoq moslik: bir xil o'zak, 4 harfli boshlanish yoki biri ikkinchisining ichida */
    const near = (t) => {
      if (mineToks[t]) return true;
      if (t.length >= 4) {
        const p = t.slice(0, 4);
        if (mineList.some((m) => m.length >= 4 && m.slice(0, 4) === p)) return true;
      }
      return mineRaw.indexOf(t) >= 0;
    };
    const hit = [], miss = [];
    k.concepts.forEach((toks, i) => {
      const ok = toks.some(near) || mineRaw.indexOf(toks.join(' ')) >= 0;
      if (ok) hit.push(i); else miss.push(k.raw[i]);
    });
    let hits = hit.length;
    (k.bonus || []).forEach((c) => { const t = norm(c).split(/\s+/).filter(Boolean).map(stem); if (t.some(near)) hits += 0.5; });
    const conceptRatio = Math.min(1, hits / k.concepts.length);
    /* mazmun qamrovi: namuna javobdagi muhim so'zlarning qanchasi javobda bor */
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const refWords = norm(tmp.textContent).split(/\s+/).filter((w) => w.length >= 5 && !STOP.has(w) && !EMPH.has(w));
    const refSet = {};
    refWords.forEach((w) => { refSet[stem(w)] = 1; });
    const refKeys = Object.keys(refSet).slice(0, 24);
    const cov = refKeys.length ? refKeys.filter(near).length / refKeys.length : 0;
    /* to'liq javob odatda asosiy nuqtalarning ~60% ini va muhim so'zlarning ~40% ini o'z so'zi bilan qamraydi */
    const r = Math.min(1, 0.55 * Math.min(1, conceptRatio / 0.45) + 0.45 * Math.min(1, cov / 0.35));
    return { r: Math.round(r * 100) / 100, miss: miss.slice(0, 5), hit: hit.length, need: k.concepts.length, pass: PASS };
  }

  const PASS = 0.34;
  const NEED_PCT = 80; // bo'lim o'rtachasi shu foizdan oshsa keyingi bo'lim ochiladi

  /* yetmagan tushuncha qaysi jumlada tushuntirilgan — o'sha jumlani topib beradi */
  function explain(html, miss) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const text = tmp.textContent.replace(/\s+/g, ' ').trim();
    const sents = text.split(/(?<=[.!?])\s+/).filter((s) => s.length > 15);
    const out = [];
    const usedS = {};
    miss.forEach((m) => {
      const key = norm(m).split(/\s+/).filter(Boolean)[0] || '';
      if (!key) return;
      const hit = sents.find((s, i) => !usedS[i] && norm(s).indexOf(key) >= 0 && (usedS[i] = 1));
      if (hit) out.push({ term: m, why: hit.trim() });
    });
    return out.slice(0, 3);
  }

  /* ---------- test bloki ---------- */
  const secNo = (id) => String(id).replace(/^s/, '');

  /* bo'lim testidan OLDIN — arxitektura tushuntirishi */
  function buildArch(secEl, id, items) {
    if (!items.length || secEl.querySelector('[data-gate-arch]')) return;
    const box = el('div', 'border:1px solid oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.11 68 / 0.4);background:oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.11 68 / 0.025);padding:22px;margin:30px 0 8px');
    box.dataset.gateArch = id;
    box.append(el('div', "font:500 11.5px " + SG + ";letter-spacing:.2em;text-transform:uppercase;color:" + CY, '🏛 Arxitektura — ' + secNo(id) + "-bo'lim"));
    box.append(el('div', "font:400 16px/1.6 " + NR + ";color:rgb(var(--ink-rgb) / 0.9);margin:10px 0 18px;text-wrap:pretty",
      "Level-up suhbatida shu bo'lim bo'yicha eng ko'p so'raladigan ikki arxitektura savoli va ularning javobi. O'qib chiqing — quyidagi testda aynan shular so'raladi."));
    const list = el('div', 'display:flex;flex-direction:column;gap:16px');
    items.forEach((it, i) => {
      const card = el('div', 'border-left:2px solid ' + CY + ';padding:2px 0 2px 16px');
      card.append(el('div', "font:500 16.5px/1.45 " + SG + ";letter-spacing:-.01em;color:var(--ink);margin-bottom:8px", (i + 1) + '. ' + it.q));
      const body = el('div', "font:400 17px/1.68 " + NR + ";color:rgb(var(--ink-rgb) / 1);text-wrap:pretty");
      body.innerHTML = it.a;
      card.appendChild(body);
      list.appendChild(card);
    });
    box.appendChild(list);
    secEl.appendChild(box);
  }

  function buildQuiz(secEl, idx, id, quiz) {
    if (secEl.querySelector('[data-gate-quiz]')) return;
    buildArch(secEl, id, quiz.filter((q) => q.arch));
    const box = el('div', 'border:1px solid ' + YE + ';background:oklch(calc(var(--lk) * 0.6 + var(--lb)) 0.077 40 / 0.025);padding:20px;margin:30px 0 8px');
    box.dataset.gateQuiz = id;
    const head = el('div', 'display:flex;flex-wrap:wrap;gap:12px;align-items:baseline;justify-content:space-between;margin-bottom:6px');
    head.append(el('div', "font:500 11.5px " + SG + ";letter-spacing:.2em;text-transform:uppercase;color:" + YE, '🔐 Bo\'lim testi — ' + secNo(id) + '-bo\'lim'));
    const sc = el('div', "font:500 12.5px " + MO + ";color:rgb(var(--ink-rgb) / 0.78)");
    sc.dataset.gateScore = '1';
    head.appendChild(sc);
    box.appendChild(head);
    box.append(el('div', "font:400 16px/1.6 " + NR + ";color:rgb(var(--ink-rgb) / 0.9);margin-bottom:18px;text-wrap:pretty", "Keyingi bo'lim ochilishi uchun shu " + quiz.length + " savolning o'rtacha bahosi " + NEED_PCT + "% dan oshishi va topshiriqlar bajarilishi kerak. Javobingizni o'z so'zingiz bilan yozing — xato bo'lsa qayeri yetmaganini tushuntiraman."));
    const list = el('div', 'display:flex;flex-direction:column;gap:16px');
    quiz.forEach((q, i) => {
      const row = el('div', 'border-top:1px solid rgb(var(--ink-rgb) / 0.11);padding-top:14px');
      row.dataset.gq = q.qid;
      const top = el('div', 'display:flex;gap:12px;align-items:baseline;margin-bottom:10px');
      const tick = el('span', "font:500 13px " + MO + ";color:rgb(var(--ink-rgb) / 0.58);min-width:18px", (i + 1) + '.');
      tick.dataset.gqTick = '1';
      top.appendChild(tick);
      const qText = el('span', "font:400 17.5px/1.5 " + NR + ";color:var(--ink);flex:1;text-wrap:pretty");
      if (q.arch) {
        const tagEl = el('span', "display:inline-block;font:500 10px " + SG + ";letter-spacing:.16em;text-transform:uppercase;color:" + CY + ";border:1px solid oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.11 68 / 0.4);padding:2px 7px;margin-right:9px;vertical-align:2px", 'arxitektura');
        qText.appendChild(tagEl);
      }
      qText.appendChild(document.createTextNode(q.q));
      top.appendChild(qText);
      row.appendChild(top);
      const ta = el('textarea', "width:100%;box-sizing:border-box;resize:vertical;background:var(--bg);border:1px solid rgb(var(--ink-rgb) / 0.2);color:var(--ink);font:400 15.5px/1.5 " + NR + ";padding:10px 12px;outline:none");
      ta.rows = 2; ta.placeholder = "Javobingizni yozing…";
      ta.dataset.gqInput = '1';
      row.appendChild(ta);
      const ctl = el('div', 'display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding-top:10px');
      const chk = el('button', "background:oklch(calc(var(--lk) * 0.6 + var(--lb)) 0.077 40 / 0.08);border:1px solid oklch(calc(var(--lk) * 0.6 + var(--lb)) 0.077 40 / 0.5);color:" + YE + ";font:500 12.5px " + SG + ";letter-spacing:.04em;padding:8px 14px;cursor:pointer", 'Tekshir');
      chk.type = 'button';
      const verdict = el('span', "font:500 13px " + SG);
      verdict.dataset.gqVerdict = '1';
      ctl.append(chk, verdict);
      row.appendChild(ctl);
      const hint = el('div', "font:400 14.5px/1.55 " + NR + ";color:rgb(var(--ink-rgb) / 0.88);padding-top:8px;display:none");
      hint.dataset.gqHint = '1';
      row.appendChild(hint);
      const ans = el('div', "font:400 16px/1.6 " + NR + ";color:rgb(var(--ink-rgb) / 0.96);padding-top:10px;display:none;text-wrap:pretty");
      ans.innerHTML = q.a;
      ans.dataset.gqAns = '1';
      row.appendChild(ans);
      /* o'z-o'zini tekshirish: tizim noto'g'ri baholasa, namuna bilan solishtirib tasdiqlash */
      const selfBox = el('div', 'display:none;flex-wrap:wrap;gap:8px;align-items:center;padding-top:10px');
      const showRef = el('button', "background:transparent;border:1px solid rgb(var(--ink-rgb) / 0.24);color:rgb(var(--ink-rgb) / 0.9);font:500 12px " + SG + ";letter-spacing:.04em;padding:7px 12px;cursor:pointer", '👁 Namunani ko\'rish');
      showRef.type = 'button';
      const iWasRight = el('button', "display:none;background:oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.07);border:1px solid oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.45);color:" + GR + ";font:500 12px " + SG + ";letter-spacing:.04em;padding:7px 12px;cursor:pointer", '✓ Javobim mazmunan shu edi');
      iWasRight.type = 'button';
      const selfNote = el('span', "font:400 13.5px " + NR + ";color:rgb(var(--ink-rgb) / 0.73)", '');
      selfBox.append(showRef, iWasRight, selfNote);
      row.appendChild(selfBox);
      showRef.onclick = () => {
        ans.style.display = 'block';
        iWasRight.style.display = 'inline-block';
        selfNote.textContent = "Solishtiring: asosiy g'oyalarni aytgan bo'lsangiz — tasdiqlang.";
      };
      iWasRight.onclick = () => {
        STATE[id] = STATE[id] || {};
        const prev = typeof STATE[id][q.qid] === 'number' ? STATE[id][q.qid] : 0;
        STATE[id][q.qid] = Math.max(prev, 85);
        save();
        weakDrop(q.qid);
        tick.textContent = '✓'; tick.style.color = GR;
        verdict.textContent = "✓ Tasdiqlandi (o'zingiz solishtirdingiz)  ·  85%";
        verdict.style.color = GR;
        selfBox.style.display = 'none';
        hint.style.display = 'none';
        refresh();
      };
      chk.onclick = async () => {
        const txt = ta.value.trim();
        if (!txt) { verdict.textContent = 'Avval javob yozing.'; verdict.style.color = 'rgb(var(--ink-rgb) / 0.78)'; return; }
        let g = null;
        if (aiAvailable()) {
          chk.disabled = true;
          verdict.textContent = '⏳ Javobingiz mantiqan tekshirilmoqda…';
          verdict.style.color = 'rgb(var(--ink-rgb) / 0.78)';
          g = await aiGrade(q, txt);
          chk.disabled = false;
        }
        if (!g) g = grade(q.a, txt);
        const pct = Math.round(g.r * 100);
        const ok = pct >= NEED_PCT;
        const half = pct >= Math.round((g.pass || PASS) * 100);
        verdict.textContent = (ok ? "✓ To'liq javob" : half ? '≈ Qismán — ' + NEED_PCT + '% kerak' : '✗ Yetarli emas') + '  ·  ' + pct + '%  ·  ' + (g.hit || 0) + '/' + (g.need || 0) + ' asosiy nuqta';
        verdict.style.color = ok ? GR : half ? YE : RD;
        STATE[id] = STATE[id] || {};
        const prev = typeof STATE[id][q.qid] === 'number' ? STATE[id][q.qid] : 0;
        STATE[id][q.qid] = Math.max(prev, pct);
        save();
        if (ok) { weakDrop(q.qid); } else { weakAdd({ kind: 'q', qid: q.qid, sec: id, q: q.q, a: q.a }); }
        if (g.ai) {
          hint.style.display = 'block';
          const li = (arr, col) => arr.map((x) => '<div style="border-left:2px solid ' + col + ';padding:2px 0 2px 12px;margin-bottom:7px">' + x + '</div>').join('');
          hint.innerHTML =
            '<div style="font:500 11.5px ' + SG + ';letter-spacing:.16em;text-transform:uppercase;color:' + CY + ';margin-bottom:8px">🧠 Mantiqiy tahlil</div>' +
            (g.good.length ? '<div style="font:500 12px ' + SG + ';color:' + GR + ';margin:4px 0 6px">To\'g\'ri aytdingiz</div>' + li(g.good, GR) : '') +
            (g.wrong.length ? '<div style="font:500 12px ' + SG + ';color:' + RD + ';margin:10px 0 6px">Xato fikr</div>' + li(g.wrong, RD) : '') +
            (g.miss.length ? '<div style="font:500 12px ' + SG + ';color:' + YE + ';margin:10px 0 6px">Yetmagan</div>' + li(g.miss, YE) : '') +
            (g.note ? '<div style="font:400 15px/1.6 ' + NR + ';color:rgb(var(--ink-rgb) / 0.96);margin-top:10px">' + g.note + '</div>' : '');
        } else if (!ok && g.miss.length) {
          const why = explain(q.a, g.miss);
          hint.style.display = 'block';
          hint.innerHTML =
            '<div style="font:500 11.5px ' + SG + ';letter-spacing:.16em;text-transform:uppercase;color:' + RD + ';margin-bottom:6px">Xato qayerda</div>' +
            '<div style="margin-bottom:' + (why.length ? '10px' : '0') + '">Javobingizda quyidagi nuqtalar yo\'q: ' +
            g.miss.map((w) => '<span style="font:500 13px ' + MO + ';color:' + CY + '">' + w + '</span>').join(', ') + '</div>' +
            why.map((x) =>
              '<div style="border-left:2px solid ' + YE + ';padding:2px 0 2px 12px;margin-bottom:8px">' +
              '<div style="font:500 12.5px ' + MO + ';color:' + YE + ';margin-bottom:3px">' + x.term + '</div>' +
              '<div style="font:400 15px/1.55 ' + NR + ';color:rgb(var(--ink-rgb) / 0.96)">' + x.why + '</div></div>').join('') +
            '<div style="font:400 14.5px/1.5 ' + NR + ';color:rgb(var(--ink-rgb) / 0.76);padding-top:2px">Shu nuqtalarni qo\'shib qaytadan yozing — ' + NEED_PCT + '% dan oshsa bo\'lim hisobiga kiradi.</div>';
        } else hint.style.display = 'none';
        if (ok) { ans.style.display = 'block'; tick.textContent = '✓'; tick.style.color = GR; selfBox.style.display = 'none'; }
        else { tick.textContent = pct + '%'; tick.style.color = half ? YE : RD; if (!g.ai || pct >= 40) selfBox.style.display = 'flex'; }
        refresh();
      };
      if (STATE[id] && typeof STATE[id][q.qid] === 'number') {
        const p = STATE[id][q.qid];
        const done = p >= NEED_PCT;
        tick.textContent = done ? '✓' : p + '%';
        tick.style.color = done ? GR : p >= 34 ? YE : RD;
        verdict.textContent = (done ? "✓ To'liq javob" : '≈ ' + NEED_PCT + '% kerak') + '  ·  ' + p + '%';
        verdict.style.color = done ? GR : YE;
        if (done) ans.style.display = 'block';
      }
      list.appendChild(row);
    });
    box.appendChild(list);
    buildTasks(box, id);
    const foot = el('div', 'border-top:1px solid rgb(var(--ink-rgb) / 0.11);margin-top:18px;padding-top:14px');
    foot.dataset.gateFoot = '1';
    box.appendChild(foot);
    secEl.appendChild(box);
    buildSecLab(secEl, id);
    buildSecTabs(secEl, id);
  }

  /* ---------- bo'lim ichida tablar: O'qish · Test · Laboratoriya ---------- */
  function flowLoad() { try { return JSON.parse(localStorage.getItem('flow:' + CFG.key) || '{}'); } catch (e) { return {}; } }
  function flowSave(f) { try { localStorage.setItem('flow:' + CFG.key, JSON.stringify(f)); } catch (e) {} }
  function noteGet(id) { try { return (JSON.parse(localStorage.getItem('daftar:' + CFG.subject) || '{}')[id]) || ''; } catch (e) { return ''; } }
  function notePut(id, v) { try { const n = JSON.parse(localStorage.getItem('daftar:' + CFG.subject) || '{}'); if (v.trim()) n[id] = v; else delete n[id]; localStorage.setItem('daftar:' + CFG.subject, JSON.stringify(n)); } catch (e) {} }
  const IVSTOP = new Set(['nima','nimani','qanday','uchun','bilan','bolsa','boladi','kerak','mumkin','emas','yoki','lekin','faqat','qaysi','farqi','farq','qachon','nega','misol','sizning','ishlaydi','qiladi','bormi','qilasiz','tekshirasiz','the','and','for','with','what','how']);
  const ivTok = (t) => String(t || '').replace(/<[^>]+>/g, ' ').toLowerCase().replace(/[‘’'\x60´]/g, '').replace(/[^a-z0-9\/\-\.\s]/g, ' ').split(/\s+/).map((w) => w.replace(/^[\.\-\/]+|[\.\-\/]+$/g, '')).filter((w) => w.length >= 3 && !IVSTOP.has(w)).map((w) => w.slice(0, 6));
  const AFF = { Linux: /linux|ssh|bash|disk|process/i, Networking: /network|dns|tcp|http|tls|nat|ip\b|tarmoq/i, Docker: /docker|artefakt|registry|container/i, Kubernetes: /kubernetes|k8s|helm|☸/i, 'CI/CD': /ci\/cd|ci |git|iac|terraform|ansible|observ|monitor|sre|security|cloud|artefakt|github|gitlab|argo/i };
  function ivPick(id, secText, title, exclude) {
    const pools = [];
    (window.HhQ || []).forEach((x) => pools.push({ src: 'hh.uz', g: x.g, q: x.q, a: x.a, key: x.id }));
    ((window.SuhbatQ || {}).q || []).forEach((x, i) => pools.push({ src: 'Suhbat', g: x.g, q: x.q, a: x.a, key: 'sq' + i }));
    (window.DeepQ || []).forEach((x) => pools.push({ src: 'Chuqur', g: x.g, q: x.q, a: x.a, key: x.id }));
    ((window.DevOpsBank || {}).questions || []).forEach((x) => { if (x.subject === CFG.subject && !exclude[x.qid]) pools.push({ src: 'Savol banki', g: x.subject, q: x.q, a: x.a, key: 'b' + x.qid }); });
    const tw = {}, tt = {}; ivTok(title).forEach((t) => { tw[t] = (tw[t] || 0) + 4; tt[t] = 1; });
    const freq = {}; ivTok(secText).forEach((t) => { freq[t] = (freq[t] || 0) + 1; });
    Object.keys(freq).sort((a, b) => freq[b] - freq[a]).slice(0, 40).forEach((t) => { tw[t] = (tw[t] || 0) + (freq[t] >= 4 ? 2 : 1); });
    const aff = AFF[CFG.subject];
    const scored = pools.map((p) => {
      const qt = ivTok(p.q), at = ivTok(p.a).slice(0, 60);
      let s = 0, th = false; const seen = {};
      qt.forEach((t) => { if (tt[t]) th = true; if (tw[t] && !seen[t]) { s += tw[t] * 1.5; seen[t] = 1; } });
      at.forEach((t) => { if (tw[t] && !seen[t]) { s += tw[t] * 0.4; seen[t] = 1; } });
      if (aff && aff.test(p.g)) s += 2;
      if (p.src === 'hh.uz') s += 1;
      return { p, s, th };
    }).filter((x) => x.s >= 6).sort((a, b) => b.s - a.s);
    const out = [], used = {}, cap = { 'Savol banki': 3, 'hh.uz': 2, Suhbat: 2, Chuqur: 1 }, cnt = {};
    const take = (x) => { const k = x.p.q.toLowerCase().slice(0, 40); if (out.length >= 6 || used[k] || (cnt[x.p.src] || 0) >= cap[x.p.src]) return; used[k] = 1; cnt[x.p.src] = (cnt[x.p.src] || 0) + 1; out.push(x.p); };
    scored.filter((x) => x.p.src !== 'Savol banki' && x.th && x.s >= 9).forEach(take);
    scored.filter((x) => x.p.src === 'Savol banki' || x.th).forEach(take);
    if (out.length < 3) scored.forEach(take);
    const rank = { 'hh.uz': 0, Chuqur: 1, Suhbat: 2, 'Savol banki': 3 };
    return out.sort((a, b) => rank[a.src] - rank[b.src]);
  }

  function keyConcepts(readEl, title) {
    const c = {}, add = (txt, w) => { txt = String(txt || '').replace(/\s+/g, ' ').trim(); if (txt.length < 2 || txt.length > 32 || /[|<>=]/.test(txt) || /^[\d\s.,%−+-]+$/.test(txt)) return; const toks = ivTok(txt); if (!toks.length || toks.length > 4) return; const k = toks.join(' '); if (!c[k]) c[k] = { label: txt, toks, w: 0 }; c[k].w += w; };
    const body = (readEl.textContent || '').toLowerCase().replace(/[‘’'\x60´]/g, '');
    add(title.replace(/\s[—–:-]\s.*$/, '').replace(/[?]/g, ''), 6);
    const G = window['Glossary' + String(CFG.subject).replace(/[^A-Za-z]/g, '')] || {};
    Object.keys(G).forEach((k) => { const kk = k.toLowerCase().replace(/[‘’'\x60´]/g, ''); let n = 0, i = -1; while ((i = body.indexOf(kk, i + 1)) >= 0 && n < 12) n++; if (n) add(k, 1 + n); });
    readEl.querySelectorAll('h3').forEach((h) => add(h.textContent.replace(/[—:(].*$/, ''), 4));
    readEl.querySelectorAll('strong,b,[style*="font-weight:600"],[style*="font-weight: 600"]').forEach((s) => { if (!s.closest('[data-gate-arch],[data-flow-next],button')) add(s.textContent, 2); });
    readEl.querySelectorAll('code').forEach((s) => { if (!s.closest('pre')) add(s.textContent, 1); });
    const freq = (s) => { const k = s.toLowerCase().replace(/[‘’'\x60´]/g, ''); let n = 0, i = -1; while ((i = body.indexOf(k, i + 1)) >= 0 && n < 5) n++; return n; };
    const list = Object.values(c).filter((x) => !/:$/.test(x.label) && (x.w >= 3 || freq(x.label) >= 2)).sort((a, b) => b.w - a.w);
    const out = [];
    list.forEach((x) => { const k = x.toks.join(' '); if (out.length < 7 && !out.some((o) => { const ok = o.toks.join(' '); return ok.indexOf(k) >= 0 || k.indexOf(ok) >= 0; })) out.push(x); });
    return out;
  }
  function coverage(concepts, text) {
    const mine = {}; ivTok(text).forEach((t) => { mine[t] = 1; mine[t.slice(0, 4)] = 1; });
    const raw = String(text || '').toLowerCase().replace(/[‘’'\x60´]/g, '');
    return concepts.map((x) => ({ x, ok: raw.indexOf(x.label.toLowerCase().replace(/[‘’'\x60´]/g, '')) >= 0 || x.toks.filter((t) => mine[t] || mine[t.slice(0, 4)]).length >= Math.ceil(x.toks.length / 2) }));
  }

  function buildSecTabs(secEl, id) {
    if (secEl.querySelector('[data-sec-tabs]')) return;
    const kids = Array.from(secEl.children);
    const h2 = kids.find((k) => k.tagName === 'H2');
    if (!h2) return;
    const head = kids.slice(0, kids.indexOf(h2) + 1);
    const quiz = secEl.querySelector(':scope > [data-gate-quiz]');
    const lab = secEl.querySelector(':scope > [data-gate-lab]');
    if (!quiz) return;
    const P = {};
    ['read', 'note', 'test', 'lab', 'iv'].forEach((k) => { P[k] = el('div'); P[k].dataset.pane = k; });
    kids.forEach((k) => {
      if (head.indexOf(k) >= 0) return;
      if (k === quiz) return;
      else if (k === lab) P.lab.appendChild(k);
      else P.read.appendChild(k);
    });
    const ACC = 'oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.11 68)';
    const btnCss = "margin-top:22px;background:transparent;border:1px solid " + ACC + ";color:var(--acc-ink);font:500 14px " + SG + ";letter-spacing:.02em;padding:12px 18px;min-height:44px;cursor:pointer";
    const STEPS = [['read', 'Nazariya'], ['note', 'Xulosa'], ['test', 'Savollar'], ['lab', 'Laboratoriya'], ['iv', "Qo'shimcha"]].filter((s) => s[0] !== 'lab' || lab);
    const bar = el('div', 'display:grid;grid-template-columns:repeat(' + STEPS.length + ',minmax(0,1fr));gap:4px;margin:6px 0 24px;padding:6px;border:1px solid rgb(var(--ink-rgb) / 0.13);background:var(--bg2);max-width:620px');
    bar.dataset.secTabs = '1';
    const tabs = STEPS.map(([key, label], i) => {
      const b = el('button', "display:flex;flex-direction:column;align-items:center;gap:5px;background:transparent;border:1px solid transparent;color:rgb(var(--ink-rgb) / 0.8);font:500 12px " + SG + ";padding:8px 2px;min-height:56px;cursor:pointer;min-width:0");
      b.type = 'button'; b.dataset.tab = key;
      const dot = el('span', "width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:500 12.5px " + MO + ";border:1px solid rgb(var(--ink-rgb) / 0.3);box-sizing:border-box", String(i + 1));
      dot.dataset.dot = '1';
      const lb = el('span', 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%', label);
      b.append(dot, lb);
      if (key === 'test') { const bd = el('span', "font:500 10.5px " + MO + ";color:rgb(var(--ink-rgb) / 0.63);line-height:1"); bd.dataset.tabBadge = '1'; b.appendChild(bd); }
      return b;
    });
    tabs.forEach((t) => bar.appendChild(t));

    /* 2 — Fikrim */
    P.note.append(
      el('div', "font:500 11.5px " + SG + ";letter-spacing:.2em;text-transform:uppercase;color:var(--acc-ink);margin-bottom:8px", "2-qadam · Qisqacha xulosa"),
      el('div', "font:400 17px/1.6 " + NR + ";color:var(--ink);margin-bottom:12px;text-wrap:pretty", "O'qiganingizni o'z so'zingiz bilan qisqacha yozing. Quyidagi asosiy tushunchalarning kamida 80% i xulosada bo'lishi kerak:"),
    );
    const ol = el('div', 'display:flex;flex-wrap:wrap;gap:6px;margin:0 0 14px');
    const CONC = keyConcepts(P.read, h2.textContent);
    const chips = CONC.map((x) => { const c = el('span', "font:500 13px " + MO + ";padding:4px 10px;border:1px solid rgb(var(--ink-rgb) / 0.25);border-radius:999px;color:rgb(var(--ink-rgb) / 0.75)", x.label); ol.appendChild(c); return c; });
    const covPct = () => { if (!CONC.length) return 100; return Math.round(coverage(CONC, ta.value).filter((r) => r.ok).length / CONC.length * 100); };
    const ta = el('textarea', "width:100%;box-sizing:border-box;min-height:180px;padding:12px 14px;border:1px solid rgb(var(--ink-rgb) / 0.22);background:var(--card);color:var(--ink);font:400 16px/1.6 " + NR + ";border-radius:4px;resize:vertical");
    ta.placeholder = "Mening tushunishimcha…";
    ta.value = noteGet(id);
    const meta = el('div', "display:flex;justify-content:space-between;gap:10px;margin-top:8px;font:500 12px " + MO + ";color:rgb(var(--ink-rgb) / 0.6)");
    const cnt = el('span'), saved = el('span');
    meta.append(cnt, saved);
    const toTest = el('button', btnCss, "Nazariy savollarga o'tish →"); toTest.type = 'button';
    let tt = null;
    const aiScore = () => { const f = flowLoad(); return (f[id] && f[id].ai) || 0; };
    const noteOk = () => ta.value.trim().length >= 40 && (covPct() >= 80 || aiScore() >= 80);
    const paintNote = () => { const cv = coverage(CONC, ta.value); cv.forEach((r, i) => { chips[i].style.borderColor = r.ok ? GR : 'rgb(var(--ink-rgb) / 0.25)'; chips[i].style.color = r.ok ? GR : 'rgb(var(--ink-rgb) / 0.75)'; chips[i].style.background = r.ok ? 'oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.08)' : 'transparent'; }); const p = covPct(), as = aiScore(); cnt.textContent = 'Qamrov: ' + p + '%' + (as ? ' · AI: ' + as : '') + (noteOk() ? ' · yetarli' : ' · kamida 80% kerak'); cnt.style.color = noteOk() ? GR : 'rgb(var(--ink-rgb) / 0.6)'; toTest.disabled = !noteOk(); toTest.style.opacity = noteOk() ? '1' : '.45'; };
    ta.oninput = () => { paintNote(); saved.textContent = ''; clearTimeout(tt); tt = setTimeout(() => { notePut(id, ta.value); saved.textContent = 'saqlandi'; paint(); }, 400); };
    const aiBox = el('div', 'display:none;margin-top:12px;padding:14px 16px;border:1px solid rgb(var(--ink-rgb) / 0.2)');
    const aiBtn = el('button', btnCss.replace('margin-top:22px', 'margin-top:12px'), 'AI bilan tekshirish'); aiBtn.type = 'button';
    aiBtn.style.display = window.DevopsCloud && window.DevopsCloud.hasAI() ? '' : 'none';
    aiBtn.onclick = () => {
      if (ta.value.trim().length < 40) { aiBox.style.display = ''; aiBox.textContent = 'Avval kamida 2–3 jumla yozing.'; return; }
      aiBtn.disabled = true; aiBtn.textContent = 'AI tekshirmoqda…';
      window.DevopsCloud.gradeSummary(h2.textContent, P.read.textContent, ta.value).then((r) => {
        const f = flowLoad(); f[id] = f[id] || {}; f[id].ai = r.score; flowSave(f); notePut(id, ta.value);
        const ok = r.score >= 80, C = ok ? GR : RD0;
        aiBox.style.display = ''; aiBox.style.borderColor = C; aiBox.innerHTML = '';
        aiBox.append(el('div', "font:500 20px 'Cormorant Garamond',Georgia,serif;color:" + C + ';margin-bottom:4px', 'AI bahosi: ' + r.score + '/100' + (ok ? ' — o‘zlashtirilgan' : '')), el('div', "font:400 16px/1.6 " + NR + ';color:var(--ink)', r.feedback || ''));
        if (r.missing.length) aiBox.append(el('div', "font:400 15px/1.6 " + NR + ';color:rgb(var(--ink-rgb) / 0.75);margin-top:6px', 'Yetishmagan: ' + r.missing.join(' · ')));
        if (r.wrong.length) aiBox.append(el('div', "font:400 15px/1.6 " + NR + ';color:' + RD0 + ';margin-top:4px', 'Noto‘g‘ri: ' + r.wrong.join(' · ')));
        paintNote(); paint();
      }, (e) => { aiBox.style.display = ''; aiBox.textContent = e.message; }).then(() => { aiBtn.disabled = false; aiBtn.textContent = 'AI bilan qayta tekshirish'; });
    };
    const RD0 = 'oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.13 30)';
    P.note.append(ol, ta, meta, aiBtn, aiBox, toTest);
    paintNote();

    /* 3 — Test */
    const splitBar = el('div', 'display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:0 0 14px');
    const splitBtn = el('button', "background:transparent;border:1px solid " + ACC + ";color:var(--acc-ink);font:500 13px " + SG + ";padding:9px 14px;min-height:40px;cursor:pointer", "Nazariyani yonida ochish");
    splitBtn.type = 'button';
    splitBar.append(splitBtn);
    const grid = el('div', 'display:block'), aside = el('div', 'display:none'), main = el('div', 'min-width:0');
    main.appendChild(quiz); grid.append(aside, main); P.test.append(splitBar, grid);
    let split = false;
    const layout = () => {
      const wide = window.innerWidth >= 1000;
      if (split) {
        aside.style.cssText = wide ? 'display:block;position:sticky;top:12px;align-self:start;max-height:calc(100vh - 24px);overflow:auto;padding:4px 16px 4px 0;border-right:1px solid rgb(var(--ink-rgb) / 0.13)' : 'display:block;max-height:55vh;overflow:auto;padding:4px 10px;margin-bottom:16px;border:1px solid rgb(var(--ink-rgb) / 0.13);background:var(--bg)';
        grid.style.cssText = wide ? 'display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:24px' : 'display:block';
      } else { aside.style.cssText = 'display:none'; grid.style.cssText = 'display:block'; }
    };
    splitBtn.onclick = () => {
      split = !split;
      if (split && !aside.children.length) { const copy = P.read.cloneNode(true); copy.removeAttribute('data-pane'); copy.style.display = ''; copy.querySelectorAll('[data-flow-next]').forEach((x) => x.remove()); aside.appendChild(copy); }
      splitBtn.textContent = split ? 'Nazariyani yopish' : 'Nazariyani yonida ochish';
      layout();
    };
    window.addEventListener('resize', layout);

    /* 5 — Intervyu */
    const ivState = () => { const f = flowLoad(); return (f[id] && f[id].iv) || {}; };
    let ivBuilt = false;
    const buildIv = () => {
      if (ivBuilt) return; ivBuilt = true;
      P.iv.append(el('div', "font:500 11.5px " + SG + ";letter-spacing:.2em;text-transform:uppercase;color:var(--acc-ink);margin-bottom:8px", "Qo'shimcha · intervyu savollari"),
        el('div', "font:400 16px/1.6 " + NR + ";color:rgb(var(--ink-rgb) / 0.86);margin-bottom:16px;text-wrap:pretty", "hh.uz e'lonlari va suhbatlarda shu mavzuda so'raladigan savollar. Avval ovoz chiqarib javob bering, keyin namunani oching."));
      const ex = {}; (CFG.quiz[id] || []).forEach((q) => { ex[q.qid] = 1; });
      const list = ivPick(id, P.read.textContent.slice(0, 6000), h2.textContent, ex);
      if (!list.length) { P.iv.appendChild(el('div', "font:400 16px " + NR + ";color:rgb(var(--ink-rgb) / 0.7)", "Bu bo'lim uchun alohida intervyu savoli topilmadi.")); return; }
      const st = ivState();
      list.forEach((q, i) => {
        const d = el('details', 'border:1px solid rgb(var(--ink-rgb) / 0.14);background:var(--card);margin:0 0 10px;padding:0');
        const sm = el('summary', "list-style:none;cursor:pointer;padding:14px 16px;display:flex;gap:12px;align-items:flex-start");
        const tick = el('span', "flex:none;font:500 12.5px " + MO + ";color:" + (st[q.key] ? GR : 'rgb(var(--ink-rgb) / 0.55)') + ";min-width:18px;padding-top:3px", st[q.key] ? '✓' : (i + 1) + '.');
        const qq = el('span', "flex:1;font:400 17px/1.5 " + NR + ";color:var(--ink);text-wrap:pretty"); qq.innerHTML = q.q;
        const tag = el('span', "flex:none;font:500 10.5px " + MO + ";letter-spacing:.06em;color:var(--acc-ink);border:1px solid " + ACC + ";padding:2px 7px;margin-top:3px", q.src);
        sm.append(tick, qq, tag);
        const body = el('div', "padding:0 16px 16px 46px;font:400 16px/1.65 " + NR + ";color:rgb(var(--ink-rgb) / 0.9)");
        const ans = el('div'); ans.innerHTML = q.a; ans.querySelectorAll('*').forEach((z) => { if (z.style) { z.style.color = ''; z.style.background = ''; } });
        const ok = el('button', "margin-top:12px;background:transparent;border:1px solid " + ACC + ";color:var(--acc-ink);font:500 13px " + SG + ";padding:8px 14px;min-height:40px;cursor:pointer", st[q.key] ? 'Tayyorman ✓' : 'Javob bera olaman');
        ok.type = 'button';
        ok.onclick = () => { const f = flowLoad(); f[id] = f[id] || {}; f[id].iv = f[id].iv || {}; f[id].iv[q.key] = 1; flowSave(f); tick.textContent = '✓'; tick.style.color = GR; ok.textContent = 'Tayyorman ✓'; paint(); };
        body.append(ans, ok);
        d.append(sm, body);
        P.iv.appendChild(d);
      });
      P.iv.dataset.total = String(list.length);
    };

    const fl = () => flowLoad()[id] || {};
    const done = {
      read: () => !!fl().read,
      note: () => noteOk(),
      test: () => { const s = secStat(id); return s.quizN > 0 && s.answered >= s.quizN && s.avg >= NEED_PCT; },
      lab: () => { const s = secStat(id); return s.taskDone >= s.taskNeed; },
      iv: () => Object.keys(fl().iv || {}).length >= 3,
    };
    const order = STEPS.map((s) => s[0]);
    const unlocked = (key) => { const k = order.indexOf(key); for (let i = 0; i < k; i++) if (!done[order[i]]()) return false; return true; };
    const lockPane = el('div', 'border:1px dashed rgb(var(--ink-rgb) / 0.3);padding:22px;font:400 17px/1.6 ' + NR + ';color:var(--ink)');
    const LABEL = { read: 'Nazariya', note: 'Xulosa', test: 'Savollar', lab: 'Laboratoriya', iv: "Qo'shimcha" };
    const NEED = { read: "nazariyani o'qib, “O'qib bo'ldim” tugmasini bosing", note: "qisqacha xulosa yozing — asosiy tushunchalarning kamida 80% i bo'lsin", test: "nazariy savollardan o'rtacha kamida 80% bilan o'ting", lab: "laboratoriya topshiriqlarini bajaring" };
    let cur = null;
    const show = (key) => {
      cur = key;
      const open = unlocked(key);
      order.forEach((k) => { P[k].style.display = k === key && open ? '' : 'none'; });
      lockPane.style.display = open ? 'none' : '';
      if (!open) {
        lockPane.innerHTML = '';
        const firstTodo = order.find((k) => !done[k]());
        lockPane.append(el('div', "font:500 11.5px " + SG + ";letter-spacing:.2em;text-transform:uppercase;color:var(--acc-ink);margin-bottom:6px", LABEL[key] + ' hali yopiq'), el('div', null, 'Avval ' + NEED[firstTodo] + '.'));
        const go = el('button', btnCss, LABEL[firstTodo] + 'ga o\u2018tish →'); go.type = 'button'; go.onclick = () => jump(firstTodo);
        lockPane.appendChild(go);
      }
      if (key === 'iv' && open) buildIv();
      TABSTATE[id] = key;
      paint();
    };
    const jump = (k) => { show(k); const y = secEl.getBoundingClientRect().top + window.scrollY - 60; window.scrollTo(0, y); };
    const paint = () => {
      tabs.forEach((t) => {
        const k = t.dataset.tab, on = k === cur, ok = done[k](), op = unlocked(k);
        t.style.background = on ? 'oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.11 68 / 0.08)' : 'transparent';
        t.style.borderColor = on ? ACC : 'transparent';
        t.style.color = on ? 'var(--ink)' : 'rgb(var(--ink-rgb) / 0.8)';
        t.style.opacity = op ? '1' : '.5';
        const d = t.querySelector('[data-dot]');
        d.textContent = ok ? '✓' : String(order.indexOf(k) + 1);
        d.style.background = ok ? ACC : 'transparent';
        d.style.color = ok ? 'var(--bg)' : on ? 'var(--acc-ink)' : 'rgb(var(--ink-rgb) / 0.7)';
        d.style.borderColor = ok || on ? ACC : 'rgb(var(--ink-rgb) / 0.3)';
      });
    };
    secEl._flowPaint = paint;
    tabs.forEach((t) => { t.onclick = () => jump(t.dataset.tab); });
    const readBtn = el('button', btnCss, "O'qib bo'ldim → Xulosa yozish"); readBtn.type = 'button'; readBtn.dataset.flowNext = '1';
    readBtn.onclick = () => { const f = flowLoad(); f[id] = f[id] || {}; f[id].read = 1; flowSave(f); jump('note'); };
    P.read.appendChild(readBtn);
    toTest.onclick = () => { if (noteOk()) { notePut(id, ta.value); jump('test'); } };
    const nx = (from, to, label) => { const n = el('button', btnCss, label); n.type = 'button'; n.onclick = () => jump(to); P[from].appendChild(n); return n; };
    const REALLAB = {"Linux":["Killercoda · Ubuntu","https://killercoda.com/playgrounds/scenario/ubuntu"],"Networking":["Killercoda · Ubuntu","https://killercoda.com/playgrounds/scenario/ubuntu"],"Docker":["Play with Docker","https://labs.play-with-docker.com/"],"Kubernetes":["Killercoda · Kubernetes","https://killercoda.com/playgrounds/scenario/kubernetes"],"CI/CD":["Killercoda · Ubuntu","https://killercoda.com/playgrounds/scenario/ubuntu"]}[CFG.subject];
    if (lab && REALLAB) { const rl = el('a', "display:inline-block;margin-top:16px;font:400 16px " + NR + ";color:var(--acc-ink)", 'Haqiqiy serverda bepul takrorlang: ' + REALLAB[0] + ' ↗'); rl.href = REALLAB[1]; rl.target = '_blank'; rl.rel = 'noopener'; P.lab.appendChild(rl); }
    if (lab) { nx('test', 'lab', 'Laboratoriyaga o\u2018tish →'); nx('lab', 'iv', "Qo'shimchaga o'tish →"); }
    else nx('test', 'iv', "Qo'shimchaga o'tish →");
    h2.insertAdjacentElement('afterend', bar);
    let prev = bar;
    [lockPane].concat(order.map((k) => P[k])).forEach((p) => { prev.insertAdjacentElement('afterend', p); prev = p; });
    secEl._tab = (k) => show(k === 'read' || k === 'test' || k === 'lab' ? k : 'read');
    const firstTodo = order.find((k) => !done[k]()) || 'read';
    show(TABSTATE[id] && unlocked(TABSTATE[id]) ? TABSTATE[id] : firstTodo);
  }

  /* ---------- bo'lim terminal mashqi ---------- */
  function secLabSpec(id) {
    const all = (window.SectionLabs || {})[CFG.subject] || {};
    return all[id] || null;
  }

  function buildSecLab(box, id) {
    const spec = secLabSpec(id);
    const engine = window.LinuxLab || window.NetLab || window.DockerLab || window.K8sLab || window.CicdLab;
    if (!spec || !engine || !engine.mountSpec) return;
    if (box.querySelector('[data-gate-lab]')) return;
    const list = secLabTasks(id);
    const idx = CFG.ids.indexOf(id);
    const wrap = el('div', 'border:1px solid ' + GR + ';background:oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.02);padding:20px;margin:18px 0 8px');
    wrap.dataset.gateLab = id;
    wrap.append(el('div', "font:500 11.5px " + SG + ";letter-spacing:.2em;text-transform:uppercase;color:" + GR, '▶ Laboratoriya — ' + spec.title));
    wrap.append(el('div', "font:400 16px/1.6 " + NR + ";color:rgb(var(--ink-rgb) / 0.9);margin:8px 0 14px;text-wrap:pretty", idx > 0
      ? "Haqiqiy buyruqlarni yozib ishlating. Vazifalar shu bo'lim va avvalgi bo'limlar materialidan — hammasi bajarilmaguncha keyingi bo'lim ochilmaydi."
      : "Haqiqiy buyruqlarni yozib ishlating — tizim javob beradi va vazifalarni o'zi tekshiradi. Bu mashq ham qulfga hisoblanadi."));
    const host = el('div');
    wrap.appendChild(host);
    box.appendChild(wrap);
    const labId = id + '-lab';
    const tasks = list.map((tk, i) => ({
      t: (tk.from ? '[' + tk.from + "-bo'lim] " : '') + tk.t.replace(/`/g, ''),
      hint: tk.hint,
      v: (b, h) => {
        const ok = h.some((x) => tk.re.test(x));
        if (ok && !(STATE[id] && STATE[id][labId + i])) { STATE[id] = STATE[id] || {}; STATE[id][labId + i] = 1; save(); setTimeout(refresh, 0); }
        return ok || !!(STATE[id] && STATE[id][labId + i]);
      },
    }));
    engine.mountSpec(host, { title: spec.title, section: spec.section, init: spec.init, tasks: tasks });
  }

  /* shu bo'lim + avvalgi bo'limlardan takrorlash vazifalari */
  function secLabTasks(id) {
    const spec = secLabSpec(id);
    if (!spec) return [];
    const cur = spec.tasks.slice(0, 3).map((t) => ({ t: t.t, re: t.re, hint: t.hint, from: null }));
    const idx = CFG.ids.indexOf(id);
    if (idx <= 0) return cur;
    const prev = [];
    const earlier = CFG.ids.slice(0, idx);
    // oxirgi 3 ta avvalgi bo'limdan bittadan vazifa
    earlier.slice(-3).forEach((pid) => {
      const ps = secLabSpec(pid);
      if (!ps || !ps.tasks.length) return;
      const pick = ps.tasks[idx % ps.tasks.length] || ps.tasks[0];
      prev.push({ t: pick.t, re: pick.re, hint: pick.hint, from: pid.replace('s', '') });
    });
    return cur.concat(prev).slice(0, 6);
  }

  const secLabCount = (id) => secLabTasks(id).length;

  /* ---------- CKA uslubidagi amaliy topshiriqlar ---------- */
  function tasksFor(id) {
    const all = (window.CkaTasks || {})[CFG.subject] || [];
    return all.filter((t) => t.sec === id);
  }

  function buildTasks(box, id) {
    const tasks = tasksFor(id);
    if (!tasks.length) return;
    const wrap = el('div', 'border-top:1px solid rgb(var(--ink-rgb) / 0.13);margin-top:20px;padding-top:16px');
    wrap.append(el('div', "font:500 11.5px " + SG + ";letter-spacing:.2em;text-transform:uppercase;color:" + CY, '⌨ Amaliy topshiriq — CKA uslubida'));
    wrap.append(el('div', "font:400 15.5px/1.55 " + NR + ";color:rgb(var(--ink-rgb) / 0.84);margin:8px 0 14px;text-wrap:pretty", "Buyruqni yozib tekshiring — tizim sintaksisni solishtiradi. Bu topshiriqlar ham qulfga hisoblanadi."));
    const list = el('div', 'display:flex;flex-direction:column;gap:14px');
    tasks.forEach((tk, i) => {
      const tid = id + '-t' + i;
      const row = el('div', 'border-top:1px solid rgb(var(--ink-rgb) / 0.09);padding-top:12px');
      row.dataset.gt = tid;
      const top = el('div', 'display:flex;gap:12px;align-items:baseline;margin-bottom:9px');
      const tick = el('span', "font:500 13px " + MO + ";color:rgb(var(--ink-rgb) / 0.58);min-width:18px", '⌨');
      tick.dataset.gtTick = '1';
      top.appendChild(tick);
      const qt = el('span', "font:400 16.5px/1.5 " + NR + ";color:var(--ink);flex:1;text-wrap:pretty");
      qt.innerHTML = tk.t.replace(/`([^`]+)`/g, '<code style="font:500 14.5px ' + MO + ';color:' + CY + '">$1</code>');
      top.appendChild(qt);
      row.appendChild(top);
      const line = el('div', 'display:flex;gap:8px;align-items:center');
      line.append(el('span', "font:500 13px " + MO + ";color:" + GR, '$'));
      const inp = el('input', "flex:1 1 180px;background:var(--bg);border:1px solid rgb(var(--ink-rgb) / 0.2);color:var(--ink);font:400 13.5px " + MO + ";padding:9px 11px;outline:none");
      inp.type = 'text';
      inp.placeholder = 'buyruqni yozing…';
      inp.dataset.gtInput = '1';
      line.appendChild(inp);
      row.appendChild(line);
      const ctl = el('div', 'display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding-top:9px');
      const chk = el('button', "background:oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.11 68 / 0.07);border:1px solid oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.11 68 / 0.45);color:" + CY + ";font:500 12.5px " + SG + ";letter-spacing:.04em;padding:8px 14px;cursor:pointer", 'Tekshir');
      chk.type = 'button';
      const show = el('button', "background:transparent;border:1px solid rgb(var(--ink-rgb) / 0.2);color:rgb(var(--ink-rgb) / 0.78);font:500 12.5px " + SG + ";letter-spacing:.04em;padding:8px 14px;cursor:pointer", 'Yechim');
      show.type = 'button';
      const verdict = el('span', "font:500 13px " + SG);
      ctl.append(chk, show, verdict);
      row.appendChild(ctl);
      const sol = el('div', "font:400 13.5px " + MO + ";color:" + YE + ";padding-top:9px;display:none");
      sol.textContent = '$ ' + tk.hint;
      row.appendChild(sol);
      const pass = () => {
        tick.textContent = '✓'; tick.style.color = GR;
        verdict.textContent = "✓ To'g'ri"; verdict.style.color = GR;
        sol.style.display = 'block';
        STATE[id] = STATE[id] || {};
        STATE[id][tid] = 1;
        save();
        weakDrop(tid);
        refresh();
      };
      chk.onclick = () => {
        const v = inp.value.trim().replace(/\s+/g, ' ');
        if (!v) { verdict.textContent = 'Buyruqni yozing.'; verdict.style.color = 'rgb(var(--ink-rgb) / 0.78)'; return; }
        if (tk.check.test(v)) pass();
        else { verdict.textContent = '✗ Mos kelmadi — yana urinib ko\'ring'; verdict.style.color = RD; weakAdd({ kind: 't', qid: tid, sec: id, q: tk.t, a: '<code>' + tk.hint + '</code>' }); }
      };
      show.onclick = () => { sol.style.display = 'block'; if (!verdict.textContent) { verdict.textContent = 'Yechim ko\'rsatildi'; verdict.style.color = 'rgb(var(--ink-rgb) / 0.73)'; } };
      if (STATE[id] && STATE[id][tid]) { tick.textContent = '✓'; tick.style.color = GR; verdict.textContent = "✓ To'g'ri"; verdict.style.color = GR; sol.style.display = 'block'; }
      list.appendChild(row);
    });
    wrap.appendChild(list);
    box.appendChild(wrap);
  }

  /* ---------- qulf ekrani ---------- */
  function lockScreen(secEl, id, prevIdx, prevTitle) {
    if (secEl.querySelector('[data-gate-lock]')) return;
    const orig = el('div');
    orig.dataset.gateBody = '1';
    while (secEl.children.length) orig.appendChild(secEl.children[0]);
    secEl.appendChild(orig);
    orig.style.display = 'none';
    const lock = el('div', 'border:1px dashed rgb(var(--ink-rgb) / 0.24);background:rgb(var(--ink-rgb) / 0.02);padding:clamp(22px,4vw,34px);text-align:left');
    lock.dataset.gateLock = id;
    lock.append(el('div', "font:500 11.5px " + SG + ";letter-spacing:.2em;text-transform:uppercase;color:rgb(var(--ink-rgb) / 0.6)", '🔒 Yopiq'));
    lock.append(el('div', "font:500 clamp(20px,3vw,26px)/1.25 " + SG + ";letter-spacing:-.02em;margin:12px 0 10px;color:rgb(var(--ink-rgb) / 0.8)", 'Bu bo\'lim hali ochilmagan'));
    const prevNo = secNo(CFG.ids[prevIdx]);
    lock.append(el('div', "font:400 17px/1.6 " + NR + ";color:rgb(var(--ink-rgb) / 0.74);max-width:540px;text-wrap:pretty", 'Ochilishi uchun ' + prevNo + "-bo'lim testini to'liq (100%) topshirishingiz kerak: " + prevTitle));
    const b = el('button', "background:oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.11 68 / 0.07);border:1px solid oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.11 68 / 0.45);color:" + CY + ";font:500 12.5px " + SG + ";letter-spacing:.04em;padding:10px 16px;cursor:pointer;margin-top:16px", '↑ ' + prevNo + "-bo'lim testiga o'tish");
    b.type = 'button';
    b.onclick = () => {
      const t = document.querySelector('[data-gate-quiz="' + CFG.ids[prevIdx] + '"]');
      if (t) window.scrollTo(0, t.getBoundingClientRect().top + window.scrollY - 70);
    };
    lock.appendChild(b);
    secEl.appendChild(lock);
  }

  function unlockScreen(secEl) {
    const lock = secEl.querySelector('[data-gate-lock]');
    const body = secEl.querySelector('[data-gate-body]');
    if (lock) lock.remove();
    if (body) { body.style.display = ''; while (body.children.length) secEl.appendChild(body.children[0]); body.remove(); }
  }

  /* bo'lim natijasi: savollar o'rtacha foizi + topshiriqlar bajarilgani */
  const secStat = (id) => {
    const quiz = CFG.quiz[id] || [];
    const st = STATE[id] || {};
    let sum = 0, answered = 0;
    quiz.forEach((q) => { const v = st[q.qid]; if (typeof v === 'number') { sum += v; answered++; } });
    const avg = quiz.length ? Math.round(sum / quiz.length) : 100;
    const taskNeed = tasksFor(id).length + secLabCount(id);
    let taskDone = 0;
    Object.keys(st).forEach((k) => { if (!quiz.some((q) => q.qid === k)) taskDone++; });
    return { avg: avg, answered: answered, quizN: quiz.length, taskDone: Math.min(taskDone, taskNeed), taskNeed: taskNeed };
  };

  const passed = (id) => {
    const s = secStat(id);
    if (!s.quizN && !s.taskNeed) return true;
    if (s.taskDone < s.taskNeed) return false;
    return s.avg >= NEED_PCT;
  };

  /* ko'rinib turgan bo'limlarni ketma-ket raqamlash (yashirilganlar sanalmaydi) */
  function renumber() {
    let n = 0, stop = 0;
    const all = Array.from(document.querySelectorAll('div[id]')).filter((d) => /^s\d+$/.test(d.id));
    all.forEach((sec) => {
      const eb = Array.from(sec.querySelectorAll('div')).find((d) => /^Bo'lim\s*\d+/.test(d.textContent.trim()) && d.children.length === 0);
      if (!eb) return;
      if (eb.dataset.raw === undefined) eb.dataset.raw = eb.textContent;
      if (getComputedStyle(sec).display === 'none') return;
      n++;
      const raw = eb.dataset.raw;
      let out = "Bo'lim " + n;
      const st = raw.match(/\d+-to'xtash[^·§]*/);
      if (st) { stop++; out += " · " + st[0].trim().replace(/^\d+-/, stop + '-'); }
      else {
        const tail = raw.replace(/^Bo'lim\s*\d+\s*/, '').replace(/^·\s*/, '').replace(/§[^·]*/g, '').replace(/·\s*$/, '').trim();
        if (tail && !/^[\d,\s—-]*$/.test(tail)) out += ' · ' + tail;
      }
      eb.textContent = out;
    });
    let m = 0;
    document.querySelectorAll('[data-nav-sections] button').forEach((b) => {
      if (!b.dataset.id || !/^s\d+$/.test(b.dataset.id)) return;
      const num = b.querySelector('span');
      if (num) {
        if (num.dataset.raw === undefined) num.dataset.raw = num.textContent;
      } else if (b.dataset.raw === undefined) b.dataset.raw = b.textContent;
      if (getComputedStyle(b).display === 'none') return;
      m++;
      if (num) num.textContent = String(m);
      else b.textContent = b.dataset.raw.replace(/^\s*\d+/, String(m));
    });
    let k = 0;
    document.querySelectorAll('[data-nav-stops] button').forEach((b) => {
      if (b.dataset.raw === undefined) b.dataset.raw = b.textContent;
      if (getComputedStyle(b).display === 'none') return;
      k++;
      const sp = b.querySelector('span');
      if (sp) { if (sp.dataset.raw === undefined) sp.dataset.raw = sp.textContent; sp.textContent = String(k); }
      else b.textContent = b.dataset.raw.replace(/^\s*\d+/, String(k));
    });
  }

  function refresh() {
    const keepY = window.scrollY;
    buildHud();
    let openTo = 0;
    for (let i = 0; i < CFG.ids.length; i++) {
      if (passed(CFG.ids[i])) openTo = i + 1; else break;
    }
    CFG.ids.forEach((id, i) => {
      const sec = document.getElementById(id);
      if (!sec) return;
      const quiz = CFG.quiz[id] || [];
      if (i <= openTo) {
        unlockScreen(sec);
        if (quiz.length) buildQuiz(sec, i, id, quiz);
        const scoreEl = sec.querySelector('[data-gate-score]');
        const foot = sec.querySelector('[data-gate-foot]');
        if (scoreEl) {
          const s = secStat(id);
          const ok = passed(id);
          scoreEl.textContent = 'o\u2018rtacha ' + s.avg + '%  ·  ' + s.answered + '/' + s.quizN + ' savol' + (s.taskNeed ? '  ·  ' + s.taskDone + '/' + s.taskNeed + ' topshiriq' : '');
          scoreEl.style.color = ok ? GR : s.avg >= 50 ? YE : 'rgb(var(--ink-rgb) / 0.78)';
          if (sec._flowPaint) sec._flowPaint();
          const tb = sec.querySelector('[data-tab-badge]');
          if (tb) { tb.textContent = ok ? '✓' : (s.answered ? s.avg + '%' : ''); tb.style.color = ok ? GR : s.avg >= 50 ? YE : 'rgb(var(--ink-rgb) / 0.63)'; }
        }
        if (foot) {
          foot.innerHTML = '';
          const done = passed(id);
          const nextId = CFG.ids[i + 1];
          if (done && nextId) {
            const d = el('div', "font:400 16px/1.6 " + NR + ";color:" + GR + ";text-wrap:pretty", "✓ Bo'lim o'zlashtirildi — keyingi bo'lim ochildi.");
            foot.appendChild(d);
            const b = el('button', "background:oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.07);border:1px solid oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.45);color:" + GR + ";font:500 12.5px " + SG + ";letter-spacing:.04em;padding:9px 15px;cursor:pointer;margin-top:12px", secNo(nextId) + "-bo'limga o'tish →");
            b.type = 'button';
            b.onclick = () => { const t = document.getElementById(nextId); if (t) window.scrollTo(0, t.getBoundingClientRect().top + window.scrollY - 24); };
            foot.appendChild(b);
          } else if (done) {
            foot.appendChild(el('div', "font:400 16px/1.6 " + NR + ";color:" + GR, "✓ Oxirgi bo'lim ham o'zlashtirildi."));
          } else {
            const s = secStat(id);
            const why = s.taskDone < s.taskNeed
              ? 'Topshiriqlar tugamagan: ' + s.taskDone + '/' + s.taskNeed + '.'
              : s.answered < s.quizN
                ? 'Hali ' + (s.quizN - s.answered) + ' ta savolga javob bermadingiz.'
                : "O'rtacha baho " + s.avg + '% — ' + NEED_PCT + '% kerak. Past baholi javoblarni to\'ldirib qayta yuboring.';
            foot.appendChild(el('div', "font:400 15.5px/1.6 " + NR + ";color:rgb(var(--ink-rgb) / 0.84);text-wrap:pretty", "Keyingi bo'lim yopiq. " + why));
          }
        }
      } else {
        const prev = i - 1;
        const pSec = document.getElementById(CFG.ids[prev]);
        const pTitle = pSec ? (pSec.querySelector('h2') ? pSec.querySelector('h2').textContent : '') : '';
        lockScreen(sec, id, prev, pTitle);
      }
    });
    // yon paneldagi tugmalar
    document.querySelectorAll('[data-nav-sections] button, [data-nav-stops] button').forEach((b) => {
      const id = b.dataset.id;
      const i = CFG.ids.indexOf(id);
      if (i < 0) return;
      const locked = i > openTo;
      b.style.opacity = locked ? '0.38' : '1';
      const sp = b.querySelector('span:last-child');
      if (sp && locked && sp.textContent.indexOf('🔒') < 0) sp.textContent = '🔒 ' + sp.textContent;
      if (sp && !locked) sp.textContent = sp.textContent.replace(/^🔒\s*/, '');
    });
    const hud = document.querySelector('[data-gate-hud]');
    if (hud) {
      const done = CFG.ids.filter((x) => passed(x)).length;
      hud.textContent = '🔐 ' + Math.min(openTo + 1, CFG.ids.length) + ' / ' + CFG.ids.length + " bo'lim ochiq  ·  " + done + ' tugallangan';
    }
    try {
      const doneN = CFG.ids.filter((x) => passed(x)).length;
      let part = 0;
      CFG.ids.forEach((x) => {
        if (passed(x)) { part += 1; return; }
        const s = secStat(x);
        const q = s.quizN ? Math.min(1, s.avg / NEED_PCT) : 1;
        const t = s.taskNeed ? s.taskDone / s.taskNeed : 1;
        part += Math.min(0.95, 0.7 * q + 0.3 * t);
      });
      localStorage.setItem(CFG.key + '-gate-sum', JSON.stringify({ done: doneN, total: CFG.ids.length, pct: Math.round((part / CFG.ids.length) * 100) }));
    } catch (e) {}
    renumber();
    if (Math.abs(window.scrollY - keepY) > 2) window.scrollTo(0, keepY);
  }

  function buildHud() {
    if (document.querySelector('[data-gate-hud]')) return;
    const bar = document.querySelector('[data-mode-bar]');
    if (!bar) return;
    const wrap = el('div', 'display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;padding:10px 0 0;width:100%');
    const hud = el('div', "font:500 12px " + MO + ";letter-spacing:.06em;color:rgb(var(--ink-rgb) / 0.78)");
    hud.dataset.gateHud = '1';
    const ctl = el('div', 'display:flex;flex-wrap:wrap;gap:8px');
    const off = el('button', "background:transparent;border:1px solid rgb(var(--ink-rgb) / 0.2);color:rgb(var(--ink-rgb) / 0.73);font:500 11.5px " + SG + ";letter-spacing:.04em;padding:6px 11px;cursor:pointer", '\uD83D\uDD13 Qulfni ochish');
    off.type = 'button';
    /* parol paneli — tugma bosilganda ochiladi */
    const pinBox = el('div', 'display:none;flex-wrap:wrap;gap:8px;align-items:center;padding:10px 0 0;width:100%');
    const pinInp = el('input', "background:var(--bg);border:1px solid rgb(var(--ink-rgb) / 0.24);color:var(--ink);font:500 13px " + MO + ";letter-spacing:.24em;padding:8px 11px;width:120px;outline:none");
    pinInp.type = 'password';
    pinInp.placeholder = '••••';
    pinInp.inputMode = 'numeric';
    const pinOk = el('button', "background:oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.07);border:1px solid oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.45);color:" + GR + ";font:500 12px " + SG + ";letter-spacing:.04em;padding:8px 14px;cursor:pointer", '✓ Tasdiqlash');
    pinOk.type = 'button';
    const pinCancel = el('button', "background:transparent;border:1px solid rgb(var(--ink-rgb) / 0.2);color:rgb(var(--ink-rgb) / 0.68);font:500 12px " + SG + ";letter-spacing:.04em;padding:8px 14px;cursor:pointer", 'Bekor');
    pinCancel.type = 'button';
    const pinMsg = el('span', "font:500 12.5px " + SG + ";color:" + RD);
    pinBox.append(el('span', "font:400 14.5px " + NR + ";color:rgb(var(--ink-rgb) / 0.88)", 'Parolni kiriting:'), pinInp, pinOk, pinCancel, pinMsg);
    const closePin = () => { pinBox.style.display = 'none'; pinInp.value = ''; pinMsg.textContent = ''; };
    pinCancel.onclick = closePin;

    const doUnlock = () => {
      CFG.enabled = false;
      try { localStorage.setItem(CFG.key + '-gate-on', '0'); } catch (e) {}
      off.textContent = '\uD83D\uDD10 Qulfni yoqish';
      CFG.ids.forEach((id) => { const s = document.getElementById(id); if (s) unlockScreen(s); });
      document.querySelectorAll('[data-nav-sections] button, [data-nav-stops] button').forEach((b) => { b.style.opacity = '1'; const sp = b.querySelector('span:last-child'); if (sp) sp.textContent = sp.textContent.replace(/^🔒\s*/, ''); });
      hud.textContent = "\uD83D\uDD13 Qulf ochilgan — hamma bo'lim ochiq";
      closePin();
    };
    const tryPin = () => {
      if (pinInp.value.trim() === '2000') doUnlock();
      else { pinMsg.textContent = "Parol noto'g'ri"; pinInp.value = ''; pinInp.focus(); }
    };
    pinOk.onclick = tryPin;
    pinInp.onkeydown = (e) => { if (e.key === 'Enter') tryPin(); };

    off.onclick = () => {
      if (!CFG.enabled) {
        CFG.enabled = true;
        try { localStorage.setItem(CFG.key + '-gate-on', '1'); } catch (e) {}
        off.textContent = '\uD83D\uDD13 Qulfni ochish';
        closePin();
        refresh();
        return;
      }
      pinBox.style.display = pinBox.style.display === 'flex' ? 'none' : 'flex';
      if (pinBox.style.display === 'flex') { pinMsg.textContent = ''; setTimeout(() => pinInp.focus(), 40); }
    };
    const reset = el('button', "background:transparent;border:1px solid rgb(var(--ink-rgb) / 0.2);color:rgb(var(--ink-rgb) / 0.73);font:500 11.5px " + SG + ";letter-spacing:.04em;padding:6px 11px;cursor:pointer", '↻ Boshidan');
    reset.type = 'button';
    reset.onclick = () => {
      if (!window.confirm("Butun progress o'chiriladi. Davom etasizmi?")) return;
      STATE = {}; save(); document.querySelectorAll('[data-gate-quiz],[data-gate-lab],[data-gate-arch]').forEach((q) => q.remove()); refresh(); window.scrollTo(0, 0);
    };
    const jump = el('button', "background:oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.07);border:1px solid oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.45);color:" + GR + ";font:500 11.5px " + SG + ";letter-spacing:.04em;padding:6px 11px;cursor:pointer", '▶ Laboratoriya');
    jump.type = 'button';
    jump.onclick = () => {
      let target = null;
      for (let i = 0; i < CFG.ids.length; i++) { if (!passed(CFG.ids[i])) { target = CFG.ids[i]; break; } }
      const lab = document.querySelector('[data-gate-lab="' + (target || CFG.ids[0]) + '"]') || document.querySelector('[data-gate-lab]');
      if (lab) { const sec = lab.closest('div[id]'); if (sec && sec._tab) sec._tab('lab'); }
      if (lab) window.scrollTo(0, lab.getBoundingClientRect().top + window.scrollY - 70);
    };
    ctl.append(jump, reset);
    wrap.append(hud, ctl);
    bar.appendChild(wrap);
  }

  window.Gate = {
    init: function (cfg) {
      if (this._ready) return true;
      if (!window.DevOpsBank) {
        if (!this._q) {
          this._q = cfg;
          const t = setInterval(() => {
            if (window.DevOpsBank) { clearInterval(t); const c = window.Gate._q; window.Gate._q = null; window.Gate.init(c); }
          }, 250);
        }
        return false;
      }
      if (CFG && CFG.key === cfg.key) { refresh(); return true; }
      CFG = { key: cfg.key, subject: cfg.subject, ids: cfg.ids.slice(), quiz: {}, enabled: true };
      try { localStorage.removeItem(cfg.key + '-gate-on'); } catch (e) {}
      STATE = load();
      const used = {};
      CFG.ids.forEach((id) => {
        const sec = document.getElementById(id);
        CFG.quiz[id] = sec ? pickQuiz(sec, cfg.subject, used) : [];
      });
      buildHud();
      document.addEventListener('click', (e) => {
        const b = e.target && e.target.closest ? e.target.closest('[data-mode-bar] button') : null;
        if (b) { setTimeout(renumber, 60); setTimeout(renumber, 260); }
      });
      if (!CFG.enabled) {
        const hud = document.querySelector('[data-gate-hud]');
        if (hud) hud.textContent = "\uD83D\uDD13 Qulf ochilgan — hamma bo'lim ochiq";
        CFG.ids.forEach((id) => { const s = document.getElementById(id); if (s) { const quiz = CFG.quiz[id] || []; if (quiz.length) buildQuiz(s, CFG.ids.indexOf(id), id, quiz); } });
        renumber();
        this._ready = true;
        return true;
      }
      this._ready = true;
      refresh();
      return true;
    },
    refresh: function () { if (CFG) refresh(); },
  };
})();
