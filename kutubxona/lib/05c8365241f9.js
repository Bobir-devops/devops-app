/* section-labs-2.js — Docker, Kubernetes, CI/CD uchun bo'lim laboratoriyalari.
   section-labs.js dan keyin yuklanadi va window.SectionLabs ga qo'shiladi. */
(function () {
  /* ---------- Docker ---------- */
  const DBOX = () => ({
    images: [
      { repo: 'myapp', tag: 'latest', id: 'a1b2c3d4e5f6', size: '142MB', cmd: ['python', 'app.py'], port: 8000, bind: '0.0.0.0', logs: ['listening on 0.0.0.0:8000'] },
      { repo: 'badapp', tag: 'latest', id: 'b2c3d4e5f6a1', size: '138MB', cmd: ['python', 'app.py'], port: 8000, bind: '127.0.0.1', logs: ['listening on 127.0.0.1:8000'] },
      { repo: 'alpine', tag: '3.19', id: 'c3d4e5f6a1b2', size: '7MB', cmd: ['sh'] },
      { repo: 'postgres', tag: '16', id: 'd4e5f6a1b2c3', size: '412MB', cmd: ['postgres'], port: 5432, bind: '0.0.0.0', logs: ['database system is ready to accept connections'] },
      { repo: 'python', tag: '3.12-slim', id: '1a2b3c4d5e6f', size: '128MB', cmd: ['python3'] },
    ],
    containers: [
      { id: '11aa22bb33cc', name: 'web', image: 'myapp:latest', state: 'running', exit: 0, cmd: ['sh', '-c', 'python app.py'], appPort: 8000, bind: '127.0.0.1', ports: '8080:8000/tcp', restart: 'always', networks: ['bridge'], ip: '172.17.0.2', memLimit: '256MiB', memUse: '240MiB', memPct: 93.7, cpu: 4.1, logs: ['listening on 127.0.0.1:8000', 'WARN: memory usage high'], procs: [{ pid: 1, ppid: 0, cmd: '/bin/sh -c python app.py' }, { pid: 9, ppid: 1, cmd: 'python app.py' }], files: { '/app/config.yaml': 'bind: 127.0.0.1\nport: 8000' } },
      { id: '44dd55ee66ff', name: 'db', image: 'postgres:16', state: 'running', exit: 0, cmd: ['postgres'], appPort: 5432, bind: '0.0.0.0', networks: ['bridge'], ip: '172.17.0.3', logs: ['database system is ready to accept connections'], files: {} },
      { id: 'aa99bb88cc77', name: 'old-job', image: 'alpine:3.19', state: 'exited', exit: 1, cmd: ['sh'], networks: ['bridge'], logs: ['FATAL: environment variable DATABASE_URL is not set'], files: {} },
    ],
    volumes: [{ name: 'pgdata' }, { name: 'old-data' }],
    networks: [{ name: 'bridge', driver: 'bridge' }, { name: 'host', driver: 'host' }, { name: 'none', driver: 'null' }],
    dockerfile: ['FROM python:3.12-slim', 'WORKDIR /app', 'COPY requirements.txt .', 'RUN pip install -r requirements.txt', 'COPY . .', 'EXPOSE 8000', 'ENTRYPOINT ["python"]', 'CMD ["app.py"]'],
    compose: { services: [
      { name: 'db', image: 'postgres:16', port: 5432, bind: '0.0.0.0', logs: ['database system is ready to accept connections'] },
      { name: 'api', image: 'myapp:latest', port: 8000, bind: '0.0.0.0', env: ['DATABASE_URL=postgres://db:5432/app'], logs: ['listening on 0.0.0.0:8000'] },
    ] },
  });
  const D = {
    s1: { title: 'Qadoqlash', tasks: [
      ['Lokal image\'lar ro\'yxatini ko\'ring.', /^docker\s+images/, 'docker images'],
      ['Ishlayotgan container\'larni ko\'ring.', /^docker\s+ps\s*$/, 'docker ps'],
      ['`web` container\'ining sozlamasini o\'qing.', /docker\s+inspect\s+web/, 'docker inspect web'],
    ] },
    s2: { title: 'VM va container', tasks: [
      ['Container ichida qanday processlar borligini ko\'ring.', /docker\s+top\s+web/, 'docker top web'],
      ['Hostdagi resurs ishlatilishini kuzating.', /docker\s+stats/, 'docker stats'],
      ['Container ichiga kirib process ro\'yxatini oling.', /docker\s+exec\s+.*web\s+ps/, 'docker exec -it web ps aux'],
    ] },
    s3: { title: 'Image → container', tasks: [
      ['`alpine:3.19` dan `test` nomli container ishga tushiring.', /docker\s+run\s+.*--name\s+test\s+alpine/, 'docker run -d --name test alpine:3.19'],
      ['To\'xtaganlarni ham ko\'rsatib ro\'yxatni oling.', /docker\s+ps\s+-a/, 'docker ps -a'],
      ['Keraksiz container\'ni o\'chirib tashlang.', /docker\s+rm\s+(-f\s+)?(test|old-job)/, 'docker rm old-job'],
    ] },
    s4: { title: 'Dockerfile va build', tasks: [
      ['Dockerfile\'dan `shop:v1` image build qiling.', /docker\s+build\s+.*-t\s+shop:v1/, 'docker build -t shop:v1 .'],
      ['Yangi image ro\'yxatda chiqqanini tasdiqlang.', /^docker\s+images/, 'docker images'],
      ['Shu image\'dan container ishga tushiring.', /docker\s+run\s+.*shop:v1/, 'docker run -d --name shop shop:v1'],
    ] },
    s5: { title: 'RUN va CMD', tasks: [
      ['`alpine:3.19` da buyruq berib ishga tushiring.', /docker\s+run\s+.*alpine.*\s+(echo|ls|sh)/, 'docker run --name a1 alpine:3.19 echo salom'],
      ['Natijani loglardan o\'qing.', /^docker\s+logs\s+/, 'docker logs a1'],
      ['Container holati va exit code\'ini ko\'ring.', /docker\s+ps\s+-a/, 'docker ps -a'],
    ] },
    s6: { title: 'ENTRYPOINT va CMD', tasks: [
      ['`shop:v1` ni build qilib default holda ishga tushiring.', /docker\s+build\s+.*-t\s+shop:v1/, 'docker build -t shop:v1 .'],
      ['Argument berib CMD almashganini ko\'ring.', /docker\s+run\s+.*shop:v1\s+\S+/, 'docker run --name s2 shop:v1 test.py'],
      ['inspect bilan ENTRYPOINT o\'zgarmaganini tasdiqlang.', /docker\s+inspect\s+/, 'docker inspect s2'],
    ] },
    s7: { title: 'Lifecycle', tasks: [
      ['To\'xtagan container\'ni exit code bilan toping.', /docker\s+ps\s+-a/, 'docker ps -a'],
      ['Uning logini o\'qib sababni aniqlang.', /docker\s+logs\s+old-job/, 'docker logs old-job'],
      ['Qaytadan ishga tushirib ko\'ring.', /docker\s+(start|restart)\s+old-job/, 'docker start old-job'],
    ] },
    s8: { title: 'stop va kill', tasks: [
      ['`db` container\'ida PID 1 kim ekanini ko\'ring.', /docker\s+top\s+db/, 'docker top db'],
      ['Uni muloyim to\'xtating (SIGTERM).', /docker\s+stop\s+db/, 'docker stop db'],
      ['`web`ni majburan to\'xtatib exit code\'ni solishtiring.', /docker\s+kill\s+web/, 'docker kill web'],
    ] },
    s9: { title: 'Container tarmog\'i', tasks: [
      ['`web` ichidan `db` ga nom orqali ulanib ko\'ring.', /docker\s+exec\s+.*web\s+.*(curl|wget).*db/, 'docker exec -it web curl -I db:5432'],
      ['Tarmoqlar ro\'yxatini ko\'ring.', /docker\s+network\s+ls/, 'docker network ls'],
      ['`app-net` yaratib `web`ni unga ulang.', /docker\s+network\s+connect\s+app-net\s+web/, 'docker network create app-net && docker network connect app-net web'],
    ] },
    s10: { title: '0.0.0.0 va bind', tasks: [
      ['`web` ichida qaysi manzilga bind qilganini ko\'ring.', /docker\s+exec\s+.*web\s+ss/, 'docker exec -it web ss -lntup'],
      ['Ichkaridan localhost orqali so\'rov yuboring.', /docker\s+exec\s+.*web\s+.*(curl|wget).*(localhost|127\.0\.0\.1)/, 'docker exec -it web curl -I localhost:8000'],
      ['To\'g\'ri image (`myapp`) bilan yangi container ishga tushiring.', /docker\s+run\s+.*-p\s*\d+:8000.*myapp/, 'docker run -d -p 8001:8000 --name good myapp'],
    ] },
    s11: { title: 'EXPOSE va -p', tasks: [
      ['8090 host portini 8000 ga bog\'lab container ishga tushiring.', /docker\s+run\s+.*-p\s*8090:8000/, 'docker run -d -p 8090:8000 --name pub myapp'],
      ['Port map ro\'yxatda ko\'rinishini tasdiqlang.', /^docker\s+ps/, 'docker ps'],
      ['inspect bilan port bindingni ko\'ring.', /docker\s+inspect\s+/, 'docker inspect pub'],
    ] },
    s12: { title: 'Volume', tasks: [
      ['`appdata` nomli volume yarating.', /docker\s+volume\s+create\s+appdata/, 'docker volume create appdata'],
      ['Volume\'ni ulab postgres ishga tushiring.', /docker\s+run\s+.*-v\s+\w+:\/var\/lib\/postgresql\/data.*postgres/, 'docker run -d -v appdata:/var/lib/postgresql/data --name db2 postgres:16'],
      ['Volume\'lar ro\'yxatini ko\'ring.', /docker\s+volume\s+ls/, 'docker volume ls'],
    ] },
    s13: { title: 'Resurs chegarasi', tasks: [
      ['512 MB xotira chegarasi bilan container ishga tushiring.', /docker\s+run\s+.*(-m|--memory)\s*=?\s*512m/i, 'docker run -d -m 512m --name lim myapp'],
      ['Hozirgi resurs ishlatilishini ko\'ring.', /docker\s+stats/, 'docker stats'],
      ['OOM bo\'lganini inspect bilan tekshiring.', /docker\s+inspect\s+/, 'docker inspect web'],
    ] },
    s14: { title: 'Debugging', tasks: [
      ['`web` loglarining oxirgi 50 qatorini oling.', /docker\s+logs\s+.*--tail\s*50/, 'docker logs --tail 50 web'],
      ['PID 1 kim ekanini aniqlang.', /docker\s+top\s+web/, 'docker top web'],
      ['Ichkaridagi sozlama faylini o\'qing.', /docker\s+exec\s+.*web\s+cat/, 'docker exec -it web cat /app/config.yaml'],
      ['Docker qancha disk egallaganini ko\'ring.', /docker\s+system\s+df/, 'docker system df'],
    ] },
    s15: { title: 'Compose', tasks: [
      ['Butun stack\'ni fon rejimida ko\'taring.', /docker\s+compose\s+up/, 'docker compose up -d'],
      ['Service\'lar holatini ko\'ring.', /docker\s+compose\s+ps/, 'docker compose ps'],
      ['`api` loglarini o\'qing.', /docker\s+(compose\s+)?logs\s+.*api/, 'docker compose logs api'],
      ['Stack\'ni tushiring.', /docker\s+compose\s+down/, 'docker compose down'],
    ] },
    s16: { title: 'Tozalash', tasks: [
      ['Disk taqsimotini ko\'ring.', /docker\s+system\s+df/, 'docker system df'],
      ['Keraksiz container\'ni o\'chiring.', /docker\s+rm\s+(-f\s+)?old-job/, 'docker rm old-job'],
      ['Ishlatilmayotgan obyektlarni tozalang.', /docker\s+system\s+prune/, 'docker system prune'],
    ] },
    s17: { title: 'To\'liq zanjir', tasks: [
      ['Container tirikmi va qaysi port map qilingan?', /^docker\s+ps/, 'docker ps'],
      ['Loglar nima deydi?', /^docker\s+logs\s+/, 'docker logs web'],
      ['PID 1 dasturmi yoki shell?', /docker\s+top\s+/, 'docker top web'],
      ['Ichkarida qaysi manzilga bind qilgan?', /docker\s+exec\s+.*ss/, 'docker exec -it web ss -lntup'],
      ['Resurs holati qanday?', /docker\s+stats/, 'docker stats'],
    ] },
  };

  /* ---------- Kubernetes ---------- */
  const KBOX = () => ({
    nodes: [{ name: 'node-1', ready: true, taints: [] }, { name: 'node-2', ready: true, taints: [] }],
    deployments: [
      { name: 'backend', replicas: 2, image: 'nginx:1.25', labels: { app: 'backend' }, container: 'backend' },
      { name: 'web', replicas: 3, image: 'nginx:1.24', labels: { app: 'web' }, container: 'web', prevImage: 'nginx:1.24' },
    ],
    services: [{ name: 'backend', selector: { app: 'backend' }, port: 80, targetPort: 80 }],
    configmaps: [{ name: 'app-config', data: { LOG_LEVEL: 'info' } }],
    secrets: [{ name: 'db-secret', data: { password: '***' } }],
    pods: [{ name: 'test', image: 'busybox:1.36', container: 'test', labels: { run: 'test' }, logs: [], prevLogs: [] }],
  });
  const K = {
    s1: { title: 'Nega Kubernetes', tasks: [
      ['Klasterdagi node\'larni ko\'ring.', /get\s+nodes/, 'kubectl get nodes'],
      ['Ishlayotgan Pod\'lar ro\'yxatini oling.', /get\s+pods/, 'kubectl get pods'],
      ['Deployment\'lar ro\'yxatini ko\'ring.', /get\s+deploy/, 'kubectl get deploy'],
    ] },
    s2: { title: 'Control plane', tasks: [
      ['Node\'larni holati bilan ko\'ring.', /get\s+nodes/, 'kubectl get nodes'],
      ['Bitta node tafsilotini oching.', /describe\s+node/, 'kubectl describe node node-1'],
      ['Klaster hodisalarini ko\'ring.', /get\s+events/, 'kubectl get events'],
    ] },
    s3: { title: 'Worker node va kubelet', tasks: [
      ['Pod\'lar qaysi node\'da ishlayotganini ko\'ring.', /get\s+pods.*-o\s*wide/, 'kubectl get pods -o wide'],
      ['Node sig\'imi va taint\'larini ko\'ring.', /describe\s+node/, 'kubectl describe node node-1'],
      ['Pod tafsilotidan node nomini tasdiqlang.', /describe\s+pod/, 'kubectl describe pod backend-xxxxx'],
    ] },
    s4: { title: 'API server', tasks: [
      ['Barcha asosiy obyektlarni ko\'rib chiqing.', /get\s+(pods|deploy|svc)/, 'kubectl get deploy'],
      ['Service\'lar ro\'yxatini oling.', /get\s+svc/, 'kubectl get svc'],
      ['Bitta Deployment spec\'ini o\'qing.', /describe\s+deploy/, 'kubectl describe deploy backend'],
    ] },
    s5: { title: 'etcd va holat', tasks: [
      ['Deployment\'dagi replicas sonini ko\'ring.', /get\s+deploy/, 'kubectl get deploy'],
      ['Desired va actual holatni solishtiring.', /get\s+pods/, 'kubectl get pods'],
      ['Spec tafsilotini o\'qing.', /describe\s+deploy/, 'kubectl describe deploy web'],
    ] },
    s6: { title: 'Scheduler', tasks: [
      ['Pod\'lar qaysi node\'ga tushganini ko\'ring.', /get\s+pods.*-o\s*wide/, 'kubectl get pods -o wide'],
      ['Node\'dagi taint\'ni ko\'ring.', /describe\s+node/, 'kubectl describe node node-2'],
      ['Rejalashtirish hodisalarini tekshiring.', /get\s+events/, 'kubectl get events'],
    ] },
    s7: { title: 'Pod yaratish', tasks: [
      ['`nginx:1.25` dan `test` nomli Pod yarating.', /run\s+test\s+--image=?\s*nginx/, 'kubectl run test --image=nginx:1.25'],
      ['Unga `app=test` label qo\'shing.', /label\s+pod\s+test\s+app=test/, 'kubectl label pod test app=test'],
      ['Pod qaysi node\'da ekanini ko\'ring.', /get\s+pods.*-o\s*wide/, 'kubectl get pods -o wide'],
    ] },
    s8: { title: 'Pending holati', tasks: [
      ['Pod\'lar holatini ko\'ring.', /get\s+pods/, 'kubectl get pods'],
      ['Sababni describe bilan aniqlang.', /describe\s+pod/, 'kubectl describe pod backend-xxxxx'],
      ['Node taint\'larini tekshiring.', /describe\s+node/, 'kubectl describe node node-1'],
    ] },
    s9: { title: 'CrashLoopBackOff', tasks: [
      ['Pod restart sonini ko\'ring.', /get\s+pods/, 'kubectl get pods'],
      ['Hozirgi log\'ni o\'qing.', /logs\s+\S+/, 'kubectl logs backend-xxxxx'],
      ['Holat va hodisalarni describe bilan tasdiqlang.', /describe\s+pod/, 'kubectl describe pod backend-xxxxx'],
    ] },
    s10: { title: 'Deployment va scaling', tasks: [
      ['`backend`ni 5 nusxaga o\'tkazing.', /scale\s+deploy\S*[\/\s]+backend\s+--replicas=?\s*5/, 'kubectl scale deploy/backend --replicas=5'],
      ['Pod soni haqiqatan oshganini tekshiring.', /get\s+pods/, 'kubectl get pods'],
      ['`web` image\'ini `nginx:1.26` ga yangilang.', /set\s+image\s+deploy\S*[\/\s]+web\s+\S+=nginx:1\.26/, 'kubectl set image deploy/web web=nginx:1.26'],
    ] },
    s11: { title: 'Self-healing', tasks: [
      ['Pod nomlarini oling.', /get\s+pods/, 'kubectl get pods'],
      ['Bitta Pod\'ni o\'chirib ko\'ring.', /delete\s+pods?\s+\S+/, 'kubectl delete pod backend-xxxxx'],
      ['Nusxa soni qaytganini tasdiqlang.', /get\s+pods/, 'kubectl get pods'],
    ] },
    s12: { title: 'Service', tasks: [
      ['`web`ni 80-portda Service qilib ochib bering.', /expose\s+deploy\S*[\/\s]+web\s+--port=?\s*80/, 'kubectl expose deploy/web --port=80'],
      ['Service\'lar ro\'yxatini ko\'ring.', /get\s+svc/, 'kubectl get svc'],
      ['Endpoints bo\'sh emasligini tekshiring.', /get\s+(ep|endpoints)/, 'kubectl get endpoints web'],
    ] },
    s13: { title: 'Endpoints', tasks: [
      ['Endpoints ro\'yxatini oling.', /get\s+(ep|endpoints)/, 'kubectl get endpoints'],
      ['Service selector\'ini ko\'ring.', /describe\s+svc/, 'kubectl describe svc backend'],
      ['Pod label\'larini solishtiring.', /get\s+pods|describe\s+pod/, 'kubectl describe pod backend-xxxxx'],
    ] },
    s14: { title: 'Kubernetes DNS', tasks: [
      ['Service nomini ro\'yxatdan oling.', /get\s+svc/, 'kubectl get svc'],
      ['Pod ichidan Service nomiga so\'rov yuboring.', /exec\s+.*--\s+(curl|wget)/, 'kubectl exec -it test -- curl -I backend:80'],
      ['Endpoints ortida Pod borligini tasdiqlang.', /get\s+(ep|endpoints)/, 'kubectl get endpoints backend'],
    ] },
    s15: { title: 'Probe', tasks: [
      ['`backend` uchun readiness probe qo\'shing.', /lab-set\s+probe\s+backend\s+readiness/, 'lab-set probe backend readiness'],
      ['Sozlamani describe bilan tasdiqlang.', /describe\s+deploy/, 'kubectl describe deploy backend'],
      ['Pod ready holatini ko\'ring.', /get\s+pods/, 'kubectl get pods'],
    ] },
    s16: { title: 'Probe parametrlari', tasks: [
      ['Startup probe qo\'shing.', /lab-set\s+probe\s+\S+\s+startup/, 'lab-set probe backend startup'],
      ['Liveness probe ham qo\'shing.', /lab-set\s+probe\s+\S+\s+liveness/, 'lab-set probe backend liveness'],
      ['Hammasini describe bilan ko\'ring.', /describe\s+deploy/, 'kubectl describe deploy backend'],
    ] },
    s17: { title: 'ConfigMap va Secret', tasks: [
      ['ConfigMap\'lar ro\'yxatini ko\'ring.', /get\s+cm|get\s+configmap/, 'kubectl get cm'],
      ['Secret\'lar ro\'yxatini oling.', /get\s+secrets?/, 'kubectl get secrets'],
      ['ConfigMap tafsilotini o\'qing.', /describe\s+(cm|configmap)/, 'kubectl describe cm app-config'],
    ] },
    s18: { title: 'Tashqi secret', tasks: [
      ['Secret\'lar ro\'yxatini ko\'ring.', /get\s+secrets?/, 'kubectl get secrets'],
      ['Deployment qanday secret ishlatayotganini ko\'ring.', /describe\s+deploy/, 'kubectl describe deploy backend'],
      ['Pod tafsilotidan mount\'ni tekshiring.', /describe\s+pod/, 'kubectl describe pod backend-xxxxx'],
    ] },
    s19: { title: 'Request va limit', tasks: [
      ['`backend` uchun request va limit qo\'ying.', /lab-set\s+res\s+backend/, 'lab-set res backend 128Mi 512Mi'],
      ['Pod\'da qo\'llanganini tekshiring.', /describe\s+pod/, 'kubectl describe pod backend-xxxxx'],
      ['Resurs ishlatilishini ko\'ring.', /top\s+pods?/, 'kubectl top pods'],
    ] },
    s20: { title: 'Node va drain', tasks: [
      ['Node\'lar holatini ko\'ring.', /get\s+nodes/, 'kubectl get nodes'],
      ['Node\'ni yangi Pod qabul qilmaydigan qilib qo\'ying.', /cordon\s+\S+/, 'kubectl cordon node-2'],
      ['Pod\'larni ko\'chirib yuboring.', /drain\s+\S+/, 'kubectl drain node-2 --ignore-daemonsets'],
      ['Node\'ni qaytadan ishga qo\'shing.', /uncordon\s+\S+/, 'kubectl uncordon node-2'],
    ] },
    s21: { title: 'Ingress va trafik', tasks: [
      ['Service\'lar ro\'yxatini ko\'ring.', /get\s+svc/, 'kubectl get svc'],
      ['Endpoints ortida Pod borligini tasdiqlang.', /get\s+(ep|endpoints)/, 'kubectl get endpoints'],
      ['Pod ichidan Service\'ga so\'rov yuboring.', /exec\s+.*--\s+(curl|wget)/, 'kubectl exec -it test -- curl -I backend:80'],
    ] },
    s22: { title: 'To\'liq zanjir', tasks: [
      ['Pod\'lar tirikmi?', /get\s+pods/, 'kubectl get pods'],
      ['Service bormi?', /get\s+svc/, 'kubectl get svc'],
      ['Endpoints bo\'sh emasmi?', /get\s+(ep|endpoints)/, 'kubectl get endpoints'],
      ['Log nima deydi?', /logs\s+\S+/, 'kubectl logs backend-xxxxx'],
      ['Hodisalarni ko\'ring.', /get\s+events/, 'kubectl get events'],
    ] },
    s23: { title: 'Mental model', tasks: [
      ['Deployment → Pod zanjirini ko\'ring.', /get\s+deploy/, 'kubectl get deploy'],
      ['Pod\'lar node bo\'yicha taqsimlanishini ko\'ring.', /get\s+pods.*-o\s*wide/, 'kubectl get pods -o wide'],
      ['Rollout holatini tekshiring.', /rollout\s+status/, 'kubectl rollout status deploy/web'],
    ] },
  };

  /* ---------- CI/CD ---------- */
  const CBOX = () => ({
    git: {
      head: 'main',
      branches: { main: { commits: [{ sha: 'a1b2c3d', msg: 'initial commit', files: [] }] } },
      remote: { main: [{ sha: 'a1b2c3d', msg: 'initial commit', files: [] }] },
      staged: [], dirty: ['app.py', 'README.md'],
    },
    ci: { plan: [
      { name: 'lint', dur: '4s', log: ['ok'] },
      { name: 'test', fails: true, dur: '31s', log: ['test_login.py::test_token FAILED', 'AssertionError: expected 200, got 401'] },
      { name: 'build', dur: '48s', log: ['building wheel...'] },
      { name: 'image', dur: '62s', log: ['docker build ...'] },
    ], image: 'backend:8f31c2a' },
    built: ['backend:8f31c2a'], registry: ['backend:8f31c2a'],
    k8s: { deploys: [{ name: 'backend', replicas: 3, ready: 3, updated: 3, image: 'backend:a1b2c3d', prevImage: 'backend:9e8d7c6' }],
      pods: [{ name: 'backend-7f9c4', ready: true, status: 'Running', restarts: 0 }, { name: 'backend-2kd8s', ready: true, status: 'Running', restarts: 0 }, { name: 'backend-x81qa', ready: true, status: 'Running', restarts: 0 }], events: [] },
    helm: { name: 'backend', current: 'a1b2c3d', revisions: [{ rev: 1, tag: '9e8d7c6', status: 'superseded' }, { rev: 2, tag: 'a1b2c3d', status: 'deployed' }] },
    tf: { inited: true, pending: [{ addr: 'aws_vpc.main', type: 'aws_vpc', action: 'created' }, { addr: 'aws_instance.web', type: 'aws_instance', action: 'created' }, { addr: 'aws_lb.front', type: 'aws_lb', action: 'created' }], applied: false },
    argo: { apps: [{ name: 'backend', sync: 'OutOfSync', target: '8f31c2a', live: 'a1b2c3d' }] },
  });
  const C = {
    s1: { title: 'Git — uch ko\'chirish', tasks: [
      ['Holatni ko\'ring — nima o\'zgargan?', /^git\s+status/, 'git status'],
      ['Hamma o\'zgarishni staging\'ga qo\'shing.', /^git\s+add\s+(\.|-A|app\.py)/, 'git add .'],
      ['Xabar bilan commit qiling.', /^git\s+commit\s+-m/, 'git commit -m "fix login"'],
      ['Remote\'ga yuboring.', /^git\s+push/, 'git push'],
    ] },
    s2: { title: 'Commit', tasks: [
      ['O\'zgarishlarni commit qiling.', /^git\s+commit\s+-m/, 'git commit -m "update"'],
      ['Tarixni qisqa ko\'rinishda ko\'ring.', /^git\s+log/, 'git log --oneline'],
      ['Farqni ko\'rib chiqing.', /^git\s+diff/, 'git diff'],
    ] },
    s3: { title: 'Branch', tasks: [
      ['`feature/login` branch yaratib unga o\'ting.', /^git\s+(checkout\s+-b|switch\s+-c)\s+feature\/login/, 'git checkout -b feature/login'],
      ['Branchlar ro\'yxatini ko\'ring.', /^git\s+branch\s*$/, 'git branch'],
      ['`main`ga qaytib oling.', /^git\s+(checkout|switch)\s+main/, 'git checkout main'],
    ] },
    s4: { title: 'Merge va rebase', tasks: [
      ['Feature branch yarating.', /^git\s+(checkout\s+-b|switch\s+-c)\s+\S+/, 'git checkout -b feature/x'],
      ['`main`ga qaytib merge qiling.', /^git\s+merge\s+\S+/, 'git merge feature/x'],
      ['Holatni tekshiring.', /^git\s+status/, 'git status'],
    ] },
    s5: { title: 'CI', tasks: [
      ['Pipeline\'ni ishga tushiring.', /^ci\s+run/, 'ci run'],
      ['Qaysi bosqichda yiqilganini ko\'ring.', /^ci\s+status/, 'ci status'],
      ['O\'sha bosqich logini o\'qing.', /^ci\s+logs\s+test/, 'ci logs test'],
      ['Sababni tuzatib belgilang.', /^ci\s+fix\s+test/, 'ci fix test'],
    ] },
    s6: { title: 'CD', tasks: [
      ['Pipeline\'ni ishlatib artifact oling.', /^ci\s+run/, 'ci run'],
      ['Holatni tekshiring.', /^ci\s+status/, 'ci status'],
      ['Klasterdagi hozirgi image\'ni ko\'ring.', /kubectl\s+get\s+deploy/, 'kubectl get deploy'],
    ] },
    s7: { title: 'Artifact', tasks: [
      ['Image\'ni Git SHA bilan build qiling.', /docker\s+build\s+.*-t\s+\S+:8f31c2a/, 'docker build -t backend:8f31c2a .'],
      ['Registry\'ga yuboring.', /docker\s+push\s+\S+:8f31c2a/, 'docker push backend:8f31c2a'],
      ['Klasterga o\'sha tegni qo\'llang.', /kubectl\s+set\s+image\s+.*8f31c2a/, 'kubectl set image deploy/backend backend=backend:8f31c2a'],
    ] },
    s8: { title: 'Docker + CI/CD', tasks: [
      ['Pipeline ishlatib image yasang.', /^ci\s+run/, 'ci run'],
      ['Image\'ni teglab build qiling.', /docker\s+build\s+.*-t\s+/, 'docker build -t backend:8f31c2a .'],
      ['Registry\'ga push qiling.', /docker\s+push\s+/, 'docker push backend:8f31c2a'],
    ] },
    s9: { title: 'Registry', tasks: [
      ['Image\'ni push qiling.', /docker\s+push\s+/, 'docker push backend:8f31c2a'],
      ['Klasterdagi deploy image\'ini ko\'ring.', /kubectl\s+get\s+deploy/, 'kubectl get deploy'],
      ['Yangi tegni qo\'llang.', /kubectl\s+set\s+image\s+/, 'kubectl set image deploy/backend backend=backend:8f31c2a'],
    ] },
    s10: { title: 'GitOps', tasks: [
      ['Argo CD ilova holatini ko\'ring.', /argocd\s+app\s+(get|list)/, 'argocd app get backend'],
      ['Git bilan farqni ko\'ring.', /argocd\s+app\s+(diff|get)/, 'argocd app diff backend'],
      ['Sinxronlashtiring.', /argocd\s+app\s+sync/, 'argocd app sync backend'],
    ] },
    s11: { title: 'Argo CD va Helm', tasks: [
      ['Helm release holatini ko\'ring.', /helm\s+(list|status)/, 'helm list'],
      ['Yangi image tegi bilan yangilang.', /helm\s+upgrade\s+backend/, 'helm upgrade backend ./chart --set image.tag=8f31c2a'],
      ['Argo CD holatini tekshiring.', /argocd\s+app\s+get/, 'argocd app get backend'],
    ] },
    s12: { title: 'Deployment strategiyasi', tasks: [
      ['Hozirgi deploy holatini ko\'ring.', /kubectl\s+get\s+deploy/, 'kubectl get deploy'],
      ['Yangi versiyani qo\'llang.', /kubectl\s+set\s+image\s+/, 'kubectl set image deploy/backend backend=backend:8f31c2a'],
      ['Rollout holatini kuzating.', /kubectl\s+rollout\s+status/, 'kubectl rollout status deploy/backend'],
    ] },
    s15: { title: 'Terraform', tasks: [
      ['Nima o\'zgarishini ko\'ring.', /terraform\s+plan|^tf\s+plan/, 'terraform plan'],
      ['O\'zgarishni qo\'llang.', /terraform\s+apply|^tf\s+apply/, 'terraform apply'],
      ['Holatni tekshiring.', /terraform\s+(show|state)|^tf\s+(show|state)/, 'terraform show'],
    ] },
    s16: { title: 'Ansible', tasks: [
      ['Terraform bilan infratuzilmani ko\'ring.', /terraform\s+(plan|show)|^tf\s+(plan|show)/, 'terraform plan'],
      ['Qo\'llab yarating.', /terraform\s+apply|^tf\s+apply/, 'terraform apply'],
      ['Klaster holatini tekshiring.', /kubectl\s+get\s+deploy/, 'kubectl get deploy'],
    ] },
    s17: { title: 'Monitoring', tasks: [
      ['Deploy holatini ko\'ring.', /kubectl\s+get\s+deploy/, 'kubectl get deploy'],
      ['Pipeline holatini tekshiring.', /^ci\s+status/, 'ci status'],
      ['Argo CD sinxronligini ko\'ring.', /argocd\s+app\s+get/, 'argocd app get backend'],
    ] },
    s18: { title: 'Prometheus va Grafana', tasks: [
      ['Klasterdagi deploy\'larni ko\'ring.', /kubectl\s+get\s+deploy/, 'kubectl get deploy'],
      ['Rollout holatini tekshiring.', /kubectl\s+rollout\s+status/, 'kubectl rollout status deploy/backend'],
      ['Pipeline loglarini o\'qing.', /^ci\s+logs\s+/, 'ci logs build'],
    ] },
    s19: { title: 'SLI / SLO / SLA', tasks: [
      ['Hozirgi deploy nusxalarini ko\'ring.', /kubectl\s+get\s+deploy/, 'kubectl get deploy'],
      ['Yangilanish tugaganini tasdiqlang.', /kubectl\s+rollout\s+status/, 'kubectl rollout status deploy/backend'],
      ['Nosozlikda qaytarib oling.', /kubectl\s+rollout\s+undo/, 'kubectl rollout undo deploy/backend'],
    ] },
    s20: { title: 'TLS va sertifikat', tasks: [
      ['Pipeline\'ni ishlatib artifact oling.', /^ci\s+run/, 'ci run'],
      ['Klaster holatini ko\'ring.', /kubectl\s+get\s+deploy/, 'kubectl get deploy'],
      ['Helm release revisiyalarini ko\'ring.', /helm\s+(list|history)/, 'helm list'],
    ] },
    s22: { title: 'Butun konveyer', tasks: [
      ['Git holatini ko\'ring.', /^git\s+status/, 'git status'],
      ['Commit qilib push qiling.', /^git\s+push/, 'git commit -m "x" && git push'],
      ['Pipeline ishlatib artifact oling.', /^ci\s+run/, 'ci run'],
      ['Image\'ni registry\'ga yuboring.', /docker\s+push\s+/, 'docker push backend:8f31c2a'],
      ['Klasterga qo\'llab rollout\'ni kuzating.', /kubectl\s+rollout\s+status/, 'kubectl rollout status deploy/backend'],
    ] },
  };

  const build = (map, box) => {
    const out = {};
    Object.keys(map).forEach((id) => {
      const s = map[id];
      out[id] = {
        title: s.title,
        section: id.replace('s', '') + "-bo'lim",
        init: box(),
        tasks: s.tasks.map((t) => ({ t: t[0], re: t[1], hint: t[2] })),
      };
    });
    return out;
  };

  window.SectionLabs = window.SectionLabs || {};
  window.SectionLabs.Docker = build(D, DBOX);
  window.SectionLabs.Kubernetes = build(K, KBOX);
  window.SectionLabs['CI/CD'] = build(C, CBOX);
})();
