window.DEVOPS_DATA = {
stages: [
{ id: "linux", n: "01", title: "Linux va Bash", weeks: 2,
  why: "Serverlarning 90%+ Linux'da ishlaydi. Har bir DevOps vazifasi terminaldan boshlanadi.",
  topics: ["File system, permissions (chmod, chown, umask)", "Process'lar: ps, top, kill, systemctl, journalctl", "Package manager: apt, dnf", "Disk: df, du, lsblk, mount, LVM asoslari", "Text tools: grep, sed, awk, cut, sort, uniq, xargs", "Bash scripting: o'zgaruvchi, if/for, function, exit code, set -euo pipefail", "cron va systemd timer", "SSH: key, ~/.ssh/config, scp, rsync"],
  res: [["OverTheWire Bandit — o'yin shaklida", "https://overthewire.org/wargames/bandit/"], ["Linux Journey", "https://linuxjourney.com"], ["The Linux Command Line (bepul kitob)", "https://linuxcommand.org/tlcl.php"], ["roadmap.sh/linux", "https://roadmap.sh/linux"]],
  quiz: [
   { q: "chmod 640 file.txt nimani beradi?", o: ["Egasi: rw, guruh: r, boshqalar: hech narsa", "Egasi: rwx, guruh: r, boshqalar: r", "Hammaga: rw", "Egasi: r, guruh: rw"], a: 0, e: "6=rw-, 4=r--, 0=---." },
   { q: "Servis loglarini ko'rish uchun qaysi buyruq?", o: ["journalctl -u nginx", "systemctl logs nginx", "cat /proc/nginx", "service nginx --log"], a: 0, e: "systemd jurnalidan bitta unit loglari: journalctl -u <unit>, kuzatish uchun -f." },
   { q: "Bash'da set -e nima qiladi?", o: ["Birorta buyruq xato qaytarsa skript to'xtaydi", "Barcha o'zgaruvchilarni eksport qiladi", "Debug rejimini yoqadi", "Xatolarni yashiradi"], a: 0, e: "-u e'lon qilinmagan o'zgaruvchida, -o pipefail pipe ichidagi xatoda to'xtatadi." },
   { q: "Disk to'lib qoldi. Qaysi papka katta ekanini qanday topasiz?", o: ["du -sh /* | sort -h", "df -i", "lsblk -f", "free -h"], a: 0, e: "df umumiy holatni, du esa papkalar hajmini ko'rsatadi." }
  ] },
{ id: "net", n: "02", title: "Tarmoq asoslari", weeks: 1,
  why: "Deploy ishlamay qolsa, sabab ko'pincha DNS, port yoki firewall bo'ladi.",
  topics: ["OSI va TCP/IP modeli", "IP, subnet, CIDR (/24, /16)", "DNS: A, CNAME, MX, TXT; dig, nslookup", "HTTP/HTTPS, TLS sertifikat, status kodlar", "Port, firewall: ufw, iptables/nftables", "Nginx: reverse proxy, load balancing", "Troubleshooting: ping, traceroute, ss, curl -v, tcpdump"],
  res: [["Cloudflare Learning Center", "https://www.cloudflare.com/learning/"], ["Nginx hujjatlari", "https://nginx.org/en/docs/"], ["Subnetting mashqlari", "https://subnettingpractice.com"]],
  quiz: [
   { q: "10.0.0.0/24 tarmoqda nechta foydalanish mumkin bo'lgan host bor?", o: ["254", "256", "255", "512"], a: 0, e: "2^8 = 256, minus network va broadcast manzillar." },
   { q: "Domen boshqa domenga ishora qilishi uchun qaysi DNS yozuvi?", o: ["CNAME", "A", "MX", "TXT"], a: 0, e: "A yozuvi IP'ga, CNAME boshqa nomga ishora qiladi." },
   { q: "502 Bad Gateway odatda nimani bildiradi?", o: ["Proxy orqadagi servisdan javob ololmadi", "Foydalanuvchi login qilmagan", "Sahifa topilmadi", "Server ataylab rad etdi"], a: 0, e: "Nginx ishlayapti, lekin upstream (app) o'chgan yoki noto'g'ri port." },
   { q: "Serverda qaysi portlar tinglanayotganini ko'rish:", o: ["ss -tulpn", "ip route", "ping localhost", "hostname -I"], a: 0, e: "ss (yoki eski netstat) socket'larni jarayon bilan ko'rsatadi." }
  ] },
{ id: "git", n: "03", title: "Git, GitHub, GitLab", weeks: 1,
  why: "Infratuzilma ham kod. Hamma narsa Git orqali o'tadi.",
  topics: ["Branch, merge, rebase farqi", "Pull Request / Merge Request, code review", "Conflict hal qilish", "Trunk-based va GitFlow", "Tag va semantic versioning", ".gitignore, git hooks", "GitLab — O'zbekistonda ko'p kompaniyalar self-hosted GitLab ishlatadi"],
  res: [["Learn Git Branching (interaktiv)", "https://learngitbranching.js.org"], ["Pro Git kitobi (bepul)", "https://git-scm.com/book"]],
  quiz: [
   { q: "git rebase'ning merge'dan asosiy farqi?", o: ["Tarixni chiziqli qilib commit'larni qayta yozadi", "Faqat remote bilan ishlaydi", "Conflict chiqmaydi", "Branch'ni o'chiradi"], a: 0, e: "Umumiy branch'larda rebase qilmang: tarix qayta yoziladi." },
   { q: "Oxirgi commit'ni bekor qilib, o'zgarishlarni saqlab qolish:", o: ["git reset --soft HEAD~1", "git reset --hard HEAD~1", "git revert HEAD --hard", "git clean -fd"], a: 0, e: "--hard o'zgarishlarni ham o'chiradi." },
   { q: "v2.3.1 → v3.0.0 nimani bildiradi (SemVer)?", o: ["Orqaga mos kelmaydigan o'zgarish", "Bug fix", "Yangi funksiya", "Hujjat o'zgarishi"], a: 0, e: "MAJOR.MINOR.PATCH." }
  ] },
{ id: "docker", n: "04", title: "Docker", weeks: 2,
  why: "Ilovani bir xil muhitda paketlash — zamonaviy deploy'ning asosi.",
  topics: ["Image, layer, container farqi", "Dockerfile best practices: multi-stage, non-root user, .dockerignore", "Volume va bind mount", "Docker network: bridge, host", "Docker Compose: ko'p servisli stack", "Registry: Docker Hub, GHCR, Harbor", "Image scanning: Trivy"],
  res: [["Play with Docker (bepul lab)", "https://labs.play-with-docker.com"], ["Docker Get Started", "https://docs.docker.com/get-started/"], ["Trivy", "https://github.com/aquasecurity/trivy"]],
  quiz: [
   { q: "Multi-stage build nima uchun kerak?", o: ["Yakuniy image'ni kichik va xavfsiz qilish", "Bir nechta konteynerni bir vaqtda ishga tushirish", "Build'ni parallel qilish", "Image'ni shifrlash"], a: 0, e: "Kompilyator va build vositalari yakuniy image'ga tushmaydi." },
   { q: "Konteyner o'chganda ma'lumot saqlanishi uchun:", o: ["Volume ishlatish", "docker commit", "EXPOSE qo'shish", "--restart always"], a: 0, e: "Container qatlami vaqtinchalik; DB uchun doim volume." },
   { q: "COPY . . ni RUN npm install'dan oldin yozish nimaga yomon?", o: ["Har kod o'zgarishida dependency cache buziladi", "Xato beradi", "Image ishlamaydi", "Farqi yo'q"], a: 0, e: "Avval package*.json, keyin install, keyin qolgan kod." },
   { q: "CMD va ENTRYPOINT farqi?", o: ["ENTRYPOINT asosiy buyruq, CMD unga default argument", "Ikkalasi bir xil", "CMD build vaqtida ishlaydi", "ENTRYPOINT faqat Windows'da"], a: 0, e: "docker run image <args> CMD'ni almashtiradi." }
  ] },
{ id: "cicd", n: "05", title: "CI/CD", weeks: 2,
  why: "Kodni avtomatik test qilib, build qilib, deploy qilish — DevOps'ning yuragi.",
  topics: ["Pipeline bosqichlari: lint, test, build, scan, deploy", "GitHub Actions: workflow, job, runner, matrix", "GitLab CI: .gitlab-ci.yml, stages, runner", "Jenkins asoslari (eski loyihalarda ko'p)", "Cache va artifact", "Secret'lar va environment'lar", "Deploy strategiyalari: rolling, blue-green, canary"],
  res: [["GitHub Actions docs", "https://docs.github.com/en/actions"], ["GitLab CI/CD docs", "https://docs.gitlab.com/ee/ci/"], ["Jenkins docs", "https://www.jenkins.io/doc/"]],
  quiz: [
   { q: "Blue-green deploy'ning asosiy afzalligi?", o: ["Bir zumda rollback qilish mumkin", "Kamroq server kerak", "Test kerak emas", "DB migratsiyasi oson"], a: 0, e: "Ikki muhit; trafik bir zumda almashtiriladi." },
   { q: "Parolni pipeline'da qayerda saqlash kerak?", o: ["CI secret / variable (masked)", ".gitlab-ci.yml ichida", "README'da", "Docker image ichida"], a: 0, e: "Hech qachon repoda emas. Masked + protected o'zgaruvchi." },
   { q: "Canary deploy nima?", o: ["Yangi versiyani avval kichik foiz foydalanuvchiga berish", "Tunda deploy qilish", "Faqat test serverga deploy", "Ikki versiyani o'chirish"], a: 0, e: "Metrikalar yaxshi bo'lsa foiz oshiriladi." }
  ] },
{ id: "cloud", n: "06", title: "Bulut: AWS + Azure/GCP qisqa", weeks: 2, cert: "AWS Cloud Practitioner → Solutions Architect Associate",
  why: "Xalqaro va katta mahalliy kompaniyalar bulutda. Ko'p mahalliy kompaniyalar esa on-prem (Proxmox/VMware) — ikkalasini biling.",
  topics: ["IAM: user, role, policy, least privilege", "VPC: subnet (public/private), route table, NAT, Security Group", "EC2, AMI, Auto Scaling Group, Load Balancer", "S3, RDS, Route 53", "CloudWatch, Budgets — xarajat nazorati", "Azure va GCP'dagi muqobillari (VM, Blob/GCS, AKS/GKE)", "On-prem: Proxmox, VMware asoslari"],
  res: [["AWS Skill Builder (bepul kurslar)", "https://skillbuilder.aws"], ["AWS Free Tier", "https://aws.amazon.com/free/"], ["Microsoft Learn — Azure", "https://learn.microsoft.com/training/azure/"], ["Google Cloud Free", "https://cloud.google.com/free"]],
  quiz: [
   { q: "Private subnet'dagi serverga internetga chiqish uchun nima kerak?", o: ["NAT Gateway", "Internet Gateway to'g'ridan", "Elastic IP", "S3 endpoint"], a: 0, e: "IGW public subnet uchun; private subnet NAT orqali chiqadi." },
   { q: "EC2'ga S3'ga kirish berishning to'g'ri usuli?", o: ["IAM Role biriktirish", "Access key'ni serverga yozish", "S3'ni public qilish", "Root hisob ishlatish"], a: 0, e: "Role vaqtinchalik credential beradi, key saqlash shart emas." },
   { q: "Security Group qanday ishlaydi?", o: ["Stateful, faqat allow qoidalari", "Stateless, allow va deny", "Faqat chiquvchi trafik", "Subnet darajasida"], a: 0, e: "NACL — subnet darajasida va stateless." },
   { q: "AWS hisobingiz kutilmagan pul yechmasligi uchun birinchi qadam?", o: ["Budget alert sozlash", "MFA o'chirish", "Region almashtirish", "Root access key yaratish"], a: 0, e: "Budgets + root uchun MFA — birinchi kunning vazifasi." }
  ] },
{ id: "iac", n: "07", title: "Terraform va Ansible", weeks: 2,
  why: "Serverni qo'lda emas, kod bilan yaratish va sozlash.",
  topics: ["Terraform: provider, resource, variable, output", "State: remote backend (S3 + lock), state xavfsizligi", "Module va workspace", "plan / apply / destroy jarayoni", "Ansible: inventory, playbook, role", "Idempotency tushunchasi", "Ansible Vault — sirlarni saqlash"],
  res: [["Terraform tutorials", "https://developer.hashicorp.com/terraform/tutorials"], ["Ansible docs", "https://docs.ansible.com/"]],
  quiz: [
   { q: "Terraform state fayli nima uchun muhim?", o: ["Real resurslarni kod bilan bog'laydi", "Faqat log", "Provider'ni yuklaydi", "Kerak emas"], a: 0, e: "State'da sirlar ham bo'ladi — Git'ga qo'ymang, remote backend ishlating." },
   { q: "Idempotent playbook degani:", o: ["Necha marta ishlatsa ham natija bir xil", "Faqat bir marta ishlaydi", "Parallel ishlaydi", "Root talab qilmaydi"], a: 0, e: "Ikkinchi ishga tushirishda changed=0 bo'lishi kerak." },
   { q: "Terraform va Ansible farqi (odatiy ishlatish)?", o: ["Terraform infra yaratadi, Ansible ichini sozlaydi", "Ikkalasi bir xil", "Ansible faqat bulut uchun", "Terraform faqat Linux uchun"], a: 0, e: "Provisioning va configuration management." }
  ] },
{ id: "k8s", n: "08", title: "Kubernetes (CKA)", weeks: 3, cert: "CKA — Certified Kubernetes Administrator",
  why: "Konteyner orkestratsiyasi standarti. CKA ish beruvchilar eng ko'p so'raydigan sertifikat.",
  topics: ["Arxitektura: control plane, etcd, kubelet, kube-proxy", "Pod, ReplicaSet, Deployment, Service (ClusterIP, NodePort, LB)", "ConfigMap, Secret", "Ingress va Ingress controller", "Storage: PV, PVC, StorageClass", "RBAC: Role, ClusterRole, ServiceAccount", "Scheduling: taint/toleration, affinity, resource limit", "Probe'lar: liveness, readiness", "Helm chart", "CKA: kubeadm upgrade, etcd backup/restore, troubleshooting"],
  res: [["Killercoda — CKA bepul lab'lar", "https://killercoda.com/killer-shell-cka"], ["kubernetes.io hujjatlari (imtihonda ruxsat)", "https://kubernetes.io/docs/"], ["kind — lokal cluster", "https://kind.sigs.k8s.io"], ["CKA imtihoni (pullik)", "https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/"]],
  quiz: [
   { q: "Pod CrashLoopBackOff holatida. Birinchi qadam?", o: ["kubectl logs <pod> --previous va describe", "Cluster'ni qayta o'rnatish", "Node'ni o'chirish", "Image'ni o'chirish"], a: 0, e: "--previous oldingi yiqilgan konteyner logini ko'rsatadi." },
   { q: "Readiness probe muvaffaqiyatsiz bo'lsa nima bo'ladi?", o: ["Pod Service endpoint'laridan chiqariladi", "Pod qayta ishga tushadi", "Node o'chadi", "Hech narsa"], a: 0, e: "Qayta ishga tushirish — liveness probe vazifasi." },
   { q: "etcd backup qaysi vosita bilan olinadi?", o: ["etcdctl snapshot save", "kubectl backup", "kubeadm export", "helm save"], a: 0, e: "CKA'da sertifikat yo'llari (--cacert, --cert, --key) bilan beriladi." },
   { q: "Deployment'ni oldingi versiyaga qaytarish:", o: ["kubectl rollout undo deployment/web", "kubectl delete deployment web", "kubectl revert web", "kubectl apply --old"], a: 0, e: "rollout history bilan revisiyalarni ko'ring." }
  ] },
{ id: "obs", n: "09", title: "Monitoring va Logging", weeks: 1,
  why: "Ko'rmagan narsangizni tuzata olmaysiz. On-call ishining asosi.",
  topics: ["Metrics, logs, traces farqi", "Prometheus: scrape, exporter, PromQL", "Grafana dashboard", "Alertmanager → Telegram bot", "Loki yoki ELK bilan loglar", "SLI, SLO, error budget", "Incident va postmortem"],
  res: [["Prometheus docs", "https://prometheus.io/docs/"], ["Grafana tutorials", "https://grafana.com/tutorials/"]],
  quiz: [
   { q: "Prometheus ma'lumotni qanday yig'adi (odatiy)?", o: ["Pull — target'larni scrape qiladi", "Push — ilova yuboradi", "Log fayllardan", "SNMP orqali"], a: 0, e: "Qisqa job'lar uchun Pushgateway bor." },
   { q: "SLO 99.9% bo'lsa oyiga taxminan qancha downtime mumkin?", o: ["~43 daqiqa", "~7 soat", "~4 daqiqa", "~1 kun"], a: 0, e: "30 kun × 0.1% ≈ 43.2 daqiqa." },
   { q: "Yaxshi alert qanday bo'lishi kerak?", o: ["Foydalanuvchiga ta'sir qiladigan va harakat talab qiladigan", "Har bir CPU sakrashida", "Kuniga yuzlab", "Faqat email orqali"], a: 0, e: "Alert fatigue — on-call'ning eng katta dushmani." }
  ] },
{ id: "job", n: "10", title: "Xavfsizlik va ishga kirish", weeks: 1,
  why: "DevSecOps asoslari va o'zingizni sotish — oxirgi qadam.",
  topics: ["Secret management: Vault, SOPS", "SAST/DAST, dependency scan", "Least privilege, MFA hamma joyda", "Portfolio: 3–4 ta loyiha GitHub'da README bilan", "Rezyume: natijalar raqamlar bilan", "Ish qidirish: hh.uz, LinkedIn, Telegram IT vakansiya kanallari", "Suhbat: texnik + troubleshooting + behavioral"],
  res: [["roadmap.sh/devops", "https://roadmap.sh/devops"], ["90DaysOfDevOps", "https://github.com/MichaelCade/90DaysOfDevOps"], ["hh.uz", "https://hh.uz"]],
  quiz: [
   { q: "Sir (secret) tasodifan Git'ga push qilindi. To'g'ri harakat?", o: ["Darhol sirni almashtirish (rotate), keyin tarixdan tozalash", "Commit'ni revert qilish yetarli", "Repo'ni private qilish", "Hech narsa"], a: 0, e: "Bir marta push bo'lgan sir — oshkor bo'lgan sir." },
   { q: "Rezyumedagi eng kuchli satr qaysi?", o: ["CI/CD joriy qilib deploy vaqtini 40 daqiqadan 6 daqiqaga tushirdim", "Docker bilaman", "Jamoada ishlay olaman", "Kubernetes haqida eshitganman"], a: 0, e: "Harakat + vosita + o'lchanadigan natija." }
  ] }
],
labs: [
 { id: "l1", st: "linux", t: "Yashirin fayllar bilan batafsil ro'yxat", g: "Joriy papkadagi barcha fayllarni (yashirinlari ham) batafsil ko'rsating.", h: "ls ga -l va -a flaglari", re: /^ls\s+(-[a-z]*(la|al)[a-z]*|-l\s+-a|-a\s+-l)\s*$/, out: "drwxr-xr-x  4 deploy deploy 4096 Oct 23 09:12 .\n-rw-r--r--  1 deploy deploy  220 Oct 20 11:02 .env\n-rwxr-xr-x  1 deploy deploy  812 Oct 22 18:40 deploy.sh\n-rw-r--r--  1 deploy deploy 9.1M Oct 23 09:10 app.log" },
 { id: "l2", st: "linux", t: "Katta fayllarni topish", g: "/var/log ichida 100MB dan katta fayllarni toping.", h: "find <papka> -size +100M", re: /^(sudo\s+)?find\s+\/var\/log\/?\s+(-type\s+f\s+)?-size\s+\+100M(\s+-type\s+f)?\s*$/, out: "/var/log/nginx/access.log.1\n/var/log/journal/3f1c/system@0005.journal" },
 { id: "l3", st: "linux", t: "Xatolarni sanash", g: "app.log faylida nechta ERROR qatori borligini sanang.", h: "grep -c yoki grep | wc -l", re: /^(grep\s+-c\s+["']?ERROR["']?\s+app\.log|grep\s+["']?ERROR["']?\s+app\.log\s*\|\s*wc\s+-l|cat\s+app\.log\s*\|\s*grep\s+-c\s+["']?ERROR["']?)\s*$/, out: "37" },
 { id: "l4", st: "linux", t: "Bajarish huquqi", g: "deploy.sh fayliga egasi uchun bajarish (execute) huquqini bering.", h: "chmod u+x", re: /^chmod\s+(u\+x|\+x|7[0-7][0-7])\s+(\.\/)?deploy\.sh\s*$/, out: "" },
 { id: "l5", st: "linux", t: "Servis holati", g: "nginx servisi ishlayaptimi — tekshiring.", h: "systemctl ...", re: /^(sudo\s+)?systemctl\s+status\s+nginx(\.service)?\s*$/, out: "● nginx.service - A high performance web server\n     Loaded: loaded (/lib/systemd/system/nginx.service; enabled)\n     Active: active (running) since Thu 2026-10-23 08:01:14 UTC" },
 { id: "l6", st: "net", t: "Portni kim band qilgan?", g: "8080 portni qaysi jarayon tinglayotganini aniqlang.", h: "ss -tlnp yoki lsof -i", re: /^((sudo\s+)?ss\s+-[a-z]*\s*\|\s*grep\s+:?8080|(sudo\s+)?lsof\s+-i\s*:8080|(sudo\s+)?netstat\s+-[a-z]+\s*\|\s*grep\s+:?8080)\s*$/, out: "LISTEN 0 511 0.0.0.0:8080 0.0.0.0:* users:((\"java\",pid=2214,fd=41))" },
 { id: "l7", st: "net", t: "DNS so'rov", g: "example.uz domenining A yozuvini so'rang.", h: "dig yoki nslookup", re: /^(dig\s+(\+short\s+)?example\.uz(\s+A)?(\s+\+short)?|nslookup\s+example\.uz)\s*$/, out: "example.uz.   300  IN  A  185.74.4.20" },
 { id: "l8", st: "git", t: "Yangi branch", g: "feature/login nomli branch yarating va unga o'ting.", h: "git switch -c yoki checkout -b", re: /^git\s+(switch\s+-c|checkout\s+-b)\s+feature\/login\s*$/, out: "Switched to a new branch 'feature/login'" },
 { id: "l9", st: "docker", t: "Nginx konteyner", g: "nginx image'ini fon rejimida, host 8080 → konteyner 80 portda ishga tushiring.", h: "docker run -d -p HOST:CONTAINER image", re: /^docker\s+run\s+(.*\s)?-d\s+(.*\s)?-p\s+8080:80\s+(.*\s)?nginx(:\S+)?\s*$|^docker\s+run\s+(.*\s)?-p\s+8080:80\s+(.*\s)?-d\s+(.*\s)?nginx(:\S+)?\s*$/, out: "f3a91c2be7d04e8a9b..." },
 { id: "l10", st: "docker", t: "Loglarni kuzatish", g: "web nomli konteyner loglarini real vaqtda kuzating.", h: "docker logs -f", re: /^docker\s+(container\s+)?logs\s+(-f|--follow)\s+web\s*$|^docker\s+logs\s+web\s+(-f|--follow)\s*$/, out: "10.0.0.5 - - [23/Oct/2026:09:14:02] \"GET /health HTTP/1.1\" 200 2\n..." },
 { id: "l11", st: "k8s", t: "Barcha pod'lar", g: "Barcha namespace'lardagi pod'larni ko'rsating.", h: "kubectl get pods + flag", re: /^(kubectl|k)\s+get\s+(pods?|po)\s+(-A|--all-namespaces)\s*$/, out: "NAMESPACE     NAME                       READY   STATUS             RESTARTS\nkube-system   coredns-5d78c9869d-x2k9p   1/1     Running            0\ndefault       web-7d4f8b-9zq           0/1     CrashLoopBackOff   6" },
 { id: "l12", st: "k8s", t: "Muammoli pod", g: "default'dagi web-7d4f8b-9zq pod'ining oldingi (yiqilgan) konteyner logini ko'ring.", h: "kubectl logs ... --previous", re: /^(kubectl|k)\s+logs\s+(pod\/)?web-7d4f8b-9zq\s+(--previous|-p)\s*$|^(kubectl|k)\s+logs\s+(--previous|-p)\s+(pod\/)?web-7d4f8b-9zq\s*$/, out: "Error: connect ECONNREFUSED 10.96.12.4:5432\n  at TCPConnectWrap.afterConnect" },
 { id: "l13", st: "k8s", t: "Scale qilish", g: "web deployment'ini 3 replikaga kengaytiring.", h: "kubectl scale ... --replicas", re: /^(kubectl|k)\s+scale\s+(deploy|deployment)(\/|\s+)web\s+--replicas[= ]3\s*$/, out: "deployment.apps/web scaled" },
 { id: "l14", st: "k8s", t: "Rollback", g: "web deployment'ini oldingi versiyaga qaytaring.", h: "kubectl rollout ...", re: /^(kubectl|k)\s+rollout\s+undo\s+(deploy|deployment)(\/|\s+)web\s*$/, out: "deployment.apps/web rolled back" },
 { id: "l15", st: "iac", t: "Terraform reja", g: "Infratuzilmaga qanday o'zgarish kiritilishini apply qilmasdan ko'ring.", h: "terraform ...", re: /^terraform\s+plan(\s+-out[= ]\S+)?\s*$/, out: "Plan: 3 to add, 1 to change, 0 to destroy." }
],
cards: [
 ["linux", "Hard link va soft link farqi?", "Hard link — o'sha inode'ga ikkinchi nom (asl fayl o'chsa ham ishlaydi). Soft (symbolic) link — yo'lga ishora, asl o'chsa buziladi."],
 ["linux", "Load average 4.0 — 2 yadroli serverda nima?", "Yuklama yadrolar sonidan 2 barobar ko'p: jarayonlar navbatda kutyapti."],
 ["linux", "Zombie process nima?", "Tugagan, lekin ota-jarayon exit kodini o'qimagan jarayon. Ota-jarayonni tuzatish/restart qilish kerak."],
 ["linux", "$? nima qaytaradi?", "Oxirgi buyruqning exit kodi. 0 — muvaffaqiyat."],
 ["linux", "SIGTERM va SIGKILL?", "SIGTERM (15) — muloyim to'xtatish, jarayon tozalash qila oladi. SIGKILL (9) — darhol, ushlab bo'lmaydi."],
 ["net", "TCP va UDP?", "TCP — ulanishli, ishonchli, tartibli (HTTP, SSH). UDP — ulanishsiz, tez (DNS, video)."],
 ["net", "Brauzerga URL yozilganda nima bo'ladi?", "DNS resolve → TCP handshake → TLS handshake → HTTP so'rov → server javobi → render."],
 ["net", "Port 22, 80, 443, 5432, 6443?", "SSH, HTTP, HTTPS, PostgreSQL, Kubernetes API server."],
 ["net", "Forward va reverse proxy?", "Forward — mijoz nomidan chiqadi. Reverse — server oldida turadi (Nginx): TLS, load balancing, cache."],
 ["git", "git fetch va git pull?", "fetch — faqat yuklab oladi. pull = fetch + merge (yoki rebase)."],
 ["docker", "Container va VM farqi?", "Container host kernel'ini ulashadi (yengil, tez). VM o'z kernel'iga ega (to'liq izolyatsiya, og'ir)."],
 ["docker", "Docker layer cache qanday ishlaydi?", "Har instruksiya — layer. Bitta layer o'zgarsa, undan keyingilari qayta build bo'ladi."],
 ["docker", "Image hajmini kamaytirish usullari?", "Multi-stage, alpine/distroless base, RUN'larni birlashtirish, .dockerignore, cache tozalash."],
 ["cicd", "CI va CD farqi?", "CI — har commit'da avtomatik build+test. CD — Delivery (deployga tayyor) yoki Deployment (avtomatik prod'ga)."],
 ["cicd", "GitOps nima?", "Git — yagona haqiqat manbai. ArgoCD/Flux cluster holatini repodagi holatga moslab turadi."],
 ["cloud", "IAM Role va User?", "User — doimiy credential'li shaxs. Role — vaqtincha olinadigan huquqlar to'plami (servislar uchun)."],
 ["cloud", "Region va Availability Zone?", "Region — geografik hudud. AZ — region ichidagi alohida data center(lar). HA uchun bir necha AZ."],
 ["cloud", "Vertical va horizontal scaling?", "Vertical — kattaroq server. Horizontal — ko'proq server (ASG, replikalar)."],
 ["iac", "terraform state lock nima uchun?", "Ikki kishi bir vaqtda apply qilib state'ni buzmasligi uchun (DynamoDB, GitLab backend)."],
 ["iac", "Terraform drift nima?", "Kimdir resursni qo'lda o'zgartirgan; real holat koddan farq qiladi. plan buni ko'rsatadi."],
 ["k8s", "Deployment va StatefulSet?", "Deployment — stateless, pod'lar bir xil. StatefulSet — barqaror nom, tartib va har biriga alohida volume (DB)."],
 ["k8s", "DaemonSet qachon?", "Har node'da bitta pod kerak bo'lganda: log agent, node-exporter, CNI."],
 ["k8s", "Service turlari?", "ClusterIP (ichki), NodePort (node porti), LoadBalancer (bulut LB), ExternalName (DNS alias)."],
 ["k8s", "requests va limits?", "requests — scheduler uchun kafolat. limits — yuqori chegara; memory oshsa OOMKilled, CPU throttling."],
 ["k8s", "Pod Pending — sabablari?", "Resurs yetmaydi, taint mos emas, PVC bog'lanmagan, nodeSelector mos node yo'q. describe → Events."],
 ["k8s", "kubeadm upgrade tartibi (CKA)?", "Control plane: kubeadm upgrade apply → kubelet/kubectl. Keyin har worker: drain → upgrade node → kubelet → uncordon."],
 ["obs", "RED va USE metodlari?", "RED (servis): Rate, Errors, Duration. USE (resurs): Utilization, Saturation, Errors."],
 ["obs", "Postmortem qoidasi?", "Blameless: kimni emas, nimani va nega. Timeline, root cause, action items."],
 ["job", "STAR usuli?", "Situation, Task, Action, Result — behavioral savollarga javob tuzilmasi."]
],
interview: [
 ["Linux", "Server sekin ishlayapti. Qanday tekshirasiz?", "uptime/top (CPU, load) → free -h (RAM, swap) → df -h, iostat (disk) → ss, iftop (tarmoq) → journalctl, dmesg (xatolar). Taxmin emas, o'lchovdan boshlayman."],
 ["Linux", "Disk 100% to'lgan, lekin du kam ko'rsatyapti. Sabab?", "O'chirilgan, lekin hali ochiq fayl (masalan log). lsof +L1 yoki lsof | grep deleted; jarayonni restart qilish yoki logrotate'ni to'g'rilash."],
 ["Tarmoq", "Sayt ochilmayapti. Qadamma-qadam diagnostika?", "DNS (dig) → port ochiqmi (nc -zv / curl -v) → firewall/SG → Nginx holati va loglari → upstream app → DB. Har qatlamni pastdan tekshiraman."],
 ["Docker", "Konteyner ishga tushib darhol o'chadi. Nima qilasiz?", "docker ps -a (exit code), docker logs, docker inspect; entrypoint/CMD'ni tekshirish; docker run -it --entrypoint sh bilan ichiga kirish."],
 ["Docker", "Production Dockerfile'da nimalarga e'tibor berasiz?", "Pinned base image, multi-stage, non-root USER, .dockerignore, HEALTHCHECK, sir yo'q, Trivy scan, kichik layer'lar."],
 ["CI/CD", "Ideal pipeline'ni tasvirlab bering.", "Lint → unit test → build image → scan → push (tag = commit SHA) → staging deploy → smoke test → manual/auto prod deploy → monitoring va rollback imkoniyati."],
 ["CI/CD", "Deploy'dan keyin xato chiqdi. Harakatlaringiz?", "Avval rollback (foydalanuvchini qutqarish), keyin loglar/metrikalar orqali sabab, fix, postmortem va pipeline'ga test qo'shish."],
 ["Bulut", "AWS'da yuqori mavjudlikdagi web ilova arxitekturasi?", "VPC, 2+ AZ, public subnet'da ALB, private subnet'da ASG/EKS, RDS Multi-AZ, S3 + CloudFront statik uchun, CloudWatch alarm, Route 53."],
 ["Bulut", "Bulut xarajatini qanday kamaytirasiz?", "Right-sizing, Reserved/Savings Plans, Spot (stateless uchun), ishlatilmagan EBS/IP'larni tozalash, S3 lifecycle, budget alert."],
 ["IaC", "Terraform state'ni jamoada qanday boshqarasiz?", "Remote backend (S3 + DynamoDB lock yoki GitLab), shifrlash, muhit bo'yicha ajratish, faqat CI orqali apply."],
 ["K8s", "Pod CrashLoopBackOff. Qanday hal qilasiz?", "kubectl describe pod (Events), logs --previous, exit code (137 = OOM), probe'lar, ConfigMap/Secret, image tag, resurs limitlari."],
 ["K8s", "Service pod'larga trafik yubormayapti. Sabab?", "Selector label'lari mos emas → kubectl get endpoints bo'sh. Yoki readiness probe o'tmayapti, yoki targetPort noto'g'ri."],
 ["K8s", "Kubernetes'da sirlarni qanday saqlaysiz?", "Secret base64 — shifr emas. etcd encryption at rest, RBAC, External Secrets/Vault yoki Sealed Secrets/SOPS bilan GitOps."],
 ["Monitoring", "Qanday alert'lar sozlaysiz?", "Simptom bo'yicha: xato foizi, latency (p95/p99), saturatsiya, disk to'lishi bashorati, sertifikat muddati. Har alert'da runbook."],
 ["Behavioral", "Eng qiyin hal qilgan muammoingiz?", "STAR: vaziyat, vazifa, aniq harakatlaringiz, o'lchanadigan natija. Real loyihangizdan (portfolio) misol keltiring."],
 ["Behavioral", "Nega DevOps?", "Qisqa va samimiy: avtomatlashtirish va tizimlar ishonchliligi sizni qiziqtiradi; buni ko'rsatadigan loyihangizni ayting."]
],
projects: [
 { id: "p1", t: "Shaxsiy sayt: Nginx + HTTPS", lvl: "Boshlang'ich", stack: "Linux, Nginx, Let's Encrypt, ufw", d: "VPS yoki AWS Free Tier EC2'da statik sayt, domen va bepul TLS sertifikat.", steps: ["EC2/VPS yaratish, SSH key bilan kirish, root login o'chirish", "ufw: faqat 22, 80, 443", "Nginx o'rnatish va server block", "certbot bilan HTTPS, avtomatik yangilanish", "README: arxitektura sxemasi va buyruqlar"] },
 { id: "p2", t: "3 qatlamli ilovani Docker'lash", lvl: "O'rta", stack: "Docker, Compose, PostgreSQL, Nginx", d: "Frontend, API va DB — bitta docker compose up bilan ishga tushadi.", steps: ["Har servis uchun multi-stage Dockerfile", "docker-compose.yml: network, volume, healthcheck", ".env.example va sirlarni repodan chiqarish", "Trivy bilan scan, natijani README'ga", "Image hajmi: oldin/keyin raqamlari"] },
 { id: "p3", t: "To'liq CI/CD pipeline", lvl: "O'rta", stack: "GitLab CI yoki GitHub Actions, Docker registry", d: "Har push'da test, build, scan, registry'ga push va serverga avtomatik deploy.", steps: ["Lint va unit test job'lari", "Image build, tag = commit SHA", "Registry'ga push (GHCR yoki GitLab Registry)", "SSH yoki runner orqali staging'ga deploy", "Prod uchun manual approval + rollback job"] },
 { id: "p4", t: "Terraform bilan AWS infratuzilma", lvl: "O'rta", stack: "Terraform, AWS VPC, EC2, RDS, S3", d: "Bir buyruq bilan VPC, public/private subnet, ALB, EC2 va RDS yaratish.", steps: ["Remote state: S3 + lock", "VPC moduli: 2 AZ, public/private subnet, NAT", "ALB + Auto Scaling Group", "RDS private subnet'da", "terraform destroy — xarajatni nolga tushirish"] },
 { id: "p5", t: "Kubernetes + GitOps", lvl: "Yuqori", stack: "kind/k3s, Helm, Ingress, ArgoCD, HPA", d: "Ilovani Helm chart bilan, ArgoCD orqali Git'dan avtomatik deploy.", steps: ["kind yoki k3s cluster", "Ilova uchun Helm chart: values dev/prod", "Ingress-nginx + TLS", "HPA va resource request/limit", "ArgoCD: Git'dagi o'zgarish → cluster'ga avtomatik"] },
 { id: "p6", t: "Monitoring: alert Telegram'ga", lvl: "Yuqori", stack: "Prometheus, Grafana, Alertmanager, Loki", d: "Server va ilova metrikalari, dashboard va Telegram bot orqali alert.", steps: ["node-exporter va ilova metrikalari", "Grafana dashboard (JSON repoda)", "Alertmanager → Telegram bot", "Loki bilan loglar", "SLO dashboard va runbook"] }
],
resume: [
 "Bir sahifa, PDF, fayl nomi: Ism_Familiya_DevOps.pdf",
 "Yuqorida: lavozim (Junior DevOps Engineer), shahar, Telegram, email, GitHub, LinkedIn",
 "Skills bo'limi guruhlangan: Linux · Containers · CI/CD · Cloud · IaC · Monitoring",
 "Har tajriba/loyiha satri: harakat + vosita + raqamli natija",
 "3–4 ta portfolio loyiha havolasi bilan",
 "Sertifikatlar (AWS CCP/SAA, CKA) yoki 'tayyorlanmoqda — sana'",
 "GitHub: pin qilingan 4–6 repo, har birida README, sxema va 'qanday ishga tushirish'",
 "GitHub profil README: kimligingiz va stack",
 "Repolarda sir (key, parol) yo'qligini tekshirish",
 "LinkedIn: headline, 'Open to work', rezyume bilan bir xil ma'lumot",
 "hh.uz'da rezyume to'ldirilgan va yangilangan",
 "Ingliz tilida ham rezyume versiyasi"
]
};

