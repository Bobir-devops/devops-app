/* arch-questions-3.js — Kubernetes va CI/CD uchun arxitektura savollari. */
(function () {
  const b = (t) => '<strong style="color:var(--ink);font-weight:600">' + t + '</strong>';
  const c = (t) => '<code style="font:500 15px \'IBM Plex Mono\',monospace;color:oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.11 68)">' + t + '</code>';

  const Kubernetes = {
    s1: [
      { q: 'Kubernetes qaysi muammoni hal qiladi — arxitektura nuqtasidan?', a: `U ${b('desired state')} modelini beradi: siz "nima bo‘lishi kerak"ni yozasiz, tizim uni ushlab turadi. Shundan uchta narsa kelib chiqadi — ${b('self-healing')} (o‘lgan nusxa qayta yaratiladi), ${b('rejalashtirish')} (qaysi node‘ga joylashtirish), ${b('deklarativ yangilash')} (rolling update). Qo‘lda boshqaruvda bularning har biri odam ishi edi.` },
      { q: 'Nima uchun Kubernetes "controller loop" ga qurilgan?', a: `Har kontroller ${b('uzluksiz tsikl')}da ishlaydi: desired state‘ni o‘qiydi, actual state bilan solishtiradi, farqni kamaytiradi. Bu ${b('buyruq emas, maqsad')} modeli — vaqtinchalik nosozlikdan keyin tizim o‘zi tiklanadi va bir xil manifestni qayta qo‘llash zarar qilmaydi (idempotent).` },
    ],
    s2: [
      { q: 'Control plane komponentlari qanday vazifa taqsimlagan?', a: `${b('API server')} — yagona kirish nuqtasi, autentifikatsiya va validatsiya. ${b('etcd')} — holat ombori. ${b('Scheduler')} — Pod‘ga node tanlaydi. ${b('Controller manager')} — desired va actual farqini yopadi. Ular ${b('bir-biri bilan to‘g‘ridan gaplashmaydi')} — hammasi API server orqali, shuning uchun tizim kengaytiriladigan bo‘ladi.` },
      { q: 'API server nega yagona kirish nuqtasi qilingan?', a: `Chunki ${b('autentifikatsiya, avtorizatsiya (RBAC), admission va validatsiya')} bitta joyda bo‘lishi kerak — aks holda har komponent o‘zicha tekshirardi. Bundan tashqari etcd‘ga faqat API server yozadi, ya‘ni ${b('holat yaxlitligi')} saqlanadi. Narxi: API server ishlamasa boshqaruv to‘xtaydi (lekin ishlab turgan Pod‘lar davom etadi).` },
    ],
    s3: [
      { q: 'Kubelet node‘da qanday ishlaydi?', a: `Kubelet API server‘dan ${b('shu node‘ga tayinlangan')} Pod‘lar ro‘yxatini oladi va konteyner runtime‘iga ularni ishga tushirishni buyuradi. So‘ng ${b('holatni qaytarib')} yuboradi: tirikmi, ready‘mi, restart bo‘ldimi. U ${b('probe')}larni ham o‘zi bajaradi. Ya‘ni kubelet — node‘dagi ${b('kichik kontroller')}.` },
      { q: 'Node NotReady bo‘lganda Pod‘lar nega darhol ko‘chmaydi?', a: `Kubelet holat yubormay qo‘ysa control plane ${b('vaqtinchalik uzilishmi yoki haqiqiy nosozlikmi')} bilmaydi. Shuning uchun toleration timeout kutiladi (odatda 5 daqiqa), keyin Pod‘lar evict qilinadi. Bu ${b('ataylab')}: tarmoq bir soniya uzilganda butun klaster Pod‘larni ko‘chira boshlasa, holat battar bo‘lardi.` },
    ],
    s4: [
      { q: 'kubectl apply so‘rovi qanday bosqichlardan o‘tadi?', a: `${b('Autentifikatsiya')} (kimsan) → ${b('avtorizatsiya')} (RBAC: huquqing bormi) → ${b('admission')} (mutating: default qo‘shish; validating: qoidaga mos keladimi) → ${b('validatsiya')} (sxema) → ${b('etcd‘ga yozish')}. Shundan keyingina kontrollerlar o‘zgarishni ko‘radi. Har bosqichda so‘rov rad etilishi mumkin va xato matni qaysi bosqich ekanini aytadi.` },
      { q: 'Admission controller nima uchun kerak?', a: `U ${b('yozishdan oldin')} aralashadi: yetishmayotgan qiymatni qo‘yadi (sidecar, default resurs) yoki qoidaga mos kelmasa rad etadi (root‘siz ishlash, teg majburiyligi, limitlar). Foydasi — siyosat ${b('markazda')} amalga oshadi, har jamoa o‘z manifestida eslab qolishiga tayanmaydi.` },
    ],
    s5: [
      { q: 'etcd nima saqlaydi va nega u kritik?', a: `etcd — klasterning ${b('yagona haqiqat ombori')}: hamma obyekt (Deployment, Service, Secret, holat) shunda. U ${b('Raft')} bilan ishlaydi, ya‘ni yozish uchun ${b('quorum')} kerak. Yo‘qolsa klaster tuzilishi yo‘qoladi — shuning uchun snapshot backup va restore mashqi alohida jarayon sifatida yuritiladi.` },
      { q: 'Uch node‘li etcd nima uchun ikkitadan yaxshi?', a: `Quorum ${b('yarmidan ko‘pi')} demak: uch node‘da 2 ta yetadi, ya‘ni ${b('bitta yo‘qolsa ham')} klaster yozishda davom etadi. Ikki node‘da quorum ham 2 — bittasi o‘lsa yozish to‘xtaydi, ya‘ni ishonchlilik oshmaydi. Shuning uchun toq son tanlanadi: 3 yoki 5.` },
    ],
    s6: [
      { q: 'Scheduler node‘ni qanday tanlaydi?', a: `Ikki bosqich: ${b('filtrlash')} — mos kelmaydigan node‘lar chiqarib tashlanadi (resurs yetmaydi, taint bor, nodeSelector mos emas, volume zonasi boshqa); ${b('ballash')} — qolganlari orasidan eng yaxshisi tanlanadi (bo‘sh resurs, tarqoqlik, image mavjudligi). Natija Pod‘ga ${b('nodeName')} sifatida yoziladi va kubelet ishni davom ettiradi.` },
      { q: 'Pending Pod nimani anglatadi va sabablari qanday guruhlanadi?', a: `Pending — ${b('hali node tanlanmagan')}. Sabablari uch guruh: ${b('resurs')} (request sig‘maydi), ${b('cheklov')} (taint/toleration, affinity, nodeSelector), ${b('bog‘liqlik')} (PVC bog‘lanmagan, image pull secret yo‘q). Aniq sabab ${c('kubectl describe pod')} hodisalarida yoziladi — taxmin qilish shart emas.` },
    ],
    s7: [
      { q: 'Pod nima uchun eng kichik birlik — konteyner emas?', a: `Pod ichidagi konteynerlar ${b('tarmoq va storage namespace‘ini')} baham ko‘radi: bir xil IP, ichida ${c('localhost')} ishlaydi, umumiy volume. Bu ${b('yordamchi konteyner')} (log yig‘uvchi, proxy) asosiy dastur bilan yonma-yon ishlashiga imkon beradi. Shuning uchun rejalashtirish va o‘lchov birligi — Pod.` },
      { q: 'Pod‘ni to‘g‘ridan yaratish nega tavsiya etilmaydi?', a: `Yalang‘och Pod‘ni ${b('hech kim kuzatmaydi')} — o‘lsa qayta yaratilmaydi, node yo‘qolsa u ham ketadi, yangilash imkoni yo‘q. Deployment esa ReplicaSet orqali ${b('nusxalar sonini ushlab turadi')} va rolling update beradi. Yalang‘och Pod faqat vaqtinchalik tekshiruv uchun.` },
    ],
    s8: [
      { q: 'Taint va toleration mexanizmi qanday ishlaydi?', a: `${b('Taint')} node‘ga qo‘yiladi — "menga hamma kelmasin". ${b('Toleration')} Pod‘da bo‘ladi — "men bu taint‘ga chidayman". Effektlar: ${c('NoSchedule')} (yangi Pod kelmaydi), ${c('PreferNoSchedule')} (imkon qadar), ${c('NoExecute')} (mavjudlari ham chiqariladi). Bu ${b('node‘ni ajratib qo‘yish')} mexanizmi — GPU, alohida ish turi, texnik xizmat.` },
      { q: 'nodeSelector, affinity va taint qaysi masalani hal qiladi?', a: `${b('nodeSelector/affinity')} — Pod tomonidan ${b('tanlov')}: men filan node‘da bo‘lay. ${b('Taint')} — node tomonidan ${b('rad etish')}: menga faqat ruxsat berilgan kelsin. Ya‘ni biri tortadi, ikkinchisi itaradi. To‘liq ajratish uchun ko‘pincha ikkisi birga ishlatiladi.` },
    ],
    s9: [
      { q: 'CrashLoopBackOff nomining o‘zi nimani tushuntiradi?', a: `Konteyner ishga tushib ${b('darhol yiqilyapti')}, kubelet uni qayta ishga tushirmoqda, lekin har urinishdan keyin ${b('kutish vaqtini oshirmoqda')} (backoff). Ya‘ni bu ${b('holat emas, tsikl')} — sabab har doim dastur ichida: konfiguratsiya yo‘q, bog‘liqlik javob bermayapti, migratsiya yiqilgan. Log ${c('--previous')} bilan o‘qiladi, chunki hozirgi konteyner yangi.` },
      { q: 'ImagePullBackOff bilan CrashLoop farqi arxitektura jihatidan nimada?', a: `${b('ImagePullBackOff')} — konteyner ${b('umuman boshlanmadi')}: teg noto‘g‘ri, registry manzili xato yoki ${c('imagePullSecret')} yo‘q. Muammo ${b('kubelet va registry')} orasida. ${b('CrashLoop')} — konteyner boshlandi va yiqildi, muammo ${b('dastur ichida')}. Shuning uchun birinchisida log yo‘q, ikkinchisida log bor.` },
    ],
    s10: [
      { q: 'Deployment → ReplicaSet → Pod zanjiri nima uchun uch qavat?', a: `${b('Deployment')} yangilash strategiyasini va tarixni boshqaradi. Har yangi versiya uchun ${b('yangi ReplicaSet')} yaratiladi, eskisi 0 ga tushiriladi, lekin ${b('saqlanadi')} — shuning uchun rollback tez. ${b('ReplicaSet')} esa faqat bitta ishni qiladi: nusxalar sonini ushlab turish. Vazifalar ajratilgani uchun har qatlam sodda va ishonchli.` },
      { q: 'maxSurge va maxUnavailable nimani boshqaradi?', a: `${b('maxSurge')} — yangilash paytida ${b('qo‘shimcha')} nechta Pod yaratish mumkin; ${b('maxUnavailable')} — nechtasi ${b('vaqtincha yo‘q')} bo‘lishi mumkin. Ikkisi birga ${b('tezlik va sig‘im')} kompromisi: surge katta bo‘lsa tez, lekin ko‘proq resurs kerak; unavailable 0 bo‘lsa uzilishsiz, lekin sekin.` },
    ],
    s11: [
      { q: 'Self-healing qanday amalga oshadi — kim nima qiladi?', a: `${b('Kubelet')} konteyner o‘lsa uni qayta ishga tushiradi (restartPolicy). ${b('ReplicaSet kontrolleri')} Pod butunlay yo‘qolsa yangisini yaratadi. ${b('Node kontrolleri')} node NotReady bo‘lsa Pod‘larni evict qiladi. Uch qatlam turli nosozlik darajasiga javob beradi — shuning uchun "Pod o‘chirdim, qaytib keldi" normal xulq.` },
      { q: 'Nega Pod‘ni o‘chirish "tuzatish" usuli sifatida xavfli?', a: `Chunki u ${b('simptomni')} yo‘qotadi, sababni emas — yangi Pod ham o‘sha konfiguratsiya bilan ko‘tariladi. Bundan tashqari o‘chirish ${b('dalilni yo‘qotadi')}: log va holat ketadi. To‘g‘ri tartib — avval ${c('describe')} va ${c('logs --previous')} bilan sababni yozib olish, keyin harakat qilish.` },
    ],
    s12: [
      { q: 'Service ClusterIP haqiqatda qanday ishlaydi?', a: `ClusterIP ${b('hech qaysi interfeysda yo‘q')} — u virtual manzil. Har node‘da kube-proxy ${b('iptables yoki IPVS qoidalari')}ni yozadi: shu manzilga kelgan paket ${b('DNAT')} bilan sog‘lom Pod IP‘siga o‘giriladi. Shuning uchun Service — alohida process emas, ${b('qoidalar to‘plami')}, va u o‘lmaydi.` },
      { q: 'Service turlarini qanday tanlaysiz?', a: `${b('ClusterIP')} — faqat klaster ichida (default, ichki xizmatlar). ${b('NodePort')} — har node‘da port ochiladi, sinov yoki tashqi LB orqasi uchun. ${b('LoadBalancer')} — bulut provayderidan tashqi balanser so‘raydi. ${b('Ingress')} esa Service emas: bitta kirish nuqtasidan ${b('L7 marshrutlash')} beradi va ko‘p domenni bitta manzilda birlashtiradi.` },
    ],
    s13: [
      { q: 'Endpoints obyekti nimani anglatadi va nega birinchi tekshiriladi?', a: `Endpoints — Service selector‘iga ${b('mos kelgan va ready bo‘lgan')} Pod IP‘lari ro‘yxati. U bo‘sh bo‘lsa Service ${b('hech qayerga trafik yubormaydi')}. Bo‘shligi ikki sababni tezda ajratadi: label mos kelmayapti yoki Pod‘lar ready emas. Shuning uchun Service nosozligida birinchi buyruq — ${c('kubectl get endpoints')}.` },
      { q: 'Label va selector modeli nimani beradi?', a: `Kubernetes obyektlarni ${b('nom bilan emas, yorliq bilan')} bog‘laydi — bu bo‘shashgan bog‘lanish (loose coupling). Shuning uchun Pod‘lar almashsa ham Service o‘zgarmaydi, canary uchun bir xil yorliqli ikki to‘plam qo‘yish mumkin. Narxi: ${b('yozuv xatosi jim qoladi')} — hech narsa buzilmaydi, shunchaki hech narsa topilmaydi.` },
    ],
    s14: [
      { q: 'Kubernetes DNS qanday qurilgan?', a: `${b('CoreDNS')} klaster ichida Pod sifatida ishlaydi va Service nomlarini ClusterIP‘ga aylantiradi. Har Pod‘ning ${c('/etc/resolv.conf')} fayliga CoreDNS manzili va ${b('search domenlari')} yoziladi — shuning uchun ${c('backend')} deb yozish ${c('backend.namespace.svc.cluster.local')} ga kengayadi. Ya‘ni nom qisqa bo‘lishi search ro‘yxati hisobiga.` },
      { q: 'Nega DNS nosozligi butun klasterga tarqaladi?', a: `Chunki har xizmat boshqasiga ${b('nom orqali')} murojaat qiladi. CoreDNS sekinlashsa yoki yiqilsa, hamma ulanish ${b('nom yechish bosqichida')} kutib qoladi — natija "hamma narsa sekin" bo‘lib ko‘rinadi, lekin sabab bitta joyda. Shuning uchun CoreDNS bir necha nusxada ishlaydi va alohida kuzatiladi.` },
    ],
    s15: [
      { q: 'Uch probe turi qaysi savolga javob beradi?', a: `${b('Startup')} — "hali ko‘tarilyaptimi?" sekin startga vaqt beradi va shu davrda boshqa probe‘larni to‘xtatadi. ${b('Readiness')} — "trafik bersa bo‘ladimi?" yiqilsa Pod endpoints‘dan chiqariladi, lekin o‘ldirilmaydi. ${b('Liveness')} — "tirikmi?" yiqilsa konteyner ${b('qayta ishga tushiriladi')}. Uchtasi turli harakatga olib keladi.` },
      { q: 'Readiness va liveness‘ni chalkashtirish nimaga olib keladi?', a: `Agar liveness bog‘liq xizmatni tekshirsa (masalan DB), DB vaqtincha sekinlashganda ${b('sog‘lom Pod‘lar ham qayta ishga tushiriladi')} — bu holatni yomonlashtiradi. To‘g‘ri taqsimot: liveness faqat ${b('dasturning o‘zi qotib qolganini')} tekshiradi, tashqi bog‘liqlik readiness‘da baholanadi.` },
    ],
    s16: [
      { q: 'Probe parametrlari qanday kompromis yaratadi?', a: `${b('periodSeconds')} va ${b('timeoutSeconds')} — tez sezish uchun kichik, lekin yuk ostida ${b('yolg‘on signal')} beradi. ${b('failureThreshold')} — katta bo‘lsa barqaror, lekin nosozlikni kech sezadi. ${b('initialDelay')} yoki startup probe — sekin ko‘tariladigan dastur uchun majburiy. Ya‘ni tanlov: tez sezish va barqarorlik o‘rtasida.` },
      { q: 'Probe endpoint‘i nimani tekshirishi kerak?', a: `Yengil va ${b('o‘z holatiga')} qaraydigan tekshiruv: process javob beradimi, ichki navbat to‘lib ketmaganmi. U ${b('og‘ir so‘rov qilmasligi')} kerak — har necha sekundda DB‘ga murojaat qilsa yuk ortadi va bog‘liqlik nosozligi noto‘g‘ri talqin qilinadi. Odatda ${c('/healthz')} (liveness) va ${c('/ready')} (readiness) ajratiladi.` },
    ],
    s17: [
      { q: 'ConfigMap va Secret arxitekturada qanday joylashadi?', a: `Ikkisi ham ${b('konfiguratsiyani image‘dan ajratadi')} — shuning uchun bir xil image dev va prod‘da ishlaydi. Pod‘ga ${b('env sifatida')} yoki ${b('fayl sifatida')} ulanadi. Farqi: Secret base64‘da saqlanadi va RBAC bilan chegaralanadi, ammo ${b('o‘zi shifrlash emas')} — etcd shifrlash alohida yoqiladi.` },
      { q: 'Konfiguratsiya o‘zgarganda Pod nega avtomatik yangilanmaydi?', a: `Env sifatida berilgan qiymat ${b('process ishga tushganda')} o‘qiladi — keyin o‘zgarmaydi. Fayl sifatida ulangan ConfigMap yangilanadi, lekin ${b('dastur uni qayta o‘qishi')} kerak. Shuning uchun amalda rollout qayta ishga tushiriladi yoki manifestga konfiguratsiya hash‘i qo‘yiladi — shunda Pod shablon o‘zgaradi va yangilanish o‘zi boshlanadi.` },
    ],
    s18: [
      { q: 'External secret modeli nima beradi?', a: `Sir ${b('tashqi omborda')} (Vault, cloud secret manager) turadi, klasterda faqat ${b('unga ishora')} yoziladi; kontroller uni o‘qib Secret obyektini yaratadi. Foydasi: sir ${b('Git‘ga tushmaydi')}, rotatsiya markazda bo‘ladi, audit bitta joyda. Narxi: qo‘shimcha bog‘liqlik — ombor yiqilsa yangi Pod sir ololmaydi.` },
      { q: 'Secret‘ni env va fayl sifatida berish qaysi biri xavfsizroq?', a: `${b('Fayl')} — ko‘pincha yaxshiroq: env o‘zgaruvchilari ${b('process ro‘yxatida')}, crash dump‘da va bola process‘larda oshkor bo‘lishi mumkin, loglarga ham tushib ketadi. Fayl esa huquq bilan chegaralanadi va ${b('yangilanishi')} mumkin. Shuning uchun sertifikat va kalitlar fayl orqali beriladi.` },
    ],
    s19: [
      { q: 'Request va limit rejalashtirishga qanday ta‘sir qiladi?', a: `${b('Request')} — rejalashtirishda ishlatiladigan ${b('kafolat')}: scheduler node‘da shuncha bo‘sh joy borligiga qaraydi. ${b('Limit')} — ish vaqtidagi ${b('shift')}: oshsa CPU throttling, xotira esa OOMKill. Request juda katta bo‘lsa Pod joylashmaydi, juda kichik bo‘lsa node haddan tashqari zichlanadi va hammasi sekinlashadi.` },
      { q: 'QoS sinflari qanday belgilanadi va nega muhim?', a: `${b('Guaranteed')} — request = limit (hamma resurs uchun); ${b('Burstable')} — request bor, limit katta; ${b('BestEffort')} — hech narsa yo‘q. Node xotirasi tugaganda ${b('BestEffort birinchi')} chiqariladi, Guaranteed oxirida. Shuning uchun muhim xizmatga aniq request/limit yozish — bu ham ustuvorlik belgisi.` },
    ],
    s20: [
      { q: 'Node‘ni texnik xizmatga chiqarish tartibi qanday?', a: `${c('cordon')} — node ${b('yangi Pod qabul qilmaydi')}, lekin ishlayotganlari qoladi. ${c('drain')} — mavjud Pod‘larni ${b('ko‘chiradi')} (PDB va graceful shutdown hisobga olinadi). Ish tugagach ${c('uncordon')}. Bu tartib uzilishsiz yangilash uchun: avval oqim to‘xtatiladi, keyin bo‘shatiladi.` },
      { q: 'PodDisruptionBudget qanday himoya beradi?', a: `PDB ${b('ixtiyoriy uzilish')} paytida (drain, node yangilash) bir vaqtda nechta Pod yo‘qolishi mumkinligini cheklaydi — masalan "kamida 2 ta ishlab tursin". Drain shu shartni buzsa ${b('kutib turadi')}. Muhim: PDB ${b('to‘satdan nosozlikni')} to‘smaydi, faqat rejalashtirilgan harakatni cheklaydi.` },
    ],
    s21: [
      { q: 'Tashqi so‘rov Pod‘gacha qanday yetib boradi?', a: `${b('DNS')} → tashqi ${b('load balancer')} → ${b('Ingress controller')} (TLS tugatish, host va yo‘l bo‘yicha marshrutlash) → ${b('Service')} (ClusterIP, kube-proxy qoidasi) → ${b('Pod')} → konteyner porti. Har bo‘g‘in alohida buziladi va alohida xato beradi — shuning uchun tashxis shu zanjir bo‘ylab olib boriladi.` },
      { q: 'Ingress va Service vazifalari nega ajratilgan?', a: `${b('Service')} — L4: ichki barqaror manzil va sog‘lom Pod‘larga taqsimlash. ${b('Ingress')} — L7: bitta tashqi manzildan ko‘p xizmatga marshrutlash, TLS, host va yo‘l qoidalari. Ajratish har xizmatga alohida tashqi balanser (va IP) olishning oldini oladi — ${b('arzon va boshqariladigan')} bo‘ladi.` },
    ],
    s22: [
      { q: 'Service ishlamaganda tekshiruv zanjiri qanday?', a: `${b('Nom')} yechiladimi → ${b('selector')} Pod yorlig‘iga mos keladimi → ${b('endpoints')} bo‘shmi → ${b('readiness')} o‘tyaptimi → ${b('port/targetPort')} to‘g‘rimi → dastur ${b('0.0.0.0')}da eshityaptimi → ${b('NetworkPolicy')} to‘smayaptimi. Yetti bo‘g‘in, har biri bitta buyruq — va aksariyat holat uchinchi qadamda hal bo‘ladi.` },
      { q: 'Nima uchun aksariyat Service muammosi label yoki readiness bilan bog‘liq?', a: `Chunki bog‘lanish ${b('yorliq mosligiga')} tayanadi va yozuv xatosi ${b('jim')} o‘tadi — Kubernetes xato bermaydi, shunchaki hech narsa topilmaydi. Readiness esa ${b('endpoints tarkibini')} boshqaradi: probe yiqilsa Pod tirik bo‘lsa ham ro‘yxatdan chiqadi. Ikkisi ham bitta belgini beradi — bo‘sh endpoints.` },
    ],
    s23: [
      { q: 'Kubernetes mental modelini qisqacha qanday tuzasiz?', a: `Uch halqa: ${b('e‘lon')} (manifest — nima bo‘lishi kerak), ${b('saqlash')} (API server va etcd), ${b('bajarish')} (scheduler, kontrollerlar, kubelet). Ustiga ${b('tarmoq')} (Service, DNS, Ingress) va ${b('konfiguratsiya')} (ConfigMap, Secret, resurs) qo‘shiladi. Har nosozlik shu halqalardan birida bo‘ladi — shuning uchun avval qaysi halqa ekani aniqlanadi.` },
      { q: 'Kubernetes nimalarni o‘zi hal qilmaydi?', a: `U ${b('dastur mantiqini')} tuzatmaydi: xato kod har qancha qayta ishga tushsa ham xato qolaveradi. ${b('Ma‘lumot bazasi migratsiyasi')}, ${b('sekin so‘rov')}, ${b('noto‘g‘ri konfiguratsiya')} ham uning ishi emas. U faqat ${b('desired state‘ni ushlab turadi')} — shuning uchun kuzatuv va test hali ham zarur.` },
    ],
  };

  const CICD = {
    s1: [
      { q: 'Git nima uchun taqsimlangan tizim va bu nima beradi?', a: `Har nusxada ${b('to‘liq tarix')} bor — server nusxasi shunchaki kelishilgan markaz. Shuning uchun offline ishlash, tez tarmoqsiz commit, va serverni yo‘qotsangiz ham tarixni tiklash mumkin. Narxi: "commit qildim" ${b('boshqalar ko‘rdi degani emas')} — push alohida qadam.` },
      { q: 'Git ma‘lumotni qanday saqlaydi — diff‘mi yoki snapshot?', a: `Git har commitda ${b('to‘liq snapshot')} saqlaydi (o‘zgarmagan fayllar uchun avvalgi obyektga ishora qiladi), diff esa ${b('ko‘rsatish paytida hisoblanadi')}. Shuning uchun istalgan commitga o‘tish tez va tarixni "yig‘ish" kerak emas. Har obyekt mazmun hash‘i bilan aniqlanadi — bu ${b('yaxlitlikni')} ta‘minlaydi.` },
    ],
    s2: [
      { q: 'Commit nima uchun "qaytib boradigan nuqta" deb qaraladi?', a: `Har commit ${b('holatning to‘liq surati')} va ${b('otasiga ishora')}ga ega — shuning uchun tarix zanjir hosil qiladi. Bitta mantiqiy o‘zgarish bo‘lsa uni ${b('yolg‘iz qaytarish')} yoki boshqa branchga ko‘chirish mumkin. Aralash commit esa bu imkonni yo‘qotadi: kerakli qismni ajratib bo‘lmaydi.` },
      { q: 'Commit xabari nega "nega" ni tushuntirishi kerak?', a: `${b('Nima o‘zgargani')}ni diff allaqachon ko‘rsatadi. Olti oydan keyin kerak bo‘ladigan ma‘lumot — ${b('qaysi muammoni hal qilgani va nima uchun shu yo‘l')} tanlangani. Bu incident paytida ${c('git log')} ni tashxis vositasiga aylantiradi: o‘zgarish sababini o‘qib, xato qaysi qaror bilan kirganini topasiz.` },
    ],
    s3: [
      { q: 'Branch nima uchun "arzon" va bu ish uslubiga qanday ta‘sir qiladi?', a: `Branch — bu shunchaki ${b('commitga ko‘rsatgich')} (bitta fayl), nusxa emas. Shuning uchun yaratish bir zumda bo‘ladi va har vazifa uchun alohida branch olish odatiy. Natijada ${b('main doim ishlaydigan holatda')} qoladi, ish esa parallel boradi.` },
      { q: 'Uzoq yashaydigan branch nega muammo tug‘diradi?', a: `Vaqt o‘tgan sari u main‘dan uzoqlashadi va birlashtirish ${b('katta va xavfli')} bo‘ladi: ko‘p konflikt, tekshirish qiyin, xato qayerdan kirganini aniqlash mushkul. Shuning uchun CI falsafasi ${b('kichik va tez-tez integratsiya')}ni talab qiladi — kichik o‘zgarish, kichik xato maydoni.` },
    ],
    s4: [
      { q: 'Merge va rebase tarixga qanday ta‘sir qiladi?', a: `${b('Merge')} ikki tarixni birlashtiradi va ${b('birlashtiruvchi commit')} qo‘shadi — tarix qanday bo‘lgan shundayligicha qoladi, tarmoqlar ko‘rinadi. ${b('Rebase')} commitlarni yangi asos ustiga ${b('qayta yozadi')} — tarix tekis bo‘ladi, lekin identifikatorlar o‘zgaradi. Shuning uchun umumiy branchda rebase boshqalarning nusxasini buzadi.` },
      { q: 'Konflikt nima uchun paydo bo‘ladi va Git nega o‘zi hal qilmaydi?', a: `Git matn qatorlarini solishtiradi va ${b('bir joyni ikki tomon boshqacha o‘zgartirgan')} bo‘lsa qaysi biri to‘g‘ri ekanini bilmaydi — bu ${b('mantiqiy qaror')}, texnik emas. Shuning uchun u to‘xtab sizdan so‘raydi. Konflikt hal qilingandan keyin ${b('test ishlatish shart')}: sintaksis to‘g‘ri bo‘lsa ham mantiq buzilgan bo‘lishi mumkin.` },
    ],
    s5: [
      { q: 'CI pipeline bosqichlari nega aynan shu tartibda?', a: `${b('Arzon tekshiruv oldinda')}: lint sekundlarda, unit test daqiqalarda, integratsiya testi va image build eng qimmat. Har bosqich ${b('keyingisining kirish sharti')} — lint yiqilsa build qilishning ma‘nosi yo‘q. Natijada ishlab chiquvchi ${b('tez qaytish')} oladi va runner vaqti tejaladi.` },
      { q: 'CI nima uchun "erta topish" falsafasiga qurilgan?', a: `Xatoni topish narxi vaqt bilan ${b('keskin oshadi')}: lokal — daqiqalar, CI — soatlar, production — obro‘ va pul. Shuning uchun tekshiruvlar imkon qadar chapga suriladi (shift-left) va integratsiya tez-tez bo‘ladi: kichik o‘zgarish — ${b('kichik qidiruv maydoni')}.` },
    ],
    s6: [
      { q: 'Delivery va Deployment o‘rtasidagi chegara nimani anglatadi?', a: `${b('Delivery')} — artifact ${b('doim chiqarishga tayyor')}, lekin oxirgi tugmani odam bosadi (biznes qarori, release oynasi). ${b('Deployment')} — o‘sha tugma ham avtomatlashtirilgan. Ikkinchisi ${b('testga ishonch')} va ${b('tez rollback')} bo‘lgandagina mantiqiy — aks holda avtomatlashtirish xatoni tezroq tarqatadi.` },
      { q: 'Muhitlar (dev/stage/prod) nima uchun kerak va nima umumiy bo‘lishi shart?', a: `Har muhit boshqa ${b('risk darajasi')}: dev‘da buzilish arzon, prod‘da qimmat. Shart: ${b('bir xil artifact')} uchalasidan o‘tishi, faqat ${b('konfiguratsiya')} farq qilishi. Aks holda stage‘dagi test natijasi prod uchun hech narsani isbotlamaydi.` },
    ],
    s7: [
      { q: 'Immutable artifact tamoyili nima beradi?', a: `Bir marta yasalgan natija ${b('o‘zgarmaydi')} va hamma muhitga o‘sha boradi. Foydasi: stage‘da sinalgan narsa prod‘ga aynan chiqadi, ${b('rollback')} uchun aniq nuqta bor, va "menda ishlagan edi" muammosi yo‘qoladi. Qayta build qilish esa jimgina boshqa natija berishi mumkin — kutubxona versiyasi, asos image o‘zgargan bo‘ladi.` },
      { q: 'Artifact versiyasi qanday belgilanishi kerak?', a: `${b('O‘zgarmas va izlanadigan')}: Git SHA (${c('backend:8f31c2a')}) yoki semantik versiya. Shunda prod‘dagi teg ${b('qaysi kod')} ekanini bir qarashda aytadi. ${c('latest')} — o‘zgaruvchi ko‘rsatgich: qaysi image ekani noma‘lum va rollback uchun qaytadigan nuqta yo‘q.` },
    ],
    s8: [
      { q: 'CI image build qilganda kesh qanday ishlatiladi?', a: `Docker qatlamlarni ${b('hash bo‘yicha')} keshlaydi — o‘zgarmagan qadam qaytadan bajarilmaydi. CI‘da bu kesh ${b('runnerlar orasida')} saqlanishi kerak (registry cache yoki build cache), aks holda har build noldan boshlanadi. Shuning uchun Dockerfile tartibi CI tezligiga to‘g‘ridan ta‘sir qiladi.` },
      { q: 'Build reproducibility nega muhim?', a: `Bir xil kirishdan ${b('bir xil natija')} chiqishi kerak: asos image digest bilan qadalgan, dependency lock faylda, build vaqtida "eng yangi"ni internetdan olinmaydi. Shunda kechagi build‘ni bugun takrorlash mumkin va ${b('tekshiruv natijalari ishonchli')} bo‘ladi — aks holda xato qayerdan kelganini aniqlab bo‘lmaydi.` },
    ],
    s9: [
      { q: 'Registry pipeline va klaster orasida qanday rol o‘ynaydi?', a: `U ${b('ajratuvchi ombor')}: CI faqat ${b('yozadi')} (push), klaster faqat ${b('o‘qiydi')} (pull). Shuning uchun huquqlar ham shunday bo‘linadi va deploy paytida kod qayta build qilinmaydi. Registry ishlamasa yangi Pod ko‘tarilmaydi — bu ${b('kritik bog‘liqlik')}, shuning uchun u ham monitoringga qo‘yiladi.` },
      { q: 'Image pull xatolari nega alohida sinf?', a: `Ular ${b('dastur ishga tushishidan oldin')} yuz beradi: teg noto‘g‘ri, registry manzili xato, autentifikatsiya yo‘q, yoki rate limit. Shuning uchun log bo‘lmaydi va tashxis faqat hodisalarda ko‘rinadi (${c('ImagePullBackOff')}). Oldini olish: aniq teg, ${c('imagePullSecret')} va o‘z registry keshi.` },
    ],
    s10: [
      { q: 'GitOps push va pull modelidan qaysi biri va nega?', a: `GitOps — ${b('pull')}: kontroller klaster ichida turib Git‘ni o‘qiydi. Foydasi — ${b('klaster kaliti tashqariga chiqmaydi')} (CI‘da kubeconfig saqlanmaydi) va qo‘lda qilingan o‘zgarish ${b('avtomatik qaytariladi')}. Push modelida esa pipeline klasterga kiradi — sodda, lekin kalit boshqaruvi va drift muammosi qoladi.` },
      { q: 'Desired state Git‘da bo‘lishi nimalarni beradi?', a: `${b('Tarix va javobgarlik')} (kim, qachon, nega — commitda), ${b('ko‘rik')} (pull request orqali), ${b('rollback')} (eski commitga qaytish), va ${b('qayta tiklash')} (yangi klasterni o‘sha repodan yig‘ish). Ya‘ni infratuzilma boshqaruvi oddiy dasturiy ta‘minot jarayoniga aylanadi.` },
    ],
    s11: [
      { q: 'Argo CD reconcile tsikli qanday ishlaydi?', a: `U Git‘dagi ${b('target state')}ni va klasterdagi ${b('live state')}ni davriy solishtiradi. Farq bo‘lsa holat ${c('OutOfSync')} bo‘ladi va farq ro‘yxati ko‘rsatiladi. Avtomatik sync yoqilgan bo‘lsa o‘zi qo‘llaydi, aks holda odam tasdiqlaydi. Shuning uchun drift ${b('ko‘rinadi va tuzatiladi')}.` },
      { q: 'Helm va Kustomize qaysi masalani hal qiladi?', a: `Ikkisi ham ${b('bir manifestni ko‘p muhitga')} moslash muammosini yechadi. ${b('Helm')} — shablon va qiymatlar (values), paket sifatida versiyalanadi va release tarixini yuritadi. ${b('Kustomize')} — shablonsiz: asos manifestga ${b('overlay')} qo‘shadi. Helm murakkab paketlar uchun, Kustomize sodda farqlar uchun qulay.` },
    ],
    s12: [
      { q: 'Deployment strategiyasini qaysi mezonlar bo‘yicha tanlaysiz?', a: `Uch mezon: ${b('xato narxi')}, ${b('mavjud resurs')}, ${b('qaytish tezligi')}. Rolling — arzon, lekin ikki versiya birga ishlaydi. Blue-green — bir zumda qaytadi, lekin resurs ikki barobar. Canary — eng xavfsiz, lekin ${b('trafik boshqaruvi va metrika')} talab qiladi. Recreate — uzilishga ruxsat bo‘lganda.` },
      { q: 'Ikki versiya bir vaqtda ishlashi qanday talab qo‘yadi?', a: `Rolling va canary paytida eski va yangi kod ${b('bir xil ma‘lumot bazasi')} bilan ishlaydi. Shuning uchun o‘zgarish ${b('orqaga mos')} bo‘lishi kerak: yangi ustun qo‘shiladi, eskisi darhol o‘chirilmaydi; API‘da yangi maydon ixtiyoriy bo‘ladi. Aks holda yangilash paytida xatolar chiqadi.` },
    ],
    s13: [
      { q: 'Rollback nima uchun har doim ham yetarli emas?', a: `Kod qaytadi, ${b('ma‘lumot qaytmaydi')}: yangi versiya allaqachon yangi formatda yozgan bo‘lishi mumkin. Bundan tashqari tashqi tizimga yuborilgan xabar yoki to‘lov ${b('qaytarib olinmaydi')}. Shuning uchun rollback — tiklanish vositasi, lekin migratsiya va tashqi ta‘sir alohida rejalashtiriladi.` },
      { q: 'Incidentda qadamlar tartibi qanday bo‘lishi kerak?', a: `Avval ${b('tiklanish')} (rollback yoki trafikni qaytarish) — mijoz kutmasligi kerak; keyin ${b('barqarorlashtirish')}; so‘ng ${b('sabab tahlili')} va nihoyat ${b('oldini olish')} (test, alert, jarayon). Sababni birinchi qidirish — eng ko‘p uchraydigan xato: uzilish vaqti behuda cho‘ziladi.` },
    ],
    s14: [
      { q: 'Pipeline‘da secret boshqaruvi qanday qurilishi kerak?', a: `Sir ${b('repoda emas')}, secret store‘da; pipeline‘ga ${b('runtime‘da')} beriladi va logda maskalanadi; huquq ${b('minimal')} (faqat kerakli job va muhit); ${b('rotatsiya')} muntazam va ${b('audit')} yoqilgan. Bundan tashqari fork‘dan kelgan pull request‘ga sir berilmaydi — aks holda uni oshkor qilish oson.` },
      { q: 'Secret oshkor bo‘lganda qadamlar tartibi nega aynan shunday?', a: `Birinchi ${b('rotate/revoke')} — chunki commit tarixda, fork‘larda va keshda qoladi, ya‘ni o‘chirish kalitni ishlamas qilmaydi. Keyin ${b('yangi kalitni tarqatish')}, so‘ng ${b('tarixni tozalash')}, oxirida ${b('audit')} — kim va qachon ishlatgan. Tartib buzilsa oraliq vaqtda kalit hali amal qiladi.` },
    ],
    s15: [
      { q: 'Terraform state nima uchun kritik komponent?', a: `State — kod‘dagi resurs bilan ${b('haqiqiy resurs orasidagi ko‘prik')}. Uni yo‘qotsangiz Terraform o‘zi yaratgan narsani ${b('tanimaydi')} va qaytadan yaratishga yoki noto‘g‘ri o‘chirishga urinadi. Shuning uchun u remote saqlanadi, versiyalanadi va ${b('qulflanadi')} — bir vaqtda ikki apply bir-birini buzmasligi uchun.` },
      { q: 'plan va apply ajratilishi nimani beradi?', a: `${c('plan')} — ${b('quruq yugurish')}: nima yaratiladi, o‘zgaradi, o‘chiriladi. Bu ${b('ko‘rik')} imkonini beradi va tasodifiy o‘chirishning oldini oladi. ${c('apply')} esa tasdiqlangan rejani bajaradi. Productionda plan artifact sifatida saqlanib, aynan o‘sha qo‘llanadi — oradagi o‘zgarish sezilmay qolmasligi uchun.` },
    ],
    s16: [
      { q: 'Terraform va Ansible mas‘uliyati qanday bo‘lingan?', a: `${b('Terraform')} — ${b('resurs yaratish')} va uning hayot tsikli (VM, tarmoq, DB), state yuritadi. ${b('Ansible')} — ${b('mavjud hostni sozlash')} (paket, fayl, xizmat), state yuritmaydi, idempotent modullar bilan ishlaydi. Chegara qat‘iy emas, lekin aralashtirilsa javobgarlik chalkashadi va drift boshqarib bo‘lmaydi.` },
      { q: 'Idempotency IaC uchun nega asosiy talab?', a: `Chunki avtomatlashtirish ${b('qayta-qayta ishlaydi')}: pipeline har deployda, kontroller har tsiklda. Agar amal ikkinchi marta boshqa natija bersa (masalan qatorni ikki marta qo‘shsa), tizim asta ${b('bashoratsiz')} holatga keladi. Shuning uchun IaC "nima bo‘lishi kerak"ni e‘lon qiladi, "nima qil"ni emas.` },
    ],
    s17: [
      { q: 'Kuzatuvning uch signali qanday qaror beradi?', a: `${b('Metrics')} — ${b('muammo bormi')} (arzon, alert shundan). ${b('Logs')} — ${b('nima bo‘ldi')} (tafsilot, qimmat). ${b('Traces')} — ${b('qayerda sekinlashdi')} (xizmatlar bo‘ylab yo‘l). Tartib ham shunday: alert metrikadan keladi, tafsilot logdan, taqsimlangan tizimda esa sabab trace‘dan topiladi.` },
      { q: 'Monitoring va observability farqi amalda nimada ko‘rinadi?', a: `${b('Monitoring')} — oldindan bilgan savollaringizga javob: dashboard va alert. ${b('Observability')} — ${b('oldin o‘ylab ko‘rmagan')} savolga ham javob topa olish: yetarli kontekst (label, trace ID, structured log) yig‘ilgan bo‘lsa yangi kesimda so‘rov berish mumkin. Yangi turdagi incidentda aynan ikkinchisi ishlaydi.` },
    ],
    s18: [
      { q: 'Prometheus nega pull modelini tanlagan?', a: `Prometheus metrikani ${b('o‘zi tortib oladi')} (scrape) — dastur faqat ${c('/metrics')} ochadi. Foydasi: dastur Prometheus qayerda ekanini bilmaydi, ${b('nishonlarni topish')} markazda (service discovery), va nishon javob bermasa bu o‘zi signal bo‘ladi. Kamchiligi: qisqa umrli ishlar uchun alohida push gateway kerak.` },
      { q: 'Alert qanday qo‘yilishi kerak?', a: `${b('Simptom bo‘yicha')} — foydalanuvchi sezadigan narsa: xato darajasi, latency, navbat. Sabab ko‘rsatkichlari (CPU, xotira) dashboard uchun qoladi. Har alert ${b('harakat talab qilishi')} kerak, aks holda "alert fatigue" boshlanadi va muhimi e‘tibordan chetda qoladi.` },
    ],
    s19: [
      { q: 'SLI, SLO va SLA zanjiri qanday ishlaydi?', a: `${b('SLI')} — o‘lchangan raqam (muvaffaqiyat ulushi, latency). ${b('SLO')} — unga qo‘yilgan ichki maqsad. ${b('SLA')} — mijoz bilan shartnoma va buzilish oqibati. SLO ${b('SLA‘dan qat‘iyroq')} qo‘yiladi — shunda shartnoma buzilishidan oldin ogohlantirish olasiz.` },
      { q: 'Error budget qanday qaror vositasi?', a: `99.9% SLO oyiga ~43 daqiqa ${b('xatoga ruxsat')} beradi. Byudjet bor ekan — tezroq chiqarish mumkin; tugasa — yangi funksiya o‘rniga ${b('barqarorlik')} ustida ishlanadi. Ya‘ni bu texnik va biznes qarorini bitta raqamga bog‘laydigan mexanizm.` },
    ],
    s20: [
      { q: 'HTTPS ulanishi qanday bosqichlardan iborat?', a: `${b('TCP')} ulanish → ${b('TLS handshake')}: shifr kelishuvi, server sertifikatini tekshirish (nom, muddat, CA zanjiri), sessiya kalitini kelishish → shundan keyin ${b('HTTP so‘rov')} shifrlangan kanalda ketadi. Ya‘ni HTTPS alohida protokol emas, ${b('HTTP + TLS')}.` },
      { q: 'TLS termination qayerda bo‘lishi kerak va oqibati nima?', a: `Ko‘pincha ${b('Ingress yoki load balancer')}da — sertifikat bitta joyda boshqariladi, backend CPU tejaydi. Oqibati: ichki trafik ${b('shifrlanmagan')} qoladi. Agar bu qabul qilinmasa, ichkarida qayta shifrlash yoki ${b('mTLS')} (service mesh) qo‘llanadi.` },
    ],
    s21: [
      { q: 'Sertifikat muddati qisqa bo‘lishi qanday kompromis?', a: `Qisqa muddat — o‘g‘irlangan kalit ${b('kam vaqt ishlaydi')}, xavfsizroq. Lekin yangilash tez-tez bo‘ladi va ${b('xatolik oynasi kichrayadi')}: bitta nosoz yangilanish darhol uzilish beradi. Shuning uchun amalda avtomatik yangilash (ACME) + muddat monitoringi + zaxira yo‘l birga qo‘yiladi.` },
      { q: 'Sertifikat IP‘ga emas, nomga bog‘lanishi nimani anglatadi?', a: `Sertifikatda ${b('hostname')} yozilgan — mijoz aynan nomni tekshiradi. IP o‘zgarsa sertifikat buzilmaydi; nom bilan IP orasidagi bog‘lanish ${b('DNS')}ning ishi. Shuning uchun serverni ko‘chirish sertifikatga tegmaydi, lekin nomni o‘zgartirish yangi sertifikat talab qiladi.` },
    ],
    s22: [
      { q: 'Butun konveyerni ikki yo‘nalishda qanday tasvirlaysiz?', a: `${b('Oldinga')}: Developer → Git → CI (test, build, scan) → artifact → registry → CD/GitOps → Kubernetes → dastur. ${b('Orqaga')}: metrics, logs, traces → alert → tekshiruv → qaysi versiya → qaysi commit. Birinchi yo‘nalish chiqarish, ikkinchisi ${b('nosozlikni izlash')} — ikkisi bir xil zanjirning ikki tomoni.` },
      { q: 'Nima uchun teglash va kuzatuv butun zanjirni bog‘laydi?', a: `Git SHA teg sifatida image‘ga, undan Deployment‘ga, undan metrikaga va logga o‘tadi. Shunda "prod‘da xato" degan signal ${b('bitta commit')}gacha kuzatiladi. Bu bog‘lanish uzilsa (masalan ${c('latest')} ishlatilsa), incident paytida ${b('qaysi kod ishlayotganini')} aniqlash mumkin bo‘lmay qoladi.` },
    ],
  };

  window.ArchQ = window.ArchQ || {};
  window.ArchQ.Kubernetes = Kubernetes;
  window.ArchQ['CI/CD'] = CICD;
})();
