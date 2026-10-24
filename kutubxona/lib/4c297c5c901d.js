/* linux-extras.js — Linux uchun to'rt yangi rejim:
   x1 incident simulyatori · x2 xato lug'ati · x3 kod o'qish · x4 4 haftalik reja */
(function () {
  const CY = 'oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.11 68)', YE = 'oklch(calc(var(--lk) * 0.54 + var(--lb)) 0.08 40)', GR = 'oklch(calc(var(--lk) * 0.46 + var(--lb)) 0.15 150)', RD = 'oklch(calc(var(--lk) * 0.42 + var(--lb)) 0.18 25)';
  const SG = "Lora,ui-sans-serif,sans-serif", MO = "'IBM Plex Mono',monospace", NR = 'Lora,Georgia,serif';
  const KEY = 'linux-extras';
  const el = (t, css, txt) => { const d = document.createElement(t); if (css) d.style.cssText = css; if (txt != null) d.textContent = txt; return d; };
  const btn = (label, kind) => {
    const map = {
      cy: ['oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.11 68 / 0.07)', 'oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.11 68 / 0.45)', CY],
      ye: ['oklch(calc(var(--lk) * 0.6 + var(--lb)) 0.077 40 / 0.08)', 'oklch(calc(var(--lk) * 0.6 + var(--lb)) 0.077 40 / 0.5)', YE],
      gr: ['oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.07)', 'oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.45)', GR],
      gh: ['transparent', 'rgb(var(--ink-rgb) / 0.22)', 'rgb(var(--ink-rgb) / 0.88)'],
    };
    const [bg, bd, c] = map[kind] || map.gh;
    const b = el('button', `background:${bg};border:1px solid ${bd};color:${c};font:500 12.5px ${SG};letter-spacing:.04em;padding:9px 15px;cursor:pointer`, label);
    b.type = 'button';
    return b;
  };
  const store = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } };
  const put = (patch) => { const s = Object.assign(store(), patch); try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} return s; };
  const code = (t) => '<code style="font:500 14px ' + MO + ';color:' + CY + '">' + t + '</code>';
  const secWrap = (id, tag, title, lead) => {
    const s = el('div', 'padding:46px 0 10px;border-top:1px solid rgb(var(--ink-rgb) / 0.11);margin-top:46px');
    s.id = id;
    s.append(el('div', "font:500 12px " + SG + ";letter-spacing:.26em;text-transform:uppercase;color:" + CY, tag));
    s.append(el('h2', "font:500 clamp(26px,4vw,34px)/1.15 " + SG + ";letter-spacing:-.025em;margin:10px 0 16px", title));
    if (lead) s.append(el('p', "font:400 18px/1.62 " + NR + ";color:rgb(var(--ink-rgb) / 0.96);max-width:640px;margin:0 0 22px;text-wrap:pretty", lead));
    return s;
  };

  /* ================= x1 — INCIDENT SIMULYATORI ================= */
  const BOX = (o) => Object.assign({
    procs: [{ pid: 812, user: 'root', cpu: 0.1, mem: 0.3, cmd: '/usr/sbin/sshd -D' }],
    files: {}, df: { size: '100G', used: '41G', avail: '59G', pct: 41, inodePct: 12 },
    du: {}, services: {}, mem: { total: '7.7G', used: '2.9G', free: '4.8G', swap: '2.0G', swapUsed: '0B' },
    nodes: { 22: 'sshd' }, limits: { nofile: 1024 }, openFds: {}, log: [], ifaces: { lo: '127.0.0.1/8', eth0: '10.0.0.5/24' },
  }, o || {});

  const INCIDENTS = [
    { id: 'i1', title: 'Sayt ochilmayapti', limit: 420,
      alert: "Monitoring: shop.example.com 503 qaytaryapti. Mijozlar yozyapti. Serverga SSH ochiq.",
      box: BOX({ procs: [{ pid: 812, user: 'root', cpu: 0.1, mem: 0.3, cmd: '/usr/sbin/sshd -D' }],
        services: { nginx: { active: false, enabled: true, desc: 'nginx' } },
        nodes: { 22: 'sshd' },
        log: ['Sep 18 09:14:02 host nginx[912]: [emerg] bind() to 0.0.0.0:80 failed (98: Address already in use)', 'Sep 18 09:14:02 host systemd[1]: nginx.service: Failed with result exit-code'] }),
      evidence: [[/systemctl\s+status\s+nginx/, 'xizmat holatini ko\'rdingiz'], [/journalctl/, 'logni o\'qidingiz'], [/ss\s+-lntup/, 'portlarni tekshirdingiz']],
      options: ["nginx to'xtagan — logда bind xatosi, 80-port band", 'Disk to\'lib qolgan', 'Xotira tugagan, OOM Killer o\'ldirgan', 'Tarmoq marshruti yo\'q'],
      answer: 0,
      fix: "Sabab: nginx ishga tusha olmayapti — 80-portni boshqa process egallagan (log: Address already in use). Qadam: ss -lntup bilan kim egallaganini topib, uni to'xtatish yoki portni o'zgartirish, keyin systemctl start nginx." },
    { id: 'i2', title: 'Disk to\'lib qoldi', limit: 420,
      alert: "Alert: / bo'limi 97% to'la. Yozish xatolari boshlandi.",
      box: BOX({ df: { size: '100G', used: '97G', avail: '3G', pct: 97, inodePct: 14 },
        du: { '/var/log': '1.8G', '/var/lib': '12G', '/var/cache': '640M' },
        deletedOpen: { cmd: 'java', pid: 2481, path: '/var/log/app/app.log' },
        procs: [{ pid: 2481, user: 'app', cpu: 1.4, mem: 8.2, cmd: '/usr/bin/java -jar app.jar' }],
        log: ['Sep 18 10:02:11 host app[2481]: rotated log file'] }),
      evidence: [[/^df\s+-h/, 'df bilan holatni ko\'rdingiz'], [/^du\s+/, 'du bilan kataloglarni tekshirdingiz'], [/lsof\s+\+L1/, "o'chirilgan-u ochiq faylni topdingiz"]],
      options: ['Inode tugagan', "O'chirilgan, lekin process ochib turgan fayl joyni band qilyapti", 'Log rotation ishlamayapti, /var/log 90G', 'Swap fayl diskni yeb qo\'ygan'],
      answer: 1,
      fix: "Sabab: df 97% deydi, du esa ancha kam ko'rsatadi — farq o'chirilgan, lekin hali ochiq turgan fayldan (lsof +L1: java, /var/log/app/app.log). Qadam: processni qayta ishga tushirish yoki faylni truncate qilish — shundan keyin joy bo'shaydi." },
    { id: 'i3', title: 'Server sudralib qoldi', limit: 420,
      alert: "Javob vaqti 8 sekundga chiqdi. CPU band ko'rinadi.",
      box: BOX({ procs: [
          { pid: 3011, user: 'app', cpu: 97.4, mem: 12.2, cmd: '/usr/bin/report-worker --full-scan' },
          { pid: 3020, user: 'app', cpu: 3.1, mem: 9.4, cmd: '/usr/bin/api-server' },
          { pid: 812, user: 'root', cpu: 0.1, mem: 0.3, cmd: '/usr/sbin/sshd -D' }],
        mem: { total: '7.7G', used: '3.4G', free: '4.3G', swap: '2.0G', swapUsed: '0B' },
        log: ['Sep 18 11:20:04 host report-worker[3011]: starting full table scan'] }),
      evidence: [[/--sort=-%cpu|^top|^htop/, 'kim yeyayotganini topdingiz'], [/^uptime|^top|^htop/, 'load average ko\'rdingiz'], [/journalctl/, 'logdan sababni aniqladingiz']],
      options: ['Xotira tugab swap ishlayapti', 'Disk I/O to\'yingan', "report-worker to'liq skanerlash bilan CPU'ni egallab olgan", 'Tarmoqda paket yo\'qolishi'],
      answer: 2,
      fix: "Sabab: bitta process (report-worker) CPU'ni 97% egallagan, log \"full table scan\" deydi — xotira va swap normal. Qadam: ishni to'xtatib yoki nice bilan pasaytirib, so'rovni optimallashtirish." },
    { id: 'i4', title: 'Dastur o\'lib-tirilib turadi', limit: 420,
      alert: "api-server har bir-ikki daqiqada qayta ishga tushyapti.",
      box: BOX({ procs: [{ pid: 4120, user: 'app', cpu: 2.1, mem: 61.4, cmd: '/usr/bin/api-server' }],
        mem: { total: '7.7G', used: '7.4G', free: '0.2G', swap: '0B', swapUsed: '0B' },
        services: { 'api-server': { active: true, enabled: true, desc: 'API' } },
        log: ['Sep 18 12:01:44 host kernel: Out of memory: Killed process 4120 (api-server) total-vm:7400000kB',
              'Sep 18 12:01:45 host systemd[1]: api-server.service: Main process exited, code=killed, status=9/KILL',
              'Sep 18 12:01:45 host systemd[1]: api-server.service: Scheduled restart job'] }),
      evidence: [[/^free/, 'xotira holatini ko\'rdingiz'], [/--sort=-%mem/, 'kim egallaganini topdingiz'], [/journalctl\s+-k|dmesg/, 'yadro logidan OOM izini topdingiz']],
      options: ['Xotira tugab OOM Killer o\'ldiryapti, systemd qaytadan tiklayapti', 'Disk to\'lgan', 'Konfiguratsiya fayli yo\'q', 'Portni boshqa process band qilgan'],
      answer: 0,
      fix: "Sabab: yadro logi \"Out of memory: Killed process 4120\" deydi, exit 137/KILL — xotira chegarasi. systemd Restart bilan qaytaradi, shuning uchun tsikl. Qadam: xotira oqmasini tuzatish yoki limitni oshirish; swap yo'qligi holatni keskinlashtirgan." },
    { id: 'i5', title: 'Yangi fayl yaratilmayapti', limit: 420,
      alert: "Dastur \"No space left on device\" deydi, lekin diskda joy bor ko'rinadi.",
      box: BOX({ df: { size: '100G', used: '9G', avail: '91G', pct: 9, inodePct: 100 },
        du: { '/var/spool': '900M', '/tmp': '210M' },
        procs: [{ pid: 5001, user: 'app', cpu: 0.8, mem: 2.1, cmd: '/usr/bin/queue-worker' }],
        log: ['Sep 18 13:30:02 host queue-worker[5001]: cannot create file: No space left on device'] }),
      evidence: [[/^df\s+-h/, 'disk joyini ko\'rdingiz'], [/^df\s+-i/, 'inode holatini tekshirdingiz'], [/^du\s+/, 'kataloglarni ko\'rdingiz']],
      options: ['Disk haqiqatan to\'lgan', 'Inode (pasport blanki) tugagan — joy bor, lekin yozuv ochilmaydi', 'Fayl tizimi read-only bo\'lib qolgan', 'Ruxsat yetmayapti'],
      answer: 1,
      fix: "Sabab: df -h 9% deydi, df -i esa inode 100% — millionlab mayda fayl har biri bittadan inode yegan. Qadam: keraksiz mayda fayllarni tozalash (/var/spool, /tmp) yoki fayl tizimini kattaroq inode zaxirasi bilan qayta yaratish." },
  ];

  function buildIncidents(host) {
    const wrap = el('div', 'display:flex;flex-direction:column;gap:14px');
    INCIDENTS.forEach((sc) => {
      const st = store();
      const best = (st.inc || {})[sc.id];
      const card = el('div', 'border:1px solid rgb(var(--ink-rgb) / 0.15);background:var(--bg2);padding:20px');
      const top = el('div', 'display:flex;flex-wrap:wrap;gap:12px;align-items:baseline;justify-content:space-between;margin-bottom:10px');
      top.append(el('div', "font:500 17px/1.3 " + SG + ";letter-spacing:-.01em;color:var(--ink)", '🚨 ' + sc.title));
      const badge = el('div', "font:500 12px " + MO + ";color:" + (best ? GR : 'rgb(var(--ink-rgb) / 0.68)'), best ? '✓ ' + best.score + '/100 · ' + best.secs + 's' : 'hali bajarilmagan');
      top.appendChild(badge);
      card.appendChild(top);
      card.append(el('div', "font:400 16.5px/1.6 " + NR + ";color:rgb(var(--ink-rgb) / 0.94);margin-bottom:14px;text-wrap:pretty", sc.alert));
      const body = el('div');
      card.appendChild(body);
      const start = btn('▶ Boshlash (' + Math.round(sc.limit / 60) + ' daqiqa)', 'cy');
      card.appendChild(start);
      start.onclick = () => { start.style.display = 'none'; runIncident(sc, body, badge); };
      wrap.appendChild(card);
    });
    host.appendChild(wrap);
  }

  function runIncident(sc, host, badge) {
    host.innerHTML = '';
    const bx = JSON.parse(JSON.stringify(sc.box));
    const hist = [];
    const t0 = Date.now();
    let done = false;
    const bar = el('div', 'display:flex;flex-wrap:wrap;gap:12px;align-items:baseline;justify-content:space-between;margin-bottom:12px');
    const clock = el('div', "font:500 14px " + MO + ";color:" + YE);
    bar.append(el('div', "font:500 11.5px " + SG + ";letter-spacing:.2em;text-transform:uppercase;color:" + RD, 'Incident ochiq'), clock);
    host.appendChild(bar);
    const out = el('pre', `font:400 12.5px/1.6 ${MO};background:var(--bg);border:1px solid rgb(var(--ink-rgb) / 0.11);padding:11px 13px;margin:0 0 10px;min-height:150px;max-height:280px;overflow:auto;color:var(--acc-deep);white-space:pre`);
    host.appendChild(out);
    const line = el('div', 'display:flex;gap:8px;align-items:center;margin-bottom:12px');
    line.append(el('span', "font:500 13px " + MO + ";color:" + GR, '$'));
    const inp = el('input', `flex:1 1 180px;background:var(--bg);border:1px solid rgb(var(--ink-rgb) / 0.22);color:var(--ink);font:400 13.5px ${MO};padding:9px 11px;outline:none`);
    inp.type = 'text'; inp.placeholder = "buyruq yozing (masalan: systemctl status nginx)";
    line.appendChild(inp);
    host.appendChild(line);
    const say = (t) => { out.textContent += (out.textContent ? '\n' : '') + t + '\n'; out.scrollTop = out.scrollHeight; };
    say('$ # tizimga kirdingiz. Sababni toping va xulosa qiling.');
    inp.onkeydown = (e) => {
      if (e.key !== 'Enter' || done) return;
      const cmd = inp.value.trim();
      if (!cmd) return;
      inp.value = '';
      hist.push(cmd.replace(/\s+/g, ' '));
      say('$ ' + cmd);
      let r = '';
      try { r = window.LinuxLab && window.LinuxLab.run ? window.LinuxLab.run(bx, cmd) : '(muhit tayyor emas)'; } catch (err) { r = 'error: ' + err.message; }
      if (r) say(r);
    };
    const qz = el('div', 'border-top:1px solid rgb(var(--ink-rgb) / 0.13);padding-top:14px');
    qz.append(el('div', "font:500 11.5px " + SG + ";letter-spacing:.2em;text-transform:uppercase;color:" + YE + ";margin-bottom:10px", 'Xulosa — sabab nima?'));
    const opts = el('div', 'display:flex;flex-direction:column;gap:8px');
    let picked = -1;
    sc.options.forEach((o, i) => {
      const b = el('button', `text-align:left;background:transparent;border:1px solid rgb(var(--ink-rgb) / 0.2);color:rgb(var(--ink-rgb) / 1);font:400 15.5px/1.5 ${NR};padding:10px 13px;cursor:pointer`, o);
      b.type = 'button';
      b.onclick = () => {
        picked = i;
        Array.from(opts.children).forEach((x, k) => {
          x.style.borderColor = k === i ? CY : 'rgb(var(--ink-rgb) / 0.2)';
          x.style.background = k === i ? 'oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.11 68 / 0.05)' : 'transparent';
        });
      };
      opts.appendChild(b);
    });
    qz.appendChild(opts);
    const submit = btn('✓ Xulosani yuborish', 'gr');
    submit.style.marginTop = '12px';
    qz.appendChild(submit);
    const verdict = el('div', "font:400 16.5px/1.65 " + NR + ";color:rgb(var(--ink-rgb) / 1);padding-top:14px;display:none;text-wrap:pretty");
    qz.appendChild(verdict);
    host.appendChild(qz);

    const tick = setInterval(() => {
      if (done) return clearInterval(tick);
      const left = sc.limit - Math.floor((Date.now() - t0) / 1000);
      clock.textContent = '⏱ ' + Math.max(0, Math.floor(left / 60)) + ':' + String(Math.max(0, left % 60)).padStart(2, '0');
      clock.style.color = left < 60 ? RD : YE;
      if (left <= 0) { clearInterval(tick); finish(true); }
    }, 1000);

    function finish(timeout) {
      if (done) return;
      done = true;
      clearInterval(tick);
      const secs = Math.floor((Date.now() - t0) / 1000);
      const ev = sc.evidence.filter(([re]) => hist.some((h) => re.test(h)));
      const right = picked === sc.answer;
      let score = 0;
      score += right ? 50 : 0;
      score += Math.round((ev.length / sc.evidence.length) * 30);
      score += timeout ? 0 : Math.max(0, Math.round(20 * (1 - secs / sc.limit)));
      const prev = (store().inc || {})[sc.id];
      if (!prev || score > prev.score) put({ inc: Object.assign(store().inc || {}, { [sc.id]: { score, secs } }) });
      badge.textContent = '✓ ' + score + '/100 · ' + secs + 's';
      badge.style.color = score >= 70 ? GR : YE;
      submit.style.display = 'none';
      inp.disabled = true;
      verdict.style.display = 'block';
      verdict.innerHTML =
        '<div style="font:500 15px ' + SG + ';color:' + (score >= 70 ? GR : score >= 40 ? YE : RD) + ';margin-bottom:10px">' +
        (timeout ? '⏱ Vaqt tugadi — ' : right ? '✓ Sabab to\'g\'ri topildi — ' : '✗ Sabab noto\'g\'ri — ') + score + '/100 · ' + secs + ' sekund</div>' +
        '<div style="margin-bottom:10px">' + sc.fix + '</div>' +
        '<div style="font:500 12px ' + SG + ';letter-spacing:.16em;text-transform:uppercase;color:rgb(var(--ink-rgb) / 0.68);margin-bottom:6px">Dalil bo\'yicha</div>' +
        '<div>' + sc.evidence.map(([re, txt]) => (hist.some((h) => re.test(h)) ? '✓ ' : '✗ ') + txt).join('<br />') + '</div>' +
        '<div style="font:400 15px/1.55 ' + NR + ';color:rgb(var(--ink-rgb) / 0.78);margin-top:10px">Ball: sabab 50 + dalil 30 + tezlik 20. Siz ' + hist.length + ' buyruq ishlatdingiz.</div>';
    }
    submit.onclick = () => { if (picked < 0) { verdict.style.display = 'block'; verdict.textContent = 'Avval variantni tanlang.'; return; } finish(false); };
    inp.focus();
  }

  /* ================= x2 — XATO LUG'ATI ================= */
  const ERRORS = [
    { e: 'Connection refused', mean: 'Paket manzilga yetib bordi, lekin o\'sha portda hech kim quloq solmayapti (yoki firewall ochiq rad etyapti).', cmd: 'ss -lntup | grep :PORT', why: ['Xizmat to\'xtagan', 'Dastur 127.0.0.1 ga bind qilgan', 'Boshqa port ishlatyapti'], sec: 's17' },
    { e: 'Connection timed out', mean: 'Javob umuman kelmadi — yo\'lda uzilgan. Bu rad javobi emas, sukunat.', cmd: 'ip route get IP  ·  nc -vz host port', why: ['Firewall DROP qilyapti', 'Marshrut yo\'q', 'Server o\'lik yoki band'], sec: 's17' },
    { e: 'No space left on device', mean: 'Yozish mumkin emas — disk joyi yoki inode tugagan.', cmd: 'df -h  keyin  df -i', why: ['Disk to\'lgan', 'Inode tugagan', 'O\'chirilgan-u ochiq fayl joyni band qilgan'], sec: 's12' },
    { e: 'Too many open files', mean: 'Process file descriptor limitiga urildi — yangi fayl/socket ochilmaydi.', cmd: 'ulimit -n  ·  lsof -p PID | wc -l', why: ['Limit past (1024)', 'Dastur socketni yopmayapti (leak)', 'Yuk oshgan'], sec: 's23' },
    { e: 'Out of memory: Killed process', mean: 'Yadro xotira tugaganda eng ochko\'z processni o\'ldirdi (OOM Killer). Exit 137.', cmd: 'journalctl -k | grep -i oom', why: ['Xotira oqmasi', 'Limit juda past', 'Swap yo\'q'], sec: 's15' },
    { e: 'Permission denied', mean: 'Fayl yoki katalogga ruxsat yo\'q — huquq, egalik yoki papkadagi x biti.', cmd: 'ls -l  ·  namei -l /yo\'l  ·  id', why: ['Huquq bitlari mos emas', 'Boshqa foydalanuvchi/guruh', 'Papkada x yo\'q — ichkariga kirilmaydi'], sec: 's16' },
    { e: 'Address already in use', mean: 'Kerakli port allaqachon boshqa process tomonidan egallangan.', cmd: 'ss -lntup | grep :PORT', why: ['Eski nusxa hali ishlayapti', 'Boshqa xizmat shu portda', 'TIME_WAIT holatida qolgan socket'], sec: 's17' },
    { e: 'Name or service not known', mean: 'Nom manzilga aylanmadi — muammo birinchi halqada (DNS/resolver).', cmd: 'getent hosts NOM  ·  dig NOM', why: ['resolv.conf noto\'g\'ri', 'Yozuv yo\'q', 'Nom xato yozilgan'], sec: 's26' },
    { e: 'command not found', mean: 'Buyruq PATH ichidagi kataloglarda topilmadi.', cmd: 'which BUYRUQ  ·  echo $PATH', why: ['Paket o\'rnatilmagan', 'PATH da yo\'q', 'Skript x biti yo\'q'], sec: 's16' },
    { e: 'Read-only file system', mean: 'Fayl tizimi faqat o\'qish rejimiga o\'tgan — odatda disk xatosi sababli yadro shunday qiladi.', cmd: 'mount | grep " / "  ·  journalctl -k', why: ['Disk xatosi (I/O error)', 'Shunday mount qilingan', 'Fayl tizimi buzilgan'], sec: 's10' },
    { e: 'Failed with result exit-code', mean: 'systemd xizmatni ishga tushirdi, lekin dastur xato kod bilan chiqdi.', cmd: 'systemctl status X  keyin  journalctl -u X -n 50', why: ['Konfiguratsiya xatosi', 'Port band', 'Kerakli fayl/ruxsat yo\'q'], sec: 's5' },
    { e: 'Unit X.service could not be found', mean: 'systemd bunday nomli unit fayl ko\'rmayapti.', cmd: 'systemctl list-units | grep X', why: ['Nom xato yozilgan', 'Unit fayl o\'rnatilmagan', 'daemon-reload qilinmagan'], sec: 's5' },
    { e: 'Argument list too long', mean: 'Buyruqqa berilgan argumentlar (odatda fayl nomlari) yadro chegarasidan oshdi.', cmd: 'find ... -exec ... +  yoki  xargs', why: ['Katalogda juda ko\'p fayl', '* bilan hammasi berilgan'], sec: 's11' },
    { e: 'Text file busy', mean: 'Fayl hozir ishlatilayotgani uchun yozib bo\'lmaydi.', cmd: 'lsof FAYL', why: ['Binar ishlab turgan', 'Fayl mount ostida'], sec: 's23' },
    { e: 'Device or resource busy', mean: 'Resurs band — odatda unmount qilinmoqchi bo\'lgan katalogda ochiq fayl bor.', cmd: 'lsof +D /yo\'l  ·  fuser -vm /yo\'l', why: ['Katalogda ochiq fayl', 'Process shu yerda turgan'], sec: 's23' },
    { e: 'kernel: nf_conntrack: table full', mean: 'Ulanishlarni kuzatish jadvali to\'ldi — yangi ulanishlar tushib qoladi.', cmd: 'journalctl -k | grep conntrack', why: ['Juda ko\'p bir vaqtdagi ulanish', 'Jadval o\'lchami past', 'SYN toshqini'], sec: 's17' },
    { e: 'Host key verification failed', mean: 'Serverning kaliti mahalliy yozuv bilan mos kelmadi — SSH ogohlantiryapti.', cmd: 'ssh-keygen -R host', why: ['Server qayta o\'rnatilgan', 'IP boshqa mashinaga o\'tgan', 'MITM ehtimoli'], sec: 's27' },
    { e: 'Permission denied (publickey)', mean: 'SSH kalit bilan kirish rad etildi.', cmd: 'ssh -v user@host  ·  ls -l ~/.ssh', why: ['Kalit serverda yo\'q', 'Kalit huquqi 600 emas', 'Foydalanuvchi nomi xato'], sec: 's27' },
    { e: 'load average juda baland', mean: 'Kassa oldidagi navbat — yadro sonidan ko\'p ish kutyapti. O\'zi xato emas, belgi.', cmd: 'uptime  ·  top  ·  ps aux --sort=-%cpu', why: ['CPU och process', 'Disk I/O kutish', 'Juda ko\'p parallel ish'], sec: 's20' },
    { e: 'swap ko\'p ishlatilyapti (thrashing)', mean: 'RAM to\'lib, tizim diskdagi zaxira stolga borib-kelyapti — hammasi sekinlashadi.', cmd: 'free -h  ·  vmstat 1', why: ['Xotira yetmayapti', 'Bitta process ochko\'z', 'swappiness yuqori'], sec: 's25' },
  ];

  function buildErrors(host) {
    const ctl = el('div', 'display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:16px');
    const inp = el('input', `flex:1 1 260px;background:var(--bg2);border:1px solid rgb(var(--ink-rgb) / 0.22);color:var(--ink);font:400 16px/1.4 ${NR};padding:11px 13px;outline:none`);
    inp.type = 'search';
    inp.placeholder = 'xato matnini yozing — masalan: refused, OOM, 137, inode…';
    const cnt = el('div', "font:500 12.5px " + MO + ";color:rgb(var(--ink-rgb) / 0.78)");
    ctl.append(inp, cnt);
    host.appendChild(ctl);
    const list = el('div', 'display:flex;flex-direction:column;gap:1px;background:rgb(var(--ink-rgb) / 0.1);border:1px solid rgb(var(--ink-rgb) / 0.11)');
    host.appendChild(list);
    const render = () => {
      const q = (inp.value || '').toLowerCase().trim();
      const rows = ERRORS.filter((x) => !q || (x.e + ' ' + x.mean + ' ' + x.cmd + ' ' + x.why.join(' ')).toLowerCase().indexOf(q) >= 0);
      cnt.textContent = rows.length + ' / ' + ERRORS.length + ' xato';
      list.innerHTML = '';
      rows.forEach((x) => {
        const row = el('div', 'background:var(--bg2);padding:16px');
        row.append(el('div', "font:500 15px " + MO + ";color:" + RD + ";margin-bottom:8px", x.e));
        row.append(el('div', "font:400 16.5px/1.6 " + NR + ";color:rgb(var(--ink-rgb) / 1);margin-bottom:10px;text-wrap:pretty", x.mean));
        const c1 = el('div', 'display:flex;flex-wrap:wrap;gap:8px;align-items:baseline;margin-bottom:8px');
        c1.append(el('span', "font:500 10.5px " + SG + ";letter-spacing:.16em;text-transform:uppercase;color:rgb(var(--ink-rgb) / 0.73)", 'Birinchi komanda'));
        c1.append(el('span', "font:500 13.5px " + MO + ";color:" + CY, x.cmd));
        row.appendChild(c1);
        const c2 = el('div', 'display:flex;flex-wrap:wrap;gap:8px;align-items:baseline');
        c2.append(el('span', "font:500 10.5px " + SG + ";letter-spacing:.16em;text-transform:uppercase;color:rgb(var(--ink-rgb) / 0.73)", 'Ehtimoliy sabab'));
        c2.append(el('span', "font:400 15.5px/1.5 " + NR + ";color:rgb(var(--ink-rgb) / 0.96)", x.why.join(' · ')));
        row.appendChild(c2);
        const go = el('button', `background:transparent;border:0;padding:8px 0 0;cursor:pointer;color:${CY};font:500 12px ${SG};text-decoration:underline`, "shu bo'limni ochish →");
        go.type = 'button';
        go.dataset.act = 'go';
        go.dataset.id = x.sec;
        row.appendChild(go);
        list.appendChild(row);
      });
    };
    let t = null;
    inp.oninput = () => { clearTimeout(t); t = setTimeout(render, 120); };
    render();
  }

  /* ================= x3 — KOD O'QISH MASHQI ================= */
  const SNIPPETS = [
    { title: 'systemd unit fayli', lang: 'ini',
      src: '[Unit]\nDescription=API server\nAfter=network.target\n\n[Service]\nExecStart=/usr/bin/api-server\nRestart=always\nMemoryMax=256M\n\n[Install]\nWantedBy=multi-user.target',
      q: 'Bu unit haqida nima to\'g\'ri?',
      opts: ['Xizmat faqat qo\'lda ishga tushadi', 'Qanday o\'lsa ham qayta tiklanadi va xotirasi 256M bilan chegaralangan', 'Xotira chegarasi yo\'q, faqat tarmoqni kutadi', 'Reboot\'dan keyin ishga tushmaydi'],
      a: 1,
      why: 'Restart=always — har qanday chiqishda tiklaydi (xato tsikli ehtimoli bor). MemoryMax=256M — oshsa OOM bilan o\'ldiriladi. WantedBy=multi-user.target — enable qilinsa boot\'da yonadi.' },
    { title: 'Dockerfile — xato qayerda?', lang: 'dockerfile',
      src: 'FROM python:3.12-slim\nWORKDIR /app\nCOPY . .\nRUN pip install -r requirements.txt\nEXPOSE 8000\nCMD ["python", "app.py"]',
      q: 'Bu Dockerfile\'ning asosiy kamchiligi nima?',
      opts: ['EXPOSE portni ochmaydi, shuning uchun keraksiz', 'COPY . . RUN\'dan oldin turgani uchun har kichik o\'zgarishda dependency qaytadan o\'rnatiladi', 'CMD exec formatda yozilmagan', 'WORKDIR keraksiz'],
      a: 1,
      why: 'Cache qatlamlari tartibga bog\'liq. Avval requirements.txt ko\'chirilib pip install qilinishi, keyin COPY . . bo\'lishi kerak — shunda kod o\'zgarganda dependency keshdan olinadi.' },
    { title: 'Bash skript', lang: 'bash',
      src: '#!/bin/bash\nset -e\nfor f in /var/log/*.log; do\n  gzip "$f"\ndone\nrm -rf /var/log/*.gz',
      q: 'Bu skript ishlaganda nima bo\'ladi?',
      opts: ['Loglarni siqib arxiv qiladi', 'Loglarni siqadi, keyin darhol o\'chirib tashlaydi — natijada log qolmaydi', 'Faqat bitta faylni siqadi', 'Xato beradi va hech narsa qilmaydi'],
      a: 1,
      why: 'gzip fayllarni .gz ga aylantiradi, keyingi qator esa aynan .gz fayllarni o\'chiradi. Ya\'ni siqishning ma\'nosi yo\'q — ma\'lumot yo\'qoladi. set -e faqat xatoda to\'xtaydi, bu mantiq xatosini ushlamaydi.' },
    { title: 'Ruxsatlar ketma-ketligi', lang: 'bash',
      src: '$ ls -l\n-rw-r--r-- 1 root root  3243 Sep 18 09:12 id_rsa\ndrwxr-xr-x 2 ali  ali   4096 Sep 18 09:12 .ssh\n$ ssh -i id_rsa user@host\nPermissions 0644 for "id_rsa" are too open.',
      q: 'Nima qilish kerak?',
      opts: ['chmod 777 id_rsa', 'chmod 600 id_rsa va egasini o\'zingizga o\'tkazish', 'chmod 755 .ssh', 'Kalitni qaytadan yaratish'],
      a: 1,
      why: 'SSH maxfiy kalit faqat egasiga o\'qish-yozish (600) bo\'lishi shart, aks holda ishlatishni rad etadi. Bundan tashqari kalit root\'ga tegishli — chown bilan o\'zingizga o\'tkazish kerak.' },
    { title: 'crontab yozuvi', lang: 'cron',
      src: '*/5 * * * * /usr/local/bin/backup.sh > /dev/null 2>&1',
      q: 'Bu yozuvdagi asosiy xavf nima?',
      opts: ['Har 5 daqiqada ishlaydi — juda tez', 'Hamma chiqish /dev/null ga ketadi — xato bo\'lsa hech qanday iz qolmaydi', 'Skript yo\'li noto\'g\'ri', 'Foydalanuvchi ko\'rsatilmagan'],
      a: 1,
      why: '2>&1 bilan stderr ham /dev/null ga yo\'naltirilgan. Backup yiqilsa ham hech kim bilmaydi. To\'g\'ri yo\'l: chiqishni logga yozish yoki xato bo\'lsa xabar qilish.' },
    { title: 'fstab qatori', lang: 'fstab',
      src: 'UUID=1c3f-9a2b  /data  ext4  defaults  0 2',
      q: 'Bu qator nima qiladi?',
      opts: ['Diskni faqat qo\'lda mount qiladi', 'Boot\'da UUID bo\'yicha diskni /data ga mount qiladi va fsck tartibini 2 qilib belgilaydi', 'Diskni read-only qiladi', 'Swap qo\'shadi'],
      a: 1,
      why: 'UUID ishlatish /dev/sdb1 dan xavfsizroq — qurilma nomi o\'zgarsa ham topiladi. Oxirgi 2 — fsck navbati (ildiz uchun 1, boshqalar 2, tekshirilmasin bo\'lsa 0).' },
    { title: 'nginx upstream', lang: 'nginx',
      src: 'upstream api {\n  server 127.0.0.1:8000;\n}\nserver {\n  listen 80;\n  location / { proxy_pass http://api; }\n}',
      q: 'Backend konteynerda ishlayotgan bo\'lsa nima muammo bo\'ladi?',
      opts: ['Hech qanday muammo yo\'q', '127.0.0.1 nginx turgan mashinaning o\'zini bildiradi — konteynerdagi backend topilmaydi', 'proxy_pass http bilan ishlamaydi', 'upstream nomi noto\'g\'ri'],
      a: 1,
      why: 'Har konteyner (yoki host) uchun 127.0.0.1 — o\'zining loopback\'i. Konteyner nomi yoki haqiqiy IP ko\'rsatilishi kerak, va ular bitta tarmoqda bo\'lishi shart.' },
    { title: 'ulimit va xizmat', lang: 'bash',
      src: '$ ulimit -n\n1024\n$ journalctl -u api -n 3\napi[4120]: accept4: too many open files\napi[4120]: dropping connection\napi[4120]: accept4: too many open files',
      q: 'Birinchi navbatda nima qilasiz?',
      opts: ['Serverni reboot qilaman', 'Process nima ochib turganini tekshiraman (lsof -p), keyin limit yoki leak\'ni hal qilaman', 'Xizmatni o\'chirib qo\'yaman', 'Diskni tozalayman'],
      a: 1,
      why: 'Limitni ko\'r-ko\'rona oshirish leak\'ni yashiradi. Avval lsof -p PID bilan nima ochilganini ko\'rish kerak: agar socketlar yopilmayotgan bo\'lsa — kod muammosi; agar haqiqatan yuk bo\'lsa — limitni oshirish (systemd unit\'da LimitNOFILE).' },
  ];

  function buildSnippets(host) {
    const list = el('div', 'display:flex;flex-direction:column;gap:14px');
    SNIPPETS.forEach((sn, idx) => {
      const card = el('div', 'border:1px solid rgb(var(--ink-rgb) / 0.15);background:var(--bg2);padding:20px');
      const top = el('div', 'display:flex;flex-wrap:wrap;gap:10px;align-items:baseline;justify-content:space-between;margin-bottom:12px');
      top.append(el('div', "font:500 16px/1.3 " + SG + ";color:var(--ink)", '📖 ' + sn.title));
      const tick = el('div', "font:500 12px " + MO + ";color:rgb(var(--ink-rgb) / 0.68)");
      top.appendChild(tick);
      card.appendChild(top);
      const pre = el('pre', `font:400 13px/1.7 ${MO};background:var(--bg);border:1px solid rgb(var(--ink-rgb) / 0.11);border-left:2px solid ${CY};padding:13px 16px;margin:0 0 14px;overflow:auto;color:var(--acc-deep)`, sn.src);
      card.appendChild(pre);
      card.append(el('div', "font:400 17px/1.55 " + NR + ";color:var(--ink);margin-bottom:12px;text-wrap:pretty", sn.q));
      const opts = el('div', 'display:flex;flex-direction:column;gap:8px');
      const why = el('div', "font:400 16px/1.6 " + NR + ";color:rgb(var(--ink-rgb) / 0.96);border-top:1px solid rgb(var(--ink-rgb) / 0.13);margin-top:14px;padding-top:12px;display:none;text-wrap:pretty", sn.why);
      let answered = !!(store().snip || {})[idx];
      sn.opts.forEach((o, i) => {
        const b = el('button', `text-align:left;background:transparent;border:1px solid rgb(var(--ink-rgb) / 0.2);color:rgb(var(--ink-rgb) / 1);font:400 15.5px/1.5 ${NR};padding:10px 13px;cursor:pointer`, o);
        b.type = 'button';
        b.onclick = () => {
          const ok = i === sn.a;
          b.style.borderColor = ok ? GR : RD;
          b.style.background = ok ? 'oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.05)' : 'oklch(calc(var(--lk) * 0.48 + var(--lb)) 0.19 25 / 0.04)';
          if (ok) {
            Array.from(opts.children).forEach((x) => { x.disabled = true; x.style.cursor = 'default'; });
            tick.textContent = '✓ topildi';
            tick.style.color = GR;
            why.style.display = 'block';
            put({ snip: Object.assign(store().snip || {}, { [idx]: 1 }) });
          }
        };
        opts.appendChild(b);
      });
      card.appendChild(opts);
      card.appendChild(why);
      if (answered) {
        tick.textContent = '✓ topildi';
        tick.style.color = GR;
        why.style.display = 'block';
        opts.children[sn.a].style.borderColor = GR;
        opts.children[sn.a].style.background = 'oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.05)';
      }
      list.appendChild(card);
    });
    host.appendChild(list);
  }

  /* ================= x4 — 4 HAFTALIK REJA ================= */
  const PLAN = [
    { w: 1, goal: "Linux asoslari — process, xizmat, log", days: [
      "1–3-bo'lim: kernel, process, zavodni topish · lab + test", "4–6-bo'lim: signal, systemd, journalctl · lab + test",
      "7–9-bo'lim: fayl tizimi, hard link, symlink · lab", "10–12-bo'lim: disk, inode, df va du · lab",
      "Takrorlash: 1–12-bo'lim savollari · 30 flashcard", "Incident: \"Sayt ochilmayapti\" + \"Disk to'lib qoldi\"", "Dam olish yoki qoldirilgan bo'limlar" ] },
    { w: 2, goal: "Resurs, ruxsat va tekshiruv zanjiri", days: [
      "13–15-bo'lim: egalik, CPU, xotira · lab", "16–18-bo'lim: ruxsatlar, SSH, zanjir · lab",
      "19–21-bo'lim: thread/zombie, load average, xizmat+log", "22–23-bo'lim: 4-2-1, FD va strace · lab",
      "Kod o'qish: 8 snippet · xato lug'atini ko'rib chiqish", "Incident: \"Server sudralib qoldi\" + \"Dastur o'lib-tirilib\"", "Aralash intervyu: 20 savol, Linux bo'yicha" ] },
    { w: 3, goal: "Tarmoq va Docker", days: [
      "Networking 1–6: IP, port, TCP, UDP · lab", "Networking 7–12: DNS, NAT, OSI · lab",
      "Networking 13–18: bind, nc, timeout/refused, zanjir · lab", "Docker 1–6: image, container, Dockerfile · lab",
      "Docker 7–12: lifecycle, signal, tarmoq, volume · lab", "Docker 13–17: resurs, debug, Compose · lab", "Takrorlash: Networking + Docker savollari" ] },
    { w: 4, goal: "Kubernetes, CI/CD va intervyuga tayyorlik", days: [
      "K8s 1–7: arxitektura, control plane, Pod · lab", "K8s 8–14: Pending, CrashLoop, Deployment, Service · lab",
      "K8s 15–21: probe, resurs, node, Ingress · lab", "K8s 22–28: zanjir, arxitektura, xavfsizlik",
      "CI/CD 1–11: Git, CI, artifact, registry, GitOps · lab", "CI/CD 12–22: strategiya, IaC, monitoring, TLS · lab",
      "Yakuniy: 30 savolli intervyu + cheat sheet'ni chop etish" ] },
  ];

  function buildPlan(host) {
    const st = store().plan || {};
    const head = el('div', 'display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:18px');
    const prog = el('div', "font:500 13px " + MO + ";color:rgb(var(--ink-rgb) / 0.8)");
    const reset = btn('↻ Rejani tozalash', 'gh');
    head.append(prog, reset);
    host.appendChild(head);
    const list = el('div', 'display:flex;flex-direction:column;gap:16px');
    host.appendChild(list);
    const refresh = () => {
      const s = store().plan || {};
      const done = Object.keys(s).filter((k) => s[k]).length;
      prog.textContent = done + ' / 28 kun bajarildi';
      prog.style.color = done === 28 ? GR : 'rgb(var(--ink-rgb) / 0.8)';
    };
    PLAN.forEach((wk) => {
      const card = el('div', 'border:1px solid rgb(var(--ink-rgb) / 0.15);background:var(--bg2);padding:20px');
      card.append(el('div', "font:500 11.5px " + SG + ";letter-spacing:.2em;text-transform:uppercase;color:" + YE, wk.w + '-hafta'));
      card.append(el('div', "font:500 18px/1.3 " + SG + ";color:var(--ink);margin:8px 0 14px", wk.goal));
      const days = el('div', 'display:flex;flex-direction:column;gap:2px');
      wk.days.forEach((d, i) => {
        const key = 'w' + wk.w + 'd' + (i + 1);
        const row = el('button', `display:flex;gap:12px;align-items:flex-start;text-align:left;background:transparent;border:0;border-left:1px solid rgb(var(--ink-rgb) / 0.13);padding:9px 0 9px 13px;cursor:pointer;width:100%`);
        row.type = 'button';
        const box = el('span', "font:500 14px " + MO + ";min-width:20px;flex:none");
        const txt = el('span', "font:400 16px/1.5 " + NR + ";flex:1;text-wrap:pretty", (i + 1) + '-kun · ' + d);
        row.append(box, txt);
        const paint = () => {
          const on = !!(store().plan || {})[key];
          box.textContent = on ? '✓' : '○';
          box.style.color = on ? GR : 'rgb(var(--ink-rgb) / 0.3)';
          txt.style.color = on ? GR : 'rgb(var(--ink-rgb) / 1)';
          row.style.borderLeftColor = on ? GR : 'rgb(var(--ink-rgb) / 0.13)';
        };
        row.onclick = () => {
          const p = store().plan || {};
          p[key] = !p[key];
          put({ plan: p });
          paint();
          refresh();
        };
        paint();
        days.appendChild(row);
      });
      card.appendChild(days);
      list.appendChild(card);
    });
    reset.onclick = () => { put({ plan: {} }); list.innerHTML = ''; host.innerHTML = ''; buildPlan(host); };
    refresh();
  }

  /* ================= x5 — QIYNALGAN JOYLAR ================= */
  const WKEY = 'linux-shahri-progress-weak';
  const PKEY = 'linux-shahri-progress';
  const wAll = () => { try { return JSON.parse(localStorage.getItem(WKEY) || '[]'); } catch (e) { return []; } };
  const wSave = (l) => { try { localStorage.setItem(WKEY, JSON.stringify(l)); } catch (e) {} };

  function weakItems() {
    const list = wAll().slice();
    let prog = {};
    try { prog = JSON.parse(localStorage.getItem(PKEY) || '{}'); } catch (e) {}
    const bank = (window.DevOpsBank || { questions: [] }).questions.filter((q) => q.subject === 'Linux');
    bank.forEach((q) => {
      if (prog[q.qid] === 'no' && !list.some((x) => x.qid === q.qid)) {
        list.push({ kind: 'b', qid: q.qid, q: q.q, a: q.a, miss: 1, at: 0 });
      }
    });
    return list.sort((a, b) => (b.miss || 1) - (a.miss || 1));
  }

  function buildWeak(host) {
    const head = el('div', 'display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:18px');
    const cnt = el('div', "font:500 13px " + MO + ";color:rgb(var(--ink-rgb) / 0.8)");
    const clear = btn("↻ Ro'yxatni tozalash", 'gh');
    head.append(cnt, clear);
    host.appendChild(head);
    const list = el('div', 'display:flex;flex-direction:column;gap:12px');
    host.appendChild(list);

    const render = () => {
      const items = weakItems();
      cnt.textContent = items.length ? items.length + ' ta joyda qiynaldingiz' : "Hozircha bo'sh — xato qilgan savol shu yerga tushadi";
      cnt.style.color = items.length ? YE : GR;
      list.innerHTML = '';
      if (!items.length) {
        const none = el('div', 'border:1px solid rgb(var(--ink-rgb) / 0.13);background:var(--bg2);padding:20px');
        none.append(el('div', "font:400 16.5px/1.6 " + NR + ";color:rgb(var(--ink-rgb) / 0.9);text-wrap:pretty",
          "Bo'lim testida, amaliy topshiriqda yoki savol bankida xato qilsangiz, savol avtomatik shu yerga yoziladi. To'g'ri javob bersangiz ro'yxatdan chiqadi."));
        list.appendChild(none);
        return;
      }
      items.forEach((it) => {
        const card = el('div', 'border:1px solid rgb(var(--ink-rgb) / 0.15);background:var(--bg2);padding:18px');
        const top = el('div', 'display:flex;flex-wrap:wrap;gap:10px;align-items:baseline;justify-content:space-between;margin-bottom:10px');
        const src = it.kind === 't' ? '⌨ amaliy topshiriq' : it.kind === 'q' ? "🔐 bo'lim testi" : '❓ savol banki';
        top.append(el('div', "font:500 10.5px " + MO + ";letter-spacing:.12em;text-transform:uppercase;color:rgb(var(--ink-rgb) / 0.76)", src + (it.sec ? '  ·  ' + String(it.sec).replace('s', '') + "-bo'lim" : '')));
        top.append(el('div', "font:500 12px " + MO + ";color:" + YE, (it.miss || 1) + ' marta'));
        card.appendChild(top);
        const qt = el('div', "font:400 17px/1.5 " + NR + ";color:var(--ink);margin-bottom:12px;text-wrap:pretty");
        qt.innerHTML = String(it.q).replace(/`([^`]+)`/g, '<code style="font:500 14.5px ' + MO + ';color:' + CY + '">$1</code>');
        card.appendChild(qt);
        const ta = el('textarea', `width:100%;box-sizing:border-box;resize:vertical;background:var(--bg);border:1px solid rgb(var(--ink-rgb) / 0.22);color:var(--ink);font:400 15.5px/1.5 ${NR};padding:10px 12px;outline:none`);
        ta.rows = 2;
        ta.placeholder = it.kind === 't' ? 'buyruqni yozing…' : "javobingizni o'z so'zingiz bilan yozing…";
        card.appendChild(ta);
        const ctl = el('div', 'display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:10px');
        const chk = btn('Tekshir', 'ye');
        const rev = btn("Javobni ko'rsat", 'gh');
        const okb = btn("✓ Bildim — chiqar", 'gr');
        const verdict = el('span', "font:500 13px " + SG);
        ctl.append(chk, rev, okb, verdict);
        card.appendChild(ctl);
        const ans = el('div', "font:400 16px/1.6 " + NR + ";color:rgb(var(--ink-rgb) / 0.96);border-top:1px solid rgb(var(--ink-rgb) / 0.13);margin-top:12px;padding-top:12px;display:none;text-wrap:pretty");
        ans.innerHTML = it.a;
        card.appendChild(ans);
        const drop = () => {
          wSave(wAll().filter((x) => x.qid !== it.qid));
          if (it.kind === 'b') {
            try {
              const p = JSON.parse(localStorage.getItem(PKEY) || '{}');
              p[it.qid] = 'ok';
              localStorage.setItem(PKEY, JSON.stringify(p));
            } catch (e) {}
          }
          render();
        };
        chk.onclick = () => {
          const txt = ta.value.trim();
          if (!txt) { verdict.textContent = 'Avval javob yozing.'; verdict.style.color = 'rgb(var(--ink-rgb) / 0.78)'; return; }
          const tmp = document.createElement('div');
          tmp.innerHTML = it.a;
          const core = Array.from(tmp.querySelectorAll('strong, code')).map((x) => x.textContent.trim()).filter((x) => x.length > 1).slice(0, 8);
          const mine = ' ' + txt.toLowerCase().replace(/[^a-z0-9\u0400-\u04ff\/\-\.\s]/g, ' ') + ' ';
          const hit = core.filter((c) => c.toLowerCase().split(/\s+/).some((w) => w.length > 2 && mine.indexOf(w.slice(0, 5)) >= 0));
          const r = core.length ? hit.length / core.length : (txt.length > 12 ? 1 : 0);
          ans.style.display = 'block';
          if (r >= 0.34) { verdict.textContent = "✓ To'g'ri (" + Math.round(r * 100) + '%)'; verdict.style.color = GR; setTimeout(drop, 900); }
          else { verdict.textContent = '✗ Yetarli emas (' + Math.round(r * 100) + '%)'; verdict.style.color = RD; }
        };
        rev.onclick = () => { ans.style.display = 'block'; };
        okb.onclick = drop;
        list.appendChild(card);
      });
    };
    clear.onclick = () => { wSave([]); render(); };
    render();
  }

  /* ================= qurish ================= */
  window.LinuxExtras = {
    ids: ['x1', 'x2', 'x3', 'x4', 'x5'],
    build: function () {
      const anchor = document.getElementById('s1');
      if (!anchor || document.getElementById('x1')) return false;
      const parent = anchor.parentElement;
      const s1 = secWrap('x1', '🚨 Incident simulyatori', 'Taymer ishga tushdi — sababni toping',
        "Har senariyda tizim buzilgan. Terminalda buyruq yozib dalil to'playsiz, keyin sababni tanlaysiz. Ball: sabab 50 + kerakli dalil 30 + tezlik 20.");
      buildIncidents(s1);
      const s2 = secWrap('x2', '🔍 Xato lug\'ati', "Xato matnini yozing — sabab va komanda chiqadi",
        "20 ta eng ko'p uchraydigan xato: ma'nosi, birinchi ishlatiladigan komanda va uchta ehtimoliy sabab. Ishda ham, intervyuda ham shu tartib.");
      buildErrors(s2);
      const s3 = secWrap('x3', '📖 Kod o\'qish mashqi', "Bu nima qiladi va xato qayerda?",
        "Intervyuda ekran ulashib manifest yoki skript ko'rsatishadi. Bu yerda teskari mashq: siz yozmaysiz — o'qib tushunasiz.");
      buildSnippets(s3);
      const s4 = secWrap('x4', '📅 4 haftalik reja', "Kun bo'yicha jadval",
        "28 kun: har kunga bo'lim, laboratoriya va takrorlash. Kunni bosib belgilaysiz — progress saqlanadi.");
      buildPlan(s4);
      const s5 = secWrap('x5', '🎯 Qiynalgan joylar', "Xato qilgan savollaringiz shu yerda",
        "Tizim o'zi eslab qoladi: bo'lim testi, amaliy topshiriq yoki savol bankida xato qilsangiz — savol shu ro'yxatga tushadi. To'g'ri javob bersangiz chiqib ketadi.");
      buildWeak(s5);
      [s1, s2, s3, s4, s5].forEach((x) => parent.appendChild(x));
      return true;
    },
  };
})();