/* LEVELS */
(function (D) {
  const L = { linux: 'J', net: 'J', git: 'J', docker: 'J', cicd: 'J', cloud: 'M', iac: 'M', k8s: 'M', obs: 'M', job: 'J' };
  D.stages.forEach(function (s) { s.lvl = L[s.id] || 'M'; });
  D.stages.push({
    id: 'uzb', n: '11', lvl: 'M', title: "O'zbekiston bozori: on-prem va bank infratuzilmasi", weeks: 2,
    why: "hh.uz'dagi DevOps e'lonlarining ko'pi banklar, fintex va telekomdan (Ipak Yo'li, Kapitalbank, Paynet, TBC, Octobank, Alif, Unitel, Ucell). Ular ko'pincha o'z serverlarida (on-premise, yopiq kontur) ishlaydi — bu bilimlar xorijiy kurslarda kam beriladi.",
    theory: [
      { h: "On-premise va yopiq kontur", p: "Ko'p bank va davlat tizimlari internetdan ajratilgan tarmoqda ishlaydi. Bunday joyda Docker Hub, PyPI yoki apt omborlariga to'g'ridan-to'g'ri chiqib bo'lmaydi: hamma narsa ichki mirror orqali keladi (Nexus, Harbor, Artifactory, apt-mirror). Shuning uchun image va paketlarni oldindan ichki registry'ga olib kirish, versiyalarni qulflash va offline o'rnatish — kundalik ish." },
      { h: "Virtualizatsiya: VMware va Proxmox", p: "Kubernetes'dan oldin serverlar odatda VMware vSphere yoki Proxmox VE ustida virtual mashina bo'lib turadi. VM yaratish, shablon (template), snapshot, resurs ajratish va storage (LVM, Ceph, SAN) tushunchalarini bilish Middle darajada so'raladi." },
      { h: "Self-hosted vositalar", p: "Bulut xizmatlari o'rniga ko'pincha o'z serverida ko'tarilgan GitLab (CI/CD bilan), Harbor, Vault, Keycloak ishlatiladi. Ularni o'rnatish, yangilash, backup qilish va sertifikatini yangilash DevOps vazifasiga kiradi." },
      { h: "Ma'lumotlar bazasi operatsiyalari", p: "PostgreSQL bu yerda eng keng tarqalgan: replikatsiya (streaming), Patroni bilan avtomatik failover, pgBouncer, pg_dump va WAL arxiv orqali backup va tiklashni sinash. Bank uchun 'backup bor' emas, 'tiklab ko'rilgan backup bor' muhim." },
      { h: "Monitoring: Zabbix + Prometheus/Grafana", p: "Mahalliy kompaniyalarda Zabbix juda keng tarqalgan (serverlar, tarmoq qurilmalari), konteynerlar uchun esa Prometheus va Grafana. Alertlar ko'pincha Telegram botga yuboriladi." },
      { h: "Qonun: shaxsga doir ma'lumotlar", p: "\"Shaxsga doir ma'lumotlar to'g'risida\"gi qonunning 27¹-moddasi 2021-yildan O'zbekiston fuqarolari ma'lumotlarini mamlakat ichidagi serverlarda saqlashni talab qilgan. 2026-yil 27-martdan kuchga kirgan o'zgarishga ko'ra, endi majburiy lokalizatsiya biometrik, genetik ma'lumotlar va telekom operatorlari foydalanuvchilari ma'lumotlariga taalluqli; qolganlarini Vazirlar Mahkamasi belgilagan davlatlarga uzatish mumkin. Arxitektura tanlashda (bulut yoki on-prem) buni bilish kerak." },
      { h: "Til va hujjatlar", p: "E'lonlarning katta qismi rus tilida, hujjatlar ingliz tilida. Texnik atamalarni uch tilda bilish (masalan: zaxira nusxa = резервная копия = backup) suhbatda va ishda vaqtni tejaydi." }
    ],
    topics: ["Yopiq kontur: ichki mirror (Nexus/Harbor), offline o'rnatish", "VMware vSphere / Proxmox VE: VM, template, snapshot", "Self-hosted GitLab va GitLab CI runner", "PostgreSQL: replikatsiya, Patroni, backup va tiklash", "Zabbix + Prometheus/Grafana, Telegram alertlar", "Nginx/HAProxy: load balancing va TLS", "Shaxsga doir ma'lumotlar qonuni (27¹-modda, 2026 tahriri)", "Rus va ingliz tilidagi texnik atamalar"],
    res: [["Shaxsga doir ma'lumotlar to'g'risida qonun — lex.uz", "https://lex.uz/acts/-4396419"], ["Proxmox VE hujjatlari", "https://pve.proxmox.com/pve-docs/"], ["GitLab self-managed o'rnatish", "https://docs.gitlab.com/install/"], ["Patroni (PostgreSQL HA)", "https://patroni.readthedocs.io/"], ["Zabbix qo'llanmasi", "https://www.zabbix.com/documentation/current/en/manual"], ["hh.uz — DevOps vakansiyalari", "https://hh.uz/vacancies/devops"]],
    quiz: [
      { q: "Yopiq konturdagi serverda docker pull ishlamayapti. To'g'ri yechim qaysi?", o: ["Image'larni ichki registry'ga (Harbor/Nexus) oldindan olib kirib, o'shadan pull qilish", "Firewall'ni butunlay o'chirib qo'yish", "Docker'ni qayta o'rnatish", "Root parolini o'zgartirish"], a: 0, e: "Yopiq konturda tashqi internet yo'q — artefaktlar ichki mirror yoki registry orqali beriladi." },
      { q: "Bank uchun backup strategiyasining eng muhim belgisi nima?", o: ["Backup muntazam tiklab sinab ko'riladi", "Backup faqat bitta diskda turadi", "Backup qo'lda olinadi", "Backup hech qachon o'chirilmaydi"], a: 0, e: "Tiklab ko'rilmagan backup — taxmin. RPO/RTO faqat sinov bilan tasdiqlanadi." },
      { q: "Patroni nima uchun ishlatiladi?", o: ["PostgreSQL klasterida avtomatik failover va lider tanlash", "Nginx konfiguratsiyasini tekshirish", "Docker image'ni kichraytirish", "Git tarixini tozalash"], a: 0, e: "Patroni etcd/Consul orqali PostgreSQL replikalari orasida liderni boshqaradi." },
      { q: "2026-yil 27-martdagi o'zgarishdan keyin qaysi ma'lumotlar baribir O'zbekiston hududida saqlanishi shart?", o: ["Biometrik, genetik ma'lumotlar va telekom operatorlari foydalanuvchilari ma'lumotlari", "Barcha log fayllar", "Faqat parollar", "Hech qanday ma'lumot"], a: 0, e: "27¹-moddaning yangi tahririda majburiy lokalizatsiya ro'yxati shu uch turga qisqartirilgan." }
    ]
  });
  D.stages.push({
    id: 'senior', n: '12', lvl: 'S', title: "Senior: arxitektura, ishonchlilik va yetakchilik", weeks: 3,
    why: "Senior'dan buyruq bilish emas, qaror qabul qilish so'raladi: tizimni qanday loyihalash, nosozlikka qanday chidamli qilish, xarajatni qanday kamaytirish va jamoani qanday olib borish.",
    theory: [
      { h: "System design", p: "Talab → yuklama hisobi (RPS, ma'lumot hajmi) → komponentlar (LB, kesh, navbat, DB) → zaif nuqtalar → kengayish. Suhbatda 'URL qisqartiruvchi' yoki 'to'lov tizimi'ni 30–45 daqiqada chizib, har bir tanlovning narxini tushuntirish so'raladi." },
      { h: "HA va DR: RPO/RTO", p: "RPO — qancha ma'lumot yo'qotishga rozimiz, RTO — qancha vaqtda tiklanamiz. Shundan arxitektura kelib chiqadi: bitta DC ichida replikatsiya, ikkinchi DC'ga asinxron nusxa, muntazam DR mashqi. 'Ikki DC bor' bilan 'ikkinchi DC'ga 15 daqiqada o'ta olamiz' — boshqa-boshqa narsa." },
      { h: "SLO asosida ishlash", p: "SLI o'lchanadi, SLO maqsad qilib qo'yiladi, error budget esa reliz tezligini boshqaradi: budjet tugasa — yangi funksiya emas, barqarorlik. Alertlar sababga emas, foydalanuvchi ta'siriga (symptom) qo'yiladi." },
      { h: "Incident boshqaruvi", p: "Incident commander, aloqa kanali, vaqt chizig'i, keyin aybsiz (blameless) postmortem va action item'lar. Senior incidentni o'zi tuzatishdan ko'ra jarayonni boshqaradi." },
      { h: "Xavfsizlik arxitekturasi", p: "Secret'lar Vault yoki KMS'da, eng kam huquq (least privilege), tarmoq segmentatsiyasi, image imzosi va skanerlash, audit log. Banklarda bularning hammasi IB (axborot xavfsizligi) bo'limi bilan kelishiladi." },
      { h: "FinOps va platforma", p: "Resurslarni o'lchab to'g'ri o'lcham tanlash, foydalanilmayotganini o'chirish, xarajatni jamoalarga taqsimlash. Platform engineering — dasturchilarga o'zi deploy qila oladigan ichki platforma (shablonlar, GitOps, self-service) berish." },
      { h: "Yetakchilik", p: "Kod review, mentorlik, texnik qarorlarni yozma asoslash (ADR), boshqa jamoalar bilan kelishish. Senior suhbatida 'qiyin qarorni qanday qabul qilgansiz' degan savol albatta bo'ladi." }
    ],
    topics: ["System design: yuklama hisobi, LB, kesh, navbat, DB", "HA va DR: RPO, RTO, DR mashqi", "SLO, error budget va symptom-based alert", "Incident commander va blameless postmortem", "Xavfsizlik: Vault/KMS, least privilege, segmentatsiya", "FinOps: right-sizing va xarajat taqsimoti", "Platform engineering va GitOps self-service", "Yetakchilik: ADR, mentorlik, kod review"],
    res: [["Google SRE kitobi (bepul)", "https://sre.google/sre-book/table-of-contents/"], ["System Design Primer", "https://github.com/donnemartin/system-design-primer"], ["AWS Well-Architected", "https://aws.amazon.com/architecture/well-architected/"], ["FinOps Framework", "https://www.finops.org/framework/"], ["HashiCorp Vault hujjatlari", "https://developer.hashicorp.com/vault/docs"]],
    quiz: [
      { q: "RPO = 5 daqiqa nimani bildiradi?", o: ["Nosozlikda ko'pi bilan 5 daqiqalik ma'lumot yo'qolishi mumkin", "Tizim 5 daqiqada tiklanadi", "Har 5 daqiqada deploy qilinadi", "Alert 5 daqiqada keladi"], a: 0, e: "RPO — yo'qotilishi mumkin bo'lgan ma'lumot oralig'i; tiklanish vaqti — RTO." },
      { q: "Error budget tugadi. To'g'ri qaror qaysi?", o: ["Yangi funksiyalarni to'xtatib, barqarorlikka ishlash", "SLO'ni pasaytirib qo'yish", "Monitoringni o'chirish", "Ko'proq reliz chiqarish"], a: 0, e: "Error budget reliz tezligi va ishonchlilik orasidagi kelishuv: budjet tugasa, ustuvorlik barqarorlikka o'tadi." },
      { q: "Blameless postmortem'ning maqsadi nima?", o: ["Tizim va jarayondagi sababni topib, takrorlanmasligini ta'minlash", "Aybdorni topib jazolash", "Incidentni yashirish", "Faqat hisobot yozish"], a: 0, e: "Odamni emas, tizimni tuzatish — shunda odamlar muammoni ochiq aytadi." },
      { q: "Alertni qayerga qo'yish yaxshiroq?", o: ["Foydalanuvchiga ta'sir qiladigan belgiga (xato ulushi, kechikish)", "Har bir CPU 70% ga", "Har bir log qatoriga", "Faqat disk hajmiga"], a: 0, e: "Symptom-based alert shovqinni kamaytiradi; sababiy metrikalar dashboard'da qoladi." }
    ]
  });
  D.interview.push(
    ['UZ', "Internetsiz (yopiq kontur) serverga Kubernetes yoki Docker image'larni qanday yetkazasiz?", "Tashqi internet bor joyda image'larni tortib, ichki registry'ga (Harbor/Nexus) push qilaman yoki docker save/load bilan olib kiraman. Paketlar uchun apt/yum mirror. Versiyalarni qulflayman, checksum va imzoni tekshiraman, keyin klaster faqat ichki registry'dan oladi."],
    ['UZ', "PostgreSQL'da master yiqildi. Patroni bo'lsa nima bo'ladi, bo'lmasa nima qilasiz?", "Patroni bo'lsa: etcd orqali lider tanlanadi, eng yangi replika master bo'ladi, ilova HAProxy/pgBouncer orqali yangi masterga ulanadi. Bo'lmasa: replika lag'ini tekshirib, eng yangisini promote qilaman, ilova ulanish manzilini o'zgartiraman, eski masterni replika qilib qaytaraman. Keyin sababini va RPO'ni hisoblayman."],
    ['UZ', "Zabbix va Prometheus farqi nima, qaysi birini qachon tanlaysiz?", "Zabbix — agent va SNMP orqali serverlar va tarmoq qurilmalari uchun qulay, sozlash UI'da. Prometheus — pull modeli, label'li time-series, konteyner va Kubernetes uchun qulay, PromQL bilan. Ko'p joyda ikkalasi birga: infra uchun Zabbix, servislar uchun Prometheus + Grafana."],
    ['UZ', "Shaxsiy ma'lumotlar qonuni arxitektura tanlashga qanday ta'sir qiladi?", "27¹-moddaning 2026-yil tahririga ko'ra biometrik, genetik va telekom foydalanuvchilari ma'lumotlari O'zbekistonda saqlanishi shart. Shunday ma'lumot bo'lsa, ular mahalliy DC yoki mahalliy bulutda turadi, xorijiy bulutdan esa boshqa qismlar uchun foydalanish mumkin. Qaror yurist va IB bilan birga qabul qilinadi."],
    ['Senior', "Ikkinchi data center'ga o'tish (DR) rejasini qanday tuzasiz?", "Avval RPO/RTO'ni biznes bilan kelishaman. Keyin ma'lumot replikatsiyasi (DB, fayllar), konfiguratsiya va image'lar ikkinchi DC'da tayyor turishi, DNS/LB orqali trafikni o'tkazish, qadamma-qadam runbook. Eng muhimi — rejani muntazam mashq qilib, haqiqiy o'tish vaqtini o'lchash."],
    ['Senior', "Jamoa haftasiga 3 marta tunda alertdan uyg'onyapti. Nima qilasiz?", "Alertlarni ko'rib chiqaman: qaysilari haqiqiy foydalanuvchi ta'siri, qaysilari shovqin. Shovqinlarini o'chiraman yoki dashboard'ga o'tkazaman, qolganlariga runbook yozaman. Takrorlanadigan sabablarni avtomatlashtiraman yoki tuzatish uchun vazifa ochaman. SLO kiritib, alertni error budget sarfiga bog'layman."],
    ['Senior', "Bulut xarajati 40% oshdi. Qayerdan boshlaysiz?", "Xarajatni xizmat va jamoa bo'yicha taqsimlab, eng katta o'sishni topaman. Keyin: foydalanilmayotgan resurslar, ortiqcha o'lcham (right-sizing), egress trafik, log va storage saqlash muddati. Reserved/spot imkoniyatlarini ko'raman va jamoalarga byudjet alertlarini qo'yaman."]
  );
  D.cards.push(
    ['uzb', "Yopiq kontur nima?", "Internetdan ajratilgan tarmoq. Paket va image'lar ichki mirror yoki registry orqali beriladi."],
    ['uzb', "Patroni nima qiladi?", "PostgreSQL klasterida lider tanlaydi va avtomatik failover qiladi (etcd/Consul orqali)."],
    ['uzb', "27¹-modda (2026 tahriri) bo'yicha nimalar O'zbekistonda saqlanadi?", "Biometrik, genetik ma'lumotlar va telekom operatorlari foydalanuvchilari ma'lumotlari."],
    ['senior', "RPO va RTO farqi?", "RPO — qancha ma'lumot yo'qotishga rozimiz. RTO — qancha vaqtda tiklanamiz."],
    ['senior', "Error budget nima?", "SLO'dan qolgan ruxsat etilgan nosozlik ulushi. Tugasa — reliz o'rniga barqarorlik."],
    ['senior', "Symptom-based alert nima?", "Sababga emas, foydalanuvchiga ta'sirga (xato ulushi, kechikish) qo'yilgan alert."]
  );
  D.levels = [
    { k: 'J', t: 'Junior', exp: "0–1 yil", d: "Linux'da bemalol ishlaydi, Docker image yig'adi, Git va oddiy CI pipeline yozadi, nima buzilganini log'dan topadi. Mustaqil emas, lekin tez o'rganadi.", must: ["Linux: process, fayl tizimi, huquqlar, systemd, journalctl", "Tarmoq: IP, port, DNS, TCP, curl/ss/dig bilan tekshirish", "Bash skript: o'zgaruvchi, sikl, shart, cron", "Git: branch, merge, rebase, pull request", "Docker: Dockerfile, volume, network, compose", "CI: GitLab CI yoki GitHub Actions'da build/test pipeline", "Nginx: reverse proxy va TLS sertifikat", "Ingliz tilida hujjat o'qiy olish"], uz: "Unitel, Ucell, Fido-Biznes, Octo kabi joylarda 1–3 yillik tajriba bilan e'lonlar bor. Ko'pincha 'tizim administratori + DevOps' aralash lavozim." },
    { k: 'M', t: 'Middle', exp: "1–3 yil", d: "Servisni noldan productiongacha mustaqil olib chiqadi: infratuzilmani kod bilan yozadi, Kubernetes'da ishlatadi, monitoring va alert qo'yadi, incidentni o'zi yopadi.", must: ["Kubernetes: Deployment, Service, Ingress, probe, resource, Helm", "Terraform va Ansible bilan infratuzilma", "Prometheus/Grafana, Zabbix, log yig'ish (Loki/ELK)", "PostgreSQL: replikatsiya, backup va tiklash", "On-prem: VMware/Proxmox, ichki registry, yopiq kontur", "Xavfsizlik: secret boshqaruvi, image skanerlash", "Bulut: AWS yoki Yandex Cloud asoslari", "Incident: troubleshooting va postmortem yozish"], uz: "hh.uz'dagi e'lonlarning asosiy qismi shu daraja (3–6 yil deb yozilgan bo'lsa ham). Banklar on-prem, Kubernetes, GitLab CI va PostgreSQL'ni ko'p so'raydi." },
    { k: 'S', t: 'Senior', exp: "3+ yil", d: "Tizimni loyihalaydi va javobgarlikni oladi: HA/DR, SLO, xavfsizlik arxitekturasi, xarajat, platforma. Jamoani o'rgatadi va texnik qarorlarni asoslaydi.", must: ["System design va yuklama hisobi", "HA/DR: RPO/RTO, ikki DC, DR mashqi", "SLO, error budget, alert strategiyasi", "Incident commander va blameless postmortem", "Vault/KMS, least privilege, segmentatsiya", "Platform engineering, GitOps (Argo CD)", "FinOps: xarajatni o'lchash va kamaytirish", "Mentorlik, ADR, kod review"], uz: "TBC, Octobank, Alif, Group-IB kabi kompaniyalar Senior/Lead izlaydi. Suhbatda system design va real incident tajribasi hal qiluvchi bo'ladi." }
  ];
})(window.DEVOPS_DATA);

