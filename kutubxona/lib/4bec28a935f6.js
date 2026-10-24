/* net-lab.js — Networking mashq muhiti: soxta tarmoq + vazifa tekshiruvi.
   <div data-nlab="ID"></div> ... window.NetLab.mountAll() */
(function () {
  const CY = 'oklch(calc(var(--lk) * 0.48 + var(--lb)) 0.11 68)', YE = 'oklch(calc(var(--lk) * 0.52 + var(--lb)) 0.077 40)', GR = 'oklch(calc(var(--lk) * 0.42 + var(--lb)) 0.15 150)';
  const INK = 'var(--ink)', SUB = 'rgb(var(--ink-rgb) / 0.86)';
  const SG = "Lora,ui-sans-serif,sans-serif", MO = "'IBM Plex Mono',monospace", NR = 'Lora,Georgia,serif';
  const el = (t, css, txt) => { const d = document.createElement(t); if (css) d.style.cssText = css; if (txt != null) d.textContent = txt; return d; };
  const btn = (label, kind) => {
    const map = { gr: ['oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.07)', 'oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.45)', 'oklch(calc(var(--lk) * 0.52 + var(--lb)) 0.13 150)'], gh: ['transparent', 'rgb(var(--ink-rgb) / 0.22)', 'rgb(var(--ink-rgb) / 0.88)'] };
    const [bg, bd, col] = map[kind] || map.gh;
    const b = el('button', `background:${bg};border:1px solid ${bd};color:${col};font:500 12.5px ${SG};letter-spacing:.04em;padding:8px 14px;cursor:pointer`, label);
    b.type = 'button'; return b;
  };
  const pad = (s, n) => String(s) + ' '.repeat(Math.max(1, n - String(s).length));

  function run(bx, raw) {
    const cmd = raw.trim().replace(/\s+/g, ' ');
    if (!cmd) return '';
    const a = cmd.split(' ');
    const has = (f) => a.indexOf(f) >= 0;
    const arg = (f) => { const i = a.indexOf(f); return i >= 0 ? a[i + 1] : null; };
    const last = a[a.length - 1];

    if (a[0] === 'help' || a[0] === '--help') {
      return 'Mashqda ishlaydigan buyruqlar:\n'
        + '  ip addr · ip route · ip route get <IP> · ip neigh\n'
        + '  ss -lntup [| grep :PORT]\n'
        + '  getent hosts <nom> · dig [@server] <nom> [A|AAAA|MX|NS|TXT] [+short]\n'
        + '  cat /etc/resolv.conf · cat /etc/hosts\n'
        + '  nc -vz <host> <port> · nc -vzu <host> <port>\n'
        + '  ping -c 3 <host> · curl [-I|-v] <url>\n'
        + '  ssh <host> · systemctl status <xizmat> · journalctl -u <xizmat>\n'
        + '  traceroute <host> · iptables -L -n (soddalashtirilgan)';
    }
    if (a[0] === 'ip') {
      if (a[1] === 'addr' || a[1] === 'a') {
        return Object.keys(bx.ifaces).map((n, i) => (i + 1) + ': ' + n + ': <UP> mtu 1500\n    inet ' + bx.ifaces[n] + ' scope ' + (n === 'lo' ? 'host' : 'global') + ' ' + n).join('\n');
      }
      if (a[1] === 'route' && a[2] === 'get') {
        const ip = a[3];
        if (!ip) return 'Error: need address';
        const r = bx.routes.find((x) => x.match === 'default');
        if (!bx.hasDefault && !bx.routes.some((x) => ip.indexOf(x.prefix) === 0)) return 'RTNETLINK answers: Network is unreachable';
        const localR = bx.routes.find((x) => x.prefix && ip.indexOf(x.prefix) === 0);
        if (localR) return ip + ' dev ' + localR.dev + ' src ' + bx.ifaces[localR.dev].split('/')[0] + ' uid 0';
        return ip + ' via ' + (r ? r.via : '10.0.0.1') + ' dev ' + (r ? r.dev : 'eth0') + ' src ' + bx.ifaces.eth0.split('/')[0] + ' uid 0';
      }
      if (a[1] === 'route' || a[1] === 'r') {
        let out = [];
        if (bx.hasDefault) { const r = bx.routes.find((x) => x.match === 'default'); out.push('default via ' + r.via + ' dev ' + r.dev); }
        bx.routes.filter((x) => x.prefix).forEach((x) => out.push(x.cidr + ' dev ' + x.dev + ' proto kernel scope link src ' + bx.ifaces[x.dev].split('/')[0]));
        return out.length ? out.join('\n') : '(routing jadvali bo\'sh)';
      }
      if (a[1] === 'neigh' || a[1] === 'n') {
        return Object.keys(bx.arp).map((ip) => ip + ' dev eth0 lladdr ' + bx.arp[ip] + ' REACHABLE').join('\n') || '(ARP jadvali bo\'sh)';
      }
      return 'ip: mashqda addr / route / route get / neigh';
    }
    if (a[0] === 'ss') {
      if (!has('-l') && !/-\w*l/.test(a.join(''))) return 'ss: mashqda "ss -lntup"';
      let rows = Object.keys(bx.listen).map((k) => {
        const s = bx.listen[k];
        return pad(s.proto || 'tcp', 7) + pad('LISTEN', 9) + pad(k, 24) + 'users:(("' + s.name + '",pid=' + s.pid + ',fd=3))';
      });
      return pad('Netid', 7) + pad('State', 9) + pad('Local Address:Port', 24) + 'Process\n' + rows.join('\n');
    }
    if (a[0] === 'getent') {
      if (a[1] !== 'hosts') return 'getent: mashqda "getent hosts <nom>"';
      const n = a[2];
      if (bx.etcHosts[n]) return bx.etcHosts[n] + '   ' + n;
      if (!bx.resolverOk) return '';
      const ip = bx.dns[n];
      return ip ? ip + '   ' + n : '';
    }
    if (a[0] === 'dig') {
      const parts = a.slice(1).filter((x) => x !== '+short');
      const server = parts.find((x) => x[0] === '@');
      const name = parts.find((x) => x[0] !== '@' && !/^(A|AAAA|MX|NS|TXT|PTR)$/.test(x));
      const type = parts.find((x) => /^(A|AAAA|MX|NS|TXT|PTR)$/.test(x)) || 'A';
      if (!name) return ';; missing name';
      const direct = !!server;
      if (!direct && !bx.dnsServerOk) return ';; connection timed out; no servers could be reached';
      const rec = (bx.records[name] || {})[type];
      const short = has('+short');
      if (!rec) return short ? '' : ';; ->>HEADER<<- status: NXDOMAIN\n;; QUESTION SECTION:\n;' + name + '.\tIN\t' + type + '\n\n;; ANSWER SECTION:\n(bo\'sh)';
      if (short) return [].concat(rec).join('\n');
      return ';; ->>HEADER<<- status: NOERROR\n;; QUESTION SECTION:\n;' + name + '.\tIN\t' + type + '\n\n;; ANSWER SECTION:\n' + [].concat(rec).map((v) => name + '.\t300\tIN\t' + type + '\t' + v).join('\n') + '\n\n;; SERVER: ' + (server ? server.slice(1) : bx.resolvNs) + '#53';
    }
    if (a[0] === 'cat') {
      if (last === '/etc/resolv.conf') return bx.resolverOk ? 'nameserver ' + bx.resolvNs + '\nsearch ' + (bx.search || 'example.internal') : '# nameserver yo\'q — resolver sozlanmagan';
      if (last === '/etc/hosts') return '127.0.0.1\tlocalhost\n' + Object.keys(bx.etcHosts).map((n) => bx.etcHosts[n] + '\t' + n).join('\n');
      return 'cat: ' + last + ': No such file or directory';
    }
    if (a[0] === 'nc') {
      const udp = /u/.test(a[1] || '');
      const host = a[a.length - 2], port = a[a.length - 1];
      const ip = bx.dns[host] || bx.etcHosts[host] || host;
      if (!/^\d/.test(ip)) return 'nc: getaddrinfo for host "' + host + '" port ' + port + ': Name or service not known';
      if (udp) return 'Connection to ' + host + ' ' + port + ' port [udp/*] succeeded!\n(diqqat: UDPda handshake yo\'q — bu natija ishonchli signal emas)';
      const key = ip + ':' + port;
      const st = bx.remote[key];
      if (st === 'open') return 'Connection to ' + host + ' ' + port + ' port [tcp/*] succeeded!';
      if (st === 'refused') return 'nc: connect to ' + host + ' port ' + port + ' (tcp) failed: Connection refused';
      return 'nc: connect to ' + host + ' port ' + port + ' (tcp) failed: Connection timed out';
    }
    if (a[0] === 'ping') {
      const host = last;
      const ip = bx.dns[host] || bx.etcHosts[host] || host;
      if (!/^\d/.test(ip)) return 'ping: ' + host + ': Name or service not known';
      if (!bx.icmpOk) return 'PING ' + host + ' (' + ip + ')\n\n--- ' + host + ' ping statistics ---\n3 packets transmitted, 0 received, 100% packet loss\n(ICMP bloklangan bo\'lishi mumkin — bu tarmoq o\'lik degani emas)';
      return 'PING ' + host + ' (' + ip + ') 56 bytes\n64 bytes from ' + ip + ': icmp_seq=1 ttl=54 time=12.4 ms\n64 bytes from ' + ip + ': icmp_seq=2 ttl=54 time=11.9 ms\n\n3 packets transmitted, 3 received, 0% packet loss';
    }
    if (a[0] === 'curl') {
      const url = a.filter((x) => /^https?:\/\//.test(x))[0] || last;
      const m = url.match(/^(https?):\/\/([^\/:]+)(?::(\d+))?/);
      if (!m) return 'curl: (3) URL rejected';
      const proto = m[1], host = m[2], port = m[3] || (proto === 'https' ? '443' : '80');
      const ip = bx.dns[host] || bx.etcHosts[host];
      if (!ip) return 'curl: (6) Could not resolve host: ' + host;
      const st = bx.remote[ip + ':' + port];
      if (st === 'refused') return 'curl: (7) Failed to connect to ' + host + ' port ' + port + ': Connection refused';
      if (st !== 'open') return 'curl: (28) Failed to connect to ' + host + ' port ' + port + ': Connection timed out';
      if (proto === 'https' && bx.tls && bx.tls.expired) return 'curl: (60) SSL certificate problem: certificate has expired';
      const http = bx.http[host] || { code: 200, server: 'nginx' };
      if (http.hang) return 'curl: (52) Empty reply from server\n(port ochiq, lekin application javob bermadi)';
      return 'HTTP/1.1 ' + http.code + ' ' + (http.text || 'OK') + '\nServer: ' + (http.server || 'nginx') + '\nContent-Type: text/html';
    }
    if (a[0] === 'ssh') {
      const host = last.replace(/^\w+@/, '');
      const ip = bx.dns[host] || bx.etcHosts[host];
      if (!ip) return 'ssh: Could not resolve hostname ' + host + ': Name or service not known';
      const st = bx.remote[ip + ':22'];
      if (st === 'refused') return 'ssh: connect to host ' + host + ' port 22: Connection refused';
      if (st !== 'open') return 'ssh: connect to host ' + host + ' port 22: Connection timed out';
      return 'Welcome to ' + host;
    }
    if (a[0] === 'systemctl') {
      const svc = (a[2] || '').replace(/\.service$/, '');
      const s = bx.services[svc];
      if (!s) return 'Unit ' + svc + '.service could not be found.';
      if (a[1] === 'status') return '● ' + svc + '.service\n   Active: ' + (s.active ? 'active (running)' : 'inactive (dead)');
      if (a[1] === 'start') { s.active = true; return ''; }
      if (a[1] === 'restart') { s.active = true; return ''; }
      return 'systemctl: mashqda status/start/restart';
    }
    if (a[0] === 'journalctl') {
      const u = arg('-u');
      let lines = bx.log.slice();
      if (u) lines = lines.filter((l) => l.indexOf(u) >= 0);
      return lines.length ? lines.join('\n') : '-- No entries --';
    }
    if (a[0] === 'traceroute') {
      return ' 1  ' + (bx.routes.find((x) => x.match === 'default') || { via: '10.0.0.1' }).via + '  0.4 ms\n 2  * * *\n 3  * * *\n(keyingi hoplar javob bermayapti — ICMP bloklangan bo\'lishi mumkin)';
    }
    if (a[0] === 'iptables') return 'Chain INPUT (policy ACCEPT)\ntarget     prot opt source        destination\n' + (bx.fwDrop || []).map((p) => 'DROP       tcp  --  0.0.0.0/0     0.0.0.0/0   tcp dpt:' + p).join('\n');
    if (cmd.indexOf('|') > 0) {
      const parts = cmd.split('|').map((x) => x.trim());
      let lines = run(bx, parts[0]).split('\n');
      for (let i = 1; i < parts.length; i++) {
        const st = parts[i].split(' ');
        if (st[0] === 'grep') { const pat = (st[1] || '').replace(/['"]/g, ''); lines = lines.filter((l) => l.indexOf(pat) >= 0); }
        else if (st[0] === 'wc' && st[1] === '-l') lines = [String(lines.filter((l) => l.trim()).length)];
        else if (st[0] === 'head') lines = lines.slice(0, +(st[1] || '').replace('-', '') || 10);
      }
      return lines.join('\n') || '(mos qator topilmadi)';
    }
    return 'bash: ' + a[0] + ': command not found — \'help\' deb ko\'ring';
  }

  const LABS = {
    'dns-lab': { title: 'DNS zanjiri', section: '7 va 9-bo\'lim',
      init: { ifaces: { lo: '127.0.0.1/8', eth0: '10.0.0.5/24' }, hasDefault: true,
        routes: [{ match: 'default', via: '10.0.0.1', dev: 'eth0' }, { prefix: '10.0.0.', cidr: '10.0.0.0/24', dev: 'eth0' }],
        arp: { '10.0.0.1': '00:1a:2b:3c:4d:5e' }, listen: { '0.0.0.0:22': { name: 'sshd', pid: 811 } },
        resolverOk: false, resolvNs: '10.0.0.53', dnsServerOk: true,
        dns: { 'api.example.com': '203.0.113.10' }, etcHosts: {},
        records: { 'api.example.com': { A: '203.0.113.10', NS: 'ns1.example.com' } },
        remote: { '203.0.113.10:443': 'open' }, http: { 'api.example.com': { code: 200 } }, icmpOk: true, services: {}, log: [] },
      tasks: [
        { t: 'Tizim nomni yechayotganini tekshiring (bo\'sh javob = muammo)', v: (b, h) => h.some((x) => /getent hosts api\.example\.com/.test(x)), hint: 'getent hosts api.example.com' },
        { t: 'Endi DNS\'dan to\'g\'ridan so\'rang — javob keladimi?', v: (b, h) => h.some((x) => /^dig .*api\.example\.com/.test(x)), hint: 'dig api.example.com' },
        { t: 'Farq bor — resolver sozlamasini o\'qing', v: (b, h) => h.some((x) => /cat \/etc\/resolv\.conf/.test(x)), hint: 'cat /etc/resolv.conf' },
        { t: '/etc/hosts ham tekshiring', v: (b, h) => h.some((x) => /cat \/etc\/hosts/.test(x)), hint: 'cat /etc/hosts' },
      ] },
    'bind-lab': { title: 'localhostda ishlaydi, remote\'da yo\'q', section: '13-bo\'lim',
      init: { ifaces: { lo: '127.0.0.1/8', eth0: '10.0.0.5/24' }, hasDefault: true,
        routes: [{ match: 'default', via: '10.0.0.1', dev: 'eth0' }, { prefix: '10.0.0.', cidr: '10.0.0.0/24', dev: 'eth0' }],
        arp: {}, listen: { '127.0.0.1:8080': { name: 'api-server', pid: 4120 }, '0.0.0.0:22': { name: 'sshd', pid: 811 } },
        resolverOk: true, resolvNs: '10.0.0.53', dnsServerOk: true,
        dns: { 'server-a': '10.0.0.5', localhost: '127.0.0.1' }, etcHosts: { 'server-a': '10.0.0.5' },
        records: { 'server-a': { A: '10.0.0.5' } },
        remote: { '127.0.0.1:8080': 'open', '10.0.0.5:8080': 'refused', '10.0.0.5:22': 'open' },
        http: { localhost: { code: 200 }, 'server-a': { code: 200 } }, icmpOk: true, services: {}, log: [] },
      tasks: [
        { t: 'Serverning o\'zidan portni sinang — ishlaydi', v: (b, h) => h.some((x) => /nc -vz (127\.0\.0\.1|localhost) 8080/.test(x)), hint: 'nc -vz 127.0.0.1 8080' },
        { t: 'Tashqi manzil orqali sinang — boshqa natija', v: (b, h) => h.some((x) => /nc -vz (10\.0\.0\.5|server-a) 8080/.test(x)), hint: 'nc -vz server-a 8080' },
        { t: 'Listener qaysi manzilga bind qilinganini toping', v: (b, h) => h.some((x) => /^ss -l/.test(x)), hint: 'ss -lntup' },
        { t: 'SSH porti bilan solishtirib ko\'ring (u 0.0.0.0 da)', v: (b, h) => h.some((x) => /ss -lntup \| grep :22|nc -vz (server-a|10\.0\.0\.5) 22/.test(x)), hint: 'ss -lntup | grep :22' },
      ] },
    'ssh-lab': { title: 'SSH timeout va refused', section: '15–16-bo\'lim',
      init: { ifaces: { lo: '127.0.0.1/8', eth0: '10.0.0.5/24' }, hasDefault: true,
        routes: [{ match: 'default', via: '10.0.0.1', dev: 'eth0' }, { prefix: '10.0.0.', cidr: '10.0.0.0/24', dev: 'eth0' }],
        arp: { '10.0.0.1': '00:1a:2b:3c:4d:5e' }, listen: { '0.0.0.0:22': { name: 'sshd', pid: 811 } },
        resolverOk: true, resolvNs: '10.0.0.53', dnsServerOk: true,
        dns: { 'server-b': '10.0.0.9', 'server-c': '10.0.0.12' }, etcHosts: {},
        records: { 'server-b': { A: '10.0.0.9' }, 'server-c': { A: '10.0.0.12' } },
        remote: { '10.0.0.9:22': 'timeout', '10.0.0.12:22': 'refused' },
        http: {}, icmpOk: false, fwDrop: [22], services: { ssh: { active: true } },
        log: ['Sep 16 10:02:11 host sshd[811]: Server listening on 0.0.0.0 port 22.'] },
      tasks: [
        { t: 'server-b ga SSH qilib ko\'ring — natijani o\'qing', v: (b, h) => h.some((x) => /ssh .*server-b/.test(x)), hint: 'ssh server-b' },
        { t: 'server-c ga ham SSH qiling — javob boshqacha', v: (b, h) => h.some((x) => /ssh .*server-c/.test(x)), hint: 'ssh server-c' },
        { t: 'Nom yechilayotganini tasdiqlang', v: (b, h) => h.some((x) => /getent hosts server-[bc]/.test(x)), hint: 'getent hosts server-b' },
        { t: 'Yo\'l bormi — marshrutni tekshiring', v: (b, h) => h.some((x) => /ip route get/.test(x)), hint: 'ip route get 10.0.0.9' },
        { t: 'Portni nc bilan ikkisida ham sinab, farqni ko\'ring', v: (b, h) => h.some((x) => /nc -vz (server-b|10\.0\.0\.9) 22/.test(x)) && h.some((x) => /nc -vz (server-c|10\.0\.0\.12) 22/.test(x)), hint: 'nc -vz server-b 22  keyin  nc -vz server-c 22' },
      ] },
    'apt-lab': { title: 'Internet bor, apt ishlamaydi', section: '17-bo\'lim',
      init: { ifaces: { lo: '127.0.0.1/8', eth0: '10.0.0.5/24' }, hasDefault: true,
        routes: [{ match: 'default', via: '10.0.0.1', dev: 'eth0' }, { prefix: '10.0.0.', cidr: '10.0.0.0/24', dev: 'eth0' }],
        arp: { '10.0.0.1': '00:1a:2b:3c:4d:5e' }, listen: { '0.0.0.0:22': { name: 'sshd', pid: 811 } },
        resolverOk: true, resolvNs: '10.0.0.53', dnsServerOk: true,
        dns: { 'archive.ubuntu.com': '91.189.91.39' }, etcHosts: {},
        records: { 'archive.ubuntu.com': { A: '91.189.91.39' } },
        remote: { '91.189.91.39:443': 'timeout', '91.189.91.39:80': 'timeout' },
        http: { 'archive.ubuntu.com': { code: 200 } }, icmpOk: true, fwDrop: [443], services: {}, log: [] },
      tasks: [
        { t: 'Manzilim bormi?', v: (b, h) => h.some((x) => /^ip a(ddr)?$/.test(x)), hint: 'ip addr' },
        { t: 'Tashqariga yo\'lim bormi?', v: (b, h) => h.some((x) => /^ip r(oute)?$/.test(x)), hint: 'ip route' },
        { t: 'Nom yechiladimi?', v: (b, h) => h.some((x) => /getent hosts archive\.ubuntu\.com/.test(x)), hint: 'getent hosts archive.ubuntu.com' },
        { t: 'HTTPS javob beradimi? — mana muammo shu yerda', v: (b, h) => h.some((x) => /curl .*archive\.ubuntu\.com/.test(x)), hint: 'curl -I https://archive.ubuntu.com' },
        { t: '443-port to\'silganini firewall qoidalaridan tasdiqlang', v: (b, h) => h.some((x) => /iptables/.test(x)), hint: 'iptables -L -n' },
      ] },
    'http-lab': { title: 'Port ochiq, HTTP javobi yo\'q', section: '14 va 18-bo\'lim',
      init: { ifaces: { lo: '127.0.0.1/8', eth0: '10.0.0.5/24' }, hasDefault: true,
        routes: [{ match: 'default', via: '10.0.0.1', dev: 'eth0' }, { prefix: '10.0.0.', cidr: '10.0.0.0/24', dev: 'eth0' }],
        arp: {}, listen: { '0.0.0.0:8080': { name: 'api-server', pid: 5001 }, '0.0.0.0:22': { name: 'sshd', pid: 811 } },
        resolverOk: true, resolvNs: '10.0.0.53', dnsServerOk: true,
        dns: { 'app.internal': '10.0.0.5' }, etcHosts: {},
        records: { 'app.internal': { A: '10.0.0.5' } },
        remote: { '10.0.0.5:8080': 'open', '10.0.0.5:22': 'open' },
        http: { 'app.internal': { hang: true } }, icmpOk: true,
        services: { 'api-server': { active: true } },
        log: ['Sep 16 12:04:02 host api-server[5001]: upstream database timeout after 30s'] },
      tasks: [
        { t: 'Nom yechiladimi?', v: (b, h) => h.some((x) => /getent hosts app\.internal/.test(x)), hint: 'getent hosts app.internal' },
        { t: 'Eshik ochiqmi? (transport qavati)', v: (b, h) => h.some((x) => /nc -vz (app\.internal|10\.0\.0\.5) 8080/.test(x)), hint: 'nc -vz app.internal 8080' },
        { t: 'Application javob beradimi? (application qavati)', v: (b, h) => h.some((x) => /curl .*app\.internal/.test(x)), hint: 'curl -I http://app.internal:8080' },
        { t: 'Xizmat tirikmi?', v: (b, h) => h.some((x) => /systemctl status api-server/.test(x)), hint: 'systemctl status api-server' },
        { t: 'Sabab loglarda — o\'qing', v: (b, h) => h.some((x) => /journalctl/.test(x)), hint: 'journalctl -u api-server' },
      ] },
    'chain-lab-net': { title: 'To\'liq zanjir — Name → Application', section: '18-bo\'lim',
      init: { ifaces: { lo: '127.0.0.1/8', eth0: '10.0.0.5/24' }, hasDefault: true,
        routes: [{ match: 'default', via: '10.0.0.1', dev: 'eth0' }, { prefix: '10.0.0.', cidr: '10.0.0.0/24', dev: 'eth0' }],
        arp: { '10.0.0.1': '00:1a:2b:3c:4d:5e' }, listen: { '0.0.0.0:443': { name: 'nginx', pid: 900 } },
        resolverOk: true, resolvNs: '10.0.0.53', dnsServerOk: true,
        dns: { 'shop.example.com': '203.0.113.20' }, etcHosts: {},
        records: { 'shop.example.com': { A: '203.0.113.20', NS: 'ns1.example.com' } },
        remote: { '203.0.113.20:443': 'open' },
        http: { 'shop.example.com': { code: 502, text: 'Bad Gateway', server: 'nginx' } },
        tls: { expired: false }, icmpOk: true, services: { nginx: { active: true } },
        log: ['Sep 16 13:40:12 host nginx[900]: connect() failed (111: Connection refused) while connecting to upstream'] },
      tasks: [
        { t: '1. Name — nom yechiladimi?', v: (b, h) => h.some((x) => /getent hosts|^dig /.test(x)), hint: 'getent hosts shop.example.com' },
        { t: '2. IP va Route — yo\'l bormi?', v: (b, h) => h.some((x) => /ip route get/.test(x)), hint: 'ip route get 203.0.113.20' },
        { t: '3. TCP port — eshik ochiqmi?', v: (b, h) => h.some((x) => /nc -vz .*443/.test(x)), hint: 'nc -vz shop.example.com 443' },
        { t: '4. TLS/HTTP — javob nima?', v: (b, h) => h.some((x) => /curl .*shop\.example\.com/.test(x)), hint: 'curl -I https://shop.example.com' },
        { t: '5. Application — 502 sababini loglardan toping', v: (b, h) => h.some((x) => /journalctl/.test(x)), hint: 'journalctl -u nginx' },
      ] },
  };

  function mount(host, id) {
    const spec = typeof id === 'string' ? LABS[id] : id;
    if (!spec) return;
    let bx = JSON.parse(JSON.stringify(spec.init));
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
    inp.type = 'text'; inp.placeholder = 'ip addr';
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
      say(r || '(bo\'sh javob)');
      paint();
    };
    inp.onkeydown = (e) => { if (e.key === 'Enter') { exec(inp.value); inp.value = ''; } };
    check.onclick = () => { paint(); const d = spec.tasks.filter((t, i) => doneSet[i]).length; say(d === spec.tasks.length ? '✓ Hamma vazifa bajarildi.' : '→ ' + d + '/' + spec.tasks.length + ' bajarildi.'); };
    reset.onclick = () => { bx = JSON.parse(JSON.stringify(spec.init)); hist = []; Object.keys(doneSet).forEach((k) => delete doneSet[k]); out.textContent = ''; say('tizim boshidan tiklandi'); paint(); };
    help.onclick = () => exec('help');
    say('mashq muhiti tayyor — ' + spec.section + '.  \'? Buyruqlar\' yordam beradi.');
    paint();
  }

  window.NetLab = {
    run: function (bx, cmd) { return run(bx, cmd); },
    mountSpec: function (host, spec) { if (host.dataset.mounted) return; host.dataset.mounted = '1'; try { mount(host, spec); } catch (e) { console.warn('seclab', e); } },
    mountAll: function () {
      document.querySelectorAll('[data-nlab]').forEach((h) => { if (h.dataset.mounted) return; h.dataset.mounted = '1'; try { mount(h, h.dataset.nlab); } catch (e) { console.warn('nlab', h.dataset.nlab, e); } });
    },
    ids: Object.keys(LABS),
  };
})();
