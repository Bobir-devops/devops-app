/* play.js — o'yin qatlami: XP/daraja, streak, yutuqlar, lug'at kartochkalari, matn ichida bo'shliq to'ldirish,
   shahar xaritasi, tabrik animatsiyasi va sxemalarni qadam-baqadam yurgizish.
   window.Play.init({ key, subject, ids, glossary }) — gate.js dan keyin chaqiriladi. */
(function () {
  const PINK = 'oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.11 68)', LIME = 'oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.11 150)', VIO = 'oklch(calc(var(--lk) * 0.42 + var(--lb)) 0.06 40)', CY = 'oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.11 68)', YE = 'oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.08 40)', OR = 'oklch(calc(var(--lk) * 0.48 + var(--lb)) 0.12 45)', GR = 'oklch(calc(var(--lk) * 0.48 + var(--lb)) 0.17 150)';
  const SG = "Lora,ui-sans-serif,sans-serif", MO = "'IBM Plex Mono',monospace", NR = 'Lora,Georgia,serif';
  const el = (t, css, txt) => { const d = document.createElement(t); if (css) d.style.cssText = css; if (txt != null) d.textContent = txt; return d; };
  const norm = (t) => (t || '').toLowerCase().replace(/[‘’ʻʼ'`´]/g, '').replace(/[^a-z0-9\u0400-\u04ff\s\-\.\/]/g, ' ').replace(/\s+/g, ' ').trim();
  const today = () => new Date().toISOString().slice(0, 10);

  const LEVELS = [[0, 'Stajyor'], [150, 'Junior D'], [400, 'Junior D+'], [800, 'Junior C'], [1400, 'Junior B'], [2200, 'Junior B+'], [3200, 'Middle']];
  const DAILY = 100;
  const BADGES = [
    ['cloze1', '✏️', "Birinchi bo'shliq", "Matn ichidagi bo'shliqni to'ldirdingiz"],
    ['lab1', '🧪', 'Birinchi lab', 'Laboratoriyadagi birinchi vazifa'],
    ['perfect', '💯', 'Mukammal javob', 'Savolga 100% javob'],
    ['sec1', '🏠', 'Shaharga kirish', "Birinchi bo'lim tugadi"],
    ['sec5', '🏘️', 'Mahalla ustasi', "5 ta bo'lim tugadi"],
    ['half', '🌆', 'Yarim shahar', "Bo'limlarning yarmi tugadi"],
    ['all', '👑', 'Shahar hokimi', "Hamma bo'lim tugadi"],
    ['oom', '💀', 'OOM ustasi', "OOM killer bo'limi o'tildi"],
    ['streak3', '🔥', '3 kun ketma-ket', 'Uch kun uzluksiz'],
    ['streak7', '⚡', 'Haftalik olov', 'Yetti kun uzluksiz'],
    ['gloss20', '📚', "Lug'atchi", '20 ta atama kartochkasi ochildi'],
    ['xp1000', '🚀', 'Ming XP', "1000 XP to'plandi"],
    ['steps', '🎞️', 'Sxema rejissyori', 'Sxemani qadam-baqadam yurgizdingiz'],
  ];

  let CFG = null, P = null;
  let ROOT = null;
  const root = () => { if (!ROOT) { ROOT = document.createElement('div'); ROOT.id = 'play-root'; document.documentElement.appendChild(ROOT); } return ROOT; };
  const KEY = () => 'play-' + CFG.key;
  const load = () => { try { P = JSON.parse(localStorage.getItem(KEY()) || 'null'); } catch (e) { P = null; } P = P || { xp: 0, days: {}, badges: {}, cloze: {}, gloss: {}, snap: null }; };
  const save = () => { try { localStorage.setItem(KEY(), JSON.stringify(P)); } catch (e) {} };

  const level = () => { let i = 0; LEVELS.forEach((l, k) => { if (P.xp >= l[0]) i = k; }); return i; };
  const streak = () => {
    let n = 0; const d = new Date();
    if (!P.days[today()]) d.setDate(d.getDate() - 1);
    for (;;) { const k = d.toISOString().slice(0, 10); if (P.days[k]) { n++; d.setDate(d.getDate() - 1); } else break; }
    return n;
  };

  /* ---------- XP va tostlar ---------- */
  function addXP(n, why) {
    if (!n) return;
    const before = level();
    P.xp += n;
    P.days[today()] = (P.days[today()] || 0) + n;
    save();
    toast('+' + n + ' XP', why, LIME);
    const after = level();
    if (after > before) { celebrate(); toast('🎖 Yangi daraja', LEVELS[after][1], PINK, 4200); }
    checkBadges();
    paintHud();
  }
  function badge(id) {
    if (P.badges[id]) return;
    const b = BADGES.find((x) => x[0] === id);
    if (!b) return;
    P.badges[id] = Date.now();
    save();
    toast(b[1] + ' Yutuq: ' + b[2], b[3], YE, 4200);
    paintHud();
  }
  let toastBox = null;
  function toast(title, sub, color, ms) {
    if (!toastBox) { toastBox = el('div', 'position:fixed;right:16px;bottom:16px;z-index:9999;display:flex;flex-direction:column;gap:8px;align-items:flex-end;pointer-events:none'); root().appendChild(toastBox); }
    const t = el('div', "background:var(--card);border:1.5px solid " + color + ";padding:10px 14px;min-width:180px;max-width:300px;box-shadow:0 8px 30px rgb(var(--ink-rgb) / .12);transform:translateY(12px);opacity:0;transition:transform .25s,opacity .25s");
    t.append(el('div', "font:600 14px " + SG + ";color:" + color, title));
    if (sub) t.append(el('div', "font:400 13.5px/1.4 " + NR + ";color:rgb(var(--ink-rgb) / 0.93);margin-top:2px", sub));
    toastBox.appendChild(t);
    requestAnimationFrame(() => { t.style.transform = 'none'; t.style.opacity = '1'; });
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(8px)'; setTimeout(() => t.remove(), 300); }, ms || 2200);
  }

  /* ---------- konfetti ---------- */
  function celebrate() {
    const cv = el('canvas', 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9998');
    root().appendChild(cv);
    const W = cv.width = innerWidth, H = cv.height = innerHeight, ctx = cv.getContext('2d');
    const cols = ['#b68235', '#7a5520', '#d9b77a', '#cdc6bc', '#5f5a53', '#a35a2a'];
    const ps = Array.from({ length: 160 }, () => ({ x: W / 2 + (Math.random() - 0.5) * 120, y: H * 0.55, vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 16 - 6, r: Math.random() * 6 + 4, c: cols[(Math.random() * cols.length) | 0], a: Math.random() * 6, va: (Math.random() - 0.5) * 0.4 }));
    const t0 = performance.now();
    (function f(t) {
      const k = (t - t0) / 1800;
      ctx.clearRect(0, 0, W, H);
      ps.forEach((p) => { p.vy += 0.45; p.x += p.vx; p.y += p.vy; p.a += p.va; ctx.save(); ctx.globalAlpha = Math.max(0, 1 - k); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore(); });
      if (k < 1) requestAnimationFrame(f); else cv.remove();
    })(t0);
  }

  /* ---------- HUD ---------- */
  let hud = null;
  function buildHud() {
    if (hud) return;
    hud = el('div', 'position:relative;z-index:1;display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end;padding:calc(10px + env(safe-area-inset-top)) 16px 4px;max-width:1180px;margin:0 auto;box-sizing:border-box');
    document.body.insertBefore(hud, document.body.firstChild);
    paintHud();
  }
  function ring(pct, color) {
    const r = 15, c = 2 * Math.PI * r;
    return '<svg width="38" height="38" viewBox="0 0 38 38" style="display:block"><circle cx="19" cy="19" r="' + r + '" fill="none" stroke="rgba(32,31,29,0.15)" stroke-width="4"/><circle cx="19" cy="19" r="' + r + '" fill="none" style="stroke:' + color + '" stroke-width="4" stroke-linecap="round" stroke-dasharray="' + c + '" stroke-dashoffset="' + (c * (1 - Math.min(1, pct))) + '" transform="rotate(-90 19 19)" style="transition:stroke-dashoffset .6s"/></svg>';
  }
  function chip(css) { return el('div', "display:flex;align-items:center;gap:8px;background:var(--card);border:1.5px solid rgb(var(--ink-rgb) / 0.18);padding:5px 11px 5px 6px;" + (css || '')); }
  function paintHud() {
    if (!hud) return;
    hud.innerHTML = '';
    const li = level(), cur = LEVELS[li], nxt = LEVELS[li + 1];
    const into = nxt ? (P.xp - cur[0]) / (nxt[0] - cur[0]) : 1;
    const lv = chip('border-color:' + PINK);
    const av = el('div', "width:30px;height:30px;display:grid;place-items:center;background:" + PINK + ";color:var(--card);font:700 14px " + SG, String(li + 1));
    const box = el('div', 'display:flex;flex-direction:column;gap:3px;min-width:110px');
    box.append(el('div', "font:600 12.5px " + SG + ";color:var(--ink);white-space:nowrap", cur[1] + '  ·  ' + P.xp + ' XP'));
    const bar = el('div', 'height:5px;background:rgb(var(--ink-rgb) / 0.13)');
    bar.appendChild(el('div', 'height:5px;width:' + Math.round(into * 100) + '%;background:' + PINK + ';transition:width .5s'));
    box.appendChild(bar);
    box.append(el('div', "font:500 10px " + MO + ";color:rgb(var(--ink-rgb) / 0.68)", nxt ? (nxt[0] - P.xp) + ' XP → ' + nxt[1] : 'eng yuqori daraja'));
    lv.append(av, box);
    const st = chip('border-color:' + OR);
    const s = streak();
    st.title = 'Kunlik maqsad: ' + DAILY + ' XP';
    const rg = el('div'); rg.innerHTML = ring((P.days[today()] || 0) / DAILY, LIME);
    st.append(rg, el('div', "font:600 13px " + SG + ";color:" + OR + ";white-space:nowrap", '🔥 ' + s + ' kun'));
    const btn = (label, color, fn) => { const b = el('button', "background:var(--card);border:1.5px solid " + color + ";color:" + color + ";font:600 12.5px " + SG + ";padding:9px 12px;cursor:pointer;", label); b.type = 'button'; b.onclick = fn; return b; };
    const nb = Object.keys(P.badges).length;
    hud.append(lv, st, btn('🗺 Xarita', CY, openMap), btn('🏅 ' + nb + '/' + BADGES.length, YE, openBadges));
  }

  /* ---------- modal ---------- */
  function modal(title, body) {
    const ov = el('div', 'position:fixed;inset:0;z-index:9500;background:rgb(var(--ink-rgb) / 0.45);display:grid;place-items:center;padding:16px');
    const card = el('div', 'background:var(--card);border:1.5px solid rgb(var(--ink-rgb) / 0.2);width:min(960px,100%);max-height:calc(100vh - 32px);overflow:auto;padding:22px');
    const head = el('div', 'display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:16px');
    head.append(el('div', "font:600 22px " + SG + ";letter-spacing:-.02em;color:var(--ink)", title));
    const x = el('button', "background:transparent;border:1px solid rgb(var(--ink-rgb) / 0.28);color:var(--ink);font:500 13px " + SG + ";padding:6px 11px;cursor:pointer", '✕');
    x.type = 'button'; x.onclick = () => ov.remove();
    head.appendChild(x);
    card.append(head, body);
    ov.appendChild(card);
    ov.onclick = (e) => { if (e.target === ov) ov.remove(); };
    root().appendChild(ov);
    return ov;
  }
  function openBadges() {
    const g = el('div', 'display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px');
    BADGES.forEach((b) => {
      const on = !!P.badges[b[0]];
      const c = el('div', 'border:1.5px solid ' + (on ? YE : 'rgb(var(--ink-rgb) / 0.13)') + ';background:' + (on ? 'oklch(calc(var(--lk) * 0.64 + var(--lb)) 0.08 40 / 0.04)' : 'var(--bg2)') + ';padding:14px;opacity:' + (on ? 1 : 0.55));
      c.append(el('div', 'font-size:30px;line-height:1;margin-bottom:8px;filter:' + (on ? 'none' : 'grayscale(1)'), b[1]));
      c.append(el('div', "font:600 14.5px " + SG + ";color:" + (on ? YE : 'var(--ink)'), b[2]));
      c.append(el('div', "font:400 13.5px/1.4 " + NR + ";color:rgb(var(--ink-rgb) / 0.83);margin-top:3px", on ? b[3] : '🔒 ' + b[3]));
      g.appendChild(c);
    });
    modal('🏅 Yutuqlar', g);
  }
  function openMap() {
    const ids = CFG.ids;
    let sum = {}; try { sum = JSON.parse(localStorage.getItem(CFG.key + '-gate-sum') || '{}'); } catch (e) {}
    const done = sum.done || 0;
    const wrap = el('div');
    wrap.append(el('div', "font:400 15.5px/1.5 " + NR + ";color:rgb(var(--ink-rgb) / 0.88);margin-bottom:16px", "Har bino — bitta bo'lim. O'tilgan binolarda chiroq yonadi, joriy bino miltillaydi. Bosib o'sha bo'limga o'ting."));
    const city = el('div', 'display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end;padding:18px 14px 0;background:linear-gradient(var(--bg2),var(--card));border:1px solid rgb(var(--ink-rgb) / 0.11);border-bottom:4px solid var(--line)');
    const hues = [350, 130, 295, 210, 85, 50, 150];
    ids.forEach((id, i) => {
      const sec = document.getElementById(id);
      const h2 = sec && sec.querySelector('h2');
      const name = h2 ? h2.textContent.trim() : id;
      const lit = i < done, cur = i === done;
      const hue = hues[i % hues.length];
      const ht = 70 + ((i * 37) % 70);
      const b = el('button', 'position:relative;width:74px;height:' + ht + 'px;border:1.5px solid ' + (lit ? 'oklch(0.75 0.17 ' + hue + ')' : cur ? 'var(--ink)' : 'var(--line)') + ';border-bottom:none;background:' + (lit ? 'oklch(0.3 0.06 ' + hue + ')' : 'var(--card)') + ';cursor:' + (lit || cur ? 'pointer' : 'default') + ';padding:0;display:flex;flex-direction:column;justify-content:flex-end' + (cur ? ';animation:playPulse 1.4s ease-in-out infinite' : ''));
      b.type = 'button';
      b.title = (i + 1) + '. ' + name;
      const win = el('div', 'position:absolute;inset:8px 8px 26px;display:grid;grid-template-columns:repeat(3,1fr);gap:5px;align-content:start');
      for (let k = 0; k < Math.floor((ht - 34) / 13) * 3; k++) win.appendChild(el('div', 'height:7px;background:' + (lit ? (Math.random() > 0.25 ? 'oklch(0.9 0.15 ' + (hue + 20) + ')' : 'rgb(var(--ink-rgb) / .12)') : 'rgb(var(--ink-rgb) / 0.07)')));
      b.appendChild(win);
      b.appendChild(el('div', "position:relative;font:700 12px " + MO + ";color:" + (lit ? '#fff' : cur ? 'var(--ink)' : 'rgb(var(--ink-rgb) / 0.3)') + ";padding:4px 0 6px;text-align:center", (lit ? '✓ ' : cur ? '▶ ' : '🔒 ') + (i + 1)));
      if (lit || cur) b.onclick = () => { document.querySelectorAll('.play-modal-close').forEach((x) => x.click()); ov.remove(); const s = document.getElementById(id); if (s) window.scrollTo(0, s.getBoundingClientRect().top + window.scrollY - 70); };
      city.appendChild(b);
    });
    wrap.appendChild(city);
    const legend = el('div', "display:flex;flex-wrap:wrap;gap:16px;margin-top:14px;font:500 12.5px " + SG + ";color:rgb(var(--ink-rgb) / 0.83)");
    legend.append(el('span', null, '✓ ' + done + " ta bo'lim o'tildi"), el('span', null, '▶ joriy'), el('span', null, '🔒 ' + (ids.length - done) + ' ta qoldi'));
    wrap.appendChild(legend);
    const ov = modal('🗺 ' + CFG.subject + ' shahri', wrap);
  }

  /* ---------- lug'at kartochkalari ---------- */
  let pop = null;
  function closePop() { if (pop) { pop.remove(); pop = null; } }
  function showTerm(span, term, def) {
    closePop();
    pop = el('div', 'position:absolute;z-index:9400;width:min(320px,calc(100vw - 24px));background:var(--card);border:1.5px solid ' + VIO + ';box-shadow:0 14px 40px rgb(var(--ink-rgb) / .12);padding:14px 16px');
    pop.append(el('div', "font:600 11px " + SG + ";letter-spacing:.18em;text-transform:uppercase;color:" + VIO + ";margin-bottom:6px", "📘 Lug'at"));
    pop.append(el('div', "font:600 18px " + SG + ";color:var(--ink);margin-bottom:6px", term));
    pop.append(el('div', "font:400 15.5px/1.55 " + NR + ";color:rgb(var(--ink-rgb) / 1)", def));
    const r = span.getBoundingClientRect();
    pop.style.left = Math.max(12, Math.min(r.left + window.scrollX, window.scrollX + innerWidth - 336)) + 'px';
    pop.style.top = (r.bottom + window.scrollY + 8) + 'px';
    root().appendChild(pop);
    const k = norm(term);
    if (!P.gloss[k]) { P.gloss[k] = 1; save(); addXP(1, "Yangi atama: " + term); if (Object.keys(P.gloss).length >= 20) badge('gloss20'); }
  }
  document.addEventListener('click', (e) => { if (pop && !pop.contains(e.target) && !e.target.closest('[data-term]')) closePop(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePop(); });

  let TERM_RE = null, TERM_MAP = null;
  function termRe() {
    if (TERM_RE) return TERM_RE;
    const G = CFG.glossary || {};
    const keys = Object.keys(G).sort((x, y) => y.length - x.length);
    if (!keys.length) return null;
    TERM_MAP = {};
    keys.forEach((k) => { TERM_MAP[k.toLowerCase()] = k; });
    TERM_RE = new RegExp('(^|[^A-Za-z0-9_])(' + keys.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')(?![A-Za-z0-9_])', 'gi');
    return TERM_RE;
  }
  function decorateTerms(pane) {
    const re = termRe();
    if (!re) return;
    const G = CFG.glossary || {};
    const used = {};
    const walker = document.createTreeWalker(pane, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => {
        const p = n.parentElement;
        if (!p || p.closest('pre,code,figure,svg,button,input,textarea,[data-term],[data-cloze],details[data-qid],h2,h3,summary,[data-gate-quiz]')) return NodeFilter.FILTER_REJECT;
        return n.nodeValue.length > 2 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    const nodes = [];
    while (walker.nextNode() && nodes.length < 1500) nodes.push(walker.currentNode);
    let found = 0;
    for (let ni = 0; ni < nodes.length && found < 14; ni++) {
      const n = nodes[ni];
      const txt = n.nodeValue;
      re.lastIndex = 0;
      const hits = [];
      let m;
      while ((m = re.exec(txt))) {
        const key = TERM_MAP[m[2].toLowerCase()];
        if (key && !used[key]) { used[key] = 1; hits.push([m.index + m[1].length, m[2].length, key]); }
        if (m[0].length === 0) re.lastIndex++;
      }
      if (!hits.length) continue;
      const frag = document.createDocumentFragment();
      let pos = 0;
      hits.forEach(([at, len, key]) => {
        frag.appendChild(document.createTextNode(txt.slice(pos, at)));
        const span = el('span', "border-bottom:2px dotted " + VIO + ";color:inherit;cursor:help;background:oklch(calc(var(--lk) * 0.48 + var(--lb)) 0.17 295 / 0.04);padding:0 1px", txt.slice(at, at + len));
        span.dataset.term = key;
        span.onclick = (e) => { e.stopPropagation(); showTerm(span, key, G[key]); };
        frag.appendChild(span);
        pos = at + len;
        found++;
      });
      frag.appendChild(document.createTextNode(txt.slice(pos)));
      n.parentNode.replaceChild(frag, n);
    }
  }

  /* ---------- matn ichida bo'shliq to'ldirish ---------- */
  function decorateCloze(pane, secId) {
    if (pane.dataset.clozeDone) return;
    pane.dataset.clozeDone = '1';
    const ok = (s) => {
      if (s.closest('details,figure,[data-mn],pre,button,[data-term]')) return false;
      const t = s.textContent.trim();
      return t.length >= 2 && t.length <= 26 && !/^\d+$/.test(t) && !/[:]$/.test(t);
    };
    const body = Array.from(pane.querySelectorAll('p strong, p code, li strong, li code')).filter((s) => ok(s) && !s.closest('[data-gate-arch]'));
    const arch = Array.from(pane.querySelectorAll('[data-gate-arch] strong')).filter(ok);
    const cands = body.concat(arch);
    const pick = [];
    cands.forEach((s) => { const par = s.closest('p,li,div'); if (pick.length < 3 && !pick.some((x) => x.closest('p,li,div') === par)) pick.push(s); });
    pick.forEach((s, i) => {
      const ans = s.textContent.trim();
      const id = secId + ':' + i;
      const w = el('span', 'display:inline-flex;align-items:baseline;gap:4px;vertical-align:baseline');
      w.dataset.cloze = id;
      const done = () => { w.innerHTML = ''; const ok = el('strong', "color:" + LIME + ";font-weight:600;background:oklch(calc(var(--lk) * 0.64 + var(--lb)) 0.18 130 / 0.06);padding:0 4px", ans); w.appendChild(ok); };
      if (P.cloze[id]) { done(); s.replaceWith(w); return; }
      const inp = el('input', "width:" + Math.max(7, ans.length + 2) + "ch;background:var(--bg2);border:none;border-bottom:2px solid " + YE + ";color:" + YE + ";font:600 16px " + MO + ";padding:1px 4px;outline:none");
      inp.placeholder = '?'.repeat(Math.min(ans.length, 8));
      inp.title = "Bo'shliqni to'ldiring (" + ans.length + ' harf) — Enter';
      const hint = el('button', "background:transparent;border:1px solid rgb(var(--ink-rgb) / 0.22);color:rgb(var(--ink-rgb) / 0.78);font:500 11px " + SG + ";padding:1px 6px;cursor:pointer", '💡');
      hint.type = 'button'; hint.title = 'Birinchi harflar';
      let tries = 0;
      hint.onclick = () => { inp.placeholder = ans.slice(0, Math.ceil(ans.length / 3)) + '…'; inp.focus(); };
      const check = () => {
        const v = norm(inp.value), a = norm(ans);
        if (!v) return;
        const good = v === a || (a.length > 5 && (a.indexOf(v) === 0 && v.length >= a.length - 2)) || a.replace(/[\s\-]/g, '') === v.replace(/[\s\-]/g, '');
        if (good) { P.cloze[id] = 1; save(); done(); addXP(tries ? 3 : 5, "Bo'shliq to'ldirildi"); badge('cloze1'); }
        else { tries++; inp.style.borderBottomColor = PINK; inp.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }], { duration: 260 }); if (tries >= 3) { inp.value = ans; inp.style.color = 'rgb(var(--ink-rgb) / 0.78)'; } }
      };
      inp.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); check(); } };
      inp.onblur = () => { if (inp.value.trim()) check(); };
      w.append(inp, hint);
      s.replaceWith(w);
    });
  }

  /* ---------- sxemani qadam-baqadam yurgizish ---------- */
  function decorateFigures(pane) {
    pane.querySelectorAll('figure').forEach((fig) => {
      if (fig.dataset.stepper) return;
      const svg = fig.querySelector('svg');
      if (!svg) return;
      const gs = Array.from(svg.querySelectorAll('g[style*="dSeq"]'));
      if (gs.length < 3) return;
      fig.dataset.stepper = '1';
      const delay = (g) => { const m = (g.getAttribute('style') || '').match(/dSeq\s+[\d.]+s\s+([\d.]+)s/); return m ? parseFloat(m[1]) : 0; };
      gs.sort((a, b) => delay(a) - delay(b));
      const orig = gs.map((g) => g.getAttribute('style'));
      const bar = el('div', 'display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:12px');
      const mk = (t, c) => { const b = el('button', "background:transparent;border:1.5px solid " + c + ";color:" + c + ";font:600 12px " + SG + ";padding:6px 11px;cursor:pointer", t); b.type = 'button'; return b; };
      const mode = mk('🎞 Qadam-baqadam', CY), prev = mk('◀', CY), next = mk('Keyingi ▶', LIME), cnt = el('span', "font:500 12px " + MO + ";color:rgb(var(--ink-rgb) / 0.78)");
      const cap = el('div', "font:500 14px/1.45 " + SG + ";color:" + LIME + ";margin-top:8px;min-height:20px");
      prev.style.display = next.style.display = 'none';
      let on = false, i = 0;
      const paint = () => {
        gs.forEach((g, k) => { g.style.animation = 'none'; g.style.opacity = k < i ? '0.55' : k === i ? '1' : '0.12'; g.style.transition = 'opacity .3s'; g.style.filter = k === i ? 'drop-shadow(0 0 6px ' + LIME + ')' : 'none'; });
        cnt.textContent = (i + 1) + ' / ' + gs.length;
        const t = Array.from(gs[i].querySelectorAll('text')).map((x) => x.textContent.trim()).filter(Boolean).join(' — ');
        cap.textContent = t ? (i + 1) + '-qadam: ' + t : '';
        prev.disabled = i === 0; next.textContent = i === gs.length - 1 ? '↺ Boshidan' : 'Keyingi ▶';
      };
      mode.onclick = () => {
        on = !on;
        if (on) { i = 0; paint(); mode.textContent = '✕ Animatsiyaga qaytish'; prev.style.display = next.style.display = ''; badge('steps'); }
        else { gs.forEach((g, k) => { g.setAttribute('style', orig[k]); g.style.filter = ''; }); mode.textContent = '🎞 Qadam-baqadam'; prev.style.display = next.style.display = 'none'; cnt.textContent = ''; cap.textContent = ''; }
      };
      prev.onclick = () => { if (i > 0) { i--; paint(); } };
      next.onclick = () => { i = i === gs.length - 1 ? 0 : i + 1; paint(); };
      bar.append(mode, prev, next, cnt);
      svg.insertAdjacentElement('afterend', cap);
      cap.insertAdjacentElement('afterend', bar);
    });
  }

  /* ---------- gate natijalarini kuzatib XP berish ---------- */
  function snapshot() {
    let st = {}, sum = {};
    try { st = JSON.parse(localStorage.getItem(CFG.key + '-gate') || '{}'); } catch (e) {}
    try { sum = JSON.parse(localStorage.getItem(CFG.key + '-gate-sum') || '{}'); } catch (e) {}
    let good = 0, perfect = 0, tasks = 0;
    const passedIds = {};
    Object.keys(st).forEach((sid) => {
      Object.keys(st[sid] || {}).forEach((k) => {
        const v = st[sid][k];
        if (v === 1) tasks++;
        else if (typeof v === 'number' && v >= 80) { good++; if (v >= 100) perfect++; }
      });
    });
    return { good, perfect, tasks, done: sum.done || 0, total: sum.total || CFG.ids.length };
  }
  function poll() {
    const s = snapshot();
    const o = P.snap;
    P.snap = s;
    if (!o) { save(); checkBadges(); return; }
    let xp = 0;
    if (s.good > o.good) xp += (s.good - o.good) * 10;
    if (s.tasks > o.tasks) { xp += (s.tasks - o.tasks) * 5; badge('lab1'); }
    if (s.perfect > o.perfect) badge('perfect');
    if (s.done > o.done) { xp += (s.done - o.done) * 50; celebrate(); toast("🎉 Bo'lim tugadi!", 'Keyingi bino yorishdi — xaritaga qarang', PINK, 4200); }
    save();
    if (xp) addXP(xp, s.done > o.done ? "Bo'lim yakuni" : 'Javob va topshiriqlar'); else checkBadges();
  }
  function checkBadges() {
    const s = P.snap || { done: 0, total: CFG.ids.length };
    if (s.done >= 1) badge('sec1');
    if (s.done >= 5) badge('sec5');
    if (s.total && s.done >= Math.ceil(s.total / 2)) badge('half');
    if (s.total && s.done >= s.total) badge('all');
    const oi = CFG.ids.indexOf(CFG.oomId || 's13');
    if (oi >= 0 && s.done > oi) badge('oom');
    const k = streak();
    if (k >= 3) badge('streak3');
    if (k >= 7) badge('streak7');
    if (P.xp >= 1000) badge('xp1000');
  }

  /* ---------- ishga tushirish ---------- */
  let busy = false;
  function decorateAll() {
    if (busy) return;
    busy = true;
    try {
      const panes = Array.from(document.querySelectorAll('[data-pane="read"]')).filter((p) => !p.dataset.playDone && p.style.display !== 'none' && p.offsetParent !== null);
      const pane = panes[0];
      if (pane) {
        pane.dataset.playDone = '1';
        const sec = pane.closest('div[id]');
        try { decorateCloze(pane, sec ? sec.id : 'x'); } catch (e) { console.warn('cloze', e); }
        try { decorateTerms(pane); } catch (e) { console.warn('terms', e); }
        try { decorateFigures(pane); } catch (e) { console.warn('figs', e); }
      }
    } finally { busy = false; }
  }

  window.Play = {
    init: function (cfg) {
      if (CFG) return;
      CFG = cfg;
      const KB = { Networking: ['🧭', 'Timeout ovchisi', "Timeout va refused bo'limi o'tildi"], Docker: ['📦', 'Konteyner ustasi', "Resurs chegarasi bo'limi o'tildi"], Kubernetes: ['☸️', 'CrashLoop ovchisi', "CrashLoopBackOff bo'limi o'tildi"], 'CI/CD': ['↩️', 'Rollback ustasi', "Rollback bo'limi o'tildi"] }[cfg.subject];
      if (KB) { const o = BADGES.find((x) => x[0] === 'oom'); if (o) { o[1] = KB[0]; o[2] = KB[1]; o[3] = KB[2]; } }
      load();
      if (!document.getElementById('play-kf')) {
        const st = document.createElement('style');
        st.id = 'play-kf';
        st.textContent = '@keyframes playPulse{0%,100%{box-shadow:0 0 0 0 rgb(var(--ink-rgb) / 0)}50%{box-shadow:0 0 18px 2px rgb(var(--ink-rgb) / 0.3)}}';
        root().appendChild(st);
      }
      const start = () => {
        try { buildHud(); } catch (e) { console.warn('hud', e); }
        setInterval(decorateAll, 900);
        try { poll(); } catch (e) { console.warn('poll', e); }
        setInterval(() => { try { poll(); } catch (e) {} }, 2000);
      };
      const later = () => setTimeout(start, 2500);
      if (document.readyState === 'complete') later(); else window.addEventListener('load', later, { once: true });
    },
  };
})();