/* COMP */
(function (D) {
  const C = {
    linux: { J: ["Fayl tizimi, ls/cd/cp/mv, find, grep", "Huquqlar: chmod, chown, sudo", "Process: ps, top, kill; systemctl start/status", "journalctl va /var/log'dan xato topish", "SSH bilan ulanish, kalit bilan kirish", "Bash: o'zgaruvchi, if, for, cron"], M: ["inode, hard/soft link, df va du farqi", "OOM Killer, swap, load average tahlili", "systemd unit yozish, restart policy, timer", "LVM, fstab, disk kengaytirish", "iptables/nftables, SELinux asoslari", "Python/Bash bilan avtomatlashtirish"], S: ["strace, lsof, file descriptor va ulimit bilan chuqur debug", "Kernel parametrlari (sysctl) va performance tuning", "USE usuli bilan server sekinlashuvini tahlil qilish", "Hardening: CIS benchmark, audit, minimal huquq", "Ko'p serverli muhitni standartlashtirish (golden image)"] },
    net: { J: ["IP, subnet, port, TCP va UDP farqi", "DNS: A, CNAME, MX; dig va nslookup", "curl, ss, ping, traceroute bilan tekshirish", "127.0.0.1 va 0.0.0.0 farqi", "HTTP status kodlar va HTTPS"], M: ["NAT, routing jadvali, default gateway", "TCP handshake, timeout va refused farqi", "Reverse proxy (Nginx), L4 va L7 load balancing", "TLS sertifikat zanjiri va yangilash", "Name → route → port → app tartibida troubleshooting"], S: ["Ko'p zonali tarmoq dizayni, VPC peering, VPN", "Load balancer arxitekturasi va health check strategiyasi", "CDN, anycast, DNS asosida failover", "Tarmoq segmentatsiyasi va zero trust"] },
    git: { J: ["clone, add, commit, push, pull", "branch, merge, conflict hal qilish", "Pull/merge request ochish va review", ".gitignore va commit xabari qoidalari"], M: ["rebase, cherry-pick, revert, reset farqi", "GitFlow va trunk-based tanlash", "Tag va semantik versiyalash", "Secret commit bo'lsa tarixdan tozalash"], S: ["Monorepo va polyrepo strategiyasi", "Branch protection, CODEOWNERS, imzolangan commit", "Reliz jarayonini butun jamoa uchun loyihalash"] },
    docker: { J: ["Image va container farqi, docker run/ps/logs", "Dockerfile: FROM, RUN, COPY, CMD", "Port (-p) va volume (-v)", "docker compose bilan bir nechta servis"], M: ["ENTRYPOINT va CMD, signal va stop/kill", "Docker networking, DNS, bridge", "Resource limit (CPU, memory) va OOM", "Multi-stage build, layer kesh, .dockerignore", "docker exec/inspect bilan debug"], S: ["Xavfsiz va kichik image: distroless, non-root, skanerlash", "Image imzosi va supply chain (SBOM)", "Registry strategiyasi va retention", "containerd/runc darajasidagi tushuncha"] },
    cicd: { J: ["CI va CD farqi, pipeline bosqichlari", "GitLab CI yoki GitHub Actions'da build/test", "Artifact va registry'ga image push", "Monitoring nima uchun kerakligi"], M: [".gitlab-ci.yml: stages, rules, needs, cache", "Runner va executor turlari", "Deployment strategiyalari: rolling, blue-green, canary", "Rollback va GitOps (Argo CD)", "Prometheus/Grafana, alert qoidalari"], S: ["DevSecOps: SAST, DAST, secret va image skanerlash pipeline'da", "Vault bilan secret boshqaruvi", "SLI/SLO/SLA va error budget", "Murakkab pipeline arxitekturasi (monorepo, parent-child)", "Reliz siyosati va change management"] },
    cloud: { J: ["Region, AZ, VPC, subnet tushunchasi", "EC2/VM yaratish va SSH bilan kirish", "S3/Object storage va IAM foydalanuvchi"], M: ["IAM role va policy, least privilege", "Auto Scaling, Load Balancer, RDS", "Xarajatni kuzatish va budjet alertlari", "Yandex Cloud/AWS farqi va umumiy prinsiplar"], S: ["Well-Architected: ishonchlilik, xavfsizlik, xarajat", "Multi-account va landing zone", "Ko'p regionli DR va FinOps"] },
    iac: { J: ["IaC nima va nima uchun kerak", "Terraform: init, plan, apply, destroy", "Ansible: inventory va oddiy playbook"], M: ["Terraform state, remote backend, lock", "Modul yozish, o'zgaruvchi va output", "Ansible role, template, idempotentlik", "terraform import va drift"], S: ["Katta tashkilot uchun modul va state tuzilmasi", "Policy as code (OPA/Sentinel)", "IaC uchun CI/CD va review jarayoni"] },
    k8s: { J: ["Pod, Deployment, Service nima", "kubectl get/describe/logs/apply", "Namespace, label, selector", "ConfigMap va Secret"], M: ["Probe, resource request/limit, QoS", "Ingress, Kubernetes DNS, NetworkPolicy asoslari", "CrashLoopBackOff, Pending, ImagePull troubleshooting", "Helm/Kustomize, PV/PVC", "StatefulSet, DaemonSet, Job/CronJob tanlash"], S: ["HA control plane va etcd quorum, etcd backup", "Klasterni yangilash, drain va PDB", "RBAC, ServiceAccount, admission va security", "Operator/controller tushunchasi va platforma"] },
    obs: { J: ["Metrika, log va trace farqi", "Grafana'da dashboard ko'rish", "Log'dan xatoni topish"], M: ["Prometheus, PromQL va alert qoidalari", "Loki/ELK bilan log yig'ish", "Zabbix bilan infra monitoring", "Alert'ni Telegram'ga yuborish"], S: ["SLO asosida alert strategiyasi", "OpenTelemetry bilan distributed tracing", "Observability xarajati va saqlash siyosati"] },
    job: { J: ["Rezyume va GitHub portfolio", "Junior suhbat savollariga javob tayyorlash", "Asosiy xavfsizlik: parol, kalit, yangilash"], M: ["Real loyiha tajribasini STAR usulida aytish", "Incident va troubleshooting misollari", "Maosh va shartlar bo'yicha muzokara"], S: ["Arxitektura qarorlarini asoslab berish", "Jamoani boshqarish va mentorlik misollari", "System design suhbatiga tayyorgarlik"] },
    uzb: { J: ["hh.uz e'lonlarini o'qish: talablarni ajratish", "Rus tilidagi texnik atamalar"], M: ["Yopiq kontur, ichki registry va mirror", "VMware/Proxmox, self-hosted GitLab", "PostgreSQL replikatsiya, Patroni, backup", "Zabbix va Telegram alertlar"], S: ["Shaxsga doir ma'lumotlar qonuniga mos arxitektura", "Bank IB talablari bilan ishlash", "Ikki DC va DR rejasi"] },
    senior: { J: ["SLI, SLO, SLA nima"], M: ["Postmortem yozish", "RPO va RTO hisoblash"], S: ["System design suhbati", "Incident commander roli", "FinOps va platform engineering", "Mentorlik va ADR"] }
  };
  D.stages.forEach(function (s) { if (C[s.id]) s.comp = C[s.id]; });
})(window.DEVOPS_DATA);

