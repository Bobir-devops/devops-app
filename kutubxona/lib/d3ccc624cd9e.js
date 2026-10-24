/* suhbat-ui.js — Suhbat xonasi, istalgan konteynerga o'rnatiladi (bosh sahifa ichida ham). */
(function () {
const SG = "Lora,ui-sans-serif,sans-serif", MO = "'IBM Plex Mono',monospace", NR = 'Lora,Georgia,serif';
const CY = 'oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.11 68)', YE = 'oklch(calc(var(--lk) * 0.54 + var(--lb)) 0.08 40)', GR = 'oklch(calc(var(--lk) * 0.46 + var(--lb)) 0.15 150)', RD = 'oklch(calc(var(--lk) * 0.42 + var(--lb)) 0.18 25)';
const LV = { J: ['junior', GR], M: ['middle', YE], S: ['senior', RD] };
const KEY = 'suhbat-progress';
const el = (t, css, txt) => { const d = document.createElement(t); if (css) d.style.cssText = css; if (txt != null) d.textContent = txt; return d; };
const norm = (t) => (t || '').toLowerCase().replace(/[‘’'`´]/g, '').replace(/<[^>]+>/g, ' ');


class SuhbatApp {
  constructor(root) { this.root = root; }

  prog() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  mark(id, v) { const p = this.prog(); if (v) p[id] = v; else delete p[id]; try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} this.stats(); }

  data() {
    const D = window.SuhbatQ || { q: [], p: [] };
    const qs = D.q.map((x, i) => ({ id: 's' + (i + 1), n: i + 1, g: x.g, q: x.q, a: x.a, l: x.l }));
    const hh = (window.HhQ || []).map((x, i) => ({ id: x.id, n: i + 1, g: x.g, q: x.q, a: x.a, l: x.l }));
    const ps = D.p.map((x, i) => ({ id: 'p' + (i + 1), n: i + 1, g: x.g, t: x.t, d: x.d, a: x.a }));
    const da = (window.DeepQ || []).map((x, i) => ({ id: x.id, n: i + 1, g: x.g, q: x.q, a: x.a, l: x.l }));
    return { qs, hh, ps, da };
  }

  skin(root) {
    root.querySelectorAll('code').forEach((c) => { if (c.parentElement.tagName !== 'PRE') c.style.cssText = "font:500 14.5px " + MO + ";color:oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.11 68);background:rgb(var(--ink-rgb) / 0.07);padding:1px 5px"; });
    root.querySelectorAll('pre').forEach((p) => { p.style.cssText = "font:400 13.5px/1.65 " + MO + ";background:var(--bg);border:1px solid rgb(var(--ink-rgb) / 0.11);border-left:2px solid " + CY + ";padding:12px 14px;margin:10px 0;overflow:auto;color:var(--acc-deep);white-space:pre"; const c = p.querySelector('code'); if (c) c.style.cssText = 'font:inherit;color:inherit;background:none;padding:0'; });
    root.querySelectorAll('.box').forEach((b) => { const warn = b.classList.contains('warn'); b.style.cssText = 'border:1px solid ' + (warn ? 'oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.18 25 / 0.45)' : 'oklch(calc(var(--lk) * 0.6 + var(--lb)) 0.077 40 / 0.4)') + ';background:' + (warn ? 'oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.18 25 / 0.03)' : 'oklch(calc(var(--lk) * 0.6 + var(--lb)) 0.077 40 / 0.03)') + ';padding:10px 14px;margin:10px 0'; });
    root.querySelectorAll('.lbl').forEach((l) => { l.style.cssText = "font:500 11px " + SG + ";letter-spacing:.16em;text-transform:uppercase;color:" + YE + ";margin-bottom:4px"; });
    root.querySelectorAll('.term').forEach((t) => { t.style.cssText = "color:" + YE + ";border-bottom:1px dashed " + YE; });
    root.querySelectorAll('strong').forEach((s) => { s.style.cssText = 'color:var(--ink);font-weight:600'; });
    root.querySelectorAll('p').forEach((p) => { p.style.margin = '6px 0'; });
    root.querySelectorAll('.mnem').forEach((m) => { m.style.cssText = 'border:1px dashed oklch(calc(var(--lk) * 0.6 + var(--lb)) 0.077 40 / 0.5);background:oklch(calc(var(--lk) * 0.6 + var(--lb)) 0.077 40 / 0.035);padding:10px 14px;margin:10px 0'; });
    root.querySelectorAll('h3,h4').forEach((h) => { h.style.cssText = "font:500 " + (h.tagName === 'H3' ? '21px' : '17px') + "/1.3 " + SG + ";letter-spacing:-.01em;margin:22px 0 8px;color:var(--ink)"; });
    root.querySelectorAll('ul,ol').forEach((l) => { l.style.cssText = "font:400 16.5px/1.6 " + NR + ";color:rgb(var(--ink-rgb) / 1);margin:6px 0 10px;padding-left:22px"; });
    root.querySelectorAll('details.qa').forEach((d) => { d.style.cssText = 'border:1px solid rgb(var(--ink-rgb) / 0.13);background:var(--bg);padding:0 14px;margin:6px 0'; const su = d.querySelector('summary'); if (su) su.style.cssText = "font:400 16px/1.5 " + NR + ";color:var(--ink);padding:11px 0;cursor:pointer"; const a = d.querySelector('.ans'); if (a) a.style.cssText = "font:400 16px/1.6 " + NR + ";color:rgb(var(--ink-rgb) / 1);border-left:2px solid " + YE + ";padding:2px 0 10px 12px;margin-bottom:10px"; });
    root.querySelectorAll('.lvl').forEach((l) => { const c = l.classList.contains('l-s') ? RD : l.classList.contains('l-m') ? YE : GR; l.style.cssText = "font:500 10px " + SG + ";letter-spacing:.12em;text-transform:uppercase;color:" + c + ";border:1px solid currentColor;padding:1px 5px;margin-left:6px"; });
    root.querySelectorAll('table').forEach((t) => { t.style.cssText = "border-collapse:collapse;font:400 14px/1.5 " + NR + ";margin:8px 0"; t.querySelectorAll('td,th').forEach((c) => { c.style.cssText = 'border:1px solid rgb(var(--ink-rgb) / 0.15);padding:5px 9px;text-align:left'; }); });
  }

  stats() {
    const host = this.root.querySelector('[data-stats]');
    if (!host) return;
    const { qs, hh, ps, da } = this.data();
    const p = this.prog();
    const cnt = (arr) => arr.filter((x) => p[x.id] === 'ok').length;
    host.innerHTML = '';
    [['📖 Qo‘llanma', (window.GuideS || []).filter((x, i) => p['g' + (i + 1)] === 'ok').length, (window.GuideS || []).length, 'oklch(calc(var(--lk) * 0.44 + var(--lb)) 0.12 300)'], ['🧩 Qo‘shimcha mavzular', (window.GapS || []).filter((x, i) => p['x' + (i + 1)] === 'ok').length, (window.GapS || []).length, 'oklch(calc(var(--lk) * 0.46 + var(--lb)) 0.12 30)'], ['❓ 150 savol', cnt(qs), qs.length, CY], ['🏛 Chuqur arxitektura', cnt(da), da.length, 'oklch(calc(var(--lk) * 0.48 + var(--lb)) 0.13 260)'], ['🇺🇿 hh.uz talablari', cnt(hh), hh.length, GR], ['🏋️ Amaliy masala', cnt(ps), ps.length, YE]].forEach(([t, d, n, c]) => {
      const b = el('div', 'border:1px solid rgb(var(--ink-rgb) / 0.15);background:var(--bg2);padding:12px 14px;min-width:170px;flex:1 1 170px');
      b.append(el('div', "font:500 11px " + SG + ";letter-spacing:.16em;text-transform:uppercase;color:" + c, t));
      b.append(el('div', "font:500 24px " + SG + ";margin:6px 0 6px", d + ' / ' + n));
      const tr = el('div', 'height:3px;background:rgb(var(--ink-rgb) / 0.11)');
      tr.appendChild(el('div', 'height:3px;width:' + (n ? Math.round((d / n) * 100) : 0) + '%;background:' + c));
      b.appendChild(tr);
      host.appendChild(b);
    });
  }

  tabs() {
    const host = this.root.querySelector('[data-tabs]');
    if (!host || host.children.length) return;
    this.T = [['guide', '📖 Qo‘llanma'], ['gap', '🧩 Qo‘shimcha mavzular'], ['qs', '❓ 150 ta savol'], ['da', '🏛 Chuqur arxitektura'], ['hh', '🇺🇿 hh.uz talablari'], ['ps', '🏋️ 55 ta masala'], ['quick', '⚡ Tezkor suhbat'], ['skills', '📋 Nima so‘raladi']];
    this.T.forEach(([k, t]) => {
      const b = el('button', "border:1px solid rgb(var(--ink-rgb) / 0.18);background:transparent;padding:9px 15px;cursor:pointer;font:500 13.5px " + SG + ";color:rgb(var(--ink-rgb) / 0.84)", t);
      b.type = 'button'; b.dataset.k = k;
      b.onclick = () => this.show(k);
      host.appendChild(b);
    });
  }

  show(k) {
    this.cur = k;
    try { localStorage.setItem(KEY + '-tab', k); } catch (e) {}
    this.root.querySelectorAll('[data-tabs] button').forEach((b) => {
      const on = b.dataset.k === k;
      b.style.borderColor = on ? 'oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.11 68 / 0.6)' : 'rgb(var(--ink-rgb) / 0.18)';
      b.style.background = on ? 'oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.11 68 / 0.06)' : 'transparent';
      b.style.color = on ? 'var(--ink)' : 'rgb(var(--ink-rgb) / 0.84)';
    });
    const tools = this.root.querySelector('[data-tools]');
    tools.innerHTML = '';
    if (k === 'qs' || k === 'hh' || k === 'da') this.listQ(k);
    else if (k === 'ps') this.listP();
    else if (k === 'quick') this.quick();
    else if (k === 'guide') this.guide();
    else if (k === 'gap') this.guide('gap');
    else this.skills();
  }

  toolbar(onChange, withLevel) {
    const tools = this.root.querySelector('[data-tools]');
    const inp = el('input', "flex:1 1 240px;background:var(--bg2);border:1px solid rgb(var(--ink-rgb) / 0.22);color:var(--ink);font:400 15px " + NR + ";padding:9px 12px;outline:none");
    inp.type = 'search'; inp.placeholder = 'qidiruv: inode, probe, rebase…';
    tools.appendChild(inp);
    const f = { q: '', lvl: '', st: '' };
    const chip = (label, key, val, col) => {
      const b = el('button', "font:500 12px " + SG + ";padding:7px 11px;border:1px solid rgb(var(--ink-rgb) / 0.2);background:transparent;color:rgb(var(--ink-rgb) / 0.84);cursor:pointer", label);
      b.type = 'button';
      b.onclick = () => {
        f[key] = f[key] === val ? '' : val;
        tools.querySelectorAll('[data-chip="' + key + '"]').forEach((x) => { const on = f[key] === x.dataset.v; x.style.borderColor = on ? col : 'rgb(var(--ink-rgb) / 0.2)'; x.style.color = on ? 'var(--ink)' : 'rgb(var(--ink-rgb) / 0.84)'; x.style.background = on ? 'rgb(var(--ink-rgb) / 0.07)' : 'transparent'; });
        onChange(f);
      };
      b.dataset.chip = key; b.dataset.v = val;
      tools.appendChild(b);
    };
    if (withLevel) Object.keys(LV).forEach((k) => chip(LV[k][0], 'lvl', k, LV[k][1]));
    chip('✗ bilmaganlarim', 'st', 'no', RD);
    chip('○ hali ko‘rilmagan', 'st', 'new', CY);
    let t = null;
    inp.oninput = () => { clearTimeout(t); t = setTimeout(() => { f.q = inp.value.trim(); onChange(f); }, 140); };
    return f;
  }

  card(item, opts) {
    const p = this.prog();
    const box = el('details', 'border:1px solid rgb(var(--ink-rgb) / 0.13);background:var(--bg2);padding:0 16px;animation:sPop .25s both');
    const sum = el('summary', 'display:flex;gap:12px;align-items:baseline;padding:14px 0;cursor:pointer');
    const st = p[item.id];
    const mark = el('span', "font:500 12px " + MO + ";min-width:32px;color:" + (st === 'ok' ? GR : st === 'no' ? RD : 'rgb(var(--ink-rgb) / 0.58)'), st === 'ok' ? '✓' : st === 'no' ? '✗' : String(item.n));
    sum.appendChild(mark);
    const qt = el('span', "font:400 17px/1.5 " + NR + ";color:var(--ink);flex:1;text-wrap:pretty");
    qt.innerHTML = opts.title;
    sum.appendChild(qt);
    if (item.l && LV[item.l]) sum.appendChild(el('span', "flex:none;font:500 10px " + SG + ";letter-spacing:.14em;text-transform:uppercase;color:" + LV[item.l][1] + ";border:1px solid currentColor;padding:2px 6px", LV[item.l][0]));
    box.appendChild(sum);
    const body = el('div', 'padding:0 0 16px 44px');
    if (opts.desc) { const d = el('div', "font:400 16px/1.6 " + NR + ";color:rgb(var(--ink-rgb) / 0.98);margin-bottom:10px"); d.innerHTML = opts.desc; body.appendChild(d); }
    const reveal = el('button', "background:oklch(calc(var(--lk) * 0.6 + var(--lb)) 0.077 40 / 0.07);border:1px solid oklch(calc(var(--lk) * 0.6 + var(--lb)) 0.077 40 / 0.45);color:" + YE + ";font:500 12.5px " + SG + ";padding:8px 14px;cursor:pointer", opts.revealLabel || '🧠 Javobni ochish');
    reveal.type = 'button';
    const ans = el('div', "display:none;font:400 16.5px/1.65 " + NR + ";color:rgb(var(--ink-rgb) / 1);border-left:2px solid " + YE + ";padding:4px 0 4px 14px;margin-top:12px;text-wrap:pretty");
    ans.innerHTML = item.a;
    this.skin(ans);
    if (opts.desc) this.skin(body);
    const self = el('div', 'display:none;gap:8px;flex-wrap:wrap;margin-top:12px');
    const ok = el('button', "background:oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.07);border:1px solid oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.45);color:" + GR + ";font:500 12.5px " + SG + ";padding:8px 14px;cursor:pointer", '✓ Bildim');
    const no = el('button', "background:transparent;border:1px solid " + RD + ";color:" + RD + ";font:500 12.5px " + SG + ";padding:8px 14px;cursor:pointer", '✗ Qayta o‘qiyman');
    [ok, no].forEach((b) => { b.type = 'button'; self.appendChild(b); });
    reveal.onclick = () => { ans.style.display = 'block'; self.style.display = 'flex'; reveal.style.display = 'none'; };
    const set = (v) => { this.mark(item.id, v); mark.textContent = v === 'ok' ? '✓' : '✗'; mark.style.color = v === 'ok' ? GR : RD; };
    ok.onclick = () => { set('ok'); box.open = false; };
    no.onclick = () => set('no');
    body.append(reveal, ans, self);
    box.appendChild(body);
    return box;
  }

  listQ(k) {
    const view = this.root.querySelector('[data-view]');
    const all = this.data()[k];
    const draw = (f) => {
      const p = this.prog();
      view.innerHTML = '';
      if (k === 'da') {
        const intro = el('div', 'border:1px solid oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.13 260 / 0.45);background:oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.13 260 / 0.03);padding:16px 18px;margin-bottom:18px');
        intro.append(el('div', "font:500 11.5px " + SG + ";letter-spacing:.18em;text-transform:uppercase;color:oklch(calc(var(--lk) * 0.52 + var(--lb)) 0.12 260);margin-bottom:6px", 'Qanday javob berish'));
        intro.append(el('div', "font:400 16px/1.6 " + NR + ";color:rgb(var(--ink-rgb) / 0.98);text-wrap:pretty", "Bu savollarda suhbatdosh zanjirni kutadi: «nima sodir bo'ladi» — qadamlar tartibi bilan, «qanday tekshirasiz» — har qadamda bitta buyruq. Javobni avval qadamlar ro'yxati sifatida ovoz chiqarib ayting, keyin oching va tushib qolgan qadamni belgilang."));
        view.appendChild(intro);
      }
      if (k === 'hh') {
        const intro = el('div', 'border:1px solid oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.4);background:oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.025);padding:16px 18px;margin-bottom:18px');
        intro.append(el('div', "font:500 11.5px " + SG + ";letter-spacing:.18em;text-transform:uppercase;color:" + GR + ";margin-bottom:6px", 'Nega bu savollar'));
        intro.append(el('div', "font:400 16px/1.6 " + NR + ";color:rgb(var(--ink-rgb) / 0.98);text-wrap:pretty", "Toshkentdagi DevOps/SRE e'lonlarida (banklar, Uzum, Unitel, Paynet, Alif) talab qilingan, lekin qo'llanmada yo'q yoki yuzaki bo'lgan mavzular: GitHub Actions, OpenTelemetry, VictoriaMetrics, Zabbix, service mesh, Kafka/Redis, operatorlar, HPA, yopiq kontur, PostgreSQL, postmortem va on-call."));
        view.appendChild(intro);
      }
      const words = norm(f.q).split(/\s+/).filter((w) => w.length > 1);
      let g = null, n = 0;
      all.forEach((it) => {
        if (f.lvl && it.l !== f.lvl) return;
        if (f.st === 'no' && p[it.id] !== 'no') return;
        if (f.st === 'new' && p[it.id]) return;
        if (words.length) { const hay = norm(it.q + ' ' + it.a + ' ' + it.g); if (!words.every((w) => hay.includes(w))) return; }
        if (it.g !== g) { g = it.g; view.appendChild(el('h3', "font:500 20px/1.3 " + SG + ";letter-spacing:-.01em;margin:24px 0 10px", g)); }
        view.appendChild(this.card(it, { title: it.q }));
        view.lastChild.style.marginBottom = '6px';
        n++;
      });
      if (!n) view.appendChild(el('div', "font:400 16px " + NR + ";color:rgb(var(--ink-rgb) / 0.78);padding:20px 0", 'Mos savol topilmadi.'));
    };
    const f = this.toolbar(draw, true);
    draw(f);
  }

  listP() {
    const view = this.root.querySelector('[data-view]');
    const all = this.data().ps;
    const draw = (f) => {
      const p = this.prog();
      view.innerHTML = '';
      const words = norm(f.q).split(/\s+/).filter((w) => w.length > 1);
      let g = null;
      all.forEach((it) => {
        if (f.st === 'no' && p[it.id] !== 'no') return;
        if (f.st === 'new' && p[it.id]) return;
        if (words.length) { const hay = norm(it.t + ' ' + it.d + ' ' + it.a); if (!words.every((w) => hay.includes(w))) return; }
        if (it.g !== g) { g = it.g; view.appendChild(el('h3', "font:500 20px/1.3 " + SG + ";margin:24px 0 10px", g)); }
        const c = this.card(it, { title: it.t, desc: it.d, revealLabel: '▶️ Yechimni ochish' });
        c.style.marginBottom = '6px';
        view.appendChild(c);
      });
    };
    const f = this.toolbar(draw, false);
    draw(f);
  }

  quick() {
    const view = this.root.querySelector('[data-view]');
    view.innerHTML = '';
    const { qs, hh } = this.data();
    const p = this.prog();
    const pool = qs.concat(hh, this.data().da);
    const start = (n, weak) => {
      let list = pool.filter((x) => !weak || p[x.id] !== 'ok');
      if (list.length < n) list = pool.slice();
      list = list.sort(() => Math.random() - 0.5).slice(0, n);
      let i = 0, okN = 0;
      const t0 = Date.now();
      const step = () => {
        view.innerHTML = '';
        if (i >= list.length) {
          const secs = Math.round((Date.now() - t0) / 1000);
          const pct = Math.round((okN / list.length) * 100);
          const r = el('div', 'border:1px solid ' + (pct >= 70 ? GR : YE) + ';background:var(--bg2);padding:24px');
          r.append(el('div', "font:500 12px " + SG + ";letter-spacing:.18em;text-transform:uppercase;color:" + (pct >= 70 ? GR : YE), 'Natija'));
          r.append(el('div', "font:500 54px/1 " + SG + ";margin:12px 0", pct + '%'));
          r.append(el('div', "font:400 17px " + NR + ";color:rgb(var(--ink-rgb) / 0.93)", okN + ' / ' + list.length + ' bildim · ' + Math.floor(secs / 60) + ' daq ' + (secs % 60) + ' sek'));
          const again = el('button', "margin-top:18px;background:oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.11 68 / 0.08);border:1px solid oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.11 68 / 0.5);color:" + CY + ";font:500 13px " + SG + ";padding:10px 16px;cursor:pointer", '↻ Yana');
          again.type = 'button'; again.onclick = () => this.quick();
          r.appendChild(again);
          view.appendChild(r);
          this.stats();
          return;
        }
        const it = list[i];
        view.append(el('div', "font:500 12.5px " + MO + ";color:rgb(var(--ink-rgb) / 0.78);margin-bottom:10px", (i + 1) + ' / ' + list.length + '  ·  ' + it.g));
        const tr = el('div', 'height:3px;background:rgb(var(--ink-rgb) / 0.11);margin-bottom:18px');
        tr.appendChild(el('div', 'height:3px;width:' + ((i / list.length) * 100) + '%;background:' + CY));
        view.appendChild(tr);
        const box = el('div', 'border:1px solid rgb(var(--ink-rgb) / 0.18);background:var(--bg2);padding:clamp(20px,4vw,34px);animation:sPop .25s both');
        const q = el('div', "font:400 clamp(20px,3.2vw,27px)/1.4 " + NR + ";color:var(--ink);text-wrap:pretty");
        q.innerHTML = it.q;
        this.skin(q);
        box.appendChild(q);
        box.append(el('div', "font:400 15px " + NR + ";color:rgb(var(--ink-rgb) / 0.68);margin-top:14px", 'Ovoz chiqarib javob bering, keyin oching.'));
        const ans = el('div', "display:none;font:400 17px/1.65 " + NR + ";color:rgb(var(--ink-rgb) / 1);border-top:1px solid rgb(var(--ink-rgb) / 0.13);margin-top:18px;padding-top:16px");
        ans.innerHTML = it.a; this.skin(ans);
        box.appendChild(ans);
        const ctl = el('div', 'display:flex;flex-wrap:wrap;gap:8px;margin-top:18px');
        const open = el('button', "background:oklch(calc(var(--lk) * 0.6 + var(--lb)) 0.077 40 / 0.08);border:1px solid oklch(calc(var(--lk) * 0.6 + var(--lb)) 0.077 40 / 0.5);color:" + YE + ";font:500 13px " + SG + ";padding:10px 16px;cursor:pointer", '🧠 Ochish');
        const ok = el('button', "display:none;background:oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.07);border:1px solid oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.45);color:" + GR + ";font:500 13px " + SG + ";padding:10px 16px;cursor:pointer", '✓ Bildim');
        const no = el('button', "display:none;background:transparent;border:1px solid " + RD + ";color:" + RD + ";font:500 13px " + SG + ";padding:10px 16px;cursor:pointer", '✗ Bilmadim');
        [open, ok, no].forEach((b) => { b.type = 'button'; ctl.appendChild(b); });
        open.onclick = () => { ans.style.display = 'block'; open.style.display = 'none'; ok.style.display = 'inline-block'; no.style.display = 'inline-block'; };
        ok.onclick = () => { this.mark(it.id, 'ok'); okN++; i++; step(); };
        no.onclick = () => { this.mark(it.id, 'no'); i++; step(); };
        box.appendChild(ctl);
        view.appendChild(box);
      };
      step();
    };
    const intro = el('div', 'border:1px solid rgb(var(--ink-rgb) / 0.15);background:var(--bg2);padding:22px');
    intro.append(el('div', "font:500 12px " + SG + ";letter-spacing:.18em;text-transform:uppercase;color:" + CY, '⚡ Tezkor suhbat'));
    intro.append(el('div', "font:400 17px/1.6 " + NR + ";color:rgb(var(--ink-rgb) / 0.96);margin:10px 0 16px;max-width:620px;text-wrap:pretty", "Aralash savollar: qo'llanmadagi 150 ta va hh.uz bo'yicha 22 ta. Har savolga ovoz chiqarib javob bering, so'ng ochib o'zingizni baholang. Suhbatdan bir kun oldin «bilmaganlarim» rejimida takrorlang."));
    const row = el('div', 'display:flex;flex-wrap:wrap;gap:8px');
    [['15 ta savol', 15, false], ['30 ta savol', 30, false], ['Bilmaganlarimdan 20 ta', 20, true]].forEach(([t, n, w]) => {
      const b = el('button', "background:oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.11 68 / 0.07);border:1px solid oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.11 68 / 0.45);color:" + CY + ";font:500 13px " + SG + ";padding:10px 16px;cursor:pointer", '▶ ' + t);
      b.type = 'button'; b.onclick = () => start(n, w);
      row.appendChild(b);
    });
    intro.appendChild(row);
    view.appendChild(intro);
  }

  guide(kind) {
    const view = this.root.querySelector('[data-view]');
    view.innerHTML = '';
    const isGap = kind === 'gap';
    const G = (isGap ? window.GapS : window.GuideS) || [];
    const pfx = isGap ? 'x' : 'g';
    const wrap = el('div', 'display:flex;flex-wrap:wrap;gap:28px;align-items:flex-start');
    const nav = el('div', 'flex:0 1 230px;min-width:200px;position:sticky;top:70px;max-height:calc(100vh - 90px);overflow:auto;display:flex;flex-direction:column;gap:2px');
    const body = el('div', 'flex:1 1 520px;min-width:0;max-width:780px');
    const p = this.prog();
    G.forEach((sec, i) => {
      const id = pfx + (i + 1);
      const b = el('button', "text-align:left;background:transparent;border:0;border-left:1px solid rgb(var(--ink-rgb) / 0.13);padding:6px 0 6px 12px;cursor:pointer;font:400 14px/1.35 " + NR + ";color:" + (p[id] === 'ok' ? GR : 'rgb(var(--ink-rgb) / 0.84)'), (p[id] === 'ok' ? '✓ ' : (i + 1) + '. ') + sec.t);
      b.type = 'button';
      b.onclick = () => { const t = this.root.querySelector('#gs-' + id); if (t) window.scrollTo(0, t.getBoundingClientRect().top + window.scrollY - 70); };
      nav.appendChild(b);
      const box = el('div', 'padding:28px 0 18px;border-top:1px solid rgb(var(--ink-rgb) / 0.11)');
      box.id = 'gs-' + id;
      box.append(el('div', "font:500 11.5px " + SG + ";letter-spacing:.22em;text-transform:uppercase;color:" + CY, (isGap ? 'Qo‘shimcha mavzu · ' : 'Qo‘llanma · ') + (i + 1)));
      box.append(el('h2', "font:500 clamp(24px,3.6vw,32px)/1.18 " + SG + ";letter-spacing:-.02em;margin:8px 0 14px", sec.t));
      const c = el('div', "font:400 17px/1.65 " + NR + ";color:rgb(var(--ink-rgb) / 1);text-wrap:pretty");
      c.innerHTML = sec.h;
      this.skin(c);
      box.appendChild(c);
      const done = el('button', "margin-top:14px;background:" + (p[id] === 'ok' ? 'oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.07)' : 'transparent') + ";border:1px solid oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.45);color:" + GR + ";font:500 12.5px " + SG + ";padding:8px 14px;cursor:pointer", p[id] === 'ok' ? '✓ O‘qildi' : '✓ O‘qib bo‘ldim');
      done.type = 'button';
      done.onclick = () => { this.mark(id, 'ok'); done.textContent = '✓ O‘qildi'; done.style.background = 'oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.07)'; b.textContent = '✓ ' + sec.t; b.style.color = GR; };
      box.appendChild(done);
      body.appendChild(box);
    });
    wrap.append(nav, body);
    view.appendChild(wrap);
  }

  skills() {
    const view = this.root.querySelector('[data-view]');
    view.innerHTML = '';
    const S = [
      ['Deyarli har e‘londa', CY, ['Linux (Ubuntu/CentOS) administrlash', 'Docker va Kubernetes — production tajriba', 'CI/CD: GitLab CI (ko‘p banklarda), GitHub Actions (Ipak Yo‘li)', 'Prometheus + Grafana', 'Bash yoki Python skripting', 'TCP/IP, DNS, HTTPS, L7 reverse proxy (nginx)']],
      ['Ko‘p e‘lonlarda', YE, ['GitOps: Argo CD yoki Flux', 'Helm', 'Ansible va Terraform', 'Loki / ELK / OpenSearch — loglar', 'Vault va secretlar', 'SAST/SCA, Trivy (DevSecOps)', 'Alertmanager, SLO, on-call va postmortem']],
      ['Plus bo‘ladi', GR, ['OpenTelemetry, Tempo — tracing', 'VictoriaMetrics, Zabbix', 'Kafka, Redis, PostgreSQL — K8s ichida', 'Istio/Envoy, Cilium', 'Operator/controller yozish (Go)', 'Nexus/Harbor, yopiq kontur', 'AWS / Yandex Cloud']],
    ];
    S.forEach(([t, c, items]) => {
      const box = el('div', 'border:1px solid rgb(var(--ink-rgb) / 0.15);background:var(--bg2);padding:18px 20px;margin-bottom:12px');
      box.append(el('div', "font:500 12px " + SG + ";letter-spacing:.18em;text-transform:uppercase;color:" + c + ";margin-bottom:10px", t));
      const ul = el('div', 'display:flex;flex-direction:column;gap:6px');
      items.forEach((x) => { const r = el('div', 'display:flex;gap:10px;align-items:baseline'); r.append(el('span', 'color:' + c, '•'), el('span', "font:400 16.5px/1.5 " + NR + ";color:rgb(var(--ink-rgb) / 1)", x)); ul.appendChild(r); });
      box.appendChild(ul);
      view.appendChild(box);
    });
    const note = el('div', "font:400 15px/1.6 " + NR + ";color:rgb(var(--ink-rgb) / 0.78);margin-top:10px;text-wrap:pretty", "Manba: hh.uz'dagi 2026-yil oktyabr holatidagi DevOps/SRE e'lonlari (Toshkent, 92 ta vakansiya) va ochiq e'lon matnlari. Talablar kompaniyaga qarab farq qiladi — suhbatdan oldin aynan o'sha e'lonni qayta o'qing.");
    view.appendChild(note);
  }

  componentDidMount() {
    const boot = () => {
      if (!window.SuhbatQ) return;
      this.tabs();
      this.stats();
      if (!this.cur) { let k = 'qs'; try { k = localStorage.getItem(KEY + '-tab') || 'guide'; } catch (e) {} this.show(k); }
    };
    [0, 200, 600, 1500].forEach((d) => setTimeout(boot, d));
  }


}
window.SuhbatUI = { mount: function (root) { if (root.__suhbat) return root.__suhbat; const app = new SuhbatApp(root); root.__suhbat = app; if (window.SuhbatQ) { app.tabs(); app.stats(); app.show('guide'); } app.componentDidMount(); return app; } };
})();
