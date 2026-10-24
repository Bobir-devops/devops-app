/* arch-questions-4.js — suhbat savollari ro'yxatidan topilgan bo'shliqlar uchun qo'shimcha arxitektura bloklari.
   Mavjud window.ArchQ bo'limlariga qo'shiladi (bo'lim testidan oldin tushuntiriladi va testda so'raladi). */
(function () {
  const b = (t) => '<strong style="color:var(--ink);font-weight:600">' + t + '</strong>';
  const c = (t) => '<code style="font:500 15px \'IBM Plex Mono\',monospace;color:oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.11 68)">' + t + '</code>';
  const add = (subj, sec, items) => {
    window.ArchQ = window.ArchQ || {};
    window.ArchQ[subj] = window.ArchQ[subj] || {};
    window.ArchQ[subj][sec] = (window.ArchQ[subj][sec] || []).concat(items);
  };

  /* ---------- LINUX ---------- */
  add('Linux', 's13', [
    { q: 'OOM killer qaysi processni o‘ldirishni qanday tanlaydi — scoring qanday ishlaydi?', a: `Xotira tugaganda kernel har processga ${b('oom_score')} (0–1000) hisoblaydi. Asosiy omil — processning ${b('xotiradagi ulushi')}: RSS (RAM‘dagi sahifalar) + swap‘dagi qismi + sahifa jadvallari, jami xotiraga nisbatan. Unga ${c('oom_score_adj')} (−1000…+1000) qo‘shiladi: ${c('-1000')} — hech qachon o‘ldirilmaydi, ${c('+1000')} — birinchi nomzod. ${b('Eng yuqori ball')} olgan process ${b('SIGKILL')} bilan o‘ldiriladi. Muhim: u ${b('aybdorni emas, eng ko‘p yeyayotganni')} tanlaydi — shuning uchun ba‘zan asosiy DB o‘ladi. Tekshirish: ${c('cat /proc/PID/oom_score')}, izi: ${c('journalctl -k | grep -i oom')}. Kubernetes‘da QoS sinfiga qarab adj avtomatik qo‘yiladi (Guaranteed −997, BestEffort 1000).` },
  ]);
  add('Linux', 's4', [
    { q: 'kill buyrug‘i va signal nomlari: qaysi signal nima qiladi?', a: `${c('kill')} aslida ${b('signal yuboradi')}, o‘ldirish — faqat bitta holat. Asosiylari: ${b('1 SIGHUP')} — "sozlamani qayta o‘qi" (ko‘p daemon reload qiladi); ${b('2 SIGINT')} — Ctrl+C; ${b('9 SIGKILL')} — ushlab bo‘lmaydi, kernel darhol o‘ldiradi; ${b('15 SIGTERM')} — default, "yig‘ishtir va chiq"; ${b('19 SIGSTOP')} / ${b('18 SIGCONT')} — to‘xtatib turish va davom ettirish. Yozilishi: ${c('kill -15 PID')} = ${c('kill -TERM PID')} = ${c('kill PID')}. Ro‘yxat: ${c('kill -l')}. Nom bo‘yicha: ${c('pkill nginx')}, ${c('killall nginx')}. Exit code = 128 + signal raqami: 143 = TERM, 137 = KILL.` },
  ]);
  add('Linux', 's11', [
    { q: 'Diskda joy bor, lekin fayl yaratib bo‘lmayapti — nega va inode bilan qanday bog‘liq?', a: `Har fayl yaratilganda unga ${b('bitta inode')} ajratiladi — inode faylning pasporti: egasi, huquqi, hajmi, bloklari manzili (${b('nomi emas')} — nom katalogda). Inode soni ${b('formatlashda belgilanadi')}. Millionlab mayda fayl (kesh, sessiya) inode‘larni tugatsa, ${c('df -h')} bo‘sh joy ko‘rsatadi, lekin ${c('df -i')} 100% bo‘ladi va ${c('No space left on device')} chiqadi. Hard link yangi inode ${b('olmaydi')} — mavjudiga ikkinchi nom beradi, symlink esa o‘z inode‘ini oladi. Yechim: mayda fayllarni topib tozalash (${c('find /var -xdev -type f | cut -d/ -f2-3 | sort | uniq -c | sort -rn | head')}), rotatsiya.` },
  ]);

  /* ---------- NETWORKING ---------- */
  add('Networking', 's14', [
    { q: 'Serverda telnet ham, nc ham yo‘q — portni qanday tekshirasiz?', a: `Bash‘ning o‘zida ${b('/dev/tcp')} imkoniyati bor: ${c('timeout 3 bash -c "</dev/tcp/10.0.0.9/22" && echo ochiq || echo yopiq')}. Bash bu yo‘lni ko‘rsa TCP ulanish ochadi — hech qanday qo‘shimcha dastur kerak emas. Eski usul — ${c('telnet 10.0.0.9 22')}: "Connected" chiqsa port ochiq, "Connection refused" — listener yo‘q, osilib qolsa — firewall/timeout. Boshqa variantlar: ${c('curl -v telnet://10.0.0.9:22')}, ${c('python3 -c "import socket;socket.create_connection((\'10.0.0.9\',22),3)"')}. Hammasi bir savolga javob: ${b('TCP handshake o‘tadimi')}.` },
  ]);
  add('Networking', 's16', [
    { q: 'Ikki server bir tarmoqda: B ga SSH ishlaydi, A ga ishlamaydi. A ga qanday kirasiz va nima tekshirasiz?', a: `Avval ${b('B dan A ni tekshirasiz')} — ular bir tarmoqda, shuning uchun muammo tashqi yo‘lda emas: ${c('ping A')}, ${c('nc -vz A 22')} (yoki ${c('bash /dev/tcp')}). Timeout — A‘da firewall yoki A o‘chiq; refused — A‘da sshd to‘xtagan yoki boshqa portda. Kirish yo‘llari: ${b('B orqali jump')} (${c('ssh -J B A')}) — agar muammo faqat sizning tarmog‘ingizdan bo‘lsa; ${b('konsol')} — bulutda serial/web console yoki AWS SSM, VMware/iLO/IPMI; ${b('konfiguratsiya agenti')} (Ansible pull, SSM Run Command) orqali ${c('systemctl restart sshd')}. Ichkariga kirgach: ${c('systemctl status sshd')}, ${c('ss -lntp | grep :22')}, ${c('journalctl -u sshd')}, firewall qoidalari, disk to‘lmaganmi (${c('df -h')}).` },
  ]);
  add('Networking', 's12', [
    { q: 'DevOps‘da qaysi qatlamlar bilan ishlaymiz va SSH nechta qatlamdan foydalanadi?', a: `Kundalik ish asosan ${b('L3 (IP, routing)')}, ${b('L4 (TCP/UDP, port, firewall, load balancer)')} va ${b('L7 (HTTP, DNS, TLS, Ingress)')}da. L2 (MAC, ARP) kamroq — asosan bir segment ichidagi muammolarda. SSH ${b('L7 protokoli')}, lekin ${b('pastdagi hammasidan foydalanadi')}: L4 da TCP 22-port, L3 da IP marshrut, L2 da keyingi qadam MAC manzili. Shifrlash SSH‘ning o‘zida (OSI bo‘yicha L6 vazifasi). Shuning uchun "SSH ishlamayapti" — qaysi qatlamda uzilganini topish masalasi.` },
  ]);

  /* ---------- DOCKER ---------- */
  add('Docker', 's6', [
    { q: 'Kubernetes‘da command va args Dockerfile‘dagi ENTRYPOINT va CMD bilan qanday bog‘lanadi?', a: `${c('command')} — ${b('ENTRYPOINT‘ni almashtiradi')}, ${c('args')} — ${b('CMD‘ni almashtiradi')}. Faqat ${c('args')} bersangiz image ENTRYPOINT‘i qoladi va sizning argumentlaringiz unga qo‘shiladi. ${c('command')} bersangiz image‘ning ENTRYPOINT ham, CMD ham e‘tiborsiz qoladi (args bermasangiz argumentsiz ishlaydi). Docker‘da ekvivalenti: ${c('docker run --entrypoint X image')} — ENTRYPOINT, ${c('docker run image a b')} — CMD. Ya‘ni ENTRYPOINT avval ishlaydi, siz bergan buyruq uning ${b('argumenti')} bo‘ladi.` },
  ]);

  /* ---------- KUBERNETES ---------- */
  add('Kubernetes', 's2', [
    { q: 'Control plane‘da qanday Pod‘lar ishlaydi va nima uchun?', a: `kubeadm klasterida master‘da ${c('kube-system')} namespace‘ida: ${b('kube-apiserver')} (yagona kirish nuqtasi), ${b('etcd')} (holat ombori), ${b('kube-scheduler')} (Pod‘ga node tanlash), ${b('kube-controller-manager')} (Deployment, ReplicaSet, Node kontrollerlari). Bular ${b('static Pod')} — manifestlari ${c('/etc/kubernetes/manifests/')} da turadi va ularni API server emas, ${b('kubelet o‘zi')} ishga tushiradi (tuxum-tovuq muammosi: API server hali yo‘q). Har node‘da (masterda ham) yana ${b('kube-proxy')} va ${b('CNI')} Pod‘lari (DaemonSet), klasterda ${b('CoreDNS')}. Ko‘rish: ${c('kubectl get pods -n kube-system -o wide')}.` },
  ]);
  add('Kubernetes', 's3', [
    { q: 'Master va worker node farqi nima va nega masterda ham kubelet bor?', a: `${b('Master (control plane)')} — ${b('qaror qabul qiladi')}: apiserver, etcd, scheduler, controller-manager. Odatda unga ${b('taint')} qo‘yilgan (${c('node-role.kubernetes.io/control-plane:NoSchedule')}) — oddiy ish yuklari tushmaydi. ${b('Worker')} — ${b('ishni bajaradi')}: kubelet, kube-proxy, container runtime va ilova Pod‘lari. Masterda kubelet shuning uchun kerak: control plane komponentlarining o‘zi ${b('static Pod')} sifatida ishlaydi va ularni ${b('kubelet ishga tushiradi va qayta tiriltiradi')}. Ya‘ni kubelet — har qanday node‘da "konteynerlarni ishga tushiruvchi agent", master ham node. Bog‘lanish: har kubelet ${b('apiserver‘ga')} ulanadi (TLS), scheduler va kontrollerlar ham faqat apiserver orqali gaplashadi.` },
  ]);

  /* ---------- CI/CD ---------- */
  add('CI/CD', 's9', [
    { q: 'Serverga SSH ruxsati yo‘q — kodni qanday deploy (push) qilasiz?', a: `SSH bo‘lmasa ${b('push emas, pull')} modeliga o‘tiladi: server o‘zi yangilikni ${b('tortib oladi')}. Variantlar: ${b('GitOps')} (Argo CD/Flux klaster ichidan Git‘ni o‘qiydi); ${b('agent')} (serverda CI runner yoki SSM/Ansible-pull agenti — faqat chiqish ulanishi kerak); ${b('registry + auto-update')} (server yangi image‘ni pull qiladi); ${b('bulut API')} (ECS/Cloud Run/K8s API orqali deploy — SSH emas, API ruxsati). Foydasi: kiruvchi port ochilmaydi, kalit tarqatilmaydi, har o‘zgarish Git‘da. Birdaniga kerak bo‘lsa — bulut konsoli yoki SSM Session Manager.` },
  ]);
})();