/* MIDDLE+ */
(function (D) {
  const NEW = [
  { id: 'arch', lvl: 'M', title: "Arxitektura: tizim qanday quriladi", weeks: 2,
    why: "Middle suhbatida 'buyruqni bilasizmi' emas, 'nega shunday qurdingiz' deb so'rashadi. Tipik veb-tizimning qismlari, ular orasidagi kelishuvlar va zaif nuqtalarni tushuntira olish — Middle'ning asosiy belgisi.",
    theory: [
      { h: "Tipik veb-tizim qatlamlari", p: "Foydalanuvchi → DNS → CDN (statik fayllar) → Load Balancer → bir nechta ilova serveri (stateless) → kesh (Redis) → ma'lumotlar bazasi (PostgreSQL, primary + replika) → navbat (Kafka/RabbitMQ) → fon ishchilari (worker). Har bir qatlam alohida kengaytiriladi va alohida yiqilishi mumkin — dizaynning mohiyati shu chegaralarni bilish." },
      { h: "Stateless va stateful", p: "Ilova serveri holatni (sessiya, fayl) o'zida saqlamasa, uni istalgancha ko'paytirish va o'chirish mumkin — Kubernetes Deployment shuning uchun qulay. Holat esa DB, kesh yoki object storage'ga chiqariladi. Stateful qismlar (DB, Kafka) eng qiyin: ularni replikatsiya, backup va failover bilan alohida o'ylash kerak." },
      { h: "Gorizontal va vertikal kengayish", p: "Vertikal — serverga ko'proq CPU/RAM berish: oddiy, lekin chegarasi bor va bitta nuqtada yiqiladi. Gorizontal — serverlar sonini oshirish: LB, stateless ilova va bo'linadigan ma'lumot talab qiladi. DB uchun avval o'qishni replikalarga chiqarish, keyin kesh, oxirida sharding." },
      { h: "Kesh: qayerda va qachon", p: "Kesh o'qishni tezlashtiradi, lekin eskirgan ma'lumot xavfini olib keladi. Cache-aside: ilova avval Redis'dan so'raydi, yo'q bo'lsa DB'dan olib Redis'ga yozadi (TTL bilan). Qiyin savol — invalidatsiya: ma'lumot o'zgarganda keshni o'chirish. Cache stampede'ga qarshi: TTL'ga tasodifiy qo'shimcha yoki bitta so'rovchi qulfi." },
      { h: "Sinxron va asinxron aloqa", p: "HTTP/gRPC chaqiruv — javob shu zahoti kerak bo'lganda. Navbat (Kafka, RabbitMQ) — ish keyinroq bajarilsa bo'lganda: email, hisobot, to'lov holatini yangilash. Navbat yuklamani tekislaydi va servislarni bir-biridan ajratadi, lekin 'kamida bir marta' yetkazish tufayli takroriy xabarni to'g'ri qayta ishlash (idempotentlik) kerak bo'ladi." },
      { h: "Ishonchlilik naqshlari", p: "Timeout (har bir tashqi chaqiruvda), retry (eksponensial kutish bilan, faqat idempotent amallar uchun), circuit breaker (buzilgan servisga so'rov yubormaslik), bulkhead (resurslarni ajratish), graceful degradation (kesh yiqilsa ham asosiy funksiya ishlaydi). Health check: liveness — tirikmi, readiness — so'rov qabul qila oladimi." },
      { h: "Diagramma chizish va asoslash", p: "Suhbatda: 1) talablarni aniqlang (foydalanuvchi soni, RPS, ma'lumot hajmi, mavjudlik maqsadi); 2) oddiy variantni chizing; 3) zaif nuqtani toping (bitta DB, bitta LB); 4) uni qanday kuchaytirishni va narxini ayting. Har bir tanlovning kamchiligini o'zingiz aytsangiz — bu Middle'dan yuqori daraja belgisi." }
    ],
    topics: ["Qatlamlar: DNS, CDN, LB, ilova, kesh, DB, navbat", "Stateless va stateful komponentlar", "Gorizontal va vertikal kengayish, read replica", "Kesh naqshlari va invalidatsiya", "Sinxron va asinxron aloqa, idempotentlik", "Timeout, retry, circuit breaker, health check", "Arxitektura diagrammasini chizish va asoslash"],
    res: [["System Design Primer", "https://github.com/donnemartin/system-design-primer"], ["ByteByteGo — bepul maqolalar", "https://blog.bytebytego.com/"], ["Martin Fowler — arxitektura maqolalari", "https://martinfowler.com/architecture/"], ["AWS Well-Architected", "https://aws.amazon.com/architecture/well-architected/"]],
    comp: { J: ["Klient → LB → server → DB yo'lini tushuntirish", "Stateless nimaligini bilish"], M: ["Tipik veb-tizimni diagrammada chizish va asoslash", "Kesh, navbat va read replica qachon kerakligini aytish", "Timeout, retry va circuit breaker farqi", "Bitta nosozlik nuqtasini (SPOF) topish"], S: ["Yuklama hisobi bilan to'liq system design", "Ko'p regionli arxitektura va ma'lumot izchilligi", "Har bir tanlovning narxi va xavfini asoslash"] },
    quiz: [
      { q: "Ilova serverini Kubernetes'da istalgancha ko'paytirish uchun eng muhim shart nima?", o: ["Ilova stateless bo'lishi — holat DB/kesh/storage'da", "Har bir pod'ga alohida DB", "Pod'larni bitta node'da ushlash", "Liveness probe'ni o'chirish"], a: 0, e: "Holat ilova ichida bo'lsa, replikalar bir-biridan farq qiladi va o'chirilganda ma'lumot yo'qoladi." },
      { q: "Retry qaysi holatda xavfli?", o: ["Idempotent bo'lmagan amal (masalan, pul yechish) timeout bilan qayta yuborilsa", "GET so'rovda", "Health check'da", "Statik faylni olishda"], a: 0, e: "Birinchi so'rov aslida bajarilgan bo'lishi mumkin — takror yuborish ikki marta yechishga olib keladi. Idempotency key kerak." },
      { q: "Navbat (Kafka/RabbitMQ) qo'shishning asosiy foydasi nima?", o: ["Servislarni ajratadi va yuklama cho'qqisini tekislaydi", "DB'ni almashtiradi", "Kechikishni nolga tushiradi", "TLS'ni almashtiradi"], a: 0, e: "Ishlab chiqaruvchi va iste'molchi turli tezlikda ishlay oladi; biri yiqilsa, xabarlar navbatda kutadi." },
      { q: "DB o'qish yuklamasi oshdi. Odatda birinchi qaysi qadam qilinadi?", o: ["Read replica va kesh qo'shish", "Darhol sharding", "DB'ni o'chirish", "Har bir so'rovni navbatga yuborish"], a: 0, e: "Sharding murakkab va qimmat; avval o'qishni replikalarga va keshga chiqarish odatda yetadi." },
      { q: "Readiness probe nima uchun kerak?", o: ["Pod hali so'rov qabul qilishga tayyor bo'lmasa, uni Service'dan chiqarib turish", "Pod'ni har daqiqada qayta ishga tushirish", "Image'ni yangilash", "Log'larni yig'ish"], a: 0, e: "Liveness tirikligini, readiness tayyorligini tekshiradi; readiness muvaffaqiyatsiz bo'lsa, pod o'ldirilmaydi, faqat trafik berilmaydi." }
    ] },
  { id: 'pg', lvl: 'M', title: "PostgreSQL: DevOps uchun", weeks: 2,
    why: "O'zbekistondagi bank, fintex va davlat tizimlarida eng ko'p ishlatiladigan DB. Middle DevOps'dan replikatsiya, backup/tiklash, ulanishlar va sekin so'rovlarni topish kutiladi.",
    theory: [
      { h: "Arxitektura qisqacha", p: "Har bir ulanish — alohida process (postmaster fork qiladi). Shuning uchun ulanishlar soni qimmat: max_connections oshirish o'rniga pgBouncer (connection pooler) qo'yiladi. Ma'lumot sahifalari shared_buffers'da keshlanadi; har bir o'zgarish avval WAL (write-ahead log)'ga yoziladi — tiklash va replikatsiya WAL asosida ishlaydi." },
      { h: "MVCC, VACUUM va bloat", p: "UPDATE eski qatorni o'chirmaydi, yangi versiya yozadi (MVCC). Eski versiyalarni VACUUM tozalaydi; autovacuum ishlamasa jadval shishadi (bloat) va so'rovlar sekinlashadi. Uzoq ochiq tranzaksiya VACUUM'ni to'sadi — 'idle in transaction' ulanishlarni kuzatish kerak." },
      { h: "Replikatsiya", p: "Streaming replication: replika primary'dan WAL oqimini olib, o'zida qo'llaydi. Asinxron — tez, lekin primary yiqilsa oxirgi tranzaksiyalar yo'qolishi mumkin (RPO > 0). Sinxron — yo'qotish yo'q, lekin yozish sekinroq. Replika lag'i pg_stat_replication orqali kuzatiladi." },
      { h: "Failover: Patroni", p: "Patroni har bir node'da agent sifatida ishlaydi va etcd/Consul orqali kim lider ekanini kelishadi. Primary yiqilsa, eng yangi replika avtomatik primary bo'ladi. Ilova esa HAProxy yoki DNS/VIP orqali har doim joriy primary'ga ulanadi. Split-brain'ning oldini olish uchun quorum kerak — shuning uchun etcd 3 node." },
      { h: "Backup va PITR", p: "pg_dump — mantiqiy nusxa, kichik bazalar va migratsiya uchun. Katta bazalar uchun fizik backup (pg_basebackup, pgBackRest, WAL-G) + WAL arxivi: bu istalgan vaqt nuqtasiga tiklash (PITR) imkonini beradi. Backup faqat muntazam tiklab sinalgandagina hisobga olinadi." },
      { h: "Sekin so'rovni topish", p: "pg_stat_statements — eng ko'p vaqt olgan so'rovlar ro'yxati. EXPLAIN ANALYZE — so'rov rejasini ko'rsatadi: Seq Scan katta jadvalda bo'lsa, odatda indeks yetishmaydi. log_min_duration_statement bilan sekin so'rovlar logga yoziladi. Qulflar pg_locks va pg_stat_activity'da ko'rinadi." },
      { h: "Kubernetes'da PostgreSQL", p: "Production DB'ni Kubernetes'da ushlash mumkin, lekin operator bilan (CloudNativePG, Zalando operator): u replikatsiya, failover, backup'ni boshqaradi. Oddiy StatefulSet + PVC bilan qo'lda qilish — xavfli. Ko'p banklar DB'ni hali ham alohida VM'larda ushlaydi." }
    ],
    topics: ["Process-per-connection va pgBouncer", "WAL, shared_buffers, checkpoint", "MVCC, VACUUM, bloat", "Streaming replication: sinxron va asinxron", "Patroni + etcd bilan failover", "pg_dump, pgBackRest, PITR", "pg_stat_statements va EXPLAIN ANALYZE", "Kubernetes'da operator bilan PostgreSQL"],
    res: [["PostgreSQL rasmiy hujjatlari", "https://www.postgresql.org/docs/current/"], ["Patroni", "https://patroni.readthedocs.io/"], ["pgBackRest", "https://pgbackrest.org/user-guide.html"], ["CloudNativePG", "https://cloudnative-pg.io/documentation/current/"], ["Use The Index, Luke — indekslar", "https://use-the-index-luke.com/"]],
    comp: { J: ["psql bilan ulanish, baza va foydalanuvchi yaratish", "pg_dump bilan backup va pg_restore", "pg_hba.conf va ulanish huquqlari"], M: ["Streaming replication sozlash va lag'ni kuzatish", "Patroni bilan failover tushunchasi", "pgBouncer va max_connections", "pg_stat_statements va EXPLAIN bilan sekin so'rov", "PITR bilan tiklash"], S: ["HA arxitekturasi: sinxron replika, quorum, ikki DC", "Katta bazada migratsiya va versiya yangilash", "Partitioning va sharding strategiyasi"] },
    quiz: [
      { q: "Ilova 'too many connections' xatosini beryapti. Eng to'g'ri uzoq muddatli yechim?", o: ["pgBouncer kabi connection pooler qo'yish", "max_connections'ni 10000 qilish", "DB'ni qayta ishga tushirish", "Indeks qo'shish"], a: 0, e: "Har bir ulanish alohida process — ularni ko'paytirish xotirani yeydi. Pooler kam sonli ulanishni ko'p klientga bo'lib beradi." },
      { q: "Asinxron replikatsiyada primary to'satdan yiqilsa nima bo'lishi mumkin?", o: ["Oxirgi bir necha tranzaksiya replikaga yetib bormagan bo'lishi mumkin", "Hech narsa yo'qolmaydi", "Replika ham yiqiladi", "Barcha ma'lumot o'chadi"], a: 0, e: "Asinxron rejimda primary replikani kutmaydi — RPO noldan katta." },
      { q: "PITR uchun nima kerak?", o: ["Fizik base backup + uzluksiz WAL arxivi", "Faqat pg_dump", "Faqat replika", "Faqat snapshot"], a: 0, e: "Base backup ustiga WAL'ni kerakli vaqtgacha qo'llab, istalgan nuqtaga tiklanadi." },
      { q: "Jadval kattalashib, so'rovlar sekinlashdi, lekin qatorlar soni o'zgarmagan. Ehtimoliy sabab?", o: ["Bloat — VACUUM eski versiyalarni tozalamayapti", "Indeks juda ko'p", "WAL o'chirilgan", "Replika yo'q"], a: 0, e: "MVCC eski qator versiyalarini qoldiradi; uzoq tranzaksiya yoki autovacuum muammosi bloat'ga olib keladi." },
      { q: "Patroni klasterida etcd nega 3 node?", o: ["Quorum uchun: bitta node yiqilsa ham ko'pchilik qaror qabul qila oladi", "Tezlik uchun", "Backup uchun", "Litsenziya talabi"], a: 0, e: "3 dan 2 tasi kelishsa lider tanlanadi; 2 node'da bittasi yiqilsa ko'pchilik bo'lmaydi va split-brain xavfi bor." }
    ] },
  { id: 'mq', lvl: 'M', title: "Kafka, RabbitMQ va Redis", weeks: 1,
    why: "Fintex va telekomda (Uzum, Paynet, Unitel, Alif) xabar navbati va kesh — har bir tizimning qismi. hh.uz e'lonlarida Kafka va Redis tez-tez talab qilinadi.",
    theory: [
      { h: "Kafka tushunchalari", p: "Topic — xabarlar oqimi; u partition'larga bo'linadi va har bir partition — tartibli, faqat oxiriga yoziladigan log. Producer yozadi, consumer group o'qiydi: bitta partition'ni guruh ichida faqat bitta consumer o'qiydi, shuning uchun parallellik partition soni bilan cheklanadi. Xabarlar o'qilgandan keyin ham retention muddatigacha saqlanadi." },
      { h: "Kafka ishonchliligi", p: "replication.factor=3 — har bir partition 3 broker'da. acks=all va min.insync.replicas=2 — yozish kamida 2 nusxaga tushmaguncha tasdiqlanmaydi. Consumer offset'ni ishni bajargandan keyin commit qilsa, xabar yo'qolmaydi, lekin takrorlanishi mumkin — shuning uchun qayta ishlash idempotent bo'lishi kerak." },
      { h: "Consumer lag", p: "Lag — topic'dagi oxirgi offset bilan guruh o'qigan offset farqi. Lag o'sib borsa, iste'molchilar ulgurmayapti: consumer sonini oshirish (partition sonigacha), ishlov berishni tezlashtirish yoki partition qo'shish kerak. Lag — Kafka monitoringidagi eng muhim metrika." },
      { h: "RabbitMQ qachon", p: "RabbitMQ — klassik navbat: xabar o'qilib tasdiqlangach o'chadi, murakkab marshrutlash (exchange: direct, topic, fanout) qulay. Kafka — katta oqim, qayta o'qish va event log uchun. Vazifa navbati (email, PDF yaratish) uchun RabbitMQ ko'pincha oddiyroq." },
      { h: "Redis", p: "Xotiradagi key-value ombor: kesh, sessiya, rate limit, qulf, oddiy navbat. maxmemory va eviction policy (masalan allkeys-lru) belgilanmasa, xotira to'lib OOM bo'ladi. Saqlash: RDB (davriy snapshot) va AOF (har bir yozuv logi). HA: Sentinel (avtomatik failover) yoki Redis Cluster (ma'lumotni bo'lish)." },
      { h: "Monitoring va tez-tez uchraydigan muammolar", p: "Kafka: consumer lag, under-replicated partitions, disk to'lishi. RabbitMQ: navbat uzunligi, unacked xabarlar. Redis: used_memory, evicted_keys, sekin buyruqlar (KEYS * production'da ishlatilmaydi — SCAN ishlatiladi)." }
    ],
    topics: ["Kafka: topic, partition, offset, consumer group", "replication.factor, acks=all, min.insync.replicas", "Consumer lag va uni kamaytirish", "RabbitMQ: exchange, queue, ack", "Redis: kesh, eviction, RDB/AOF", "Redis Sentinel va Cluster", "Navbat va kesh monitoringi"],
    res: [["Apache Kafka hujjatlari", "https://kafka.apache.org/documentation/"], ["RabbitMQ tutorials", "https://www.rabbitmq.com/tutorials"], ["Redis hujjatlari", "https://redis.io/docs/latest/"], ["Strimzi — Kafka on Kubernetes", "https://strimzi.io/documentation/"]],
    comp: { J: ["Navbat nima uchun kerakligini tushuntirish", "Redis'ga kalit yozish va o'qish, TTL"], M: ["Kafka partition va consumer group munosabati", "Consumer lag'ni topish va kamaytirish", "acks va replication bilan xabar yo'qotmaslik", "Redis maxmemory, eviction va persistence", "Kafka va RabbitMQ'ni vazifaga qarab tanlash"], S: ["Exactly-once va idempotent ishlov berish dizayni", "Kafka klasterini kengaytirish va rebalancing", "Ko'p DC'li xabar replikatsiyasi"] },
    quiz: [
      { q: "Topic'da 6 partition bor. Bitta consumer group'da 10 ta consumer ishga tushirsangiz nima bo'ladi?", o: ["Faqat 6 tasi ishlaydi, 4 tasi bo'sh turadi", "10 tasi ham parallel o'qiydi", "Xabarlar 10 marta o'qiladi", "Kafka xato beradi"], a: 0, e: "Guruh ichida bitta partition'ni faqat bitta consumer o'qiydi." },
      { q: "Xabar yo'qolmasligi uchun producer'da qaysi sozlama muhim?", o: ["acks=all (min.insync.replicas bilan)", "acks=0", "linger.ms=0", "compression=none"], a: 0, e: "acks=all — yozish sinxron replikalarga tushgachgina tasdiqlanadi." },
      { q: "Redis xotirasi to'lib, ilova xato bera boshladi. Kesh uchun to'g'ri sozlama?", o: ["maxmemory + allkeys-lru eviction", "AOF'ni o'chirish", "KEYS * bilan tozalash", "Redis'ni restart qilish"], a: 0, e: "Kesh uchun eski kalitlarni avtomatik chiqarish kerak; maxmemory bo'lmasa server OOM bo'ladi." },
      { q: "Consumer lag doimiy o'syapti. Birinchi nimani tekshirasiz?", o: ["Consumer'lar soni, ishlov berish tezligi va xatolar", "Producer'ni o'chirish", "Topic'ni o'chirish", "Retention'ni 0 qilish"], a: 0, e: "Lag iste'molchilar ulgurmayotganini bildiradi — ular sekinmi, yiqilganmi yoki kammi, shuni aniqlash kerak." }
    ] },
  { id: 'onprem', lvl: 'M', title: "On-prem va uy laboratoriyasi (Proxmox)", weeks: 2,
    why: "Banklar va telekom o'z serverlarida ishlaydi. O'zingizning Proxmox laboratoriyangizda Kubernetes, PostgreSQL HA va monitoringni noldan ko'tarish — suhbatda eng kuchli dalil.",
    theory: [
      { h: "Virtualizatsiya asoslari", p: "Hypervisor (Proxmox VE — KVM asosida, VMware ESXi) bitta jismoniy serverda bir nechta VM ishlatadi. VM'ga vCPU, RAM va disk ajratiladi; overcommit (jismoniydan ko'p ajratish) CPU uchun odatiy, RAM uchun xavfli. Template'dan VM klonlash va cloud-init bilan avtomatik sozlash — vaqtni tejaydi." },
      { h: "Storage", p: "Lokal disk (LVM-thin, ZFS) — tez va oddiy, lekin VM boshqa node'ga ko'chmaydi. Umumiy storage (Ceph, NFS, iSCSI SAN) — VM'ni live migration qilish va HA uchun kerak. Ceph kamida 3 node va tez tarmoq talab qiladi." },
      { h: "Tarmoq", p: "Linux bridge (vmbr0) VM'larni jismoniy tarmoqqa ulaydi. VLAN bilan muhitlarni ajratish: boshqaruv, ilova, DB, storage tarmoqlari alohida. Bank muhitida bu segmentatsiya IB talabi." },
      { h: "Yopiq konturga tayyorlanish", p: "Internetsiz muhitni mashq qilish uchun laboratoriyada: Harbor yoki Nexus ko'taring, image va paketlarni u orqali tarqating, Kubernetes'ni ichki registry bilan o'rnating. Bu bank suhbatlarida 'tajribangiz bormi' savoliga aniq javob beradi." },
      { h: "Laboratoriya rejasi", p: "Minimal: 32 GB RAM'li kompyuter. VM'lar: 3 ta K8s (1 control plane + 2 worker yoki 3 ta k3s), 3 ta PostgreSQL (Patroni + etcd), 1 ta monitoring (Prometheus, Grafana, Zabbix), 1 ta GitLab + runner. Hammasini Terraform (Proxmox provider) va Ansible bilan kod orqali ko'taring." },
      { h: "Backup va DR", p: "Proxmox Backup Server yoki vzdump bilan VM backup, snapshot faqat qisqa muddatli o'zgarishdan oldin. DR mashqi: bitta VM'ni o'chirib, backupdan boshqa node'da tiklab ko'ring va vaqtini o'lchang." }
    ],
    topics: ["Hypervisor: Proxmox VE va VMware ESXi", "VM template, klon, cloud-init", "Storage: LVM-thin, ZFS, Ceph, NFS", "Linux bridge va VLAN segmentatsiya", "Ichki registry va yopiq kontur mashqi", "Terraform Proxmox provider + Ansible", "VM backup, snapshot va DR mashqi"],
    res: [["Proxmox VE hujjatlari", "https://pve.proxmox.com/pve-docs/"], ["Terraform Proxmox provider (bpg)", "https://registry.terraform.io/providers/bpg/proxmox/latest/docs"], ["k3s", "https://docs.k3s.io/"], ["Harbor", "https://goharbor.io/docs/"], ["Proxmox Backup Server", "https://pbs.proxmox.com/docs/"]],
    comp: { J: ["VM yaratish, disk va tarmoq ulash", "SSH kalit bilan VM'ga kirish"], M: ["Template va cloud-init bilan VM avtomatlashtirish", "VLAN bilan tarmoqni ajratish", "Terraform + Ansible bilan laboratoriyani kod orqali ko'tarish", "Ichki registry orqali K8s o'rnatish", "VM backup va tiklash"], S: ["Ceph bilan HA klaster va live migration", "Ikki saytli DR dizayni", "On-prem va bulut gibrid arxitekturasi"] },
    quiz: [
      { q: "VM'ni bir node'dan boshqasiga to'xtatmasdan ko'chirish (live migration) uchun odatda nima kerak?", o: ["Umumiy storage (Ceph/NFS/SAN) yoki storage replikatsiyasi", "Ko'proq RAM", "Yangi IP", "Docker"], a: 0, e: "Disk ikkala node'ga ham ko'rinishi kerak — aks holda butun diskni ko'chirish kerak bo'ladi." },
      { q: "cloud-init nima qiladi?", o: ["VM birinchi ishga tushganda hostname, foydalanuvchi, SSH kalit va paketlarni sozlaydi", "VM'ni zaxiralaydi", "Kubernetes'ni o'rnatadi", "Storage yaratadi"], a: 0, e: "Template'dan klonlangan VM'ni avtomatik individual qilish uchun ishlatiladi." },
      { q: "Snapshot nega backup o'rnini bosmaydi?", o: ["U o'sha storage'da turadi — disk yoki storage yiqilsa snapshot ham yo'qoladi", "Snapshot juda sekin", "Snapshot faqat Windows uchun", "Snapshot shifrlanmaydi"], a: 0, e: "Backup alohida joyda (boshqa server yoki storage) saqlanishi kerak." },
      { q: "Bank muhitida VLAN nima uchun ishlatiladi?", o: ["Boshqaruv, ilova, DB va storage tarmoqlarini bir-biridan ajratish uchun", "Internet tezligini oshirish uchun", "IP manzillarni tejash uchun", "DNS uchun"], a: 0, e: "Segmentatsiya buzg'unchi bir tarmoqqa kirsa ham boshqasiga o'tishini qiyinlashtiradi." }
    ] },
  { id: 'helm', lvl: 'M', title: "Helm va Kubernetes'ga paketlash", weeks: 1,
    why: "Real loyihalarda YAML'lar qo'lda emas, Helm chart yoki Kustomize bilan boshqariladi. Middle'dan chart yozish, qiymatlarni muhitlarga ajratish va reliz/rollback'ni bilish kutiladi.",
    theory: [
      { h: "Helm nima", p: "Helm — Kubernetes uchun paket menejeri. Chart — templatelar (templates/), standart qiymatlar (values.yaml) va metadata (Chart.yaml). helm install/upgrade templatelarni qiymatlar bilan to'ldirib klasterga qo'llaydi va har bir urinishni revision sifatida saqlaydi — helm rollback shu revisionga qaytaradi." },
      { h: "Qiymatlar va muhitlar", p: "Umumiy values.yaml + values-dev.yaml, values-prod.yaml. --set faqat CI'da tez o'zgaruvchilar (image.tag) uchun. Secret'larni values'ga ochiq yozmang: sops, helm-secrets yoki External Secrets ishlating." },
      { h: "Template yozish", p: "Go template: {{ .Values.image.repository }}, {{ include \"app.fullname\" . }}, if/range. _helpers.tpl'da umumiy label'lar. helm template va helm lint bilan klasterga qo'ymasdan tekshirish; --dry-run bilan serverga solishtirish." },
      { h: "Kustomize bilan farqi", p: "Kustomize templatesiz: asosiy YAML (base) ustiga overlay'lar bilan o'zgarish. Oddiy va kubectl ichida bor. Helm — qayta ishlatiladigan paket, versiyalash va bog'liqliklar uchun qulay. Ko'p jamoalar ichki ilovalar uchun Kustomize, tashqi vositalar (ingress-nginx, Prometheus) uchun Helm ishlatadi." },
      { h: "GitOps bilan", p: "Argo CD yoki Flux Helm chart'ni Git'dagi qiymatlar bilan o'zi qo'llaydi. CI faqat image yig'adi va values'dagi tegni yangilaydi; klasterga qo'llash Argo CD vazifasi. Rollback — Git'da commit'ni qaytarish." }
    ],
    topics: ["Chart tuzilmasi: Chart.yaml, values.yaml, templates", "install, upgrade, rollback, history", "Muhitlar uchun values fayllar", "helm template, lint, --dry-run", "_helpers.tpl va umumiy label'lar", "Kustomize: base va overlay", "Helm + Argo CD"],
    res: [["Helm hujjatlari", "https://helm.sh/docs/"], ["Helm chart best practices", "https://helm.sh/docs/chart_best_practices/"], ["Kustomize", "https://kubectl.docs.kubernetes.io/references/kustomize/"], ["Artifact Hub", "https://artifacthub.io/"]],
    comp: { J: ["Tayyor chart'ni o'rnatish va values bilan sozlash", "helm list, status, uninstall"], M: ["O'z ilovasi uchun chart yozish", "Muhitlar uchun values ajratish", "upgrade, rollback, history bilan reliz boshqaruvi", "helm template/lint bilan tekshirish", "Kustomize overlay'lari"], S: ["Ichki chart kutubxonasi va standartlar", "Chart versiyalash va bog'liqliklar siyosati", "GitOps bilan ko'p klasterli reliz"] },
    quiz: [
      { q: "helm upgrade'dan keyin ilova buzildi. Eng tez qaytarish?", o: ["helm rollback <release> <oldingi revision>", "Namespace'ni o'chirish", "kubectl delete pod --all", "Chart'ni qayta yozish"], a: 0, e: "Helm har bir reliz revision'ini saqlaydi; rollback oldingi holatni qayta qo'llaydi." },
      { q: "Chart'ni klasterga qo'ymasdan, hosil bo'ladigan YAML'ni ko'rish uchun?", o: ["helm template", "helm install", "helm uninstall", "helm repo add"], a: 0, e: "helm template templatelarni lokal render qiladi." },
      { q: "Prod parolini qayerda saqlash to'g'ri?", o: ["Shifrlangan holda (sops/helm-secrets) yoki External Secrets orqali Vault'da", "values.yaml'da ochiq", "Chart.yaml'da", "README'da"], a: 0, e: "Git'ga ochiq secret tushsa, tarixdan ham o'chirish qiyin." },
      { q: "Kustomize'ning Helm'dan asosiy farqi?", o: ["Template tilisiz, base YAML ustiga overlay bilan o'zgartiradi", "Faqat Docker uchun", "Klasterda alohida server kerak", "Rollback qila oladi, Helm qila olmaydi"], a: 0, e: "Kustomize patch asosida ishlaydi; versiyalash va paket tushunchasi Helm'da kuchliroq." }
    ] },
  { id: 'logs', lvl: 'M', title: "Loglar: ELK va Loki", weeks: 1,
    why: "Incident'da birinchi qaraladigan joy — log. Middle'dan markazlashgan log tizimini ko'tarish, to'g'ri formatlash va saqlash muddatini boshqarish kutiladi.",
    theory: [
      { h: "Nega markazlashgan log", p: "Pod'lar o'ladi va yangilari boshqa node'da ochiladi — kubectl logs eski log'ni ko'rsatmaydi. Har bir node'da agent (Fluent Bit, Promtail/Alloy, Filebeat) log'larni yig'ib markaziy omborga yuboradi." },
      { h: "ELK / OpenSearch", p: "Elasticsearch (yoki OpenSearch) log matnini to'liq indekslaydi — erkin matnli qidiruv kuchli, lekin disk va RAM ko'p ketadi. Logstash yoki ingest pipeline log'ni bo'laklarga ajratadi, Kibana — ko'rish. Indekslarni ILM bilan kunlik aylantirib, eskisini o'chirish shart, aks holda disk to'ladi." },
      { h: "Grafana Loki", p: "Loki faqat label'larni indekslaydi (namespace, app, pod), matnni esa siqib saqlaydi — ancha arzon. LogQL: {app=\"api\"} |= \"error\" | json | status >= 500. Label'larga yuqori kardinallikli qiymat (user_id, request_id) qo'ymang — indeks portlaydi." },
      { h: "Strukturali log", p: "JSON formatdagi log (level, time, msg, request_id, service) qidiruvni osonlashtiradi. request_id/trace_id bir so'rovning hamma servislardagi izini bog'laydi — bu traces bilan birga observability'ning asosi." },
      { h: "Saqlash va xavfsizlik", p: "Retention'ni maqsadga qarab belgilang: debug log 7 kun, audit log qonun talabiga qarab yillar. Log'ga parol, karta raqami, shaxsiy ma'lumot yozilmasligi kerak — banklarda bu IB auditida tekshiriladi." }
    ],
    topics: ["Agentlar: Fluent Bit, Promtail/Alloy, Filebeat", "Elasticsearch/OpenSearch, Kibana, ILM", "Loki, label'lar va LogQL", "Kardinallik muammosi", "JSON log va request_id", "Retention va shaxsiy ma'lumotni log'dan chiqarish"],
    res: [["Grafana Loki hujjatlari", "https://grafana.com/docs/loki/latest/"], ["Fluent Bit", "https://docs.fluentbit.io/"], ["OpenSearch", "https://opensearch.org/docs/latest/"], ["Elastic ILM", "https://www.elastic.co/guide/en/elasticsearch/reference/current/index-lifecycle-management.html"]],
    comp: { J: ["kubectl logs, journalctl bilan log ko'rish", "Grafana/Kibana'da log qidirish"], M: ["Loki yoki ELK'ni ko'tarish va agent sozlash", "LogQL/KQL bilan xatoni topish", "Retention va ILM sozlash", "Strukturali log va request_id"], S: ["Log, metrika va trace'ni bitta tizimga bog'lash", "Log xarajatini va hajmini boshqarish siyosati", "Audit log va IB talablari"] },
    quiz: [
      { q: "Loki'ning ELK'dan arzonligining asosiy sababi?", o: ["Faqat label'larni indekslaydi, matnni indekslamaydi", "Log'larni saqlamaydi", "Faqat RAM'da ishlaydi", "Faqat bitta pod'dan o'qiydi"], a: 0, e: "To'liq matnli indeks Elasticsearch'da eng ko'p resurs oladi." },
      { q: "Loki label'iga user_id qo'yish nega yomon?", o: ["Yuqori kardinallik — juda ko'p oqim va indeks hosil bo'ladi", "Xavfsizlik uchun yaxshi", "Tezlashtiradi", "Hech qanday farqi yo'q"], a: 0, e: "Har bir noyob label qiymati alohida oqim yaratadi; bunday qiymatlarni log ichida saqlang." },
      { q: "Elasticsearch diski har oy to'lib qolyapti. Nima qilasiz?", o: ["ILM bilan indekslarni aylantirib, eskisini o'chirish yoki arzon storage'ga o'tkazish", "Diskni o'chirish", "Log yig'ishni to'xtatish", "Replika sonini oshirish"], a: 0, e: "Retention siyosatisiz log hajmi cheksiz o'sadi." },
      { q: "Bir so'rovning 5 servisdagi log'larini bog'lash uchun?", o: ["Har log'ga request_id/trace_id yozish", "Hammasini bitta faylga yozish", "Vaqt bo'yicha taxmin qilish", "Log'larni o'chirish"], a: 0, e: "Umumiy identifikator bo'yicha qidirib, butun yo'lni ko'rish mumkin." }
    ] },
  { id: 'py', lvl: 'M', title: "Python: DevOps avtomatlashtirish", weeks: 1,
    why: "Bash oddiy vazifalarga yetadi, lekin API bilan ishlash, JSON/YAML qayta ishlash va katta skriptlar uchun Python kerak. hh.uz e'lonlarida 'Bash/Python' deyarli har doim bor.",
    theory: [
      { h: "Qachon Bash, qachon Python", p: "Bash — buyruqlarni ketma-ket ishga tushirish, oddiy fayl ishlari. Python — shartlar va xatolar ko'p bo'lsa, API (GitLab, Kubernetes, Telegram) bilan ishlash, JSON/YAML o'qish, test yozish kerak bo'lsa. 50 qatordan oshgan Bash odatda Python'ga ko'chiriladi." },
      { h: "Muhit", p: "python3 -m venv .venv va pip install -r requirements.txt — har bir loyiha alohida bog'liqliklar bilan. Versiyalarni requirements'da qulflang. Serverga global pip bilan o'rnatmang." },
      { h: "Kerakli kutubxonalar", p: "subprocess (buyruq ishga tushirish, check=True bilan), pathlib (fayl yo'llari), json va PyYAML, requests yoki httpx (API), argparse (CLI argumentlar), logging (print o'rniga), kubernetes va boto3 (K8s va AWS API)." },
      { h: "Ishonchli skript", p: "Har bir tashqi chaqiruvga timeout, xatoni ushlab aniq xabar va to'g'ri exit kod, idempotentlik (qayta ishga tushirsa zarar qilmasin), secret'larni muhit o'zgaruvchisidan o'qish. Kichik funksiyalarga bo'lib, pytest bilan sinash." },
      { h: "Tipik vazifalar", p: "Eski Docker image teglarini registry'dan tozalash, sertifikat muddatini tekshirib Telegram'ga yuborish, Kubernetes'dagi resurssiz pod'lar ro'yxati, log'dan xatolarni sanab hisobot. Bularni portfolio'ga qo'ysangiz, suhbatda ko'rsatish oson." }
    ],
    topics: ["Bash va Python'ni tanlash", "venv va requirements.txt", "subprocess, pathlib, json, PyYAML", "requests bilan REST API", "argparse va logging", "kubernetes va boto3 kutubxonalari", "Timeout, exit kod, idempotentlik, pytest"],
    res: [["Python rasmiy tutorial", "https://docs.python.org/3/tutorial/"], ["Automate the Boring Stuff (bepul)", "https://automatetheboringstuff.com/"], ["Kubernetes Python client", "https://github.com/kubernetes-client/python"], ["Requests", "https://requests.readthedocs.io/"]],
    comp: { J: ["O'zgaruvchi, ro'yxat, lug'at, sikl, funksiya", "Fayl o'qish va yozish, JSON"], M: ["subprocess va API bilan avtomatlashtirish skripti", "argparse, logging, xatolarni ushlash", "venv va bog'liqliklarni boshqarish", "Kubernetes/AWS API bilan ishlash"], S: ["Ichki CLI vosita yoki operator yozish", "Testlar va CI bilan vosita sifatini ta'minlash"] },
    quiz: [
      { q: "subprocess.run'da buyruq xato bilan tugasa, skript ham to'xtashi uchun?", o: ["check=True", "shell=True", "text=True", "capture_output=False"], a: 0, e: "check=True nol bo'lmagan exit kodda CalledProcessError chiqaradi." },
      { q: "API token'ni skriptda qayerdan olish to'g'ri?", o: ["Muhit o'zgaruvchisi yoki secret ombordan", "Kod ichiga yozib", "Git'dagi config faylidan", "Skript nomidan"], a: 0, e: "Kodga yozilgan secret Git tarixiga tushadi." },
      { q: "Nega serverda global pip install o'rniga venv?", o: ["Har bir loyiha bog'liqliklari alohida va tizim paketlari buzilmaydi", "Tezroq ishlaydi", "Internet kerak emas", "Python'ni yangilaydi"], a: 0, e: "Global o'rnatish tizim vositalari (masalan apt'ning Python'i) bilan to'qnashishi mumkin." },
      { q: "requests.get'da timeout ko'rsatilmasa nima bo'lishi mumkin?", o: ["Server javob bermasa skript cheksiz osilib qoladi", "Avtomatik 5 soniya kutadi", "Xato chiqmaydi va hech narsa bo'lmaydi", "So'rov yuborilmaydi"], a: 0, e: "requests'da standart timeout yo'q — har doim timeout bering." }
    ] }
  ];
  const sIdx = D.stages.findIndex(function (s) { return s.id === 'senior'; });
  D.stages.splice.apply(D.stages, [sIdx < 0 ? D.stages.length : sIdx, 0].concat(NEW));
  D.stages.forEach(function (s, i) { s.n = String(i + 1).padStart(2, '0'); });
  D.interview.push(
    ['arch', "Oddiy onlayn do'kon uchun arxitektura chizing. Qayerda yiqilishi mumkin?", "DNS → CDN → LB (2 ta) → 3 ta stateless ilova pod → Redis kesh → PostgreSQL primary + replika → navbat (to'lov/email uchun) → worker'lar. Zaif nuqtalar: bitta DB primary (Patroni bilan failover), LB (ikkita, VIP), kesh yiqilsa DB'ga yuklama (graceful degradation, rate limit). Monitoring va backup alohida."],
    ['arch', "Retry'ni qachon qo'shmaslik kerak?", "Idempotent bo'lmagan amallarda (pul yechish, buyurtma yaratish) idempotency key bo'lmasa. Retry har doim timeout va eksponensial kutish bilan, chegaralangan son bilan bo'lishi kerak; aks holda buzilgan servisga bo'ron (retry storm) yuboriladi."],
    ['arch', "Kesh va DB ma'lumoti farq qilib qoldi. Nima qilasiz?", "Avval qaysi naqsh ishlatilganini aniqlayman (cache-aside). Yozishda keshni yangilash emas, o'chirish (invalidate) xavfsizroq; TTL qo'yaman. Muhim ma'lumot (balans) keshlanmaydi yoki juda qisqa TTL bilan. Keyin sababini — qaysi yo'l keshni chetlab o'tganini topaman."],
    ['pg', "Replika primary'dan 10 daqiqa orqada qoldi. Sabablari va tekshiruv?", "pg_stat_replication'da write/flush/replay lag'ni ko'raman. Sabablar: tarmoq, replikaning diski sekin, replikada uzoq so'rov WAL qo'llashni to'sgan (hot_standby_feedback, max_standby_streaming_delay), primary'da katta batch yozuv. Disk I/O va tarmoqni tekshiraman, uzoq so'rovlarni topaman."],
    ['pg', "Backup strategiyangiz qanday?", "Kunlik fizik base backup (pgBackRest) + uzluksiz WAL arxivi boshqa serverga/S3'ga, 14–30 kun saqlash. Haftalik avtomatik tiklash sinovi alohida serverda va tiklash vaqtini o'lchash. Kichik bazalar uchun qo'shimcha pg_dump. RPO — WAL arxiv oralig'i, RTO — sinovda o'lchangan vaqt."],
    ['mq', "Kafka'da xabarlar takrorlanib kelyapti. Nega va nima qilasiz?", "Consumer xabarni qayta ishlab, offset commit qilishdan oldin yiqilsa yoki rebalance bo'lsa, xabar qayta o'qiladi — bu 'at-least-once'ning odatiy natijasi. Yechim: iste'molchini idempotent qilish (xabar ID'si bo'yicha tekshirish, upsert), producer'da enable.idempotence=true."],
    ['mq', "Redis'ni qachon kesh, qachon asosiy ombor sifatida ishlatish mumkin?", "Kesh — yo'qolsa DB'dan tiklanadigan ma'lumot uchun, maxmemory va LRU bilan. Asosiy ombor sifatida faqat yo'qotish qabul qilinadigan yoki AOF + replika + Sentinel bilan himoyalangan holda (sessiya, rate limit). Pul va asosiy biznes ma'lumoti uchun — yo'q, DB kerak."],
    ['onprem', "Uy laboratoriyangizda nima qurgansiz? (suhbatda albatta so'raladi)", "Proxmox'da Terraform bilan 7 ta VM: 3 node k3s, Patroni bilan 3 node PostgreSQL + etcd, monitoring VM (Prometheus, Grafana, Zabbix). Ansible bilan sozlash, ichki Harbor registry, GitLab CI ilovani yig'ib Argo CD orqali deploy qiladi. DR mashqi: primary DB'ni o'chirib failover vaqtini o'lchaganman."],
    ['helm', "Helm chart'ni muhitlarga qanday ajratasiz?", "Bitta chart, umumiy values.yaml va har muhit uchun values-dev/stage/prod. Farqlar: replika soni, resurs, domen, secret manbasi. Secret'lar External Secrets orqali Vault'dan. CI faqat image.tag'ni yangilaydi, Argo CD qo'llaydi."],
    ['logs', "Loki yoki Elasticsearch — qaysini tanlaysiz?", "Asosiy ehtiyoj ilova log'larini label bo'yicha topish va xarajat muhim bo'lsa — Loki (Grafana bilan birga). Erkin matnli murakkab qidiruv, tahlil va xavfsizlik (SIEM) kerak bo'lsa — Elasticsearch/OpenSearch. Ko'p joyda ikkalasi: ilova log'lari Loki'da, audit va xavfsizlik log'lari ELK'da."],
    ['py', "Python'da qanday avtomatlashtirish yozgansiz?", "Masalan: registry'dan 30 kundan eski va prod'da ishlatilmayotgan image teglarini o'chiruvchi skript — Kubernetes API'dan ishlatilayotgan teglarni olib, registry API bilan solishtiradi, avval --dry-run hisobot beradi. argparse, logging, timeout va pytest bilan; GitLab CI'da haftada bir ishga tushadi."]
  );
  D.cards.push(
    ['arch', "Stateless nima?", "Ilova holatni o'zida saqlamaydi — istalgan nusxa istalgan so'rovni bajara oladi, shuning uchun gorizontal kengayadi."],
    ['arch', "Circuit breaker nima?", "Buzilgan servisga so'rov yuborishni vaqtincha to'xtatib, butun tizim yiqilishining oldini oladi."],
    ['pg', "pgBouncer nima uchun?", "Ko'p klient ulanishini kam sonli DB ulanishiga bo'lib beradi — PostgreSQL'da har ulanish alohida process."],
    ['pg', "PITR nima?", "Base backup + WAL arxivi bilan bazani istalgan vaqt nuqtasiga tiklash."],
    ['mq', "Consumer lag nima?", "Topic'dagi oxirgi offset va consumer group o'qigan offset farqi — iste'molchilar ulgurmayotganini ko'rsatadi."],
    ['helm', "helm rollback nima qiladi?", "Reliz'ni oldingi revision'dagi holatga qaytaradi."],
    ['logs', "Loki'da yuqori kardinallik nega yomon?", "Har noyob label qiymati alohida oqim yaratadi — indeks va xotira portlaydi."],
    ['py', "subprocess.run(check=True) nima beradi?", "Buyruq xato bilan tugasa istisno chiqaradi — skript jim davom etmaydi."]
  );
  D.labs.push(
    { id: 'pg1', st: 'pg', t: "Replikatsiya holati", g: "Primary'da replikalar holati va lag'ini ko'rsatadigan so'rovni yozing.", h: "psql -c 'select ... from pg_stat_replication'", re: /pg_stat_replication/i, out: " client_addr | state     | replay_lag\n 10.0.1.12   | streaming | 00:00:00.4\n 10.0.1.13   | streaming | 00:00:01.2" },
    { id: 'pg2', st: 'pg', t: "Eng sekin so'rovlar", g: "Eng ko'p umumiy vaqt olgan 5 ta so'rovni chiqaring.", h: "pg_stat_statements'dan total_exec_time bo'yicha tartiblang", re: /pg_stat_statements.*order\s+by\s+total_exec_time\s+desc.*limit\s+5/i, out: " calls | total_ms | query\n 81234 | 912345   | select * from payments where user_id = $1\n  ..." },
    { id: 'mq1', st: 'mq', t: "Consumer lag", g: "Kafka'da 'billing' consumer group'ining lag'ini ko'ring.", h: "kafka-consumer-groups.sh --describe --group billing", re: /kafka-consumer-groups(\.sh)?\s+.*--describe.*--group\s+billing|--group\s+billing.*--describe/i, out: "GROUP   TOPIC    PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG\nbilling payments 0          120334          125012          4678" },
    { id: 'mq2', st: 'mq', t: "Redis xotirasi", g: "Redis'ning xotira holatini ko'rsatadigan buyruq.", h: "redis-cli info memory", re: /redis-cli\s+(-[a-z]\s+\S+\s+)*info\s+memory/i, out: "used_memory_human:3.81G\nmaxmemory_human:4.00G\nmaxmemory_policy:allkeys-lru" },
    { id: 'helm1', st: 'helm', t: "Reliz tarixi", g: "'api' relizining revision tarixini ko'ring.", h: "helm history api", re: /^helm\s+history\s+api\b/i, out: "REVISION  STATUS      DESCRIPTION\n4         superseded  Upgrade complete\n5         deployed    Upgrade complete" },
    { id: 'helm2', st: 'helm', t: "Rollback", g: "'api' relizini 4-revision'ga qaytaring.", h: "helm rollback api 4", re: /^helm\s+rollback\s+api\s+4\b/i, out: "Rollback was a success! Happy Helming!" },
    { id: 'logs1', st: 'logs', t: "LogQL qidiruv", g: "api ilovasining 'error' so'zi bor log'larini Loki'da qidiring (logcli).", h: "logcli query '{app=\"api\"} |= \"error\"'", re: /logcli\s+query\s+.*\{\s*app\s*=\s*"api"\s*\}\s*\|=\s*"error"/i, out: "2026-10-24T10:12:01Z {app=\"api\"} level=error msg=\"db timeout\" request_id=8f2c" }
  );
  D.projects.push({ id: 'homelab', t: "Uy laboratoriyasi: Proxmox ustida production'ga o'xshash muhit", lvl: 'Middle', stack: 'Proxmox · Terraform · Ansible · k3s · Patroni · Harbor · GitLab CI · Argo CD · Prometheus · Loki', d: "Bank infratuzilmasiga o'xshash muhitni noldan kod orqali quring — suhbatda 'tajribangiz' savoliga eng kuchli javob.", steps: ["Proxmox o'rnatish va Ubuntu cloud-init template", "Terraform bilan 7 ta VM yaratish", "Ansible bilan k3s klaster (3 node)", "Patroni + etcd bilan 3 node PostgreSQL", "Harbor ichki registry va image mirror", "GitLab + runner, ilova uchun pipeline", "Argo CD + Helm chart bilan deploy", "Prometheus, Grafana, Loki, Telegram alert", "DR mashqi: primary DB'ni o'chirib failover vaqtini yozish", "README: arxitektura diagrammasi va qarorlar"] });
})(window.DEVOPS_DATA);
