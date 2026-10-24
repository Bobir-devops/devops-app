/* cka-tasks.js — KodeKloud / CKA uslubidagi amaliy topshiriqlar.
   window.CkaTasks[subject] = [{ sec: 's3', t: 'vazifa', check: /regex/, hint: 'buyruq' }, ...] */
(function () {
  const Linux = [
    { sec: 's3', t: "`nginx` nomli process'ning PID'ini bitta buyruq bilan chiqaring (grep'siz).", check: /pgrep\s+(-a\s+)?nginx/, hint: 'pgrep -a nginx' },
    { sec: 's3', t: "CPU'ni eng ko'p yeyayotgan 5 process'ni ko'rsatadigan buyruq yozing.", check: /ps\s+aux\s*--sort=-%cpu\s*\|\s*head/, hint: 'ps aux --sort=-%cpu | head -5' },
    { sec: 's4', t: "PID 4120 ga muloyim to'xtash signali yuboring (majburan emas).", check: /^kill\s+(-15\s+|-TERM\s+|-SIGTERM\s+)?4120\s*$/, hint: 'kill 4120' },
    { sec: 's5', t: "`nginx` xizmatini har reboot'da o'zi yonadigan qilib, hoziroq ham ishga tushiring — bitta buyruqda.", check: /systemctl\s+enable\s+--now\s+nginx/, hint: 'systemctl enable --now nginx' },
    { sec: 's6', t: "`ssh` xizmatining oxirgi 50 qator logini ko'rsating.", check: /journalctl\s+-u\s+ssh(\.service)?\s+.*-n\s*50|journalctl\s+-n\s*50\s+-u\s+ssh/, hint: 'journalctl -u ssh -n 50' },
    { sec: 's9', t: "`/data/report.txt` uchun `/data/latest.txt` nomli symlink yarating.", check: /ln\s+-s\s+\/data\/report\.txt\s+\/data\/latest\.txt/, hint: 'ln -s /data/report.txt /data/latest.txt' },
    { sec: 's12', t: "Disk 95% to'la, lekin `du` kamroq ko'rsatyapti — o'chirilgan-u hali ochiq fayllarni toping.", check: /lsof\s+\+L1/, hint: 'lsof +L1' },
    { sec: 's16', t: "`deploy.sh` faylini egasi o'qiy-yoza-ishlata oladigan, qolganlar faqat o'qib-ishlata oladigan qilib qo'ying.", check: /chmod\s+755\s+deploy\.sh/, hint: 'chmod 755 deploy.sh' },
    { sec: 's16', t: "`id_rsa` kalitini faqat egasi o'qiy-yoza oladigan qilib qo'ying.", check: /chmod\s+600\s+id_rsa/, hint: 'chmod 600 id_rsa' },
    { sec: 's22', t: "`/srv/app` katalogining egasini `www-data` foydalanuvchisi va guruhiga rekursiv o'tkazing.", check: /chown\s+-R\s+www-data:www-data\s+\/srv\/app/, hint: 'chown -R www-data:www-data /srv/app' },
    { sec: 's23', t: "PID 4120 process'i qanday tizim chaqiruvlari qilayotganini kuzatuvga oling.", check: /strace\s+-p\s*4120/, hint: 'strace -p 4120' },
    { sec: 's26', t: "8.8.8.8 ga paket qaysi yo'l va interfeys orqali ketishini aniqlang.", check: /ip\s+route\s+get\s+8\.8\.8\.8/, hint: 'ip route get 8.8.8.8' },
  ];
  const Networking = [
    { sec: 's3', t: "Tizimda 8080-portni kim eshitayotganini aniqlang (process nomi bilan).", check: /ss\s+-[a-z]*l[a-z]*n[a-z]*t[a-z]*u[a-z]*p|ss\s+-lntup/, hint: 'ss -lntup | grep :8080' },
    { sec: 's7', t: "`api.example.com` nomini tizim resolver'i orqali yeching (dig emas).", check: /getent\s+hosts\s+api\.example\.com/, hint: 'getent hosts api.example.com' },
    { sec: 's8', t: "`example.com` domenining MX yozuvlarini so'rang.", check: /dig\s+.*example\.com\s+MX|dig\s+MX\s+example\.com/i, hint: 'dig example.com MX' },
    { sec: 's9', t: "Domenni 8.8.8.8 serveridan so'rab, faqat natijani chiqaring.", check: /dig\s+@8\.8\.8\.8\s+\S+\s+\+short|dig\s+\+short\s+@8\.8\.8\.8/, hint: 'dig @8.8.8.8 example.com +short' },
    { sec: 's14', t: "`server-b` hostining 22-portiga TCP ulanish bo'ladimi — ma'lumot yubormasdan tekshiring.", check: /nc\s+-[vz]{1,2}\s+server-b\s+22/, hint: 'nc -vz server-b 22' },
    { sec: 's14', t: "`https://api.example.com` faqat javob sarlavhalarini oling.", check: /curl\s+.*-I\s+.*api\.example\.com/, hint: 'curl -I https://api.example.com' },
    { sec: 's13', t: "Dastur tashqaridan ko'rinmayapti — ichkarida qaysi manzilga bind qilganini tekshiradigan buyruq yozing.", check: /ss\s+-lntup/, hint: 'ss -lntup' },
  ];
  const Docker = [
    { sec: 's3', t: "`myapp` image'idan `web` nomli container'ni fon rejimida, 8080 host portini 8000 container portiga bog'lab ishga tushiring.", check: /docker\s+run\s+.*-d.*-p\s*8080:8000.*--name\s+web\s+myapp|docker\s+run\s+.*--name\s+web.*-p\s*8080:8000.*myapp/, hint: 'docker run -d -p 8080:8000 --name web myapp' },
    { sec: 's7', t: "To'xtagan container'larni ham ko'rsatib, exit code'ni aniqlang.", check: /docker\s+ps\s+-a/, hint: 'docker ps -a' },
    { sec: 's7', t: "`api` container'i OOM sababli o'lganini tasdiqlash uchun sozlamasini o'qing.", check: /docker\s+inspect\s+api/, hint: 'docker inspect api' },
    { sec: 's8', t: "`web` container'ining oxirgi 100 qator logini jonli kuzatuvda oching.", check: /docker\s+logs\s+.*(-f.*--tail\s*100|--tail\s*100.*-f)/, hint: 'docker logs -f --tail 100 web' },
    { sec: 's10', t: "`web` container'i ichida qaysi manzilga bind qilganini tekshiring.", check: /docker\s+exec\s+.*web\s+ss\s+-lntup/, hint: 'docker exec -it web ss -lntup' },
    { sec: 's9', t: "`app-net` nomli bridge tarmoq yaratib, `api` container'ini unga ulang.", check: /docker\s+network\s+connect\s+app-net\s+api/, hint: 'docker network create app-net && docker network connect app-net api' },
    { sec: 's12', t: "`pgdata` volume'ini `/var/lib/postgresql/data` ga ulab postgres ishga tushiring.", check: /docker\s+run\s+.*-v\s+pgdata:\/var\/lib\/postgresql\/data.*postgres/, hint: 'docker run -d -v pgdata:/var/lib/postgresql/data postgres:16' },
    { sec: 's13', t: "Container'ni 512 MB xotira chegarasi bilan ishga tushiring.", check: /docker\s+run\s+.*(-m|--memory)\s*=?\s*512m/i, hint: 'docker run -d -m 512m myapp' },
    { sec: 's14', t: "Docker qancha disk egallaganini ko'rsating.", check: /docker\s+system\s+df/, hint: 'docker system df' },
  ];
  const Kubernetes = [
    { sec: 's7', t: "`nginx` image'idan `web` nomli Pod'ni imperativ yarating.", check: /kubectl\s+run\s+web\s+--image=?\s*nginx/, hint: 'kubectl run web --image=nginx' },
    { sec: 's7', t: "Pod'ni yaratmasdan, uning YAML'ini faylga chiqaradigan buyruq yozing.", check: /--dry-run=client\s+-o\s*yaml|-o\s*yaml\s+--dry-run=client/, hint: 'kubectl run web --image=nginx --dry-run=client -o yaml > pod.yaml' },
    { sec: 's8', t: "`web-1` Pod'i nega Pending turganini hodisalar bilan aniqlang.", check: /kubectl\s+describe\s+pod\s+web-1/, hint: 'kubectl describe pod web-1' },
    { sec: 's9', t: "CrashLoop'dagi Pod'ning o'lgan konteyner logini o'qing.", check: /kubectl\s+logs\s+\S+\s+(--previous|-p)\b/, hint: 'kubectl logs web-1 --previous' },
    { sec: 's10', t: "`backend` Deployment'ini 5 nusxaga o'tkazing.", check: /kubectl\s+scale\s+deploy(loyment)?[\/\s]+backend\s+--replicas=?\s*5/, hint: 'kubectl scale deploy/backend --replicas=5' },
    { sec: 's10', t: "`backend` Deployment'ining `app` konteyneridagi image'ni `backend:8f31c2a` ga o'zgartiring.", check: /kubectl\s+set\s+image\s+deploy(loyment)?[\/\s]+backend\s+\S+=backend:8f31c2a/, hint: 'kubectl set image deploy/backend app=backend:8f31c2a' },
    { sec: 's11', t: "Nosoz chiqqan rollout'ni oldingi versiyaga qaytaring.", check: /kubectl\s+rollout\s+undo\s+deploy(loyment)?[\/\s]+\S+/, hint: 'kubectl rollout undo deploy/backend' },
    { sec: 's12', t: "`backend` Deployment'ini 80-portda ClusterIP Service sifatida oching.", check: /kubectl\s+expose\s+deploy(loyment)?[\/\s]+backend\s+--port=?\s*80/, hint: 'kubectl expose deploy/backend --port=80 --target-port=8080' },
    { sec: 's13', t: "Service ortida haqiqatan Pod bor-yo'qligini tekshiring.", check: /kubectl\s+get\s+(ep|endpoints)\b/, hint: 'kubectl get endpoints backend' },
    { sec: 's14', t: "Pod ichidan Service nomi orqali so'rov yuborib ko'ring.", check: /kubectl\s+exec\s+.*--\s+(curl|wget)/, hint: 'kubectl exec -it web -- curl -I backend:80' },
    { sec: 's19', t: "Qaysi Pod qancha CPU va xotira ishlatayotganini ko'rsating.", check: /kubectl\s+top\s+pods?/, hint: 'kubectl top pods' },
    { sec: 's20', t: "Node'ni yangilashdan oldin uni yangi Pod qabul qilmaydigan qilib, mavjud Pod'larni ko'chiring.", check: /kubectl\s+drain\s+\S+.*--ignore-daemonsets/, hint: 'kubectl drain node-2 --ignore-daemonsets --delete-emptydir-data' },
    { sec: 's21', t: "Klaster hodisalarini eng yangisidan boshlab ko'rsating.", check: /kubectl\s+get\s+events\s+.*--sort-by/, hint: "kubectl get events --sort-by=.lastTimestamp" },
  ];
  const CICD = [
    { sec: 's1', t: "O'zgargan hamma faylni staging'ga qo'shib, «fix login» xabari bilan commit qiling — bitta qatorda.", check: /git\s+add\s+(\.|-A)\s*&&\s*git\s+commit\s+-m/, hint: 'git add . && git commit -m "fix login"' },
    { sec: 's3', t: "`feature/login` nomli yangi branch yaratib, darhol unga o'ting.", check: /git\s+(checkout\s+-b|switch\s+-c)\s+feature\/login/, hint: 'git checkout -b feature/login' },
    { sec: 's4', t: "Umumiy branch'da xato commit'ni tarixni buzmasdan bekor qiling (sha: 8f31c2a).", check: /git\s+revert\s+8f31c2a/, hint: 'git revert 8f31c2a' },
    { sec: 's8', t: "Image'ni Git SHA bilan teglab build qiling (sha: 8f31c2a, nom: backend).", check: /docker\s+build\s+.*-t\s+backend:8f31c2a/, hint: 'docker build -t backend:8f31c2a .' },
    { sec: 's9', t: "O'sha image'ni registry'ga yuboring.", check: /docker\s+push\s+\S*backend:8f31c2a/, hint: 'docker push backend:8f31c2a' },
    { sec: 's11', t: "Helm release'ni yangi image tegi bilan yangilang (release: backend, teg: 8f31c2a).", check: /helm\s+upgrade\s+backend\s+.*image\.tag=8f31c2a/, hint: 'helm upgrade backend ./chart --set image.tag=8f31c2a' },
    { sec: 's13', t: "Helm release'ni 3-revisionga qaytaring.", check: /helm\s+rollback\s+backend\s+3/, hint: 'helm rollback backend 3' },
    { sec: 's15', t: "Terraform'da nima o'zgarishini qo'llashdan oldin ko'ring.", check: /terraform\s+plan/, hint: 'terraform plan' },
    { sec: 's10', t: "Argo CD ilovasining Git bilan farqini ko'rsatadigan buyruq yozing (ilova: backend).", check: /argocd\s+app\s+(get|diff)\s+backend/, hint: 'argocd app get backend' },
  ];
  window.CkaTasks = { Linux: Linux, Networking: Networking, Docker: Docker, Kubernetes: Kubernetes, 'CI/CD': CICD };
})();
