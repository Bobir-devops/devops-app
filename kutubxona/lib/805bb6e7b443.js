/* section-labs.js — har bo'lim uchun terminal mashqi (bo'lim testi tagida).
   window.SectionLabs[subject] = { 's1': { title, tasks:[[prompt, regex, hint], ...], init? } } */
(function () {
  /* umumiy soxta tizim — ko'p bo'lim uchun yetarli */
  const BOX = () => ({
    procs: [
      { pid: 812, user: 'root', cpu: 0.1, mem: 0.3, cmd: '/usr/sbin/sshd -D' },
      { pid: 1204, user: 'www-data', cpu: 8.4, mem: 2.6, cmd: 'nginx: worker process' },
      { pid: 1198, user: 'root', cpu: 0.2, mem: 0.5, cmd: 'nginx: master process /usr/sbin/nginx' },
      { pid: 3011, user: 'app', cpu: 91.2, mem: 11.4, cmd: '/usr/bin/report-worker' },
      { pid: 3020, user: 'app', cpu: 3.1, mem: 58.2, cmd: '/usr/bin/cache-service' },
      { pid: 4120, user: 'app', cpu: 2.2, mem: 6.1, cmd: '/usr/bin/api-server', ignoresTerm: true },
    ],
    files: {
      'report.txt': { perm: '-rw-r--r--', links: 1, inode: 22001, owner: 'root', group: 'root', size: 812, content: 'hisobot' },
      'deploy.sh': { perm: '-rw-r--r--', links: 1, inode: 22002, owner: 'root', group: 'root', size: 420 },
      'notes.txt': { perm: '-rwxrwxrwx', links: 1, inode: 22003, owner: 'root', group: 'root', size: 120, content: 'eslatma' },
      'id_rsa': { perm: '-rw-r--r--', links: 1, inode: 22004, owner: 'ali', group: 'ali', size: 3243 },
    },
    df: { size: '100G', used: '93G', avail: '7G', pct: 93, inodePct: 96 },
    du: { '/var/log': '2.4G', '/var/lib': '61G', '/var/cache': '1.1G' },
    deletedOpen: { cmd: 'java', pid: 2481, path: '/var/log/app/old.log' },
    services: { nginx: { active: true, enabled: false, desc: 'A high performance web server' }, ssh: { active: true, enabled: true, desc: 'OpenBSD Secure Shell server' } },
    mem: { total: '7.7G', used: '7.1G', free: '0.4G', swap: '2.0G', swapUsed: '1.3G' },
    nodes: { 22: 'sshd', 80: 'nginx', 8080: 'api-server' },
    limits: { nofile: 1024 },
    openFds: { 4120: 1024 },
    log: [
      'Sep 17 09:02:11 host systemd[1]: Started nginx.',
      'Sep 17 09:14:02 host sshd[812]: Accepted publickey for ali from 10.0.0.9',
      'Sep 17 10:41:55 host kernel: Out of memory: Killed process 3020 (cache-service)',
      'Sep 17 10:42:10 host api-server[4120]: accept4: too many open files',
      'Sep 17 11:02:40 host nginx[1204]: 200 GET /health',
    ],
  });

  /* [savol, tekshiruv regex, yordam] */
  const L = {
    s1: { title: 'Kernel va tizim', tasks: [
      ['Tizimda qaysi processlar ishlayotganini to\'liq ko\'ring.', /^ps\s+aux/, 'ps aux'],
      ['Yadro (kernel) yozuvlarini jurnaldan ajratib oling.', /journalctl\s+-k|dmesg/, 'journalctl -k'],
      ['Hozirgi foydalanuvchi va guruhlarini chiqaring.', /^id\b/, 'id'],
    ] },
    s2: { title: 'Process va PID', tasks: [
      ['`api-server` processining PID\'ini ism bo\'yicha toping.', /pgrep\s+(-a\s+)?api-server/, 'pgrep -a api-server'],
      ['Xotirani eng ko\'p yeyayotgan processlarni tepaga chiqaring.', /--sort=-%mem/, 'ps aux --sort=-%mem | head'],
      ['Jonli monitorni oching.', /^(top|htop)\b/, 'top'],
    ] },
    s3: { title: 'Zavodni topish', tasks: [
      ['Butun process ro\'yxatini oling.', /^ps\s+aux\s*$/, 'ps aux'],
      ['`nginx`ni grep bilan filtrlab toping.', /ps\s+aux\s*\|\s*grep\s+nginx/, 'ps aux | grep nginx'],
      ['Xuddi shuni `pgrep` bilan bajaring.', /pgrep\s+(-a\s+)?nginx/, 'pgrep -a nginx'],
      ['8080-portni kim egallaganini aniqlang.', /ss\s+-lntup/, 'ss -lntup'],
    ] },
    s4: { title: 'SIGTERM va SIGKILL', tasks: [
      ['4120 ga muloyim to\'xtash signali yuboring.', /^kill\s+(-15\s+|-TERM\s+)?4120\s*$/, 'kill 4120'],
      ['U javob bermadi — ro\'yxatda turganini tasdiqlang.', /^ps\s+aux|pgrep/, 'ps aux | grep api-server'],
      ['Faqat shundan keyin majburan to\'xtating.', /kill\s+-9\s+4120/, 'kill -9 4120'],
    ] },
    s5: { title: 'systemd dispetcheri', tasks: [
      ['`nginx` holatini tekshiring.', /systemctl\s+status\s+nginx/, 'systemctl status nginx'],
      ['Uni har reboot\'da o\'zi yonadigan qilib qo\'ying.', /systemctl\s+enable\s+(--now\s+)?nginx/, 'systemctl enable nginx'],
      ['Downtime\'siz yangi sozlamani qabul qildiring.', /systemctl\s+reload\s+nginx/, 'systemctl reload nginx'],
    ] },
    s6: { title: 'Qora kitob — journalctl', tasks: [
      ['`ssh` xizmatining oxirgi 20 qatorini ko\'ring.', /journalctl\s+.*-u\s+ssh.*-n\s*20|journalctl\s+-n\s*20\s+-u\s+ssh/, 'journalctl -u ssh -n 20'],
      ['Yadro xabarlarini ajratib oling.', /journalctl\s+-k|dmesg/, 'journalctl -k'],
      ['`nginx` yozuvlarini jonli kuzatuvga oling.', /journalctl\s+.*-u\s+nginx.*-f|journalctl\s+-f.*nginx/, 'journalctl -u nginx -f'],
    ] },
    s7: { title: 'Fayl tizimi', tasks: [
      ['Fayllarni huquqlari bilan ko\'ring.', /^ls\s+-l/, 'ls -l'],
      ['`report.txt` ichini o\'qing.', /^cat\s+report\.txt/, 'cat report.txt'],
      ['Fayllarning inode raqamlarini chiqaring.', /ls\s+-(li|il)/, 'ls -li'],
    ] },
    s8: { title: 'Hard link', tasks: [
      ['`report.txt` uchun `backup.txt` nomli hard link yarating.', /^ln\s+report\.txt\s+backup\.txt/, 'ln report.txt backup.txt'],
      ['Ikkisining inode raqami bir xil ekanini tasdiqlang.', /ls\s+-(li|il)/, 'ls -li'],
      ['Asl faylni o\'chirib, nusxaning ishlashini tekshiring.', /rm\s+report\.txt/, 'rm report.txt keyin cat backup.txt'],
    ] },
    s9: { title: 'Symlink', tasks: [
      ['`report.txt` uchun `latest.txt` symlink yarating.', /ln\s+-s\s+report\.txt\s+latest\.txt/, 'ln -s report.txt latest.txt'],
      ['Symlink ekanini ro\'yxatdan ko\'ring (-> belgisi).', /^ls\s+-l/, 'ls -l'],
      ['Nishonni o\'chirib, symlink\'ning buzilganini ko\'ring.', /cat\s+latest\.txt/, 'rm report.txt keyin cat latest.txt'],
    ] },
    s10: { title: 'Disk holati', tasks: [
      ['Diskda qancha joy qolganini ko\'ring.', /^df\s+-h/, 'df -h'],
      ['Qaysi katalog joyni yeyayotganini toping.', /^du\s+/, 'du -sh /var/*'],
      ['Inode holatini ham tekshiring.', /^df\s+-i/, 'df -i'],
    ] },
    s11: { title: 'Inode tugashi', tasks: [
      ['Inode ishlatilishini ko\'ring — 96% to\'lgan.', /^df\s+-i/, 'df -i'],
      ['Disk joyi hali borligini tasdiqlang.', /^df\s+-h/, 'df -h'],
      ['Yangi fayl yaratib ko\'ring.', /^touch\s+|^echo\s+.*>/, 'echo test > yangi.txt'],
    ] },
    s12: { title: 'df va du farqi', tasks: [
      ['df nima deydi?', /^df\s+-h/, 'df -h'],
      ['du nima deydi?', /^du\s+/, 'du -sh /var/*'],
      ['Farqning sababini toping — o\'chirilgan, lekin ochiq fayl.', /lsof\s+\+L1/, 'lsof +L1'],
    ] },
    s13: { title: 'Fayl egaligi', tasks: [
      ['Egasi va guruhini ro\'yxatdan ko\'ring.', /^ls\s+-l/, 'ls -l'],
      ['`report.txt` egasini `www-data` ga o\'tkazing.', /chown\s+www-data(:www-data)?\s+report\.txt/, 'chown www-data:www-data report.txt'],
      ['O\'zgarishni tasdiqlang.', /^ls\s+-l/, 'ls -l'],
    ] },
    s14: { title: 'CPU tekshiruvi', tasks: [
      ['CPU\'ni kim yeyayotganini toping.', /--sort=-%cpu/, 'ps aux --sort=-%cpu | head'],
      ['Jonli monitorda tasdiqlang.', /^(top|htop)\b/, 'top'],
      ['Load average\'ni ko\'ring.', /^uptime\b|^(top|htop)\b/, 'uptime'],
    ] },
    s15: { title: 'Xotira tekshiruvi', tasks: [
      ['Stolda qancha bo\'sh joy borligini ko\'ring.', /^free/, 'free -h'],
      ['Xotirani eng ko\'p egallaganni toping.', /--sort=-%mem/, 'ps aux --sort=-%mem | head'],
      ['Qo\'riqchi kimnidir uloqtirganmi — yadro logini tekshiring.', /journalctl\s+-k|dmesg/, 'journalctl -k'],
    ] },
    s16: { title: 'Ruxsatlar', tasks: [
      ['`deploy.sh`ni skript qilib qo\'ying (755).', /chmod\s+755\s+deploy\.sh/, 'chmod 755 deploy.sh'],
      ['`notes.txt`ni oddiy faylga tushiring (644).', /chmod\s+644\s+notes\.txt/, 'chmod 644 notes.txt'],
      ['`id_rsa` kalitini faqat egasiga qoldiring (600).', /chmod\s+600\s+id_rsa/, 'chmod 600 id_rsa'],
    ] },
    s17: { title: 'SSH va portlar', tasks: [
      ['Eshitilayotgan portlarni process nomi bilan ko\'ring.', /ss\s+-lntup/, 'ss -lntup'],
      ['22-portni filtrlab chiqaring.', /ss\s+-lntup\s*\|\s*grep\s+.*22/, 'ss -lntup | grep :22'],
      ['SSH xizmati tirikligini tasdiqlang.', /systemctl\s+status\s+ssh/, 'systemctl status ssh'],
    ] },
    s18: { title: 'To\'liq tekshiruv zanjiri', tasks: [
      ['1-halqa: process tirikmi?', /pgrep|^ps\s+aux/, 'pgrep -a nginx'],
      ['2-halqa: eshik ochiqmi?', /ss\s+-lntup/, 'ss -lntup'],
      ['3-halqa: xizmat holati nima deydi?', /systemctl\s+status/, 'systemctl status nginx'],
      ['4-halqa: resurs yetarlimi?', /^free|^df\s+-h/, 'free -h'],
      ['5-halqa: qora kitob nima deydi?', /journalctl/, 'journalctl -n 20'],
    ] },
    s19: { title: 'Thread, zombie, orphan', tasks: [
      ['Processlarni holat ustuni bilan ko\'ring (STAT).', /^ps\s+aux/, 'ps aux'],
      ['PID 1 kim ekanini aniqlang.', /pgrep|^ps\s+aux/, 'ps aux | grep systemd'],
      ['Yadro logida o\'ldirilgan process izini qidiring.', /journalctl\s+-k|dmesg/, 'journalctl -k'],
    ] },
    s20: { title: 'Load average', tasks: [
      ['Load average\'ni chiqaring.', /^uptime\b/, 'uptime'],
      ['Yadro (kassa) sonini bilish uchun monitorni oching.', /^(top|htop)\b/, 'top'],
      ['Navbatni kim uzaytirayotganini toping.', /--sort=-%cpu/, 'ps aux --sort=-%cpu | head'],
    ] },
    s21: { title: 'Xizmat va log birga', tasks: [
      ['`nginx` holatini ko\'ring.', /systemctl\s+status\s+nginx/, 'systemctl status nginx'],
      ['So\'ng uning logini o\'qing.', /journalctl\s+.*-u\s+nginx/, 'journalctl -u nginx -n 20'],
      ['Eshitayotgan portini tasdiqlang.', /ss\s+-lntup/, 'ss -lntup'],
    ] },
    s22: { title: '4-2-1 amalda', tasks: [
      ['Hozirgi huquqlarni ko\'ring.', /^ls\s+-l/, 'ls -l'],
      ['`deploy.sh` — 755.', /chmod\s+755\s+deploy\.sh/, 'chmod 755 deploy.sh'],
      ['`id_rsa` — 600.', /chmod\s+600\s+id_rsa/, 'chmod 600 id_rsa'],
      ['O\'zgarishni tasdiqlang.', /^ls\s+-l/, 'ls -l'],
    ] },
    s23: { title: 'FD va strace', tasks: [
      ['FD limitini ko\'ring.', /ulimit\s+-n/, 'ulimit -n'],
      ['4120 nima ochib turganini aniqlang.', /lsof\s+-p\s*4120/, 'lsof -p 4120'],
      ['Xato xabarini loglardan tasdiqlang.', /journalctl/, 'journalctl -n 20'],
      ['Process nimaga osilganini kuzatuvga oling.', /strace\s+-p\s*4120/, 'strace -p 4120'],
    ] },
    s24: { title: 'systemd chuqur', tasks: [
      ['Xizmatni to\'xtatib ko\'ring.', /systemctl\s+stop\s+nginx/, 'systemctl stop nginx'],
      ['Holatini tekshiring — chiroq o\'chdi.', /systemctl\s+status\s+nginx/, 'systemctl status nginx'],
      ['Boot ro\'yxatiga qo\'shib, hoziroq yoqing.', /systemctl\s+enable\s+--now\s+nginx/, 'systemctl enable --now nginx'],
    ] },
    s25: { title: 'Swap', tasks: [
      ['Swap ishlatilishini ko\'ring.', /^free/, 'free -h'],
      ['Xotirani egallaganni toping.', /--sort=-%mem/, 'ps aux --sort=-%mem | head'],
      ['OOM izlarini yadro logidan qidiring.', /journalctl\s+-k|dmesg/, 'journalctl -k'],
    ] },
    s26: { title: 'IP va marshrut', tasks: [
      ['Mening manzillarim bormi?', /^ip\s+a(ddr)?\b/, 'ip addr'],
      ['Tashqariga yo\'l bormi?', /^ip\s+r(oute)?\s*$/, 'ip route'],
      ['8.8.8.8 ga qaysi yo\'ldan ketadi?', /ip\s+route\s+get\s+8\.8\.8\.8/, 'ip route get 8.8.8.8'],
      ['Qo\'shnilarni (ARP) ko\'ring.', /^ip\s+n(eigh)?\b/, 'ip neigh'],
    ] },
    s27: { title: 'SSH chuqur', tasks: [
      ['SSH xizmati holatini ko\'ring.', /systemctl\s+status\s+ssh/, 'systemctl status ssh'],
      ['22-port eshitilayotganini tasdiqlang.', /ss\s+-lntup/, 'ss -lntup'],
      ['Kim kirganini logdan toping.', /journalctl\s+.*-u\s+ssh/, 'journalctl -u ssh -n 20'],
    ] },
    s28: { title: 'Hammasi birga', tasks: [
      ['Process tirikmi?', /pgrep|^ps\s+aux/, 'pgrep -a nginx'],
      ['Eshik ochiqmi?', /ss\s+-lntup/, 'ss -lntup'],
      ['Xizmat holati?', /systemctl\s+status/, 'systemctl status nginx'],
      ['Disk va xotira yetarlimi?', /^df\s+-h|^free/, 'df -h'],
      ['Log nima deydi?', /journalctl/, 'journalctl -n 20'],
    ] },
  };

  const NBOX = () => ({
    ifaces: { lo: '127.0.0.1/8', eth0: '10.0.0.5/24' },
    hasDefault: true,
    routes: [{ match: 'default', via: '10.0.0.1', dev: 'eth0' }, { prefix: '10.0.0.', cidr: '10.0.0.0/24', dev: 'eth0' }],
    arp: { '10.0.0.1': '00:1a:2b:3c:4d:5e', '10.0.0.9': '00:1a:2b:3c:4d:77' },
    listen: { '0.0.0.0:22': { name: 'sshd', pid: 811 }, '0.0.0.0:80': { name: 'nginx', pid: 1204 }, '127.0.0.1:8080': { name: 'api-server', pid: 4120 } },
    resolverOk: true, resolvNs: '10.0.0.53', dnsServerOk: true, search: 'example.internal',
    dns: { 'api.example.com': '203.0.113.10', 'shop.example.com': '203.0.113.20', 'server-b': '10.0.0.9', 'server-c': '10.0.0.12', 'archive.ubuntu.com': '91.189.91.39', localhost: '127.0.0.1' },
    etcHosts: { 'server-b': '10.0.0.9' },
    records: {
      'api.example.com': { A: '203.0.113.10', AAAA: '2001:db8::10', NS: 'ns1.example.com', TXT: 'v=spf1 -all' },
      'shop.example.com': { A: '203.0.113.20', MX: 'mail.example.com', NS: 'ns1.example.com' },
      'example.com': { A: '203.0.113.5', MX: 'mail.example.com', NS: 'ns1.example.com', TXT: 'verify=abc' },
      'server-b': { A: '10.0.0.9' }, 'server-c': { A: '10.0.0.12' },
      'archive.ubuntu.com': { A: '91.189.91.39' },
    },
    remote: { '203.0.113.10:443': 'open', '203.0.113.20:443': 'open', '10.0.0.9:22': 'timeout', '10.0.0.12:22': 'refused', '91.189.91.39:443': 'timeout', '127.0.0.1:8080': 'open', '10.0.0.5:8080': 'refused', '10.0.0.5:22': 'open', '10.0.0.5:80': 'open' },
    http: { 'api.example.com': { code: 200 }, 'shop.example.com': { code: 502, text: 'Bad Gateway', server: 'nginx' }, localhost: { code: 200 }, 'archive.ubuntu.com': { code: 200 } },
    tls: { expired: false }, icmpOk: true, fwDrop: [443],
    services: { nginx: { active: true }, ssh: { active: true }, 'api-server': { active: true } },
    log: [
      'Sep 17 09:02:11 host sshd[811]: Server listening on 0.0.0.0 port 22.',
      'Sep 17 10:20:44 host nginx[1204]: connect() failed (111: Connection refused) while connecting to upstream',
      'Sep 17 10:41:02 host api-server[4120]: listening on 127.0.0.1:8080',
    ],
  });

  const N = {
    s1: { title: 'Mental model', init: NBOX(), tasks: [
      ['Mening manzillarim bormi — tekshiring.', /^ip\s+a(ddr)?\b/, 'ip addr'],
      ['Tashqariga yo\'l bormi?', /^ip\s+r(oute)?\s*$/, 'ip route'],
      ['Eshitilayotgan portlarni ko\'ring.', /ss\s+-lntup/, 'ss -lntup'],
    ] },
    s2: { title: 'IP address', init: NBOX(), tasks: [
      ['Interfeyslar va manzillarni chiqaring.', /^ip\s+a(ddr)?\b/, 'ip addr'],
      ['`10.0.0.9` ga qaysi yo\'ldan ketiladi?', /ip\s+route\s+get\s+10\.0\.0\.9/, 'ip route get 10.0.0.9'],
      ['Qo\'shnilar jadvalini (ARP) ko\'ring.', /^ip\s+n(eigh)?\b/, 'ip neigh'],
    ] },
    s3: { title: 'Port', init: NBOX(), tasks: [
      ['Barcha eshitilayotgan portlarni process nomi bilan ko\'ring.', /ss\s+-lntup/, 'ss -lntup'],
      ['22-portni filtrlab chiqaring.', /ss\s+-lntup\s*\|\s*grep\s+.*22/, 'ss -lntup | grep :22'],
      ['80-portga TCP ulanish bo\'ladimi?', /nc\s+-[vz]{1,2}\s+\S+\s+80/, 'nc -vz 10.0.0.5 80'],
    ] },
    s4: { title: 'TCP', init: NBOX(), tasks: [
      ['`api.example.com` 443-portiga ulanishni sinang.', /nc\s+-[vz]{1,2}\s+api\.example\.com\s+443/, 'nc -vz api.example.com 443'],
      ['`server-c` 22-portini sinang — rad javobi keladi.', /nc\s+-[vz]{1,2}\s+(server-c|10\.0\.0\.12)\s+22/, 'nc -vz server-c 22'],
      ['`server-b` 22-portini sinang — sukunat.', /nc\s+-[vz]{1,2}\s+(server-b|10\.0\.0\.9)\s+22/, 'nc -vz server-b 22'],
    ] },
    s5: { title: 'TCP ishonchliligi', init: NBOX(), tasks: [
      ['HTTPS javob sarlavhalarini oling.', /curl\s+.*-I\s+.*api\.example\.com/, 'curl -I https://api.example.com'],
      ['Portning ochiqligini alohida tasdiqlang.', /nc\s+-[vz]{1,2}\s+api\.example\.com\s+443/, 'nc -vz api.example.com 443'],
      ['ICMP bilan yo\'lni sinab ko\'ring.', /^ping\s+/, 'ping -c 3 api.example.com'],
    ] },
    s6: { title: 'UDP', init: NBOX(), tasks: [
      ['53-portga UDP bilan murojaat qilib ko\'ring.', /nc\s+-\w*u\w*\s+\S+\s+53/, 'nc -vzu 10.0.0.53 53'],
      ['DNS so\'rovini to\'g\'ridan yuboring.', /^dig\s+/, 'dig api.example.com'],
      ['UDP natijasi ishonchsiz — TCP bilan solishtiring.', /nc\s+-[vz]{1,2}\s+\S+\s+443/, 'nc -vz api.example.com 443'],
    ] },
    s7: { title: 'DNS', init: NBOX(), tasks: [
      ['Nomni tizim resolver\'i orqali yeching.', /getent\s+hosts\s+api\.example\.com/, 'getent hosts api.example.com'],
      ['Xuddi shuni DNS\'dan to\'g\'ridan so\'rang.', /^dig\s+.*api\.example\.com/, 'dig api.example.com'],
      ['Resolver sozlamasini o\'qing.', /cat\s+\/etc\/resolv\.conf/, 'cat /etc/resolv.conf'],
    ] },
    s8: { title: 'DNS recordlar', init: NBOX(), tasks: [
      ['`example.com` MX yozuvlarini so\'rang.', /dig\s+.*example\.com\s+MX|dig\s+MX\s+example\.com/i, 'dig example.com MX'],
      ['NS yozuvlarini so\'rang.', /dig\s+.*NS/i, 'dig example.com NS'],
      ['Faqat natijani chiqaring (+short).', /dig\s+.*\+short|\+short.*dig/, 'dig api.example.com +short'],
    ] },
    s9: { title: 'DNS troubleshooting', init: NBOX(), tasks: [
      ['Tizim nomni qanday ko\'radi?', /getent\s+hosts\s+\S+/, 'getent hosts api.example.com'],
      ['Boshqa serverdan so\'rab solishtiring.', /dig\s+@\S+/, 'dig @8.8.8.8 api.example.com'],
      ['`/etc/hosts` ni tekshiring.', /cat\s+\/etc\/hosts/, 'cat /etc/hosts'],
    ] },
    s10: { title: 'NAT', init: NBOX(), tasks: [
      ['Chiqish yo\'lini (default route) ko\'ring.', /^ip\s+r(oute)?\s*$/, 'ip route'],
      ['Tashqi manzilga yo\'lni aniqlang.', /ip\s+route\s+get\s+\S+/, 'ip route get 8.8.8.8'],
      ['Firewall qoidalarini ko\'ring.', /^iptables/, 'iptables -L -n'],
    ] },
    s11: { title: 'OSI qavatlar', init: NBOX(), tasks: [
      ['L3: manzil bormi?', /^ip\s+a(ddr)?\b/, 'ip addr'],
      ['L4: eshik ochiqmi?', /nc\s+-[vz]{1,2}\s+\S+\s+\d+/, 'nc -vz api.example.com 443'],
      ['L7: HTTP javob beradimi?', /^curl\s+/, 'curl -I https://api.example.com'],
    ] },
    s12: { title: 'SSH qaysi layer', init: NBOX(), tasks: [
      ['Nom yechiladimi?', /getent\s+hosts\s+server-[bc]/, 'getent hosts server-b'],
      ['22-port ochiqmi?', /nc\s+-[vz]{1,2}\s+\S+\s+22/, 'nc -vz server-c 22'],
      ['SSH xizmati holatini ko\'ring.', /systemctl\s+status\s+ssh/, 'systemctl status ssh'],
    ] },
    s13: { title: '127.0.0.1 va 0.0.0.0', init: NBOX(), tasks: [
      ['Ichkaridan 8080 ishlaydimi?', /nc\s+-[vz]{1,2}\s+(127\.0\.0\.1|localhost)\s+8080/, 'nc -vz 127.0.0.1 8080'],
      ['Tashqi manzil orqali sinang — boshqa natija.', /nc\s+-[vz]{1,2}\s+10\.0\.0\.5\s+8080/, 'nc -vz 10.0.0.5 8080'],
      ['Listener qaysi manzilga bind qilganini toping.', /ss\s+-lntup/, 'ss -lntup'],
    ] },
    s14: { title: 'nc — netcat', init: NBOX(), tasks: [
      ['443-portni ma\'lumot yubormasdan sinang.', /nc\s+-[vz]{1,2}\s+\S+\s+443/, 'nc -vz api.example.com 443'],
      ['Eshik ochiq — application ham javob beradimi?', /^curl\s+/, 'curl -I https://api.example.com'],
      ['Nom yechilmasa nc nima deydi — sinab ko\'ring.', /nc\s+-[vz]{1,2}\s+\S+/, 'nc -vz yoq.example.com 443'],
    ] },
    s15: { title: 'timeout va refused', init: NBOX(), tasks: [
      ['`server-b` ga SSH qilib ko\'ring — sukunat.', /^ssh\s+.*server-b/, 'ssh server-b'],
      ['`server-c` ga SSH qiling — rad javobi.', /^ssh\s+.*server-c/, 'ssh server-c'],
      ['Serverda listener bor-yo\'qligini tekshiring.', /ss\s+-lntup/, 'ss -lntup'],
    ] },
    s16: { title: 'Server A → Server B', init: NBOX(), tasks: [
      ['1. Nom yechiladimi?', /getent\s+hosts\s+server-b/, 'getent hosts server-b'],
      ['2. Yo\'l bormi?', /ip\s+route\s+get\s+10\.0\.0\.9/, 'ip route get 10.0.0.9'],
      ['3. Port ochiqmi?', /nc\s+-[vz]{1,2}\s+(server-b|10\.0\.0\.9)\s+22/, 'nc -vz server-b 22'],
      ['4. SSH xizmati tirikmi?', /systemctl\s+status\s+ssh/, 'systemctl status ssh'],
      ['5. Log nima deydi?', /journalctl/, 'journalctl -u ssh'],
    ] },
    s17: { title: 'apt ishlamayapti', init: NBOX(), tasks: [
      ['Manzilim bormi?', /^ip\s+a(ddr)?\b/, 'ip addr'],
      ['Yo\'lim bormi?', /^ip\s+r(oute)?\s*$/, 'ip route'],
      ['Nom yechiladimi?', /getent\s+hosts\s+archive\.ubuntu\.com/, 'getent hosts archive.ubuntu.com'],
      ['HTTPS javob beradimi?', /curl\s+.*archive\.ubuntu\.com/, 'curl -I https://archive.ubuntu.com'],
      ['To\'siq firewall\'da ekanini tasdiqlang.', /^iptables/, 'iptables -L -n'],
    ] },
    s18: { title: 'Narvon — to\'liq zanjir', init: NBOX(), tasks: [
      ['Name: nom yechiladimi?', /getent\s+hosts\s+shop\.example\.com|dig\s+.*shop\.example\.com/, 'getent hosts shop.example.com'],
      ['Route: yo\'l bormi?', /ip\s+route\s+get\s+203\.0\.113\.20/, 'ip route get 203.0.113.20'],
      ['Port: eshik ochiqmi?', /nc\s+-[vz]{1,2}\s+shop\.example\.com\s+443/, 'nc -vz shop.example.com 443'],
      ['TLS/HTTP: javob nima?', /curl\s+.*shop\.example\.com/, 'curl -I https://shop.example.com'],
      ['Application: 502 sababini logdan toping.', /journalctl/, 'journalctl -u nginx'],
    ] },
  };

  const build = (map) => {
    const out = {};
    Object.keys(map).forEach((id) => {
      const s = map[id];
      out[id] = {
        title: s.title,
        section: id.replace('s', '') + "-bo'lim",
        init: s.init || BOX(),
        tasks: s.tasks.map((t) => ({ t: t[0], re: t[1], hint: t[2] })),
      };
    });
    return out;
  };

  window.SectionLabs = { Linux: build(L), Networking: build(N) };
})();
