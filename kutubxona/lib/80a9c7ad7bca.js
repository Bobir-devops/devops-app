/* lfcs-ui.js — LFCS sertifikat bo'limi (bosh sahifa ichiga o'rnatiladi). */
(function () {
  const SG = "Lora,ui-sans-serif,sans-serif", MO = "'IBM Plex Mono',monospace", NR = 'Lora,Georgia,serif';
  const CY = 'oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.11 68)', YE = 'oklch(calc(var(--lk) * 0.54 + var(--lb)) 0.08 40)', GR = 'oklch(calc(var(--lk) * 0.46 + var(--lb)) 0.15 150)', VI = 'oklch(calc(var(--lk) * 0.48 + var(--lb)) 0.13 290)';
  const KEY = 'lfcs-progress';
  const LINKS = [
    ['🧪 KodeKloud kursi va 29 ta lab', 'https://kodekloud.com/courses/linux-foundation-certified-system-administrator-lfcs'],
    ['📒 KodeKloud konspektlari', 'https://notes.kodekloud.com/docs/Prep-Course-Linux-Foundation-Certified-System-Administrator-LFCS-Certification/Introduction/Course-Introduction/page'],
    ['🎬 Udemy kursi (labs bilan)', 'https://www.udemy.com/course/linux-foundation-certified-systems-administrator-lfcs/'],
    ['🎓 Imtihon sahifasi (Linux Foundation)', 'https://training.linuxfoundation.org/certification/linux-foundation-certified-sysadmin-lfcs/'],
    ['⏱ killer.sh simulyatori', 'https://killer.sh'],
  ];
  const DOM = [['Operations Deployment', 25], ['Networking', 25], ['Storage', 20], ['Essential Commands', 20], ['Users and Groups', 10]];
  const UZ = { 'Introduction': 'Kirish', 'Essential Commands': 'Asosiy buyruqlar', 'Operations Deployment': 'Tizim operatsiyalari', 'Users and Groups': 'Foydalanuvchi va guruhlar', 'Networking': 'Tarmoq', 'Storage': 'Saqlash (storage)', 'Conclusion': 'Yakun' };
  const el = (t, css, txt) => { const d = document.createElement(t); if (css) d.style.cssText = css; if (txt != null) d.textContent = txt; return d; };
  const prog = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } };
  const mark = (id, v) => { const p = prog(); if (v) p[id] = 1; else delete p[id]; try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} };
  const code = (t) => t.replace(/`([^`]+)`/g, '<code style="font:500 14px ' + MO + ';color:' + CY + '">$1</code>');

  function App(root) { this.root = root; this.D = window.LfcsData || []; }

  App.prototype.stats = function () {
    const host = this.root.querySelector('[data-lf-stats]');
    const p = prog();
    let lt = 0, ld = 0, tt = 0, td = 0;
    this.D.forEach((c) => {
      c.lessons.forEach((l) => { lt++; if (p['l:' + c.ch + ':' + l.n]) ld++; });
      c.labs.forEach((lab, i) => lab.tasks.forEach((t, j) => { tt++; if (p['t:' + c.ch + ':' + i + ':' + j]) td++; }));
    });
    host.innerHTML = '';
    [['🎬 Darslar', ld, lt, CY], ['🧪 Lab vazifalari', td, tt, GR], ['📊 Umumiy', ld + td, lt + tt, YE]].forEach(([t, d, n, col]) => {
      const b = el('div', 'border:1px solid rgb(var(--ink-rgb) / 0.15);background:var(--bg2);padding:12px 14px;flex:1 1 170px');
      b.append(el('div', 'font:500 11px ' + SG + ';letter-spacing:.16em;text-transform:uppercase;color:' + col, t));
      b.append(el('div', 'font:500 24px ' + SG + ';margin:6px 0', d + ' / ' + n + '  ·  ' + (n ? Math.round((d / n) * 100) : 0) + '%'));
      const tr = el('div', 'height:3px;background:rgb(var(--ink-rgb) / 0.11)');
      tr.appendChild(el('div', 'height:3px;width:' + (n ? Math.round((d / n) * 100) : 0) + '%;background:' + col));
      b.appendChild(tr);
      host.appendChild(b);
    });
  };

  App.prototype.tabs = function () {
    const host = this.root.querySelector('[data-lf-tabs]');
    if (host.children.length) return;
    const all = [['about', '🎓 Imtihon']].concat(this.D.map((c, i) => [String(i), UZ[c.ch] || c.ch]));
    all.forEach(([k, t]) => {
      const b = el('button', 'border:1px solid rgb(var(--ink-rgb) / 0.18);background:transparent;padding:8px 13px;cursor:pointer;font:500 13px ' + SG + ';color:rgb(var(--ink-rgb) / 0.84)', t);
      b.type = 'button'; b.dataset.k = k;
      b.onclick = () => this.show(k);
      host.appendChild(b);
    });
  };

  App.prototype.show = function (k) {
    try { localStorage.setItem(KEY + '-tab', k); } catch (e) {}
    this.root.querySelectorAll('[data-lf-tabs] button').forEach((b) => {
      const on = b.dataset.k === k;
      b.style.borderColor = on ? 'oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.13 290 / 0.6)' : 'rgb(var(--ink-rgb) / 0.18)';
      b.style.background = on ? 'oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.13 290 / 0.06)' : 'transparent';
      b.style.color = on ? 'var(--ink)' : 'rgb(var(--ink-rgb) / 0.84)';
    });
    const v = this.root.querySelector('[data-lf-view]');
    v.innerHTML = '';
    if (k === 'about') return this.about(v);
    this.chapter(v, this.D[+k]);
    window.scrollTo(0, this.root.getBoundingClientRect().top + window.scrollY - 10);
  };

  App.prototype.about = function (v) {
    const box = el('div', 'border:1px solid rgb(var(--ink-rgb) / 0.15);background:var(--bg2);padding:20px;margin-bottom:14px');
    box.append(el('div', 'font:500 12px ' + SG + ';letter-spacing:.18em;text-transform:uppercase;color:' + VI, 'Imtihon haqida'));
    const p = el('div', 'font:400 17px/1.65 ' + NR + ';color:rgb(var(--ink-rgb) / 1);margin-top:10px;text-wrap:pretty');
    p.innerHTML = "LFCS — <strong style=\"color:var(--ink)\">amaliy</strong> imtihon: test emas, brauzerdagi terminalda 2 soat ichida real serverlarda vazifalar bajarasiz. Natija tizim holatiga qarab tekshiriladi — buyruqni yozish yetmaydi, o'zgarish <strong style=\"color:var(--ink)\">doimiy</strong> bo'lishi (reboot'dan keyin ham saqlanishi) kerak. Imtihon paytida <code style=\"font:500 14px " + MO + ";color:" + CY + "\">man</code> va <code style=\"font:500 14px " + MO + ";color:" + CY + "\">--help</code> ishlatish mumkin.";
    box.appendChild(p);
    v.appendChild(box);
    const dom = el('div', 'border:1px solid rgb(var(--ink-rgb) / 0.15);background:var(--bg2);padding:20px;margin-bottom:14px');
    dom.append(el('div', 'font:500 12px ' + SG + ';letter-spacing:.18em;text-transform:uppercase;color:' + YE + ';margin-bottom:12px', 'Imtihon bo‘limlari va ulushi'));
    DOM.forEach(([n, w]) => {
      const r = el('div', 'margin-bottom:10px');
      const top = el('div', 'display:flex;justify-content:space-between;font:400 16px ' + NR + ';color:rgb(var(--ink-rgb) / 1);margin-bottom:4px');
      top.append(el('span', null, (UZ[n] || n) + ' · ' + n), el('span', 'font:500 13px ' + MO + ';color:' + YE, w + '%'));
      r.appendChild(top);
      const tr = el('div', 'height:4px;background:rgb(var(--ink-rgb) / 0.11)');
      tr.appendChild(el('div', 'height:4px;width:' + (w * 4) + '%;background:' + YE));
      r.appendChild(tr);
      dom.appendChild(r);
    });
    dom.append(el('div', 'font:400 14.5px/1.55 ' + NR + ';color:rgb(var(--ink-rgb) / 0.73);margin-top:8px', "Ulushlar Linux Foundation'ning joriy o'quv dasturiga ko'ra; topshirishdan oldin rasmiy sahifada tekshiring."));
    v.appendChild(dom);
    const ln = el('div', 'border:1px solid rgb(var(--ink-rgb) / 0.15);background:var(--bg2);padding:20px');
    ln.append(el('div', 'font:500 12px ' + SG + ';letter-spacing:.18em;text-transform:uppercase;color:' + GR + ';margin-bottom:12px', 'Havolalar'));
    const row = el('div', 'display:flex;flex-wrap:wrap;gap:8px');
    LINKS.forEach(([t, u]) => { const a = el('a', 'font:500 13px ' + SG + ';padding:9px 14px;border:1px solid rgb(var(--ink-rgb) / 0.22);color:var(--ink);text-decoration:none', t + ' ↗'); a.href = u; a.target = '_blank'; a.rel = 'noopener'; row.appendChild(a); });
    ln.appendChild(row);
    ln.append(el('div', 'font:400 14.5px/1.55 ' + NR + ';color:rgb(var(--ink-rgb) / 0.73);margin-top:12px;text-wrap:pretty', "Subtitrlarda laboratoriyalarning alohida havolalari yo'q edi — ular KodeKloud kursi ichida, har bobdagi darslardan keyin turadi. Har lab kartasidagi tugma kursni ochadi; lab nomi KodeKloud'dagi nom bilan bir xil."));
    v.appendChild(ln);
  };

  App.prototype.chapter = function (v, c) {
    const p = prog();
    v.append(el('h2', 'font:500 clamp(24px,3.6vw,32px)/1.2 ' + SG + ';letter-spacing:-.02em;margin:6px 0 8px', (UZ[c.ch] || c.ch) + ' · ' + c.ch));
    v.append(el('div', 'font:400 17px/1.6 ' + NR + ';color:rgb(var(--ink-rgb) / 0.96);margin-bottom:16px;max-width:720px;text-wrap:pretty', c.intro));
    c.lessons.forEach((l) => {
      const id = 'l:' + c.ch + ':' + l.n;
      const done = !!p[id];
      const card = el('div', 'display:flex;gap:14px;align-items:flex-start;border:1px solid rgb(var(--ink-rgb) / 0.11);background:var(--bg2);padding:13px 15px;margin-bottom:6px');
      const chk = el('button', 'flex:none;width:26px;height:26px;border:1px solid ' + (done ? GR : 'rgb(var(--ink-rgb) / 0.3)') + ';background:' + (done ? 'oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.2)' : 'transparent') + ';color:' + GR + ';font:600 14px ' + SG + ';cursor:pointer', done ? '✓' : '');
      chk.type = 'button'; chk.title = 'Darsni ko‘rdim';
      chk.onclick = () => { const now = !prog()[id]; mark(id, now); chk.textContent = now ? '✓' : ''; chk.style.borderColor = now ? GR : 'rgb(var(--ink-rgb) / 0.3)'; chk.style.background = now ? 'oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.2)' : 'transparent'; this.stats(); };
      const body = el('div', 'flex:1;min-width:0');
      const top = el('div', 'display:flex;flex-wrap:wrap;gap:10px;align-items:baseline');
      top.append(el('span', 'font:500 12px ' + MO + ';color:rgb(var(--ink-rgb) / 0.63)', String(l.n).padStart(3, '0')), el('span', 'font:500 16px/1.4 ' + SG + ';color:var(--ink)', l.t));
      if (l.dur) top.append(el('span', 'font:500 11.5px ' + MO + ';color:rgb(var(--ink-rgb) / 0.63)', '⏱ ' + l.dur));
      body.appendChild(top);
      if (l.s) body.append(el('div', 'font:400 15.5px/1.55 ' + NR + ';color:rgb(var(--ink-rgb) / 0.93);margin-top:4px;text-wrap:pretty', l.s));
      if (l.cmds && l.cmds.length) {
        const cm = el('div', 'display:flex;flex-wrap:wrap;gap:5px;margin-top:8px');
        l.cmds.forEach((x) => cm.append(el('span', 'font:500 12px ' + MO + ';color:' + CY + ';background:rgb(var(--ink-rgb) / 0.06);border:1px solid rgb(var(--ink-rgb) / 0.11);padding:2px 7px', x)));
        body.appendChild(cm);
      }
      card.append(chk, body);
      const nt = (window.LfcsNotes || {})[c.ch + '/' + l.n];
      const tx = (window.LfcsText || {})[c.ch + '/' + l.n];
      if (nt || tx) {
        const open = el('button', 'margin-top:10px;background:oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.13 290 / 0.06);border:1px solid oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.13 290 / 0.45);color:' + VI + ';font:500 12.5px ' + SG + ';padding:7px 13px;cursor:pointer', '📖 Darsni o‘rganish');
        open.type = 'button';
        const panel = el('div', 'display:none;margin-top:12px;border-top:1px solid rgb(var(--ink-rgb) / 0.11);padding-top:12px');
        if (nt) {
          const mm = (window.LfcsMemo || {})[c.ch + '/' + l.n];
          if (mm && mm.e) {
            const ex = el('div', 'border-left:2px solid ' + CY + ';background:oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.11 68 / 0.03);padding:10px 14px;margin:0 0 12px');
            ex.append(el('div', 'font:500 11px ' + SG + ';letter-spacing:.18em;text-transform:uppercase;color:' + CY + ';margin-bottom:5px', '💡 Oddiy qilib aytganda'));
            ex.append(el('div', 'font:400 16.5px/1.6 ' + NR + ';color:rgb(var(--ink-rgb) / 1);text-wrap:pretty', mm.e));
            panel.appendChild(ex);
          }
          nt.p.forEach((t) => panel.append(el('p', 'font:400 16.5px/1.65 ' + NR + ';color:rgb(var(--ink-rgb) / 1);margin:0 0 10px;text-wrap:pretty', t)));
          if (nt.c) panel.append(el('pre', 'font:400 13.5px/1.6 ' + MO + ';background:var(--bg);border:1px solid rgb(var(--ink-rgb) / 0.11);border-left:2px solid ' + CY + ';padding:11px 13px;margin:6px 0 10px;white-space:pre-wrap;color:var(--acc-deep)', nt.c));
          if (mm && mm.m) {
            const mb = el('details', 'background:rgb(var(--acc-rgb) / 0.03);border:1px solid rgb(var(--acc-rgb) / 0.3);padding:0 14px;margin:4px 0 12px');
            mb.appendChild(el('summary', 'font:500 11.5px ' + SG + ';letter-spacing:.18em;text-transform:uppercase;color:' + YE + ';padding:11px 0;cursor:pointer', '🧠 Eslab qolish — mnemonika'));
            mb.appendChild(el('div', 'font:400 16.5px/1.6 ' + NR + ';color:rgb(var(--ink-rgb) / 1);padding:0 0 12px;text-wrap:pretty', mm.m));
            panel.appendChild(mb);
          }
        } else {
          panel.append(el('div', 'font:400 15px/1.55 ' + NR + ';color:rgb(var(--ink-rgb) / 0.78);margin-bottom:10px', "Bu dars uchun o‘zbekcha konspekt hali yozilmagan — quyida darsning to‘liq matni."));
        }
        if (tx && tx.length) {
          const d = el('details', 'border:1px solid rgb(var(--ink-rgb) / 0.13);background:var(--bg);padding:0 14px');
          d.appendChild(el('summary', 'font:500 12px ' + SG + ';letter-spacing:.12em;text-transform:uppercase;color:rgb(var(--ink-rgb) / 0.78);padding:11px 0;cursor:pointer', '🎬 Darsning to‘liq matni (ingliz tilida)'));
          tx.forEach((t) => d.append(el('p', 'font:400 15px/1.65 ' + NR + ';color:rgb(var(--ink-rgb) / 0.9);margin:0 0 10px', t)));
          panel.appendChild(d);
        }
        open.onclick = () => { const o = panel.style.display === 'none'; panel.style.display = o ? 'block' : 'none'; open.textContent = o ? '✕ Yopish' : '📖 Darsni o‘rganish'; };
        body.append(open, panel);
      }
      v.appendChild(card);
      c.labs.forEach((lab, li) => { if (lab.after === l.n) v.appendChild(this.lab(c, lab, li)); });
    });
  };

  App.prototype.lab = function (c, lab, li) {
    const p = prog();
    const box = el('div', 'border:1px solid ' + GR + ';background:oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.025);padding:16px 18px;margin:12px 0 18px');
    const top = el('div', 'display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;margin-bottom:10px');
    top.append(el('div', 'font:500 12px ' + SG + ';letter-spacing:.16em;text-transform:uppercase;color:' + GR, '🧪 Lab — ' + lab.name));
    const a = el('a', 'font:500 12.5px ' + SG + ';padding:7px 12px;border:1px solid ' + GR + ';color:' + GR + ';text-decoration:none', 'KodeKloud‘da ochish ↗');
    a.href = LINKS[0][1]; a.target = '_blank'; a.rel = 'noopener';
    top.appendChild(a);
    box.appendChild(top);
    box.append(el('div', 'font:400 15px/1.55 ' + NR + ';color:rgb(var(--ink-rgb) / 0.83);margin-bottom:10px', "Avval o'zingiz test serverda yoki VM'da bajaring, keyin yechimni oching. Imtihondagidek: o'zgarish reboot'dan keyin ham saqlansin."));
    lab.tasks.forEach((t, j) => {
      const id = 't:' + c.ch + ':' + li + ':' + j;
      const row = el('div', 'border-top:1px solid rgb(var(--ink-rgb) / 0.09);padding:10px 0');
      const q = el('div', 'display:flex;gap:10px;align-items:baseline');
      const st = el('span', 'flex:none;font:500 12px ' + MO + ';color:' + (p[id] ? GR : 'rgb(var(--ink-rgb) / 0.63)'), p[id] ? '✓' : (j + 1) + '.');
      const qt = el('span', 'font:400 16px/1.5 ' + NR + ';color:var(--ink);text-wrap:pretty');
      qt.innerHTML = code(t[0]);
      q.append(st, qt);
      row.appendChild(q);
      const ctl = el('div', 'display:flex;flex-wrap:wrap;gap:8px;margin:8px 0 0 26px');
      const show = el('button', 'background:oklch(calc(var(--lk) * 0.6 + var(--lb)) 0.077 40 / 0.06);border:1px solid oklch(calc(var(--lk) * 0.6 + var(--lb)) 0.077 40 / 0.45);color:' + YE + ';font:500 12px ' + SG + ';padding:6px 12px;cursor:pointer', '▶ Yechim');
      const ok = el('button', 'background:oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.06);border:1px solid oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.45);color:' + GR + ';font:500 12px ' + SG + ';padding:6px 12px;cursor:pointer', p[id] ? '✓ Bajarildi' : '✓ Bajardim');
      [show, ok].forEach((x) => { x.type = 'button'; ctl.appendChild(x); });
      const sol = el('pre', 'display:none;font:400 13.5px/1.6 ' + MO + ';background:var(--bg);border:1px solid rgb(var(--ink-rgb) / 0.11);border-left:2px solid ' + YE + ';padding:10px 12px;margin:8px 0 0 26px;white-space:pre-wrap;color:var(--acc-deep)', t[1]);
      show.onclick = () => { sol.style.display = sol.style.display === 'none' ? 'block' : 'none'; };
      ok.onclick = () => { const now = !prog()[id]; mark(id, now); ok.textContent = now ? '✓ Bajarildi' : '✓ Bajardim'; st.textContent = now ? '✓' : (j + 1) + '.'; st.style.color = now ? GR : 'rgb(var(--ink-rgb) / 0.63)'; this.stats(); };
      row.append(ctl, sol);
      box.appendChild(row);
    });
    return box;
  };

  window.LfcsUI = {
    mount: function (root) {
      if (root.__lf) return root.__lf;
      const app = new App(root);
      root.__lf = app;
      app.tabs(); app.stats();
      let k = 'about'; try { k = localStorage.getItem(KEY + '-tab') || 'about'; } catch (e) {}
      app.show(k);
      return app;
    },
  };
})();
