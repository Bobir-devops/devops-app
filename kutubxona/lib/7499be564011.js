/* linux-lab.js — Linux mashq muhiti: soxta shell + vazifa tekshiruvi.
   <div data-llab="ID"></div> ... window.LinuxLab.mountAll() */
(function () {
  const CY = 'oklch(calc(var(--lk) * 0.48 + var(--lb)) 0.11 68)', YE = 'oklch(calc(var(--lk) * 0.52 + var(--lb)) 0.077 40)', GR = 'oklch(calc(var(--lk) * 0.42 + var(--lb)) 0.15 150)', RD = 'oklch(calc(var(--lk) * 0.4 + var(--lb)) 0.19 25)';
  const INK = 'var(--ink)', SUB = 'rgb(var(--ink-rgb) / 0.86)';
  const SG = "Lora,ui-sans-serif,sans-serif", MO = "'IBM Plex Mono',monospace", NR = 'Lora,Georgia,serif';
  const el = (t, css, txt) => { const d = document.createElement(t); if (css) d.style.cssText = css; if (txt != null) d.textContent = txt; return d; };
  const btn = (label, kind) => {
    const map = { cy: ['oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.11 68 / 0.07)', 'oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.11 68 / 0.45)', 'oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.11 68)'],
      ye: ['oklch(calc(var(--lk) * 0.6 + var(--lb)) 0.077 40 / 0.08)', 'oklch(calc(var(--lk) * 0.6 + var(--lb)) 0.077 40 / 0.5)', 'oklch(calc(var(--lk) * 0.58 + var(--lb)) 0.077 40)'],
      gr: ['oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.07)', 'oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.45)', 'oklch(calc(var(--lk) * 0.52 + var(--lb)) 0.13 150)'],
      gh: ['transparent', 'rgb(var(--ink-rgb) / 0.22)', 'rgb(var(--ink-rgb) / 0.88)'] };
    const [bg, bd, col] = map[kind] || map.gh;
    const b = el('button', `background:${bg};border:1px solid ${bd};color:${col};font:500 12.5px ${SG};letter-spacing:.04em;padding:8px 14px;cursor:pointer`, label);
    b.type = 'button'; return b;
  };
  const pad = (s, n) => String(s) + ' '.repeat(Math.max(1, n - String(s).length));

  /* ---------- soxta tizim ---------- */
  function Box(init) {
    this.procs = (init.procs || []).map((p, i) => Object.assign({ pid: 1000 + i * 7, ppid: 1, user: 'root', cpu: 0.4, mem: 1.2, state: 'S', cmd: 'sleep 1000' }, p));
    this.files = Object.assign({}, init.files || {});
    this.links = init.links || {};
    this.inodes = init.inodes || {};
    this.df = init.df || { size: '100G', used: '48G', avail: '52G', pct: 48, inodePct: 12 };
    this.du = init.du || {};
    this.services = init.services || {};
    this.mem = init.mem || { total: '7.7G', used: '3.1G', free: '4.6G', swap: '2.0G', swapUsed: '0B' };
    this.nodes = init.nodes || {};
    this.log = init.log || [];
    this.perms = init.perms || {};
    this.limits = init.limits || { nofile: 1024 };
    this.openFds = init.openFds || {};
  }

  function run(bx, raw) {
    const cmd = raw.trim().replace(/\s+/g, ' ');
    if (!cmd) return '';
    const a = cmd.split(' ');
    const has = (f) => a.indexOf(f) >= 0;
    const pipeTo = cmd.indexOf('|') > 0 ? cmd.split('|').map((x) => x.trim()) : null;

    const psOut = (list) => {
      let out = pad('USER', 8) + pad('PID', 7) + pad('%CPU', 6) + pad('%MEM', 6) + pad('STAT', 6) + 'COMMAND';
      list.forEach((p) => { out += '\n' + pad(p.user, 8) + pad(p.pid, 7) + pad(p.cpu.toFixed(1), 6) + pad(p.mem.toFixed(1), 6) + pad(p.state, 6) + p.cmd; });
      return out;
    };

    if (pipeTo) {
      const first = run(bx, pipeTo[0]);
      let lines = first.split('\n');
      for (let i = 1; i < pipeTo.length; i++) {
        const st = pipeTo[i].split(' ');
        if (st[0] === 'grep') { const fl = st.slice(1).filter((x) => /^-/.test(x)).join(''); const pat = (st.slice(1).find((x) => !/^-/.test(x)) || '').replace(/['"]/g, ''); const inv = /v/.test(fl), ci = /i/.test(fl); const hit = (l) => ci ? l.toLowerCase().indexOf(pat.toLowerCase()) >= 0 : l.indexOf(pat) >= 0; lines = lines.filter((l, idx) => idx === 0 && /USER|NAME|Filesystem/.test(l) ? true : (inv ? !hit(l) : hit(l))); }
        else if (st[0] === 'head') { const n = +(st[1] || '').replace('-', '') || 10; lines = lines.slice(0, n + 1); }
        else if (st[0] === 'wc' && st[1] === '-l') { lines = [String(lines.filter((l) => l.trim()).length)]; }
        else if (st[0] === 'sort') { const body = lines.slice(1); const num = st.indexOf('-n') > 0 || st.indexOf('-rn') > 0 || st.indexOf('-nr') > 0; const rev = /r/.test(st.join('')); body.sort((x, y) => num ? (parseFloat(x) || 0) - (parseFloat(y) || 0) : x.localeCompare(y)); if (rev) body.reverse(); lines = [lines[0]].concat(body); }
        else if (st[0] === 'uniq') { const seen = {}; lines = lines.filter((l) => { if (seen[l]) return false; seen[l] = 1; return true; }); }
        else if (st[0] === 'awk' || st[0] === 'cut' || st[0] === 'sed') { /* soddalashtirilgan: o'zgartirmaydi */ }
        else return first + '\n(bu mashqda "' + st[0] + '" filtri qo\'llab-quvvatlanmaydi)';
      }
      return lines.join('\n');
    }

    if (a[0] === 'ps') {
      let list = bx.procs.slice();
      if (cmd.indexOf('--sort=-%cpu') > 0) list.sort((x, y) => y.cpu - x.cpu);
      if (cmd.indexOf('--sort=-%mem') > 0) list.sort((x, y) => y.mem - x.mem);
      return psOut(list);
    }
    if (a[0] === 'pgrep') {
      const name = a[a.length - 1];
      const m = bx.procs.filter((p) => p.cmd.indexOf(name) >= 0);
      if (!m.length) return '';
      return m.map((p) => has('-a') ? p.pid + ' ' + p.cmd : String(p.pid)).join('\n');
    }
    if (a[0] === 'top' || a[0] === 'htop') {
      const l = bx.procs.slice().sort((x, y) => y.cpu - x.cpu);
      return 'top - load average: 2.15, 1.80, 1.20\n\n' + psOut(l.slice(0, 6));
    }
    if (a[0] === 'uptime') return ' 14:32:10 up 9 days,  3:14,  2 users,  load average: 2.15, 1.80, 1.20';
    if (a[0] === 'free') return pad('', 14) + pad('total', 9) + pad('used', 9) + pad('free', 9) + '\n' + pad('Mem:', 14) + pad(bx.mem.total, 9) + pad(bx.mem.used, 9) + pad(bx.mem.free, 9) + '\n' + pad('Swap:', 14) + pad(bx.mem.swap, 9) + pad(bx.mem.swapUsed, 9) + pad(bx.mem.swap, 9);
    if (a[0] === 'kill') {
      const force = has('-9');
      const pid = +a[a.length - 1];
      const p = bx.procs.find((x) => x.pid === pid);
      if (!p) return 'bash: kill: (' + pid + ') - No such process';
      if (force) { bx.procs = bx.procs.filter((x) => x !== p); bx.killed = (bx.killed || []).concat([{ pid: pid, force: true }]); return ''; }
      if (p.ignoresTerm) { bx.killed = (bx.killed || []).concat([{ pid: pid, force: false }]); return '(SIGTERM yuborildi — lekin process javob bermayapti, hali ro\'yxatda)'; }
      bx.procs = bx.procs.filter((x) => x !== p);
      bx.killed = (bx.killed || []).concat([{ pid: pid, force: false }]);
      return '';
    }
    if (a[0] === 'df') {
      if (has('-i')) return pad('Filesystem', 14) + pad('Inodes', 10) + pad('IUsed', 10) + pad('IFree', 10) + 'IUse%\n' + pad('/dev/sda1', 14) + pad('6553600', 10) + pad(Math.round(6553600 * bx.df.inodePct / 100), 10) + pad(Math.round(6553600 * (100 - bx.df.inodePct) / 100), 10) + bx.df.inodePct + '%';
      return pad('Filesystem', 14) + pad('Size', 7) + pad('Used', 7) + pad('Avail', 7) + 'Use%  Mounted on\n' + pad('/dev/sda1', 14) + pad(bx.df.size, 7) + pad(bx.df.used, 7) + pad(bx.df.avail, 7) + pad(bx.df.pct + '%', 6) + '/';
    }
    if (a[0] === 'du') {
      const keys = Object.keys(bx.du);
      if (!keys.length) return '4.0K\t.';
      return keys.map((k) => pad(bx.du[k], 8) + k).join('\n');
    }
    if (a[0] === 'lsof') {
      if (has('+L1')) {
        if (!bx.deletedOpen) return 'COMMAND   PID   USER   FD   TYPE  NLINK  NODE  NAME\n(o\'chirilgan, lekin ochiq fayl topilmadi)';
        return 'COMMAND   PID   USER   FD   TYPE  NLINK  NODE  NAME\n' + pad(bx.deletedOpen.cmd, 10) + pad(bx.deletedOpen.pid, 6) + pad('root', 7) + pad('4w', 5) + pad('REG', 6) + pad('0', 7) + pad('1234', 6) + bx.deletedOpen.path + ' (deleted)';
      }
      const pi = a.indexOf('-p');
      if (pi > 0) { const pid = +a[pi + 1]; const n = bx.openFds[pid] || 0; return 'COMMAND  PID  FD   TYPE  NAME\n' + Array.from({ length: Math.min(6, n) }, (_, i) => pad('app', 9) + pad(pid, 5) + pad(i + 3 + 'u', 5) + pad('IPv4', 6) + 'TCP 10.0.0.5:8080->10.0.0.9:' + (40000 + i)).join('\n') + (n > 6 ? '\n... jami ' + n + ' ta FD' : ''); }
      return 'lsof: mashqda faqat "lsof +L1" va "lsof -p <PID>"';
    }
    if (a[0] === 'ulimit') { if (has('-n')) return String(bx.limits.nofile); return 'unlimited'; }
    if (a[0] === 'ls') {
      const long = has('-l') || has('-li') || has('-il');
      const ino = has('-i') || has('-li') || has('-il');
      const names = Object.keys(bx.files);
      if (!names.length) return '';
      if (!long) return names.join('  ');
      return names.map((n) => {
        const f = bx.files[n];
        return (ino ? pad(f.inode, 9) : '') + pad(f.perm || '-rw-r--r--', 12) + pad(f.links || 1, 3) + pad(f.owner || 'root', 8) + pad(f.group || 'root', 8) + pad(f.size || 12, 7) + n + (f.target ? ' -> ' + f.target : '');
      }).join('\n');
    }
    if (a[0] === 'ln') {
      const sym = has('-s');
      const src = a[a.length - 2], dst = a[a.length - 1];
      if (!bx.files[src] && !sym) return 'ln: failed to access \'' + src + '\': No such file or directory';
      if (sym) { bx.files[dst] = { perm: 'lrwxrwxrwx', links: 1, inode: 90000 + Object.keys(bx.files).length, target: src, size: src.length }; return ''; }
      const s = bx.files[src];
      s.links = (s.links || 1) + 1;
      bx.files[dst] = Object.assign({}, s);
      return '';
    }
    if (a[0] === 'rm') {
      const n = a[a.length - 1];
      const f = bx.files[n];
      if (!f) return 'rm: cannot remove \'' + n + '\': No such file or directory';
      const ino = f.inode;
      delete bx.files[n];
      Object.keys(bx.files).forEach((k) => { if (bx.files[k].inode === ino) bx.files[k].links = Math.max(1, (bx.files[k].links || 1) - 1); });
      return '';
    }
    if (a[0] === 'cat') {
      const n = a[1];
      if (n && n.indexOf('/proc/') === 0) {
        const m = n.match(/\/proc\/(\d+)\/(\w+)/);
        if (m) { if (m[2] === 'oom_score') return '187'; if (m[2] === 'oom_score_adj') return '0'; }
        return 'cat: ' + n + ': No such file or directory';
      }
      const f = bx.files[n];
      if (!f) return 'cat: ' + n + ': No such file or directory';
      if (f.target) { const t = bx.files[f.target]; return t ? (t.content || '') : 'cat: ' + n + ': No such file or directory  ← broken link'; }
      return f.content || '';
    }
    if (a[0] === 'echo') {
      const m = cmd.match(/echo\s+(.*?)\s*>\s*(\S+)/);
      if (m) { bx.files[m[2]] = { perm: '-rw-r--r--', links: 1, inode: 50000 + Object.keys(bx.files).length, content: m[1].replace(/['"]/g, ''), size: m[1].length }; return ''; }
      return cmd.replace(/^echo\s*/, '').replace(/['"]/g, '');
    }
    if (a[0] === 'chmod') {
      const mode = a[1], n = a[2];
      const f = bx.files[n];
      if (!f) return 'chmod: cannot access \'' + n + '\': No such file or directory';
      if (/^\d{3}$/.test(mode)) {
        const bits = mode.split('').map((d) => { const v = +d; return (v & 4 ? 'r' : '-') + (v & 2 ? 'w' : '-') + (v & 1 ? 'x' : '-'); }).join('');
        f.perm = '-' + bits;
        f.mode = mode;
      }
      return '';
    }
    if (a[0] === 'chown') { const f = bx.files[a[2]]; if (!f) return 'chown: cannot access \'' + a[2] + '\''; const [u, g] = a[1].split(':'); f.owner = u; if (g) f.group = g; return ''; }
    if (a[0] === 'systemctl') {
      const act = a[1], svc = (a[2] || '').replace(/\.service$/, '');
      const s = bx.services[svc];
      if (!s) return 'Unit ' + svc + '.service could not be found.';
      if (act === 'status') return '● ' + svc + '.service - ' + (s.desc || svc) + '\n   Loaded: loaded (/lib/systemd/system/' + svc + '.service; ' + (s.enabled ? 'enabled' : 'disabled') + ')\n   Active: ' + (s.active ? 'active (running)' : 'failed (Result: exit-code)') + (s.active ? '' : '\n  Process: exited, status=1/FAILURE');
      if (act === 'start') { s.active = true; return ''; }
      if (act === 'stop') { s.active = false; return ''; }
      if (act === 'restart') { s.active = true; s.restarted = true; return ''; }
      if (act === 'reload') { s.reloaded = true; return ''; }
      if (act === 'enable') { s.enabled = true; if (has('--now')) s.active = true; return 'Created symlink /etc/systemd/system/multi-user.target.wants/' + svc + '.service'; }
      if (act === 'disable') { s.enabled = false; return ''; }
      return 'systemctl: mashqda status/start/stop/restart/reload/enable/disable';
    }
    if (a[0] === 'journalctl') {
      let lines = bx.log.slice();
      const ui = a.indexOf('-u');
      if (ui > 0) { const u = a[ui + 1]; lines = lines.filter((l) => l.indexOf(u) >= 0); }
      if (has('-k')) lines = lines.filter((l) => l.indexOf('kernel') >= 0);
      const ni = a.indexOf('-n');
      if (ni > 0) lines = lines.slice(-(+a[ni + 1] || 10));
      return lines.length ? lines.join('\n') : '-- No entries --';
    }
    if (a[0] === 'dmesg') return bx.log.filter((l) => l.indexOf('kernel') >= 0).join('\n') || '(bo\'sh)';
    if (a[0] === 'ss') { if (has('-lntup') || has('-lntu') || has('-ltnp')) return pad('Netid', 7) + pad('State', 9) + pad('Local Address:Port', 24) + 'Process\n' + Object.keys(bx.nodes).map((port) => pad('tcp', 7) + pad('LISTEN', 9) + pad('0.0.0.0:' + port, 24) + 'users:(("' + bx.nodes[port] + '",pid=' + (1000 + (+port % 97)) + '))').join('\n'); return 'ss: mashqda "ss -lntup"'; }
    if (a[0] === 'namei') { const p = a[a.length - 1]; return 'f: ' + p + '\n d /\n d ' + p.split('/').filter(Boolean).slice(0, -1).join('\n d ') + '\n - ' + p.split('/').pop(); }
    if (a[0] === 'ip') {
      const sub = a[1] || '';
      if (/^a(ddr)?$/.test(sub)) return '1: lo: <LOOPBACK,UP> mtu 65536\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500 state UP\n    inet 10.0.0.5/24 brd 10.0.0.255 scope global eth0';
      if (/^r(oute)?$/.test(sub) && a[2] === 'get') return (a[3] || '8.8.8.8') + ' via 10.0.0.1 dev eth0 src 10.0.0.5';
      if (/^r(oute)?$/.test(sub)) return 'default via 10.0.0.1 dev eth0\n10.0.0.0/24 dev eth0 proto kernel scope link src 10.0.0.5';
      if (/^n(eigh)?$/.test(sub)) return '10.0.0.1 dev eth0 lladdr 52:54:00:12:34:56 REACHABLE';
      return 'Usage: ip addr | ip route [get <ip>] | ip neigh';
    }
    if (a[0] === 'id') return 'uid=1000(ali) gid=1000(ali) groups=1000(ali),27(sudo)';
    if (a[0] === 'strace') return 'execve("/usr/bin/app", ...) = 0\nopenat(AT_FDCWD, "/etc/app/config.yaml", O_RDONLY) = -1 ENOENT (No such file or directory)\nwrite(2, "config not found", 16) = 16\nexit_group(1) = ?';
    if (a[0] === 'help' || a[0] === '--help') {
      return 'Mashqda ishlaydigan buyruqlar:\n'
        + '  ps aux [--sort=-%cpu|-%mem] · pgrep -a <nom> · top · uptime · free -h\n'
        + '  kill <PID> · kill -9 <PID>\n'
        + '  df -h · df -i · du -sh * · lsof +L1 · lsof -p <PID> · ulimit -n\n'
        + '  ls -l · ls -li · ln [-s] <src> <dst> · rm <fayl> · cat <fayl> · echo X > fayl\n'
        + '  chmod NNN <fayl> · chown user:group <fayl> · namei -l <yo\'l> · id\n'
        + '  systemctl status|start|stop|restart|reload|enable[--now] <xizmat>\n'
        + '  journalctl [-u X] [-k] [-n N] · dmesg · ss -lntup · strace -p <PID>\n'
        + '  ip addr · ip route [get <ip>] · ip neigh\n'
        + '  quvurlar: | grep · | head -N · | wc -l · | sort [-rn] · | uniq';
    }
    return 'bash: ' + a[0] + ': command not found — \'help\' deb ko\'ring';
  }

  /* ---------- mashqlar ---------- */
  const LABS = {
    'find-proc': { title: 'Zavodni topish', section: '3-bo\'lim',
      init: { procs: [{ user: 'www-data', cpu: 12.4, mem: 3.1, cmd: 'nginx: worker process' }, { user: 'root', cpu: 0.1, mem: 0.4, cmd: 'nginx: master process /usr/sbin/nginx' }, { user: 'postgres', cpu: 41.2, mem: 18.6, cmd: 'postgres: writer process' }, { user: 'root', cpu: 0.0, mem: 0.2, cmd: '/usr/sbin/sshd -D' }],
        nodes: { 80: 'nginx', 5432: 'postgres', 22: 'sshd' } },
      tasks: [
        { t: 'Barcha processlarni ko\'ring', v: (b, h) => h.some((x) => /^ps aux/.test(x)), hint: 'ps aux' },
        { t: '`nginx` processini grep bilan filtrlab toping', v: (b, h) => h.some((x) => /ps aux \| grep nginx/.test(x)), hint: 'ps aux | grep nginx' },
        { t: 'Xuddi shuni `pgrep` bilan toping', v: (b, h) => h.some((x) => /pgrep -a nginx/.test(x)), hint: 'pgrep -a nginx' },
        { t: '5432 portni kim ishlatayotganini aniqlang', v: (b, h) => h.some((x) => /ss -lntup/.test(x)), hint: 'ss -lntup' },
      ] },
    'kill-lab': { title: 'SIGTERM va SIGKILL', section: '4-bo\'lim',
      init: { procs: [{ pid: 1234, user: 'root', cpu: 0.6, mem: 2.2, cmd: '/usr/bin/stuck-app --serve', ignoresTerm: true }, { pid: 1241, user: 'root', cpu: 0.2, mem: 0.9, cmd: '/usr/bin/nice-app' }] },
      tasks: [
        { t: '`nice-app` PID\'ini toping', v: (b, h) => h.some((x) => /^ps aux|pgrep/.test(x)), hint: 'ps aux' },
        { t: '1241 ga muloyim xat yuboring (SIGTERM)', v: (b) => (b.killed || []).some((k) => k.pid === 1241 && !k.force), hint: 'kill 1241' },
        { t: '1234 ga SIGTERM yuboring — u javob bermaydi', v: (b) => (b.killed || []).some((k) => k.pid === 1234 && !k.force), hint: 'kill 1234' },
        { t: 'Faqat shundan keyin rubilnikni tortib ko\'ring', v: (b) => (b.killed || []).some((k) => k.pid === 1234 && k.force) && (b.killed || []).some((k) => k.pid === 1234 && !k.force), hint: 'kill -9 1234' },
      ] },
    'systemd-lab': { title: 'Dispetcherni boshqarish', section: '5 va 24-bo\'lim',
      init: { services: { nginx: { active: false, enabled: false, desc: 'A high performance web server' } },
        log: ['Sep 16 14:02:11 host systemd[1]: Starting nginx...', 'Sep 16 14:02:12 host nginx[912]: [emerg] bind() to 0.0.0.0:80 failed (98: Address already in use)', 'Sep 16 14:02:12 host systemd[1]: nginx.service: Failed with result exit-code'] },
      tasks: [
        { t: '`nginx` holatini tekshiring — chiroq qaysi rang?', v: (b, h) => h.some((x) => /systemctl status nginx/.test(x)), hint: 'systemctl status nginx' },
        { t: 'Qora kitobdan nginx yozuvlarini o\'qing', v: (b, h) => h.some((x) => /journalctl -u nginx/.test(x)), hint: 'journalctl -u nginx -n 20' },
        { t: 'Xizmatni ishga tushiring', v: (b) => b.services.nginx.active, hint: 'systemctl start nginx' },
        { t: 'Har reboot\'da o\'zi yonadigan qilib qo\'ying', v: (b) => b.services.nginx.enabled, hint: 'systemctl enable nginx  (yoki enable --now)' },
      ] },
    'link-lab': { title: 'Hard link va symlink', section: '8–9-bo\'lim',
      init: { files: { 'a.txt': { perm: '-rw-r--r--', links: 1, inode: 12345, content: 'hello', size: 6 } } },
      tasks: [
        { t: '`a.txt` uchun hard link yarating: `b.txt`', v: (b) => !!b.files['b.txt'] && b.files['b.txt'].inode === 12345, hint: 'ln a.txt b.txt' },
        { t: 'Ikkisining inode raqami bir xil ekanini tasdiqlang', v: (b, h) => h.some((x) => /ls -li|ls -il/.test(x)), hint: 'ls -li' },
        { t: '`a.txt`ni o\'chirsangiz `b.txt` ishlashda davom etadi — sinab ko\'ring', v: (b, h) => !b.files['a.txt'] && !!b.files['b.txt'] && h.some((x) => /cat b\.txt/.test(x)), hint: 'rm a.txt  keyin  cat b.txt' },
        { t: 'Endi symlink yarating: `c.txt` → `b.txt`', v: (b) => !!b.files['c.txt'] && b.files['c.txt'].target === 'b.txt', hint: 'ln -s b.txt c.txt' },
        { t: '`b.txt`ni o\'chirib, symlink\'ning buzilganini ko\'ring', v: (b, h) => !b.files['b.txt'] && h.some((x) => /cat c\.txt/.test(x)), hint: 'rm b.txt  keyin  cat c.txt' },
      ] },
    'df-lab': { title: 'Ombor to\'la, javon bo\'sh', section: '10–12-bo\'lim',
      init: { df: { size: '100G', used: '95G', avail: '5G', pct: 95, inodePct: 11 },
        du: { '/var/log': '2.1G', '/var/lib': '18G', '/var/cache': '900M' },
        deletedOpen: { cmd: 'java', pid: 2481, path: '/var/log/app/old.log' } },
      tasks: [
        { t: 'Diskda qancha joy qolganini ko\'ring', v: (b, h) => h.some((x) => /^df -h/.test(x)), hint: 'df -h' },
        { t: 'Inode holatini ham tekshiring — bu boshqa narsa', v: (b, h) => h.some((x) => /^df -i/.test(x)), hint: 'df -i' },
        { t: 'Qaysi katalog joyni yeyayotganini toping', v: (b, h) => h.some((x) => /^du /.test(x)), hint: 'du -sh /var/*' },
        { t: 'df 95% deydi, du kamroq — o\'chirilgan lekin ochiq faylni toping', v: (b, h) => h.some((x) => /lsof \+L1/.test(x)), hint: 'lsof +L1' },
      ] },
    'cpu-mem-lab': { title: 'CPU va xotira — kim yeyapti?', section: '14–15-bo\'lim',
      init: { procs: [{ pid: 3011, user: 'app', cpu: 96.4, mem: 12.2, cmd: '/usr/bin/report-worker' }, { pid: 3020, user: 'app', cpu: 4.1, mem: 61.8, cmd: '/usr/bin/cache-service' }, { pid: 3033, user: 'root', cpu: 0.3, mem: 1.1, cmd: '/usr/sbin/cron' }],
        mem: { total: '7.7G', used: '7.2G', free: '0.3G', swap: '2.0G', swapUsed: '1.4G' },
        log: ['Sep 16 15:01:02 host kernel: Out of memory: Killed process 3020 (cache-service) total-vm:6100000kB'] },
      tasks: [
        { t: 'CPU\'ni kim yeyayotganini toping (eng ochko\'z tepada)', v: (b, h) => h.some((x) => /--sort=-%cpu/.test(x)), hint: 'ps aux --sort=-%cpu | head' },
        { t: 'Xotirada eng ko\'p joy egallaganni toping', v: (b, h) => h.some((x) => /--sort=-%mem/.test(x)), hint: 'ps aux --sort=-%mem | head' },
        { t: 'Stolda qancha bo\'sh joy borligini ko\'ring', v: (b, h) => h.some((x) => /^free/.test(x)), hint: 'free -h' },
        { t: 'Qo\'riqchi kimnidir uloqtirganmi — kernel yozuvlarini tekshiring', v: (b, h) => h.some((x) => /journalctl -k|dmesg/.test(x)), hint: 'journalctl -k  yoki  dmesg | grep -i oom' },
      ] },
    'perm-lab': { title: 'Ruxsatlar — 4-2-1', section: '16 va 22-bo\'lim',
      init: { files: { 'deploy.sh': { perm: '-rw-r--r--', links: 1, inode: 7001, owner: 'root', group: 'root', size: 420 },
        'notes.txt': { perm: '-rwxrwxrwx', links: 1, inode: 7002, owner: 'root', group: 'root', size: 120 },
        'id_rsa': { perm: '-rw-r--r--', links: 1, inode: 7003, owner: 'ali', group: 'ali', size: 3243 } } },
      tasks: [
        { t: 'Fayllarning hozirgi huquqlarini ko\'ring', v: (b, h) => h.some((x) => /^ls -l/.test(x)), hint: 'ls -l' },
        { t: '`deploy.sh`ni skript qilib qo\'ying (755)', v: (b) => b.files['deploy.sh'] && b.files['deploy.sh'].mode === '755', hint: 'chmod 755 deploy.sh' },
        { t: '`notes.txt`ni oddiy faylga tushiring (644)', v: (b) => b.files['notes.txt'] && b.files['notes.txt'].mode === '644', hint: 'chmod 644 notes.txt' },
        { t: '`id_rsa` — SSH kaliti, faqat egasiga (600)', v: (b) => b.files['id_rsa'] && b.files['id_rsa'].mode === '600', hint: 'chmod 600 id_rsa' },
      ] },
    'fd-lab': { title: 'Chiptalar tugadi — too many open files', section: '23-bo\'lim',
      init: { procs: [{ pid: 4120, user: 'app', cpu: 3.2, mem: 8.1, cmd: '/usr/bin/api-server' }],
        limits: { nofile: 1024 }, openFds: { 4120: 1024 },
        log: ['Sep 16 16:10:44 host api-server[4120]: accept4: too many open files'] },
      tasks: [
        { t: 'Hozirgi FD limitini ko\'ring', v: (b, h) => h.some((x) => /ulimit -n/.test(x)), hint: 'ulimit -n' },
        { t: 'Process nima ochib turganini ko\'ring', v: (b, h) => h.some((x) => /lsof -p 4120/.test(x)), hint: 'lsof -p 4120' },
        { t: 'Xato xabarini loglardan tasdiqlang', v: (b, h) => h.some((x) => /journalctl/.test(x)), hint: 'journalctl -n 20' },
        { t: 'Process nimaga osilib qolganini strace bilan ko\'ring', v: (b, h) => h.some((x) => /strace/.test(x)), hint: 'strace -p 4120' },
      ] },
    'chain-lab-linux': { title: 'Tekshiruv zanjiri — to\'liq', section: '18-bo\'lim',
      init: { procs: [{ pid: 5001, user: 'www-data', cpu: 1.2, mem: 2.4, cmd: 'nginx: worker process' }],
        nodes: { 80: 'nginx' }, services: { nginx: { active: true, enabled: true, desc: 'nginx' } },
        log: ['Sep 16 17:20:01 host nginx[5001]: 200 GET /', 'Sep 16 17:20:44 host kernel: nf_conntrack: table full, dropping packet'] },
      tasks: [
        { t: '1-halqa: process tirikmi?', v: (b, h) => h.some((x) => /^ps aux|pgrep/.test(x)), hint: 'pgrep -a nginx' },
        { t: '2-halqa: eshik ochiqmi?', v: (b, h) => h.some((x) => /ss -lntup/.test(x)), hint: 'ss -lntup' },
        { t: '3-halqa: xizmat holati nima deydi?', v: (b, h) => h.some((x) => /systemctl status/.test(x)), hint: 'systemctl status nginx' },
        { t: '4-halqa: resurs yetarlimi?', v: (b, h) => h.some((x) => /^free|^df -h/.test(x)), hint: 'free -h  va  df -h' },
        { t: '5-halqa: qora kitob nima deydi?', v: (b, h) => h.some((x) => /journalctl/.test(x)), hint: 'journalctl -n 20' },
      ] },
  };

  /* ---------- UI ---------- */
  function mount(host, id) {
    const spec = typeof id === 'string' ? LABS[id] : id;
    if (!spec) return;
    let bx = new Box(JSON.parse(JSON.stringify(spec.init)));
    let hist = [];
    const doneSet = {};
    host.style.cssText = 'border:1px solid rgb(var(--ink-rgb) / 0.15);background:var(--bg);padding:0;margin:8px 0 24px';
    const head = el('div', 'border-bottom:1px solid rgb(var(--ink-rgb) / 0.11);padding:16px 18px;display:flex;flex-wrap:wrap;gap:12px;align-items:baseline;justify-content:space-between');
    head.append(el('div', `font:500 11.5px ${SG};letter-spacing:.2em;text-transform:uppercase;color:${GR}`, '▶ Mashq — ' + spec.title));
    const score = el('div', `font:500 12.5px ${MO};color:${SUB}`);
    head.appendChild(score);
    const wrap = el('div', 'display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:0');
    const left = el('div', 'padding:16px 18px;border-right:1px solid rgb(var(--ink-rgb) / 0.09)');
    const right = el('div', 'padding:16px 18px');
    const taskList = el('div', 'display:flex;flex-direction:column;gap:10px');
    left.append(el('div', `font:500 11.5px ${SG};letter-spacing:.2em;text-transform:uppercase;color:${YE};margin-bottom:12px`, 'Vazifalar'), taskList);
    const out = el('pre', `font:400 12.5px/1.6 ${MO};background:var(--bg2);border:1px solid rgb(var(--ink-rgb) / 0.1);padding:11px 13px;margin:0 0 10px;min-height:170px;max-height:300px;overflow:auto;color:var(--acc-deep);white-space:pre`);
    const line = el('div', 'display:flex;gap:8px;align-items:center');
    const inp = el('input', `flex:1 1 160px;background:var(--bg2);border:1px solid rgb(var(--ink-rgb) / 0.2);color:${INK};font:400 13px ${MO};padding:9px 11px;outline:none`);
    inp.type = 'text'; inp.placeholder = 'ps aux';
    const ctl = el('div', 'display:flex;flex-wrap:wrap;gap:8px;margin-top:10px');
    const check = btn('✓ Tekshir', 'gr'), reset = btn('↻ Boshidan', 'gh'), help = btn('? Buyruqlar', 'gh');
    ctl.append(check, reset, help);
    right.append(out, line, ctl);
    line.append(el('span', `font:500 13px ${MO};color:${GR}`, '$'), inp);
    wrap.append(left, right);
    host.append(head, wrap);

    const say = (t) => { out.textContent += (out.textContent ? '\n' : '') + t + '\n'; out.scrollTop = out.scrollHeight; };
    const paint = () => {
      taskList.innerHTML = '';
      let done = 0;
      spec.tasks.forEach((tk, i) => {
        let ok = false;
        try { ok = !!tk.v(bx, hist); } catch (e) { ok = false; }
        if (ok) doneSet[i] = true;
        const fin = !!doneSet[i];
        if (fin) done++;
        const row = el('div', 'display:flex;gap:10px;align-items:flex-start');
        row.append(el('div', `font:500 13px ${MO};color:${fin ? GR : 'rgb(var(--ink-rgb) / 0.58)'};min-width:16px`, fin ? '✓' : (i + 1) + '.'));
        const body = el('div');
        body.append(el('div', `font:400 15.5px/1.5 ${NR};color:${fin ? GR : INK};text-wrap:pretty`, tk.t));
        if (!fin) {
          const hb = el('button', `background:transparent;border:0;padding:4px 0 0;cursor:pointer;color:rgb(var(--ink-rgb) / 0.63);font:400 12.5px ${SG};text-decoration:underline`, 'yordam');
          hb.type = 'button';
          hb.onclick = () => hb.replaceWith(el('div', `font:400 12.5px ${MO};color:${CY};padding-top:4px`, tk.hint));
          body.appendChild(hb);
        }
        row.appendChild(body);
        taskList.appendChild(row);
      });
      score.textContent = done + ' / ' + spec.tasks.length + ' bajarildi';
      score.style.color = done === spec.tasks.length ? GR : SUB;
    };
    const exec = (raw) => {
      if (!raw.trim()) return;
      hist.push(raw.trim().replace(/\s+/g, ' '));
      say('$ ' + raw.trim());
      let r;
      try { r = run(bx, raw); } catch (e) { r = 'error: ' + e.message; }
      if (r) say(r);
      paint();
    };
    inp.onkeydown = (e) => { if (e.key === 'Enter') { exec(inp.value); inp.value = ''; } };
    check.onclick = () => { paint(); const d = spec.tasks.filter((t, i) => doneSet[i]).length; say(d === spec.tasks.length ? '✓ Hamma vazifa bajarildi.' : '→ ' + d + '/' + spec.tasks.length + ' bajarildi.'); };
    reset.onclick = () => { bx = new Box(JSON.parse(JSON.stringify(spec.init))); hist = []; Object.keys(doneSet).forEach((k) => delete doneSet[k]); out.textContent = ''; say('tizim boshidan tiklandi'); paint(); };
    help.onclick = () => exec('help');
    say('mashq muhiti tayyor — ' + spec.section + '.  \'? Buyruqlar\' yordam beradi.');
    paint();
  }

  window.LinuxLab = {
    mountSpec: function (host, spec) { if (host.dataset.mounted) return; host.dataset.mounted = '1'; try { mount(host, spec); } catch (e) { console.warn('seclab', e); } },
    run: function (bx, cmd) { return run(bx, cmd); },
    mountAll: function () {
      document.querySelectorAll('[data-llab]').forEach((h) => { if (h.dataset.mounted) return; h.dataset.mounted = '1'; try { mount(h, h.dataset.llab); } catch (e) { console.warn('llab', h.dataset.llab, e); } });
    },
    ids: Object.keys(LABS),
  };
})();
