/* gaps-data.js — mavzularda yetishmagan qismlar: suhbatda so'raladigan, lekin bo'limlarda yuzaki bo'lgan bilimlar. */
(function () {
  const c = (t) => '<code>' + t + '</code>';
  const b = (t) => '<strong>' + t + '</strong>';
  const pre = (t) => '<pre><code>' + t.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</code></pre>';
  const box = (lbl, t, warn) => '<div class="box' + (warn ? ' warn' : '') + '"><div class="lbl">' + lbl + '</div><p>' + t + '</p></div>';
  const S = [
    ['🐧 Linux: disk, LVM, RAID va fstab', `<p>Disk qatlamlari pastdan yuqoriga: ${b('fizik disk')} → ${b('bo‘lim (partition)')} → ixtiyoriy ${b('RAID')} → ixtiyoriy ${b('LVM')} → ${b('fayl tizimi')} (ext4/xfs) → ${b('mount')} nuqta.</p>
<h3>LVM — moslashuvchan disk</h3><p>${b('PV')} (physical volume) — disk yoki bo‘lim; ${b('VG')} (volume group) — PV‘lar havzasi; ${b('LV')} (logical volume) — VG‘dan kesilgan "virtual disk". Foydasi: diskni ${b('ishlab turgan holda kengaytirish')}, snapshot.</p>
${pre(`lsblk -f                         # disklar, bo'limlar, FS, mount
pvcreate /dev/sdb && vgextend data /dev/sdb
lvextend -L +20G /dev/data/app   # LV ni kengaytirish
resize2fs /dev/data/app          # ext4 (xfs uchun: xfs_growfs /mount)
# bir qadamda: lvextend -r -L +20G /dev/data/app`)}
<h3>RAID</h3><p>${b('RAID 0')} — tezlik, himoya yo‘q. ${b('RAID 1')} — ko‘zgu, bitta disk o‘lsa ishlaydi. ${b('RAID 5')} — paritet, bitta disk chidaydi. ${b('RAID 10')} — ko‘zgu + striping, DB uchun eng ko‘p tanlanadi. Holat: ${c('cat /proc/mdstat')}, ${c('mdadm --detail /dev/md0')}. RAID — ${b('backup emas')}: o‘chirilgan fayl ikkala diskdan ham o‘chadi.</p>
<h3>/etc/fstab</h3>${pre(`UUID=3f2c...  /data  ext4  defaults,noatime  0 2
# sinab ko'rish (reboot'dan oldin!): mount -a && findmnt /data`)}
${box('⚠️ Xato', 'fstab‘da xato bo‘lsa server emergency mode‘da yuklanadi. Tarmoq disklari uchun <code>nofail</code> va <code>_netdev</code> qo‘shing, qurilma nomi o‘rniga <code>UUID</code> ishlating.', true)}`],
    ['🐧 Linux: systemd timer, cron va loglar', `<p>Rejali ishlar ikki yo‘l bilan: ${b('cron')} (oddiy, an‘anaviy) va ${b('systemd timer')} (log, bog‘liqlik, o‘tkazib yuborilganni bajarish).</p>
${pre(`# cron: min soat kun oy hafta_kuni
*/5 * * * *  /opt/backup.sh >> /var/log/backup.log 2>&1
crontab -l ; crontab -e ; ls /etc/cron.d

# systemd timer: backup.service + backup.timer
[Timer]
OnCalendar=*-*-* 02:00
Persistent=true          # o'chiq bo'lgan payt o'tkazilgan ishni keyin bajaradi
systemctl enable --now backup.timer
systemctl list-timers ; journalctl -u backup.service`)}
${box('💡 Suhbatda', 'Cron ishlamayapti: cron muhitida <code>PATH</code> qisqa — to‘liq yo‘l yozing; skriptda <code>chmod +x</code>; chiqishni logga yo‘naltiring; <code>%</code> belgisini <code>\\%</code> qiling.')}
<h3>Log rotatsiyasi</h3>${pre(`/var/log/app/*.log {
  daily
  rotate 14
  compress
  missingok
  copytruncate      # yoki postrotate ichida: systemctl kill -s HUP app
}
logrotate -d /etc/logrotate.d/app   # quruq sinov`)}`],
    ['🐧 Linux: foydalanuvchilar, sudo va SELinux', `${pre(`useradd -m -s /bin/bash deploy ; passwd -l deploy   # parolsiz, faqat kalit
usermod -aG docker deploy ; id deploy
visudo -f /etc/sudoers.d/deploy
deploy ALL=(root) NOPASSWD: /usr/bin/systemctl restart app`)}
<p>${b('Least privilege')}: sudo‘ga butun huquq emas, aniq buyruq beriladi. ${c('/etc/sudoers')} faqat ${c('visudo')} bilan tahrirlanadi (sintaksis xatosi sudo‘ni butunlay buzadi).</p>
<h3>SELinux / AppArmor</h3><p>Oddiy huquqlar (DAC) ustidan ${b('majburiy siyosat')} (MAC): process faqat o‘z "yorlig‘i"ga ruxsat berilgan fayl va portga tegadi. RHEL‘da SELinux, Ubuntu‘da AppArmor.</p>
${pre(`getenforce                      # Enforcing / Permissive
ausearch -m avc -ts recent      # nima rad etildi
ls -Z /var/www ; restorecon -Rv /var/www
semanage port -a -t http_port_t -p tcp 8081`)}
${box('⚠️ Klassik holat', 'Huquqlar to‘g‘ri, lekin nginx fayl o‘qiy olmayapti yoki yangi portga bog‘lana olmayapti — bu ko‘pincha SELinux. Uni o‘chirib qo‘yish emas, to‘g‘ri kontekst berish kerak.', true)}`],
    ['🌐 Firewall: iptables, nftables, firewalld', `<p>Linux paket filtri — ${b('netfilter')}. Paket zanjirlardan o‘tadi: ${b('PREROUTING')} → (bizga mo‘ljallangan bo‘lsa) ${b('INPUT')}, (o‘tib ketadigan bo‘lsa) ${b('FORWARD')} → ${b('POSTROUTING')}; mahalliy chiqish — ${b('OUTPUT')}. Jadvallar: ${c('filter')} (ruxsat/rad), ${c('nat')} (DNAT/SNAT), ${c('mangle')}.</p>
${pre(`iptables -L -n -v --line-numbers
iptables -A INPUT -p tcp --dport 22 -s 10.0.0.0/24 -j ACCEPT
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
iptables -P INPUT DROP          # oxirida! avval o'zingizga ruxsat bering
nft list ruleset                # yangi tizimlar nftables ishlatadi
firewall-cmd --add-service=https --permanent && firewall-cmd --reload`)}
${box('⚠️ O‘zingizni qulflab qo‘ymang', 'Masofadagi serverda DROP siyosatidan oldin SSH ruxsatini qo‘shing va <code>at now + 5 min</code> bilan qoidalarni qaytaradigan zaxira rejani qo‘ying.', true)}
<p>Docker va kube-proxy ham iptables‘ga qoida yozadi — shuning uchun ${c('iptables -F')} konteyner tarmog‘ini buzadi.</p>`],
    ['☸️ Kubernetes: RBAC va ServiceAccount', `<p>RBAC to‘rt obyekt: ${b('Role')} (namespace ichidagi ruxsatlar), ${b('ClusterRole')} (klaster bo‘yicha), ${b('RoleBinding')} va ${b('ClusterRoleBinding')} (kimga beriladi). "Kim" — User, Group yoki ${b('ServiceAccount')} (Pod‘ning identifikatori).</p>
${pre(`apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata: { name: pod-reader, namespace: app }
rules:
- apiGroups: [""]
  resources: ["pods", "pods/log"]
  verbs: ["get", "list", "watch"]
---
kind: RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata: { name: ci-reads-pods, namespace: app }
subjects: [{ kind: ServiceAccount, name: ci, namespace: app }]
roleRef: { kind: Role, name: pod-reader, apiGroup: rbac.authorization.k8s.io }

kubectl auth can-i delete pods -n app --as=system:serviceaccount:app:ci`)}
${box('💡 Suhbatda', 'RBAC faqat ruxsat beradi, rad etuvchi qoida yo‘q (default — hammasi taqiqlangan). <code>cluster-admin</code> ni CI yoki ilovaga bermang; Pod uchun <code>automountServiceAccountToken: false</code> — token kerak bo‘lmasa.')}`],
    ['☸️ Kubernetes: NetworkPolicy', `<p>Default holatda ${b('har Pod har Pod bilan gaplasha oladi')}. NetworkPolicy buni cheklaydi — lekin faqat CNI qo‘llab-quvvatlasa (Calico, Cilium; oddiy flannel — yo‘q).</p>
${pre(`# 1) namespace'da hammasini yopish
kind: NetworkPolicy
apiVersion: networking.k8s.io/v1
metadata: { name: default-deny, namespace: app }
spec: { podSelector: {}, policyTypes: [Ingress, Egress] }
---
# 2) faqat api -> db:5432
kind: NetworkPolicy
apiVersion: networking.k8s.io/v1
metadata: { name: db-from-api, namespace: app }
spec:
  podSelector: { matchLabels: { app: db } }
  ingress:
  - from: [{ podSelector: { matchLabels: { app: api } } }]
    ports: [{ port: 5432 }]`)}
${box('⚠️ Klassik xato', 'Egress‘ni yopganda DNS‘ni (kube-system, UDP/TCP 53) ochishni unutish — shunda hamma ulanish "nom topilmadi" bilan yiqiladi.', true)}`],
    ['☸️ Kubernetes: storage — PV, PVC, StorageClass', `<p>${b('PVC')} — Pod "menga 20Gi disk kerak" deydi. ${b('StorageClass')} — qanday disk (SSD, provisioner, ${c('reclaimPolicy')}). ${b('PV')} — haqiqiy disk; dinamik provisioning‘da avtomatik yaratiladi (CSI drayver).</p>
<p>${b('Access mode')}: ${c('RWO')} — bitta node‘da yozish (blok disk, DB uchun), ${c('RWX')} — ko‘p node (NFS, CephFS), ${c('ROX')} — faqat o‘qish. ${b('volumeBindingMode: WaitForFirstConsumer')} — disk Pod qaysi zonaga tushsa o‘sha yerda yaratiladi.</p>
${pre(`kubectl get sc,pv,pvc -A
kubectl describe pvc data-db-0     # Pending sababi: StorageClass yo'q, kvota, zona`)}
${box('⚠️ Ma‘lumot yo‘qotmaslik', '<code>reclaimPolicy: Delete</code> — PVC o‘chirilsa disk ham o‘chadi. Prod DB uchun <code>Retain</code> va muntazam snapshot/backup.', true)}`],
    ['☸️ Kubernetes: workload turlari', `<p>${b('Deployment')} — stateless, almashtiriladigan nusxalar. ${b('StatefulSet')} — barqaror nom (${c('db-0, db-1')}), har biriga o‘z PVC, tartibli ishga tushish/to‘xtash; headless Service bilan ${c('db-0.db.ns.svc')} manzili. ${b('DaemonSet')} — har node‘da bittadan (log agent, CNI, node-exporter). ${b('Job')} — tugaguncha ishlaydigan vazifa (${c('backoffLimit')}, ${c('completions')}). ${b('CronJob')} — jadval bo‘yicha Job (${c('concurrencyPolicy: Forbid')} — ustma-ust ishlamasin).</p>
${pre(`kubectl create job manual-backup --from=cronjob/db-backup   # CronJob'ni qo'lda ishga tushirish
kubectl rollout restart deploy/api                            # konfiguratsiya o'zgarganda`)}`],
    ['☸️ Kubernetes: klaster operatsiyalari — etcd backup va upgrade', `<h3>etcd backup / restore</h3>${pre(`ETCDCTL_API=3 etcdctl snapshot save /backup/etcd-$(date +%F).db \\
  --endpoints=https://127.0.0.1:2379 \\
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\
  --cert=/etc/kubernetes/pki/etcd/server.crt \\
  --key=/etc/kubernetes/pki/etcd/server.key
etcdutl snapshot status /backup/etcd-2026-10-20.db
etcdutl snapshot restore snap.db --data-dir /var/lib/etcd-restore
# so'ng etcd static pod manifestida data-dir yo'lini almashtirish`)}
<h3>kubeadm upgrade tartibi</h3><ol><li>Avval ${b('control plane')}: ${c('kubeadm upgrade plan')} → ${c('kubeadm upgrade apply v1.31.x')}.</li><li>Har node: ${c('kubectl drain node --ignore-daemonsets')} → kubeadm, kubelet, kubectl paketlarini yangilash → ${c('systemctl restart kubelet')} → ${c('kubectl uncordon')}.</li><li>Faqat ${b('bitta minor versiya')} sakrab o‘tiladi (1.29 → 1.30 → 1.31); kubelet API serverdan eski bo‘lishi mumkin, yangi emas.</li></ol>
${box('💡 Sertifikatlar', '<code>kubeadm certs check-expiration</code> — kubeadm sertifikatlari 1 yil amal qiladi; upgrade ularni yangilaydi. Unutilsa bir kuni API server ishlamay qoladi.')}`],
    ['☸️ Kubernetes: Kustomize va Helm amaliyoti', `${pre(`base/              # umumiy manifestlar + kustomization.yaml
overlays/
  dev/kustomization.yaml
  prod/kustomization.yaml   # resources: [../../base], patches, images, replicas

kubectl kustomize overlays/prod | less
kubectl apply -k overlays/prod
helm template app ./chart -f values-prod.yaml   # render qilib ko'rish
helm diff upgrade app ./chart -f values-prod.yaml  # (plugin) nima o'zgaradi
helm history app ; helm rollback app 7`)}
<p>${b('Kustomize')} — shablonsiz: asosga "yamoqlar". ${b('Helm')} — shablon + qiymat + versiyalangan release, tayyor paketlar (ingress-nginx, prometheus-stack). Ko‘p jamoalarda ikkalasi birga: Helm chart‘ni Kustomize/Argo CD bilan muhitga moslash.</p>`],
    ['🐳 Docker: xavfsiz va kichik image', `${pre(`# syntax=docker/dockerfile:1
FROM golang:1.23 AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download                  # kesh: dependency alohida qatlam
COPY . .
RUN CGO_ENABLED=0 go build -o /app ./cmd/api

FROM gcr.io/distroless/static:nonroot
COPY --from=build /app /app
USER nonroot:nonroot
EXPOSE 8080
ENTRYPOINT ["/app"]`)}
<ul><li>${b('Multi-stage')} — compiler yakuniy image‘ga tushmaydi.</li><li>${b('Root emas')} (${c('USER')}), ${c('readOnlyRootFilesystem')}, capability olib tashlash.</li><li>Asos image ${b('aniq teg yoki digest')} bilan; ${c('latest')} emas.</li><li>${c('.dockerignore')} — ${c('.git')}, ${c('.env')}, ${c('node_modules')}.</li><li>Secret build‘ga ${c('--secret')} (BuildKit) bilan, ${c('ARG/ENV')} bilan emas — ular image tarixida qoladi (${c('docker history')}).</li><li>${c('HEALTHCHECK')} va exec form ENTRYPOINT.</li></ul>`],
    ['🌐 Nginx: reverse proxy amaliyoti', `${pre(`upstream api { least_conn; server 10.0.1.11:8080; server 10.0.1.12:8080; keepalive 32; }

server {
  listen 443 ssl http2;
  server_name api.bank.uz;
  ssl_certificate     /etc/ssl/api.crt;
  ssl_certificate_key /etc/ssl/api.key;
  ssl_protocols TLSv1.2 TLSv1.3;

  client_max_body_size 10m;
  limit_req zone=perip burst=20 nodelay;

  location / {
    proxy_pass http://api;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_connect_timeout 3s;
    proxy_read_timeout 30s;
  }
}
server { listen 80; return 301 https://$host$request_uri; }

nginx -t && nginx -s reload       # uzilishsiz qayta yuklash`)}
<p>Xatolar: ${b('413')} — ${c('client_max_body_size')}; ${b('502')} — backend o‘chiq yoki yopiq port; ${b('504')} — ${c('proxy_read_timeout')} oshdi; loglar: ${c('/var/log/nginx/error.log')}.</p>`],
    ['🗄 Ma‘lumotlar bazasi: backup, replikatsiya, DR', `<p>${b('Backup turlari:')} ${b('mantiqiy')} (${c('pg_dump')}, kichik DB, versiyalar orasida ko‘chirish) va ${b('fizik')} (pgBackRest/WAL-G — to‘liq nusxa + ${b('WAL arxivi')} → istalgan sekundgacha tiklash, PITR).</p>
${pre(`pg_dump -Fc -d app -f app.dump && pg_restore -d app_restore app.dump
pgbackrest --stanza=main backup --type=full
pgbackrest --stanza=main restore --type=time --target="2026-10-20 14:30:00"`)}
<p>${b('RPO')} — qancha ma‘lumot yo‘qotishga rozimiz (WAL arxivi bilan — sekundlar). ${b('RTO')} — qancha vaqtda tiklaymiz. ${b('3-2-1 qoidasi')}: 3 nusxa, 2 xil saqlash, 1 tasi boshqa joyda (va immutable).</p>
${box('⚠️ Eng muhim gap', 'Tiklab ko‘rilmagan backup — backup emas. Restore muntazam mashq qilinadi va vaqti o‘lchanadi.', true)}`],
    ['🔁 Git: suhbatda so‘raladigan amaliyot', `${pre(`git log --oneline --graph --all
git cherry-pick <sha>          # bitta commitni boshqa branchga
git rebase -i HEAD~3           # oxirgi 3 commitni birlashtirish/tahrirlash
git reflog                     # "yo'qolgan" commitni topish
git reset --hard <sha>         # lokal tarixni orqaga (umumiy branchda emas!)
git revert <sha>               # umumiy branchda xavfsiz bekor qilish
git stash push -m wip ; git stash pop
git bisect start ; git bisect bad ; git bisect good v1.4   # xato kirgan commitni topish
git commit --amend --no-edit`)}
<p>${b('Branching:')} ${b('trunk-based')} (qisqa branch, tez-tez main‘ga, feature flag) — CI/CD uchun eng mos; ${b('GitFlow')} (develop/release/hotfix) — reliz sikli uzun bo‘lsa. ${b('Pre-commit hook')}: gitleaks, lint, format — commitdan oldin.</p>`],
    ['☁️ Cloud: Yandex Cloud va umumiy prinsiplar', `<p>Mintaqada AWS bilan bir qatorda ${b('Yandex Cloud')} ham ko‘p ishlatiladi. Tushunchalar bir xil, nomlar boshqa: ${b('VPC/Subnet')} ↔ VPC/Subnet; ${b('Compute Cloud')} ↔ EC2; ${b('Object Storage')} ↔ S3 (S3-mos API); ${b('Managed Kubernetes')} ↔ EKS; ${b('IAM, service account')} ↔ IAM role; ${b('Lockbox')} ↔ Secrets Manager; ${b('Network Load Balancer / ALB')} ↔ NLB/ALB; ${b('Security groups')} — bir xil.</p>
<p>${b('Shared responsibility')}: provayder apparat va hipervizorga, siz OS, tarmoq qoidalari, ma‘lumot va IAM‘ga javobgarsiz. ${b('FinOps')}: teglash (kim to‘laydi), right-sizing, avtoskeyl, spot/preemptible, reserved/commit, bo‘sh disk va IP‘larni tozalash, egress trafik narxi.</p>
${box('💡 Suhbatda', 'Bulut qaysi bo‘lishidan qat‘i nazar, javobni prinsip bilan boshlang: tarmoq izolyatsiyasi, minimal IAM, shifrlash, ko‘p AZ, backup, kuzatuv — keyin aniq xizmat nomini ayting.')}`],
    ['🛡 Incident va o‘zgarish boshqaruvi: amaliy shablon', `<h3>Incident paytida (birinchi 15 daqiqa)</h3><ol><li>Alertni ${b('qabul qilish')}, severity (SEV1–SEV3) belgilash, incident kanalini ochish.</li><li>${b('Rollar')}: incident commander, texnik, aloqa uchun mas‘ul.</li><li>${b('Ta‘sir')}: qaysi xizmat, qancha foydalanuvchi, qachondan beri.</li><li>${b('Oxirgi o‘zgarish')}ni tekshirish (deploy, config, infra) — ko‘p incident shundan.</li><li>${b('Tiklash')} sababni topishdan oldin: rollback, feature flag o‘chirish, trafikni burish, masshtab.</li><li>Har 15–30 daqiqada ${b('status xabari')}.</li></ol>
<h3>Postmortem shabloni</h3>${pre(`Xulosa: nima bo'ldi, ta'sir, davomiylik
Vaqt chizig'i: aniqlandi / e'lon qilindi / tiklandi
Asosiy sabab (5 Why) va hissa qo'shgan omillar
Nima yaxshi ishladi / nima yomon
Harakatlar: [egasi] [muddat] [turi: oldini olish | aniqlash | tiklash]`)}
<p>MTTD (aniqlash vaqti), MTTR (tiklash vaqti), change failure rate — DORA bilan birga o‘lchanadi.</p>`],
  ];
  window.GapS = S.map((x) => ({ t: x[0], h: x[1] }));
})();
