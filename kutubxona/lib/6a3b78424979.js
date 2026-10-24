/* practice-hub.js — takrorlash jadvali, intervyu rejimi, teskari savollar, kuchsiz joy hisoboti.
   Ikki sahifa (Linux Shahri, Kubernetes Zavodi) uchun umumiy. window.PracticeHub.init({key, subject}) */
(function () {
  const DAY = 86400000;
  const BOX = [0, 1, 3, 7, 21]; // kun: bilmadim → bugun, keyin 1/3/7/21
  const CY = 'oklch(calc(var(--lk) * 0.48 + var(--lb)) 0.11 68)', YE = 'oklch(calc(var(--lk) * 0.52 + var(--lb)) 0.077 40)', GR = 'oklch(calc(var(--lk) * 0.42 + var(--lb)) 0.15 150)', RD = 'oklch(calc(var(--lk) * 0.4 + var(--lb)) 0.19 25)';
  const INK = 'var(--ink)', SUB = 'rgb(var(--ink-rgb) / 0.86)';
  const SG = "Lora,ui-sans-serif,sans-serif";
  const NR = 'Lora,Georgia,serif';

  const el = (tag, css, txt) => { const d = document.createElement(tag); if (css) d.style.cssText = css; if (txt != null) d.textContent = txt; return d; };
  const btn = (label, kind) => {
    const map = {
      cy: ['oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.11 68 / 0.07)', 'oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.11 68 / 0.45)', 'oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.11 68)'],
      ye: ['oklch(calc(var(--lk) * 0.6 + var(--lb)) 0.077 40 / 0.08)', 'oklch(calc(var(--lk) * 0.6 + var(--lb)) 0.077 40 / 0.5)', 'oklch(calc(var(--lk) * 0.58 + var(--lb)) 0.077 40)'],
      gr: ['oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.07)', 'oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.45)', 'oklch(calc(var(--lk) * 0.52 + var(--lb)) 0.13 150)'],
      rd: ['oklch(calc(var(--lk) * 0.44 + var(--lb)) 0.19 25 / 0.07)', 'oklch(calc(var(--lk) * 0.44 + var(--lb)) 0.19 25 / 0.45)', 'oklch(calc(var(--lk) * 0.48 + var(--lb)) 0.17 25)'],
      gh: ['transparent', 'rgb(var(--ink-rgb) / 0.22)', 'rgb(var(--ink-rgb) / 0.88)'],
    };
    const [bg, bd, col] = map[kind] || map.gh;
    const b = el('button', `background:${bg};border:1px solid ${bd};color:${col};font:500 12.5px ${SG};letter-spacing:.04em;padding:9px 15px;cursor:pointer`, label);
    b.type = 'button';
    return b;
  };

  function Hub(opts) {
    this.key = opts.key + '-sr';
    this.subject = opts.subject || '';
    try { this.sr = JSON.parse(localStorage.getItem(this.key) || '{}'); } catch (e) { this.sr = {}; }
    this.cards = [];
  }

  Hub.prototype.save = function () { try { localStorage.setItem(this.key, JSON.stringify(this.sr)); } catch (e) {} };

  Hub.prototype.scan = function () {
    this.cards = Array.from(document.querySelectorAll('details[data-qid]')).map((det) => {
      const holder = det.previousElementSibling;
      const spans = holder ? holder.querySelectorAll('span') : [];
      const q = spans.length > 1 ? spans[1].textContent.trim() : (holder ? holder.textContent.trim() : '');
      const ansEl = det.querySelector('[data-answer]');
      const sec = det.closest('div[id^="q"]');
      const h2 = sec ? sec.querySelector('h2') : null;
      const eyebrow = sec ? sec.querySelector('div') : null;
      return {
        id: det.dataset.qid, det: det, q: q,
        a: ansEl ? ansEl.textContent.trim() : '',
        aHtml: ansEl ? ansEl.innerHTML : '',
        sec: h2 ? h2.textContent.replace(/\d+\/\d+$/, '').trim() : '',
        tag: eyebrow ? eyebrow.textContent.trim() : '',
      };
    }).filter((c) => c.q && c.a);
    return this.cards;
  };

  Hub.prototype.rec = function (id) { return this.sr[id] || { box: 0, due: 0, hits: 0, fails: 0, seen: 0 }; };

  Hub.prototype.grade = function (id, ok) {
    const r = this.rec(id);
    r.box = ok ? Math.min(BOX.length - 1, r.box + 1) : 0;
    r.due = Date.now() + BOX[r.box] * DAY;
    r.seen = (r.seen || 0) + 1;
    if (ok) r.hits = (r.hits || 0) + 1; else r.fails = (r.fails || 0) + 1;
    this.sr[id] = r;
    this.save();
    this.paintBar();
  };

  Hub.prototype.due = function () {
    const now = Date.now();
    return this.cards.filter((c) => { const r = this.sr[c.id]; return !r || r.due <= now; });
  };

  /* ---------- overlay ---------- */
  Hub.prototype.overlay = function (title) {
    const back = el('div', 'position:fixed;inset:0;background:rgb(var(--ink-rgb) / 0.45);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding:28px 16px;overflow:auto');
    const card = el('div', 'background:var(--bg2);border:1px solid rgb(var(--ink-rgb) / 0.18);max-width:720px;width:100%;padding:24px 26px 26px');
    const head = el('div', 'display:flex;gap:14px;align-items:baseline;justify-content:space-between;margin-bottom:18px');
    head.append(el('div', `font:500 12px ${SG};letter-spacing:.26em;text-transform:uppercase;color:${YE}`, title));
    const x = btn('✕ Yopish', 'gh');
    const shut = () => { if (back.__onClose) back.__onClose(); back.remove(); };
    x.onclick = shut;
    head.appendChild(x);
    const body = el('div');
    card.append(head, body);
    back.appendChild(card);
    back.onclick = (e) => { if (e.target === back) shut(); };
    document.body.appendChild(back);
    return { back: back, body: body, close: shut, onClose: (fn) => { back.__onClose = fn; } };
  };

  /* ---------- 1. takrorlash jadvali ---------- */
  Hub.prototype.review = function (pool, title) {
    const queue = (pool || this.due()).slice();
    for (let i = queue.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = queue[i]; queue[i] = queue[j]; queue[j] = t; }
    if (!queue.length) { const o = this.overlay('Takrorlash'); o.body.append(el('div', `font:400 19px/1.6 ${NR};color:${SUB}`, 'Bugun takrorlanadigan savol qolmadi. Ertaga qaytib keling — jadval o‘zi eslatadi.')); return; }
    const o = this.overlay(title || 'Bugungi takrorlash');
    let i = 0, ok = 0;
    const prog = el('div', `font:500 12.5px 'IBM Plex Mono',monospace;color:${SUB};margin-bottom:12px`);
    const qEl = el('div', `font:400 21px/1.5 ${NR};color:${INK};margin-bottom:16px;text-wrap:pretty`);
    const aEl = el('div', `font:400 17px/1.6 ${NR};color:${SUB};border-left:2px solid ${YE};padding-left:14px;margin-bottom:18px;display:none`);
    const ctl = el('div', 'display:flex;flex-wrap:wrap;gap:8px');
    o.body.append(prog, qEl, aEl, ctl);
    const show = btn('Javobni ko‘rsat', 'ye');
    const good = btn('✓ Bildim', 'gr');
    const bad = btn('↻ Bilmadim', 'rd');
    const step = () => {
      if (i >= queue.length) {
        qEl.textContent = 'Tugadi.';
        aEl.style.display = 'none';
        ctl.innerHTML = '';
        const sum = el('div', `font:400 19px/1.6 ${NR};color:${INK}`, ok + ' / ' + queue.length + ' ta savolni bildingiz.');
        const next = el('div', `font:400 16px/1.6 ${NR};color:${SUB};margin-top:8px`, 'Bilganlaringiz keyingi takrorlash uchun 1 → 3 → 7 → 21 kun oralig‘iga surildi. Bilmaganlar ertaga qaytadi.');
        o.body.append(sum, next);
        this.paintBar();
        return;
      }
      const c = queue[i];
      const r = this.rec(c.id);
      prog.textContent = (i + 1) + ' / ' + queue.length + '   ·   ' + c.tag + '   ·   qadam ' + r.box + '/4';
      qEl.textContent = c.q;
      aEl.innerHTML = c.aHtml || c.a;
      aEl.style.display = 'none';
      ctl.innerHTML = '';
      ctl.appendChild(show);
    };
    show.onclick = () => { aEl.style.display = 'block'; ctl.innerHTML = ''; ctl.append(good, bad); };
    good.onclick = () => { this.grade(queue[i].id, true); ok++; i++; step(); };
    bad.onclick = () => { this.grade(queue[i].id, false); i++; step(); };
    step();
  };

  /* ---------- 2. intervyu rejimi ---------- */
  Hub.prototype.interview = function () {
    const all = this.cards.slice();
    if (all.length < 5) return;
    const pick = [];
    while (pick.length < Math.min(10, all.length)) { const c = all.splice(Math.floor(Math.random() * all.length), 1)[0]; pick.push(c); }
    const o = this.overlay('Intervyu rejimi — 10 savol');
    let i = 0, score = 0, t0 = Date.now(), timer;
    const bar = el('div', `display:flex;gap:16px;align-items:baseline;font:500 12.5px 'IBM Plex Mono',monospace;color:${SUB};margin-bottom:14px`);
    const cnt = el('span'), clock = el('span', `color:${YE}`);
    bar.append(cnt, clock);
    const qEl = el('div', `font:400 22px/1.45 ${NR};color:${INK};margin-bottom:16px;text-wrap:pretty`);
    const note = el('div', `font:400 15px/1.55 ${NR};color:rgb(var(--ink-rgb) / 0.68);margin-bottom:16px`, 'Javobni ovoz chiqarib aytib bering — keyin javobni ochib o‘zingizni baholaysiz.');
    const aEl = el('div', `font:400 17px/1.6 ${NR};color:${SUB};border-left:2px solid ${YE};padding-left:14px;margin-bottom:18px;display:none`);
    const ctl = el('div', 'display:flex;flex-wrap:wrap;gap:8px');
    o.body.append(bar, qEl, note, aEl, ctl);
    timer = setInterval(() => { clock.textContent = Math.floor((Date.now() - t0) / 1000) + 's'; }, 500);
    o.onClose(() => clearInterval(timer));
    const show = btn('Javobni ochish', 'ye'), good = btn('✓ To‘g‘ri aytdim', 'gr'), bad = btn('✗ Aytolmadim', 'rd');
    const step = () => {
      if (i >= pick.length) {
        clearInterval(timer);
        const secs = Math.floor((Date.now() - t0) / 1000);
        qEl.textContent = 'Natija: ' + score + ' / ' + pick.length;
        qEl.style.color = score >= pick.length * 0.7 ? GR : score >= pick.length * 0.4 ? YE : RD;
        note.textContent = 'Vaqt: ' + Math.floor(secs / 60) + ' daq ' + (secs % 60) + ' s   ·   savol boshiga ' + Math.round(secs / pick.length) + ' s';
        aEl.style.display = 'none';
        ctl.innerHTML = '';
        const miss = pick.filter((c) => c.missed);
        if (miss.length) {
          const h = el('div', `font:500 13px ${SG};letter-spacing:.2em;text-transform:uppercase;color:${RD};margin:18px 0 10px`, 'Qaytish kerak');
          o.body.appendChild(h);
          miss.forEach((c) => o.body.appendChild(el('div', `font:400 16px/1.5 ${NR};color:${SUB};margin-bottom:8px`, '· ' + c.tag + ' — ' + c.q)));
        }
        const again = btn('↻ Yana bir marta', 'cy');
        again.onclick = () => { o.close(); this.interview(); };
        ctl.appendChild(again);
        this.paintBar();
        return;
      }
      const c = pick[i];
      cnt.textContent = (i + 1) + ' / ' + pick.length + '  ·  ' + c.tag;
      qEl.textContent = c.q;
      qEl.style.color = INK;
      note.textContent = 'Javobni ovoz chiqarib aytib bering — keyin javobni ochib o‘zingizni baholaysiz.';
      aEl.innerHTML = c.aHtml || c.a;
      aEl.style.display = 'none';
      ctl.innerHTML = '';
      ctl.appendChild(show);
    };
    show.onclick = () => { aEl.style.display = 'block'; ctl.innerHTML = ''; ctl.append(good, bad); };
    good.onclick = () => { this.grade(pick[i].id, true); score++; i++; step(); };
    bad.onclick = () => { this.grade(pick[i].id, false); pick[i].missed = true; i++; step(); };
    step();
  };

  /* ---------- 3. teskari savollar ---------- */
  Hub.prototype.reverse = function () {
    const pool = this.cards.filter((c) => c.a.length > 60);
    if (pool.length < 4) return;
    const o = this.overlay('Teskari savollar — ta‘rifdan atamani top');
    let n = 0, ok = 0;
    const prog = el('div', `font:500 12.5px 'IBM Plex Mono',monospace;color:${SUB};margin-bottom:12px`);
    const defEl = el('div', `font:400 19px/1.6 ${NR};color:${INK};border-left:2px solid ${CY};padding-left:14px;margin-bottom:18px;text-wrap:pretty`);
    const opts = el('div', 'display:flex;flex-direction:column;gap:8px;margin-bottom:14px');
    const fb = el('div', `font:500 14px ${SG};min-height:22px`);
    const ctl = el('div', 'display:flex;gap:8px;margin-top:12px');
    o.body.append(prog, defEl, opts, fb, ctl);
    const next = btn('Keyingi →', 'cy');
    next.onclick = () => round();
    const round = () => {
      n++;
      const right = pool[Math.floor(Math.random() * pool.length)];
      const others = [];
      while (others.length < 3) {
        const c = this.cards[Math.floor(Math.random() * this.cards.length)];
        if (c.id !== right.id && others.every((o2) => o2.id !== c.id)) others.push(c);
      }
      const list = others.concat([right]);
      for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = list[i]; list[i] = list[j]; list[j] = t; }
      prog.textContent = n + '-savol   ·   to‘g‘ri: ' + ok + '/' + (n - 1);
      let sent = right.a.split(/(?<=[.!?])\s/)[0];
      if (sent.length > 220) sent = sent.slice(0, 218) + '…';
      defEl.textContent = sent;
      opts.innerHTML = '';
      fb.textContent = '';
      ctl.innerHTML = '';
      list.forEach((c) => {
        const b = el('button', `text-align:left;background:transparent;border:1px solid rgb(var(--ink-rgb) / 0.2);color:${INK};font:400 16.5px/1.45 ${NR};padding:11px 14px;cursor:pointer`, c.q);
        b.type = 'button';
        b.onmouseenter = () => { if (!b.disabled) b.style.borderColor = 'rgb(var(--ink-rgb) / 0.58)'; };
        b.onmouseleave = () => { if (!b.disabled) b.style.borderColor = 'rgb(var(--ink-rgb) / 0.2)'; };
        b.onclick = () => {
          Array.from(opts.children).forEach((x) => { x.disabled = true; x.style.cursor = 'default'; });
          const good = c.id === right.id;
          b.style.borderColor = good ? GR : RD;
          b.style.color = good ? GR : RD;
          if (good) { ok++; fb.textContent = '✓ To‘g‘ri'; fb.style.color = GR; }
          else {
            fb.textContent = '✗ To‘g‘ri javob: ' + right.q;
            fb.style.color = RD;
            Array.from(opts.children).forEach((x) => { if (x.textContent === right.q) { x.style.borderColor = GR; x.style.color = GR; } });
          }
          this.grade(right.id, good);
          ctl.appendChild(next);
        };
        opts.appendChild(b);
      });
    };
    round();
  };

  /* ---------- 4. kuchsiz joy hisoboti ---------- */
  Hub.prototype.weak = function () {
    const o = this.overlay('Kuchsiz joy hisoboti');
    const groups = {};
    this.cards.forEach((c) => {
      const g = groups[c.tag] || (groups[c.tag] = { tag: c.tag, sec: c.sec, total: 0, learned: 0, fails: 0, seen: 0 });
      g.total++;
      const r = this.sr[c.id];
      if (r) { g.seen += r.seen || 0; g.fails += r.fails || 0; if (r.box >= 2) g.learned++; }
    });
    const rows = Object.values(groups).sort((a, b) => (b.fails / Math.max(1, b.seen)) - (a.fails / Math.max(1, a.seen)));
    const anySeen = rows.some((r) => r.seen > 0);
    if (!anySeen) {
      o.body.append(el('div', `font:400 19px/1.6 ${NR};color:${SUB}`, 'Hali ma‘lumot yo‘q. Bir-ikki marta takrorlash yoki intervyu rejimidan o‘tsangiz, qaysi bo‘limda ko‘p adashayotganingiz shu yerda chiqadi.'));
      return;
    }
    rows.forEach((r) => {
      const rate = r.seen ? r.fails / r.seen : 0;
      const row = el('div', 'display:grid;grid-template-columns:minmax(120px,1.1fr) 1.4fr auto;gap:12px;align-items:center;padding:9px 0;border-top:1px solid rgb(var(--ink-rgb) / 0.09)');
      row.append(el('div', `font:500 13px 'IBM Plex Mono',monospace;color:${INK}`, r.tag + ' ' + (r.sec || '')));
      const track = el('div', 'height:8px;background:rgb(var(--ink-rgb) / 0.11)');
      const fill = el('div', `height:8px;width:${Math.round(rate * 100)}%;background:${rate > 0.5 ? RD : rate > 0.25 ? YE : GR}`);
      track.appendChild(fill);
      row.appendChild(track);
      row.append(el('div', `font:500 12px 'IBM Plex Mono',monospace;color:${SUB};white-space:nowrap`, r.seen ? Math.round(rate * 100) + '% xato · ' + r.learned + '/' + r.total : '—'));
      o.body.appendChild(row);
    });
    const worst = rows.filter((r) => r.seen && r.fails / r.seen > 0.3);
    if (worst.length) {
      const go = btn('▶ Shu bo‘limlarni takrorlash', 'rd');
      go.style.marginTop = '18px';
      go.onclick = () => {
        const tags = worst.slice(0, 3).map((r) => r.tag);
        const pool = this.cards.filter((c) => tags.indexOf(c.tag) >= 0);
        o.close();
        this.review(pool, 'Kuchsiz joylar');
      };
      o.body.appendChild(go);
    }
  };

  /* ---------- panel ---------- */
  Hub.prototype.paintBar = function () {
    if (!this.dueEl) return;
    const d = this.due().length;
    const learned = this.cards.filter((c) => (this.sr[c.id] || {}).box >= 2).length;
    this.dueEl.textContent = d ? 'bugun takrorlash: ' + d + ' savol' : 'bugun takrorlash tugadi ✓';
    this.dueEl.style.color = d ? YE : GR;
    this.learnEl.textContent = 'mustahkamlangan: ' + learned + ' / ' + this.cards.length;
  };

  Hub.prototype.mount = function (host) {
    this.scan();
    host.style.cssText = 'border:1px solid rgb(var(--acc-rgb) / 0.3);background:rgb(var(--acc-rgb) / 0.025);padding:16px 18px;margin:14px 0 0';
    const top = el('div', 'display:flex;flex-wrap:wrap;gap:16px;align-items:baseline;margin-bottom:14px');
    this.dueEl = el('div', `font:500 13.5px ${SG}`);
    this.learnEl = el('div', `font:500 12.5px 'IBM Plex Mono',monospace;color:${SUB}`);
    top.append(this.dueEl, this.learnEl);
    const row = el('div', 'display:flex;flex-wrap:wrap;gap:8px');
    const b1 = btn('▶ Bugungi takrorlash', 'ye'); b1.onclick = () => { this.scan(); this.review(); };
    const b2 = btn('🎯 Intervyu rejimi', 'cy'); b2.onclick = () => { this.scan(); this.interview(); };
    const b3 = btn('↔ Teskari savollar', 'gr'); b3.onclick = () => { this.scan(); this.reverse(); };
    const b4 = btn('📊 Kuchsiz joylar', 'gh'); b4.onclick = () => { this.scan(); this.weak(); };
    row.append(b1, b2, b3, b4);
    const hint = el('div', `font:400 14.5px/1.5 ${NR};color:rgb(var(--ink-rgb) / 0.78);margin-top:12px`,
      'Takrorlash jadvali: bilgan savol 1 → 3 → 7 → 21 kundan keyin qaytadi, bilmagani ertaga. Sahifani yopsangiz ham saqlanadi.');
    host.append(top, row, hint);
    this.paintBar();
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act="ok"],[data-act="no"]');
      if (!b) return;
      const det = b.closest('details[data-qid]');
      if (!det) return;
      if (!this.cards.length) this.scan();
      this.grade(det.dataset.qid, b.dataset.act === 'ok');
    });
  };

  window.PracticeHub = {
    init: function (opts) {
      const host = document.querySelector('[data-hub]');
      if (!host || host.dataset.mounted) return null;
      host.dataset.mounted = '1';
      const h = new Hub(opts);
      h.mount(host);
      return h;
    },
  };
})();
