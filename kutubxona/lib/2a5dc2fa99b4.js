/* incidents.js — har mavzu uchun incident simulyatori (Linuxdagi 🚨 rejimning ko'p mavzuli versiyasi).
   window.Incidents.build('Networking'|'Docker'|'Kubernetes'|'CI/CD') → 'x1' bo'limini qo'shadi */
(function () {
  const CY = 'oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.11 68)', YE = 'oklch(calc(var(--lk) * 0.54 + var(--lb)) 0.08 40)', GR = 'oklch(calc(var(--lk) * 0.46 + var(--lb)) 0.15 150)', RD = 'oklch(calc(var(--lk) * 0.42 + var(--lb)) 0.18 25)';
  const SG = "Lora,ui-sans-serif,sans-serif", MO = "'IBM Plex Mono',monospace", NR = 'Lora,Georgia,serif';
  const el = (t, css, txt) => { const d = document.createElement(t); if (css) d.style.cssText = css; if (txt != null) d.textContent = txt; return d; };
  const btn = (label, kind) => {
    const map = {
      cy: ['oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.11 68 / 0.07)', 'oklch(calc(var(--lk) * 0.56 + var(--lb)) 0.11 68 / 0.45)', CY],
      gr: ['oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.07)', 'oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.15 150 / 0.45)', GR],
      gh: ['transparent', 'rgb(var(--ink-rgb) / 0.22)', 'rgb(var(--ink-rgb) / 0.88)'],
    };
    const [bg, bd, c] = map[kind] || map.gh;
    const b = el('button', `background:${bg};border:1px solid ${bd};color:${c};font:500 12.5px ${SG};letter-spacing:.04em;padding:9px 15px;cursor:pointer`, label);
    b.type = 'button';
    return b;
  };

  /* ---------- soxta tizim shablonlari ---------- */
  const NETBOX = (o) => Object.assign({
    ifaces: { lo: '127.0.0.1/8', eth0: '10.0.0.5/24' }, hasDefault: true,
    routes: [{ match: 'default', via: '10.0.0.1', dev: 'eth0' }, { prefix: '10.0.0.', cidr: '10.0.0.0/24', dev: 'eth0' }],
    arp: { '10.0.0.1': '00:1a:2b:3c:4d:5e' }, listen: { '0.0.0.0:22': { name: 'sshd', pid: 811 } },
    resolverOk: true, resolvNs: '10.0.0.53', dnsServerOk: true,
    dns: {}, etcHosts: {}, records: {}, remote: {}, http: {}, icmpOk: true, services: {}, log: [],
  }, o || {});

  const DOCKBOX = (o) => Object.assign({
    images: [
      { repo: 'myapp', tag: 'latest', id: 'a1b2c3d4e5f6', size: '142MB', cmd: ['python', 'app.py'], port: 8000, bind: '0.0.0.0', logs: ['listening on 0.0.0.0:8000'] },
      { repo: 'postgres', tag: '16', id: 'd4e5f6a1b2c3', size: '412MB', cmd: ['postgres'], port: 5432, bind: '0.0.0.0', logs: ['ready to accept connections'] },
      { repo: 'alpine', tag: '3.19', id: 'c3d4e5f6a1b2', size: '7MB', cmd: ['sh'] },
    ],
    containers: [], volumes: [], networks: [{ name: 'bridge', driver: 'bridge' }, { name: 'host', driver: 'host' }],
  }, o || {});

  const CICDBOX = (o) => Object.assign({
    git: { head: 'main', branches: { main: { commits: [{ sha: 'a1b2c3d', msg: 'initial commit', files: [] }] } },
      remote: { main: [{ sha: 'a1b2c3d', msg: 'initial commit', files: [] }] }, staged: [], dirty: [] },
  }, o || {});

  /* ---------- senariylar ---------- */
  const SETS = {
    Networking: [
      { id: 'n1', title: 'API nomi topilmayapti', limit: 420,
        alert: "Dastur \"Name or service not known\" deb yiqilyapti. Tarmoq ishlayotganga o'xshaydi.",
        box: NETBOX({ resolverOk: false, dns: { 'api.example.com': '203.0.113.10' },
          records: { 'api.example.com': { A: '203.0.113.10' } }, remote: { '203.0.113.10:443': 'open' },
          http: { 'api.example.com': { code: 200 } } }),
        ev: [[/getent\s+hosts/, 'tizim resolver\'ini sinadingiz'], [/^dig\s+/, 'DNS\'dan to\'g\'ridan so\'radingiz'], [/cat\s+\/etc\/resolv\.conf/, 'resolver sozlamasini o\'qidingiz']],
        options: ['DNS serveri o\'lik', "Tizim resolver'i sozlanmagan — dig ishlaydi, getent ishlamaydi", 'Firewall 443-ni to\'syapti', 'Marshrut yo\'q'],
        answer: 1,
        fix: "Sabab: dig javob beradi (DNS sog'lom), lekin getent hosts bo'sh qaytaradi — demak muammo DNS'da emas, /etc/resolv.conf da nameserver yozilmagan. Qadam: resolv.conf ni tuzatish yoki resolver xizmatini ishga tushirish." },
      { id: 'n2', title: 'Ulanish rad etilyapti', limit: 420,
        alert: "server-c:22 ga SSH \"connection refused\" qaytaryapti, server-b esa timeout.",
        box: NETBOX({ dns: { 'server-b': '10.0.0.9', 'server-c': '10.0.0.12' },
          records: { 'server-b': { A: '10.0.0.9' }, 'server-c': { A: '10.0.0.12' } },
          remote: { '10.0.0.9:22': 'timeout', '10.0.0.12:22': 'refused' }, icmpOk: false, fwDrop: [22],
          services: { ssh: { active: true } } }),
        ev: [[/nc\s+-vz.*server-b|nc\s+-vz.*10\.0\.0\.9/, 'server-b portini sinadingiz'], [/nc\s+-vz.*server-c|nc\s+-vz.*10\.0\.0\.12/, 'server-c portini sinadingiz'], [/ip\s+route\s+get/, 'marshrutni tekshirdingiz']],
        options: ['Ikkisida ham bir xil muammo', "server-b'da yo'l/firewall (sukunat), server-c'da listener yo'q (rad javobi)", 'DNS ishlamayapti', 'Ikkisi ham o\'lik'],
        answer: 1,
        fix: "Sabab: timeout va refused — ikki boshqa sahna. server-b: javob umuman kelmadi → firewall DROP yoki marshrut. server-c: paket yetib bordi, lekin 22-portda listener yo'q → sshd to'xtagan yoki boshqa portda." },
      { id: 'n3', title: 'Port ochiq, javob yo\'q', limit: 420,
        alert: "app.internal:8080 ga ulanish o'rnatiladi, lekin HTTP javobi kelmaydi.",
        box: NETBOX({ dns: { 'app.internal': '10.0.0.5' }, records: { 'app.internal': { A: '10.0.0.5' } },
          listen: { '0.0.0.0:8080': { name: 'api-server', pid: 5001 }, '0.0.0.0:22': { name: 'sshd', pid: 811 } },
          remote: { '10.0.0.5:8080': 'open', '10.0.0.5:22': 'open' },
          http: { 'app.internal': { hang: true } }, services: { 'api-server': { active: true } },
          log: ['Sep 18 12:04:02 host api-server[5001]: upstream database timeout after 30s'] }),
        ev: [[/nc\s+-vz/, 'transport qavatini sinadingiz'], [/^curl/, 'application qavatini so\'radingiz'], [/journalctl/, 'logdan sababni topdingiz']],
        options: ['Port yopiq', "Transport sog'lom, dastur javob bermayapti — upstream DB timeout", 'DNS xato', 'TLS sertifikati muddati o\'tgan'],
        answer: 1,
        fix: "Sabab: nc succeeded (eshik ochiq), curl bo'sh javob — demak muammo application qavatida. Log \"upstream database timeout\" deydi: dastur DB javobini kutib qotib qolgan." },
      { id: 'n4', title: 'apt ishlamayapti', limit: 420,
        alert: "Serverda internet bor, lekin apt update HTTPS'da qotib qolyapti.",
        box: NETBOX({ dns: { 'archive.ubuntu.com': '91.189.91.39' },
          records: { 'archive.ubuntu.com': { A: '91.189.91.39' } },
          remote: { '91.189.91.39:443': 'timeout', '91.189.91.39:80': 'timeout' },
          http: { 'archive.ubuntu.com': { code: 200 } }, fwDrop: [443] }),
        ev: [[/^ip\s+a(ddr)?/, 'manzilni tekshirdingiz'], [/^ip\s+r(oute)?/, 'marshrutni ko\'rdingiz'], [/getent\s+hosts/, 'nom yechilishini sinadingiz'], [/^curl/, 'HTTPS javobini so\'radingiz'], [/iptables/, 'firewall qoidalarini ko\'rdingiz']],
        options: ['DNS ishlamayapti', 'Marshrut yo\'q', "Nom yechiladi, lekin 443-port firewall tomonidan to'silgan", 'Repo manzili xato'],
        answer: 2,
        fix: "Sabab: ip addr va ip route joyida, getent hosts manzil qaytaradi — birinchi uch halqa sog'lom. curl esa timeout: 443 chiqishga ruxsat yo'q. iptables ro'yxati DROP qoidasini tasdiqlaydi." },
      { id: 'n5', title: 'Faqat remote\'dan ishlamayapti', limit: 420,
        alert: "Dastur serverning o'zidan ishlaydi, boshqa mashinadan \"connection refused\".",
        box: NETBOX({ dns: { 'server-a': '10.0.0.5', localhost: '127.0.0.1' }, etcHosts: { 'server-a': '10.0.0.5' },
          records: { 'server-a': { A: '10.0.0.5' } },
          listen: { '127.0.0.1:8080': { name: 'api-server', pid: 4120 }, '0.0.0.0:22': { name: 'sshd', pid: 811 } },
          remote: { '127.0.0.1:8080': 'open', '10.0.0.5:8080': 'refused', '10.0.0.5:22': 'open' },
          http: { localhost: { code: 200 } } }),
        ev: [[/nc\s+-vz\s+(127\.0\.0\.1|localhost)/, 'ichkaridan sinadingiz'], [/nc\s+-vz\s+(server-a|10\.0\.0\.5)/, 'tashqaridan sinadingiz'], [/ss\s+-lntup/, 'bind manzilini ko\'rdingiz']],
        options: ['Firewall to\'syapti', "Dastur 127.0.0.1 ga bind qilgan — tashqaridan yetib borilmaydi", 'Marshrut yo\'q', 'SSH tunnel kerak'],
        answer: 1,
        fix: "Sabab: ss -lntup chiqishida manzil 127.0.0.1:8080 — faqat loopback. 0.0.0.0 ga bind qilinishi kerak. Firewall bo'lsa timeout bo'lardi, bu esa refused." },
    ],
    Docker: [
      { id: 'd1', title: 'Container darhol chiqib ketyapti', limit: 420,
        alert: "api container ishga tushgan zahoti to'xtayapti. Restart ham yordam bermayapti.",
        box: DOCKBOX({ containers: [{ id: 'f1a2b3c4d5e6', name: 'api', image: 'api:latest', state: 'exited', exit: 1,
          cmd: ['node', 'server.js'], env: [], restart: 'no', networks: ['bridge'],
          logs: ['FATAL: environment variable DATABASE_URL is not set'], files: {} }],
          images: [{ repo: 'api', tag: 'latest', id: 'e5f6a1b2c3d4', size: '156MB', cmd: ['node', 'server.js'], port: 3000, bind: '0.0.0.0', needsEnv: 'DATABASE_URL', logs: [] }] }),
        ev: [[/docker\s+ps\s+-a/, 'exit code\'ni ko\'rdingiz'], [/docker\s+logs/, 'logni o\'qidingiz'], [/docker\s+inspect/, 'sozlamani tekshirdingiz']],
        options: ['Image buzilgan', "Kerakli environment o'zgaruvchisi (DATABASE_URL) berilmagan", 'Port band', 'Xotira yetmayapti'],
        answer: 1,
        fix: "Sabab: exit code 1 va log \"environment variable DATABASE_URL is not set\". inspect chiqishida Env bo'sh. Qadam: docker run -e DATABASE_URL=... yoki compose'da env qo'shish." },
      { id: 'd2', title: 'Port map qilingan, lekin javob yo\'q', limit: 420,
        alert: "docker run -p 8080:8000 qilindi, lekin hostdan curl ishlamaydi.",
        box: DOCKBOX({ containers: [{ id: '11aa22bb33cc', name: 'bad', image: 'badapp:latest', state: 'running', exit: 0,
          cmd: ['python', 'app.py'], appPort: 8000, bind: '127.0.0.1', ports: '8080:8000/tcp', networks: ['bridge'], ip: '172.17.0.2',
          logs: ['listening on 127.0.0.1:8000'], files: {} }],
          images: [{ repo: 'badapp', tag: 'latest', id: 'b2c3d4e5f6a1', size: '138MB', cmd: ['python', 'app.py'], port: 8000, bind: '127.0.0.1', logs: ['listening on 127.0.0.1:8000'] }] }),
        ev: [[/docker\s+ps/, 'port mapping\'ni ko\'rdingiz'], [/docker\s+logs/, 'logni o\'qidingiz'], [/docker\s+exec\s+.*ss/, 'ichkaridagi bind manzilini topdingiz']],
        options: ['Port mapping xato yozilgan', "Dastur container ichida 127.0.0.1 ga bind qilgan", 'Tarmoq bridge emas', 'Firewall to\'syapti'],
        answer: 1,
        fix: "Sabab: port mapping to'g'ri, lekin container ichida dastur loopback'ga bind qilgan — mapping o'sha portga yetib bora olmaydi. Log ham \"listening on 127.0.0.1:8000\" deydi. Qadam: 0.0.0.0 ga bind qilish." },
      { id: 'd3', title: 'Container o\'ldirilyapti (137)', limit: 420,
        alert: "worker container exit 137 bilan qayta-qayta to'xtayapti.",
        box: DOCKBOX({ containers: [{ id: '22bb33cc44dd', name: 'worker', image: 'myapp:latest', state: 'exited', exit: 137,
          cmd: ['python', 'app.py'], memLimit: '256MiB', memUse: '256MiB', memPct: 100, oom: true, restart: 'always',
          networks: ['bridge'], logs: ['processing batch 1', 'processing batch 2'], files: {} }] }),
        ev: [[/docker\s+ps\s+-a/, 'exit code\'ni ko\'rdingiz'], [/docker\s+inspect/, 'OOMKilled belgisini topdingiz'], [/docker\s+stats/, 'resurs ishlatilishini ko\'rdingiz']],
        options: ['Dastur o\'zi chiqib ketyapti', "Xotira chegarasiga urilgan — OOMKilled (137)", 'Disk to\'lgan', 'Signal noto\'g\'ri ishlangan'],
        answer: 1,
        fix: "Sabab: exit 137 = SIGKILL, inspect ichida OOMKilled: true va xotira 256MiB limitga teng. Qadam: limitni oshirish yoki dasturning xotira ishlatilishini kamaytirish. Log oddiy ko'rinadi — chunki o'ldirilishdan oldin xato yozilmaydi." },
      { id: 'd4', title: 'Containerlar bir-birini topmayapti', limit: 420,
        alert: "api container db ga ulanolmayapti: \"Could not resolve host: db\".",
        box: DOCKBOX({ containers: [
          { id: '33cc44dd55ee', name: 'api', image: 'myapp:latest', state: 'running', exit: 0, cmd: ['python', 'app.py'], appPort: 8000, bind: '0.0.0.0', networks: ['bridge'], ip: '172.17.0.2', logs: ['listening on 0.0.0.0:8000'], files: {} },
          { id: '44dd55ee66ff', name: 'db', image: 'postgres:16', state: 'running', exit: 0, cmd: ['postgres'], appPort: 5432, bind: '0.0.0.0', networks: ['bridge'], ip: '172.17.0.3', logs: ['ready to accept connections'], files: {} }] }),
        ev: [[/docker\s+exec\s+.*api.*(curl|wget)/, 'ichkaridan ulanishni sinadingiz'], [/docker\s+network\s+ls/, 'tarmoqlarni ko\'rdingiz'], [/docker\s+network\s+(inspect|create|connect)/, 'tarmoq bilan ishladingiz']],
        options: ['DB o\'lik', "Ikkisi default bridge'da — nom orqali topish faqat o'z tarmog'ida ishlaydi", 'Port yopiq', 'DNS serveri kerak'],
        answer: 1,
        fix: "Sabab: default bridge tarmog'ida container nomlari DNS orqali yechilmaydi. Qadam: docker network create app-net va ikkisini shu tarmoqqa ulash — shundan keyin \"db\" nomi ishlaydi." },
      { id: 'd5', title: 'Disk to\'ldi', limit: 420,
        alert: "Docker host'da joy qolmadi: \"no space left on device\".",
        box: DOCKBOX({ containers: [
          { id: '55ee66ff77aa', name: 'web', image: 'myapp:latest', state: 'running', exit: 0, cmd: ['python', 'app.py'], appPort: 8000, bind: '0.0.0.0', networks: ['bridge'], logs: ['listening'], files: {} },
          { id: '66ff77aa88bb', name: 'old-job', image: 'alpine:3.19', state: 'exited', exit: 0, cmd: ['sh'], networks: ['bridge'], logs: [], files: {} }],
          volumes: [{ name: 'pgdata' }, { name: 'old-data' }, { name: 'tmp-cache' }] }),
        ev: [[/docker\s+system\s+df/, 'disk taqsimotini ko\'rdingiz'], [/docker\s+ps\s+-a/, 'to\'xtaganlarni topdingiz'], [/docker\s+volume\s+ls/, 'volume\'larni ko\'rdingiz']],
        options: ['Faqat loglar joyni yeyapti', "Build cache, to'xtagan container va ishlatilmagan volume'lar yig'ilib qolgan", 'Image juda katta', 'Host disk kichik'],
        answer: 1,
        fix: "Sabab: docker system df ko'rsatadi — build cache 100% reclaimable, to'xtagan container va bo'sh volume'lar bor. Qadam: keraksizini o'chirib docker system prune; volume'larni ehtiyotkorlik bilan (ma'lumot yo'qolmasin)." },
    ],
    Kubernetes: [
      { id: 'k1', title: 'Pod\'lar Pending turib qoldi', limit: 480,
        alert: "trainer Deployment'ining Pod'lari Running bo'lmayapti.",
        cluster: { nodes: [{ name: 'node-1', ready: true, taints: ['workload=gpu:NoSchedule'] }, { name: 'node-2', ready: true, taints: ['workload=gpu:NoSchedule'] }],
          deployments: [{ name: 'trainer', replicas: 2, image: 'trainer:1.0', labels: { app: 'trainer' }, container: 'trainer' }] },
        ev: [[/get\s+pods/, 'Pod holatini ko\'rdingiz'], [/describe\s+pod/, 'hodisalarni o\'qidingiz'], [/describe\s+node/, 'node taint\'ini topdingiz']],
        options: ['Image tortib olinmayapti', "Node'larda taint bor, Pod'da tolerance yo'q — rejalashtirilmayapti", 'Resurs so\'rovi juda katta', 'Deployment noto\'g\'ri yozilgan'],
        answer: 1,
        fix: "Sabab: describe pod \"FailedScheduling\" deydi, describe node esa taint ko'rsatadi (workload=gpu:NoSchedule). Qadam: Pod'ga tolerations qo'shish yoki taint'ni olib tashlash." },
      { id: 'k2', title: 'Service ortida hech kim yo\'q', limit: 480,
        alert: "shop Service'iga so'rov ketmayapti, 503 qaytadi.",
        cluster: { deployments: [{ name: 'shop', replicas: 2, image: 'nginx:1.25', labels: { app: 'shop-web' }, container: 'shop' }],
          services: [{ name: 'shop', selector: { app: 'shop' }, port: 80, targetPort: 80 }] },
        ev: [[/get\s+(ep|endpoints)/, 'endpoints bo\'sh ekanini ko\'rdingiz'], [/describe\s+svc/, 'Service selector\'ini o\'qidingiz'], [/get\s+pods|describe\s+pod/, 'Pod label\'larini solishtirdingiz']],
        options: ['Pod\'lar o\'lik', "Service selector (app=shop) Pod label'iga (app=shop-web) mos kelmayapti", 'Port xato', 'NetworkPolicy to\'syapti'],
        answer: 1,
        fix: "Sabab: kubectl get endpoints bo'sh — Service hech qanday Pod'ni topmayapti. describe svc selector app=shop deydi, Pod'larda esa app=shop-web. Qadam: label yoki selector'ni moslashtirish." },
      { id: 'k3', title: 'CrashLoopBackOff', limit: 480,
        alert: "payments Pod'i qayta-qayta yiqilyapti, restart soni oshib boryapti.",
        cluster: { pods: [{ name: 'payments-7c9f', owner: null, status: 'CrashLoopBackOff', ready: false, restarts: 7,
          image: 'payments:2.1', container: 'payments', labels: { app: 'payments' },
          logs: [], prevLogs: ['level=fatal msg="config file not found: /etc/app/config.yaml"', 'exit status 1'] }] },
        ev: [[/get\s+pods/, 'restart sonini ko\'rdingiz'], [/logs\s+\S+\s+(--previous|-p)/, "o'lgan konteyner logini o'qidingiz"], [/describe\s+pod/, 'hodisalarni tekshirdingiz']],
        options: ['Xotira yetmayapti', "Konfiguratsiya fayli yo'q — dastur fatal bilan chiqyapti", 'Image tortib olinmayapti', 'Probe juda qattiq'],
        answer: 1,
        fix: "Sabab: hozirgi log bo'sh (konteyner yangi), --previous esa haqiqiy sababni ko'rsatadi: config file not found. Qadam: ConfigMap'ni mount qilish yoki yo'lni to'g'rilash." },
      { id: 'k4', title: 'Yangilanish yarmida qoldi', limit: 480,
        alert: "web Deployment'ini yangiladik — rollout qotib qoldi, eski Pod'lar hali ishlayapti.",
        cluster: { deployments: [{ name: 'web', replicas: 3, image: 'nginx:1.26-broken', labels: { app: 'web' }, container: 'web', prevImage: 'nginx:1.24' }] },
        ev: [[/rollout\s+status/, 'rollout holatini ko\'rdingiz'], [/get\s+pods/, 'Pod holatini tekshirdingiz'], [/describe\s+pod|logs\s+/, 'sababni qidirdingiz'], [/rollout\s+(undo|history)/, 'qaytarish yo\'lini ishlatdingiz']],
        options: ['Replicas kam', "Yangi image bilan Pod'lar ready bo'lmayapti — rolling update to'xtadi, rollback kerak", 'Node yetmayapti', 'Service selector buzilgan'],
        answer: 1,
        fix: "Sabab: rolling update yangi Pod ready bo'lmaguncha eskisini o'chirmaydi — shuning uchun \"yarmida\" qoladi (bu himoya, xato emas). Tezkor chora: kubectl rollout undo. Keyin image/probe sababini tuzatish." },
      { id: 'k5', title: 'Node NotReady', limit: 480,
        alert: "node-2 NotReady bo'lib qoldi, Pod'lar ko'chmayapti.",
        cluster: { nodes: [{ name: 'node-1', ready: true, taints: [] }, { name: 'node-2', ready: false, taints: [] }],
          deployments: [{ name: 'api', replicas: 4, image: 'nginx:1.25', labels: { app: 'api' }, container: 'api' }] },
        ev: [[/get\s+nodes/, 'node holatini ko\'rdingiz'], [/describe\s+node/, 'node tafsilotini o\'qidingiz'], [/get\s+pods.*-o\s*wide|get\s+pods/, 'Pod taqsimotini tekshirdingiz']],
        options: ['Klaster o\'lik', "node-2 NotReady — kubelet/CNI muammosi; Pod'lar sog'lom node'ga ko'chishi kerak", 'Service buzilgan', 'etcd to\'lgan'],
        answer: 1,
        fix: "Sabab: node-2 NotReady — kubelet javob bermayapti yoki CNI/pressure muammosi. Pod'lar darhol ko'chmaydi: eviction timeout kutiladi. Qadam: node'dagi kubelet holati va logini ko'rish; shoshilinch bo'lsa cordon + drain." },
    ],
    'CI/CD': [
      { id: 'c1', title: 'Pipeline yiqildi', limit: 420,
        alert: "main'ga push qildik — pipeline qizil. Deploy to'xtadi.",
        box: CICDBOX({ ci: { plan: [
            { name: 'lint', dur: '4s', log: ['ok'] },
            { name: 'test', fails: true, dur: '31s', log: ['test_login.py::test_token FAILED', 'AssertionError: expected 200, got 401'] },
            { name: 'build', dur: '48s', log: ['building wheel...'] },
          ], image: 'backend:8f31c2a' } }),
        ev: [[/^ci\s+run/, 'pipeline\'ni ishlatdingiz'], [/^ci\s+status/, 'qaysi bosqichda yiqilganini ko\'rdingiz'], [/^ci\s+logs\s+test/, 'o\'sha bosqich logini o\'qidingiz']],
        options: ['Build muhiti buzilgan', "test bosqichida token testi yiqilgan — 401 qaytyapti", 'Registry ishlamayapti', 'Runner band'],
        answer: 1,
        fix: "Sabab: ci status test bosqichida to'xtaganini ko'rsatadi, log esa aniq testni: expected 200, got 401 — autentifikatsiya buzilgan. Qadam: o'zgarish nima ekanini diff bilan ko'rib testni yoki kodni tuzatish." },
      { id: 'c2', title: 'Prod\'da qaysi versiya ekani noma\'lum', limit: 420,
        alert: "Xato chiqdi, lekin prod'dagi image latest teg bilan — qaysi kod ekani bilinmayapti.",
        box: CICDBOX({ warnLatest: true, built: [], registry: [],
          k8s: { deploys: [{ name: 'backend', replicas: 3, ready: 3, updated: 3, image: 'backend:latest' }] },
          ci: { plan: [{ name: 'test', dur: '20s', log: ['ok'] }, { name: 'build', dur: '40s', log: ['ok'] }], image: 'backend:8f31c2a' } }),
        ev: [[/kubectl\s+get\s+deploy/, 'prod\'dagi image tegini ko\'rdingiz'], [/docker\s+build\s+.*:8f31c2a|docker\s+push\s+.*:8f31c2a/, 'Git SHA bilan teglab yasadingiz'], [/kubectl\s+set\s+image/, 'aniq tegni qo\'lladingiz']],
        options: ['Registry buzilgan', "latest o'zgaruvchi ko'rsatgich — rollback uchun qaytadigan nuqta yo'q; Git SHA teg kerak", 'Deployment noto\'g\'ri', 'Replicas kam'],
        answer: 1,
        fix: "Sabab: latest bugun bir image'ni, ertaga boshqasini bildiradi — node'lar turli vaqtda pull qilgani uchun bir xil teg turli ichki holat bo'lishi mumkin. Qadam: Git SHA bilan teglab (backend:8f31c2a) qayta chiqarish, keyin rollback aniq tegga qaytish bo'ladi." },
      { id: 'c3', title: 'Secret repoga tushdi', limit: 420,
        alert: "Ogohlantirish: .env fayli commit qilinib push bo'lgan. Ichida DB paroli bor.",
        box: CICDBOX({ git: { head: 'main', branches: { main: { commits: [{ sha: 'a1b2c3d', msg: 'initial commit', files: [] }] } },
            remote: { main: [{ sha: 'a1b2c3d', msg: 'initial commit', files: [] }] }, staged: [], dirty: ['.env'] },
          ci: { plan: [{ name: 'rotate', fails: true, log: ['secret hali amalda — rotate qilinmagan'] }] } }),
        ev: [[/^git\s+status/, 'holatni ko\'rdingiz'], [/^git\s+rm/, 'faylni o\'chirib ko\'rdingiz'], [/^ci\s+fix\s+rotate/, 'kalitni rotate qildingiz']],
        options: ['git rm bilan o\'chirish yetarli', "Birinchi ish — kalitni revoke/rotate qilish; Gitdan o'chirish yetarli emas", 'Repo\'ni private qilish kifoya', 'Faylni .gitignore ga qo\'shish yetarli'],
        answer: 1,
        fix: "Sabab: commit tarixda, fork'larda, CI keshida va odamlarning nusxasida qoladi — o'chirsangiz ham kalit ishlayotgan kalit bo'lib turadi. Tartib: 1) rotate/revoke, 2) yangi kalitni secret store'ga, 3) tarixni tozalash, 4) audit." },
      { id: 'c4', title: 'Deploy o\'tdi, lekin xato ko\'paydi', limit: 420,
        alert: "Yangi versiya chiqdi, 5 daqiqadan keyin xato darajasi 12% ga chiqdi.",
        box: CICDBOX({ k8s: { deploys: [{ name: 'backend', replicas: 4, ready: 4, updated: 4, image: 'backend:9c1d2e3' }] },
          helm: { releases: [{ name: 'backend', revision: 5, image: 'backend:9c1d2e3' }] },
          ci: { plan: [{ name: 'test', dur: '22s', log: ['43 passed'] }], image: 'backend:9c1d2e3' } }),
        ev: [[/kubectl\s+get\s+deploy|kubectl\s+rollout\s+status/, 'deploy holatini ko\'rdingiz'], [/kubectl\s+rollout\s+undo|helm\s+rollback/, 'tezkor qaytarish qildingiz'], [/helm\s+(list|history)/, 'revision tarixini ko\'rdingiz']],
        options: ['Kutish kerak, o\'zi tuzaladi', "Avval rollback (tiklanish), keyin sababni izlash — mijozni kutdirmaslik kerak", 'Replicas oshirish kerak', 'Pipeline\'ni qayta ishlatish kerak'],
        answer: 1,
        fix: "Sabab tartibi: incidentda birinchi maqsad — tiklanish, keyin tahlil. Qadam: kubectl rollout undo yoki helm rollback bilan ishlaydigan versiyaga qaytish, shundan keyin loglar va metrikadan sababni topish. Testlar o'tgani xatoni ushlamaganini bildiradi — test qoplamini ham ko'rish kerak." },
      { id: 'c5', title: 'GitOps drift', limit: 420,
        alert: "Argo CD \"OutOfSync\" deydi. Kimdir klasterda qo'lda o'zgartirish qilgan.",
        box: CICDBOX({ argo: { apps: [{ name: 'backend', sync: 'OutOfSync', target: '8f31c2a', live: 'a1b2c3d' }] },
          k8s: { deploys: [{ name: 'backend', replicas: 5, ready: 5, updated: 5, image: 'backend:a1b2c3d' }] } }),
        ev: [[/argocd\s+app\s+(get|list)/, 'ilova holatini ko\'rdingiz'], [/argocd\s+app\s+diff/, 'farqni ko\'rdingiz'], [/argocd\s+app\s+sync/, 'sinxronlashtirdingiz']],
        options: ['Argo CD buzilgan', "Klasterdagi holat Git'dan farq qilyapti — Git haqiqat manbasi, sync kerak", 'Git repo o\'chib ketgan', 'Replicas noto\'g\'ri'],
        answer: 1,
        fix: "Sabab: OutOfSync — live holat (a1b2c3d, 5 replica) Git'dagi target (8f31c2a) bilan mos kelmaydi. Qadam: diff bilan farqni ko'rish; o'zgarish kerakli bo'lsa Git'ga commit qilish, aks holda sync bilan Git holatiga qaytarish." },
    ],
  };

  const ENGINE = {
    Networking: () => window.NetLab,
    Docker: () => window.DockerLab,
    Kubernetes: () => window.K8sLab,
    'CI/CD': () => window.CicdLab,
  };
  const PH = { Networking: 'ip addr', Docker: 'docker ps', Kubernetes: 'kubectl get pods', 'CI/CD': 'git status' };

  function keyOf(subject) { return 'incidents-' + subject.replace(/\W+/g, '-').toLowerCase(); }
  const stAll = (subject) => { try { return JSON.parse(localStorage.getItem(keyOf(subject)) || '{}'); } catch (e) { return {}; } };
  const stSave = (subject, o) => { try { localStorage.setItem(keyOf(subject), JSON.stringify(o)); } catch (e) {} };

  function runOne(sc, host, badge, subject) {
    host.innerHTML = '';
    const eng = ENGINE[subject] ? ENGINE[subject]() : null;
    let bx;
    if (sc.cluster) bx = eng && eng.newCluster ? eng.newCluster(JSON.parse(JSON.stringify(sc.cluster))) : JSON.parse(JSON.stringify(sc.cluster));
    else bx = JSON.parse(JSON.stringify(sc.box || {}));
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
    inp.type = 'text';
    inp.placeholder = 'buyruq yozing (masalan: ' + (PH[subject] || 'help') + ')';
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
      try { r = eng && eng.run ? eng.run(bx, cmd) : '(muhit tayyor emas)'; } catch (err) { r = 'error: ' + err.message; }
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
      const ev = sc.ev.filter(([re]) => hist.some((h) => re.test(h)));
      const right = picked === sc.answer;
      let score = (right ? 50 : 0) + Math.round((ev.length / sc.ev.length) * 30) + (timeout ? 0 : Math.max(0, Math.round(20 * (1 - secs / sc.limit))));
      const all = stAll(subject);
      if (!all[sc.id] || score > all[sc.id].score) { all[sc.id] = { score: score, secs: secs }; stSave(subject, all); }
      badge.textContent = '✓ ' + score + '/100 · ' + secs + 's';
      badge.style.color = score >= 70 ? GR : YE;
      submit.style.display = 'none';
      inp.disabled = true;
      verdict.style.display = 'block';
      verdict.innerHTML =
        '<div style="font:500 15px ' + SG + ';color:' + (score >= 70 ? GR : score >= 40 ? YE : RD) + ';margin-bottom:10px">' +
        (timeout ? '⏱ Vaqt tugadi — ' : right ? "✓ Sabab to'g'ri topildi — " : "✗ Sabab noto'g'ri — ") + score + '/100 · ' + secs + ' sekund</div>' +
        '<div style="margin-bottom:10px">' + sc.fix + '</div>' +
        '<div style="font:500 12px ' + SG + ';letter-spacing:.16em;text-transform:uppercase;color:rgb(var(--ink-rgb) / 0.73);margin-bottom:6px">Dalil bo\'yicha</div>' +
        '<div>' + sc.ev.map(([re, txt]) => (hist.some((h) => re.test(h)) ? '✓ ' : '✗ ') + txt).join('<br />') + '</div>' +
        '<div style="font:400 15px/1.55 ' + NR + ';color:rgb(var(--ink-rgb) / 0.8);margin-top:10px">Ball: sabab 50 + dalil 30 + tezlik 20. Siz ' + hist.length + ' buyruq ishlatdingiz.</div>';
    }
    submit.onclick = () => { if (picked < 0) { verdict.style.display = 'block'; verdict.textContent = 'Avval variantni tanlang.'; return; } finish(false); };
    inp.focus();
  }

  window.Incidents = {
    build: function (subject) {
      const set = SETS[subject];
      const anchor = document.getElementById('s1');
      if (!set || !anchor || document.getElementById('x1')) return false;
      const sec = el('div', 'padding:46px 0 10px;border-top:1px solid rgb(var(--ink-rgb) / 0.11);margin-top:46px');
      sec.id = 'x1';
      sec.append(el('div', "font:500 12px " + SG + ";letter-spacing:.26em;text-transform:uppercase;color:" + CY, '🚨 Incident simulyatori'));
      sec.append(el('h2', "font:500 clamp(26px,4vw,34px)/1.15 " + SG + ";letter-spacing:-.025em;margin:10px 0 16px", 'Taymer ishga tushdi — sababni toping'));
      sec.append(el('p', "font:400 18px/1.62 " + NR + ";color:rgb(var(--ink-rgb) / 0.96);max-width:640px;margin:0 0 22px;text-wrap:pretty",
        "Har senariyda tizim buzilgan. Terminalda buyruq yozib dalil to'playsiz, keyin sababni tanlaysiz. Ball: sabab 50 + kerakli dalil 30 + tezlik 20."));
      const wrap = el('div', 'display:flex;flex-direction:column;gap:14px');
      const saved = stAll(subject);
      set.forEach((sc) => {
        const card = el('div', 'border:1px solid rgb(var(--ink-rgb) / 0.15);background:var(--bg2);padding:20px');
        const top = el('div', 'display:flex;flex-wrap:wrap;gap:12px;align-items:baseline;justify-content:space-between;margin-bottom:10px');
        top.append(el('div', "font:500 17px/1.3 " + SG + ";letter-spacing:-.01em;color:var(--ink)", '🚨 ' + sc.title));
        const best = saved[sc.id];
        const badge = el('div', "font:500 12px " + MO + ";color:" + (best ? GR : 'rgb(var(--ink-rgb) / 0.73)'), best ? '✓ ' + best.score + '/100 · ' + best.secs + 's' : 'hali bajarilmagan');
        top.appendChild(badge);
        card.appendChild(top);
        card.append(el('div', "font:400 16.5px/1.6 " + NR + ";color:rgb(var(--ink-rgb) / 0.94);margin-bottom:14px;text-wrap:pretty", sc.alert));
        const body = el('div');
        card.appendChild(body);
        const start = btn('▶ Boshlash (' + Math.round(sc.limit / 60) + ' daqiqa)', 'cy');
        card.appendChild(start);
        start.onclick = () => { start.style.display = 'none'; runOne(sc, body, badge, subject); };
        wrap.appendChild(card);
      });
      sec.appendChild(wrap);
      anchor.parentElement.appendChild(sec);
      return true;
    },
  };
})();
