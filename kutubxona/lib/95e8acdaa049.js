/* arch-questions-2.js — Networking va Docker uchun arxitektura savollari. */
(function () {
  const b = (t) => '<strong style="color:var(--ink);font-weight:600">' + t + '</strong>';
  const c = (t) => '<code style="font:500 15px \'IBM Plex Mono\',monospace;color:oklch(calc(var(--lk) * 0.5 + var(--lb)) 0.11 68)">' + t + '</code>';

  const Networking = {
    s1: [
      { q: 'Brauzerga manzil yozilgandan javob kelgunicha qanday qatlamlar ishlaydi?', a: `${b('Nom')} IP‘ga aylanadi (DNS) → ${b('marshrut')} tanlanadi (routing jadvali, gateway) → ${b('TCP ulanish')} o‘rnatiladi (3-way handshake) → ${b('TLS')} kelishuvi bo‘ladi → ${b('HTTP so‘rov')} yuboriladi → dastur javob qaytaradi. Har qatlam pastdagisiga tayanadi, shuning uchun nosozlikni ham shu tartibda qidiriladi.` },
      { q: 'Nega tarmoq qatlamlarga bo‘lingan — bu nima beradi?', a: `Har qatlam ${b('bitta masalani')} hal qiladi va qo‘shnisiga faqat oddiy shartnoma orqali murojaat qiladi. Foydasi: bir qatlamni almashtirish boshqasini buzmaydi (Wi-Fi yoki kabel — IP uchun farqi yo‘q), nosozlikni ${b('ajratish')} oson, va har qatlam mustaqil rivojlanadi. Shuning uchun HTTP/3 UDP‘ga o‘tganda dasturlar deyarli o‘zgarmadi.` },
    ],
    s2: [
      { q: 'IP manzil tarmoq va host qismiga qanday bo‘linadi va bu nimaga kerak?', a: `Prefiks (${c('/24')}) manzilning boshidan qancha bit ${b('tarmoqqa')} tegishli ekanini aytadi, qolgani ${b('host')}. Router qaror qabul qilganda faqat tarmoq qismiga qaraydi — shuning uchun millionlab manzil o‘rniga ${b('bir nechta yozuv')} bilan ishlaydi. Bu routing jadvalini kichik va tez ushlab turadi.` },
      { q: 'Private manzil internetda nega ishlamaydi va bu qanday hal qilinadi?', a: `${c('10.x')}, ${c('172.16–31.x')}, ${c('192.168.x')} diapazonlari ${b('global routing qilinmaydi')} — internetdagi routerlar ularni tashlaydi, chunki bir xil manzil minglab tarmoqda takrorlanadi. Yechim — ${b('NAT')}: chiqishda manba manzili public manzilga almashtiriladi va javob qaytganda teskari tarjima qilinadi.` },
    ],
    s3: [
      { q: 'Bitta IP da bir nechta xizmat qanday yashaydi?', a: `Manzil hostni topadi, ${b('port')} esa host ichidagi dasturni. Kernel har kelgan paketni ${b('to‘rtlik')} bo‘yicha ajratadi: manba IP+port va manzil IP+port. Shuning uchun bitta serverda 80, 443, 5432 alohida dasturlarga boradi, va bitta dasturga minglab ulanish bir vaqtda kelishi mumkin — har biri boshqa manba portida.` },
      { q: 'Listening socket va ulanish socketi qanday farq qiladi?', a: `${b('Listening')} socket faqat kutadi — u ${c('ss -lntup')} da ko‘rinadi va bitta (IP:port) juftligini band qiladi. Ulanish kelganda kernel ${b('yangi socket')} yaratadi, u to‘rtlik bilan aniqlanadi va haqiqiy ma‘lumot shundan o‘tadi. Shuning uchun bitta 443-port minglab ulanishga xizmat qiladi va har biri alohida FD oladi.` },
    ],
    s4: [
      { q: 'TCP ulanishi nega uch qadamda o‘rnatiladi?', a: `Har tomon ${b('o‘z boshlang‘ich raqamini')} e‘lon qilishi va qarshi tomonnikini ${b('tasdiqlashi')} kerak. SYN — mijoz raqamini yuboradi; SYN-ACK — server tasdiqlaydi va o‘zinikini yuboradi; ACK — mijoz tasdiqlaydi. Ikki qadam yetmaydi, chunki server tasdig‘i yetib borganini bilmay qoladi. Shundan keyingina ${b('ikki tomon ham tayyor')}.` },
      { q: 'Ulanish yopilishi qanday bo‘ladi va TIME_WAIT nega kerak?', a: `Yopilish ${b('ikki tomonlama')}: har tomon o‘z yo‘nalishini FIN bilan yopadi va tasdiq oladi. Yopgan tomon bir muddat ${b('TIME_WAIT')}da turadi — kechikkan paketlar yangi ulanishga aralashib ketmasligi uchun. Shuning uchun band serverda minglab TIME_WAIT ko‘rinishi normal holat.` },
    ],
    s5: [
      { q: 'TCP ishonchlilikni qanday ta‘minlaydi — mexanizmlarni ayting.', a: `${b('Sequence number')} — tartib va yo‘qolganni aniqlash; ${b('ACK')} — yetib kelgani tasdig‘i; ${b('retransmission')} — tasdiq kelmasa qayta yuborish; ${b('checksum')} — buzilganini aniqlash; ${b('window')} — qabul qiluvchi buferiga moslash. Beshtasi birga ishlaydi: shuning uchun TCP sekinroq, lekin uzatilgan ma‘lumot to‘liq va tartibli.` },
      { q: 'Window size va congestion control nimani hal qiladi?', a: `${b('Flow control')} (window) — qabul qiluvchi bufer to‘lib ketmasin; ${b('congestion control')} — tarmoqning o‘zi bo‘g‘ilib qolmasin. TCP sekin boshlaydi va tezlikni asta oshiradi, paket yo‘qolsa keskin kamaytiradi. Shuning uchun uzoq masofada latency yuqori bo‘lsa, o‘tkazuvchanlik katta bo‘lsa ham tezlik past bo‘lishi mumkin.` },
    ],
    s6: [
      { q: 'UDP‘ni tanlash qaysi arxitektura qarorini bildiradi?', a: `Siz ${b('kechikishni')} ishonchlilikdan ustun qo‘yyapsiz: handshake yo‘q, qayta yuborish yo‘q, tartib kafolati yo‘q. Bu video, o‘yin, DNS so‘rovi kabi "kech kelgan ma‘lumot keraksiz" holatlarda to‘g‘ri. Agar ishonchlilik kerak bo‘lsa, uni ${b('dastur o‘zi quradi')} — QUIC aynan shunday qilgan.` },
      { q: 'DNS nega asosan UDP‘da, lekin TCP ham kerak?', a: `So‘rov va javob kichkina — bitta datagram yetadi, handshake‘siz ${b('bir borish-kelish')}da tugaydi. Lekin javob katta bo‘lsa (ko‘p yozuv, DNSSEC) datagramga sig‘maydi: server ${b('truncated')} belgisini qo‘yadi va mijoz ${b('TCP')}da qayta so‘raydi. Zone transfer ham TCP‘da. Shuning uchun 53-port ikkala protokolda ochiq bo‘lishi kerak.` },
    ],
    s7: [
      { q: 'DNS so‘rovi javobgacha qanday yo‘l bosadi?', a: `Dastur ${b('resolver')}dan so‘raydi → resolver keshni tekshiradi → bo‘lmasa ${b('recursive server')}ga yuboradi → u ${b('root')}dan ${b('TLD')}ga, undan ${b('authoritative')} serverga boradi → javob qaytadi va ${b('TTL')} davomida keshlanadi. Shuning uchun birinchi so‘rov sekin, keyingilari tez; va yozuv o‘zgarganda eski javob TTL tugagunicha qaytaveradi.` },
      { q: 'Resolver, recursive va authoritative — rollarni ajrating.', a: `${b('Resolver')} — mijoz tomonidagi mexanizm: ${c('/etc/hosts')}, nsswitch, kesh va nameserver ro‘yxatini hisobga oladi. ${b('Recursive')} — javobni to‘liq topib beradigan server (odatda provayder yoki 8.8.8.8). ${b('Authoritative')} — zona egasi, rasmiy javob shunda. Shuning uchun ${c('dig')} ishlab ${c('getent')} ishlamasa, muammo DNS‘da emas — resolver sozlamasida.` },
    ],
    s8: [
      { q: 'CNAME va A yozuvlari arxitekturada qanday farqli ishlatiladi?', a: `${b('A')} nomni ${b('manzilga')} bog‘laydi — oxirgi nuqta. ${b('CNAME')} nomni ${b('boshqa nomga')} bog‘laydi va yechish davom etadi. CNAME foydasi: manzil o‘zgarsa faqat bitta joyda tuzatasiz (${c('app.example.com → lb.provider.net')}). Cheklovi: zona ildizida (${c('example.com')}) CNAME qo‘yib bo‘lmaydi, chunki u yerda NS va SOA turishi shart.` },
      { q: 'TTL qiymatini tanlash qanday kompromis?', a: `Kichik TTL — o‘zgarish ${b('tez tarqaladi')}, lekin so‘rov ko‘p va DNS serverga yuk ortadi. Katta TTL — kam so‘rov, tez javob, lekin migratsiya ${b('sekin')} bo‘ladi va xatoni qaytarish uzoq davom etadi. Amaliyot: ko‘chirishdan bir necha kun oldin TTL kamaytiriladi, ish tugagach qaytariladi.` },
    ],
    s9: [
      { q: 'DNS nosozligini qanday qatlamlarga bo‘lib tekshirasiz?', a: `${c('getent hosts')} — ${b('tizim')} qanday ko‘radi; ${c('dig')} — ${b('DNS')} nima deydi; ${c('dig @boshqa-server')} — muammo o‘z resolver‘idami; ${c('cat /etc/resolv.conf')} va ${c('/etc/hosts')} — ${b('sozlama')}; ${c('dig NOM NS')} — yozuv umuman bormi. Har qadam javobni bir qatlamga toraytiradi.` },
      { q: 'Negative caching nima va nega chalkashlik keltiradi?', a: `Topilmagan nom ham ${b('keshlanadi')} — "bu nom yo‘q" javobi ma‘lum vaqt saqlanadi (SOA‘dagi qiymat bo‘yicha). Shuning uchun yozuvni qo‘shganingizdan keyin ham bir muddat "topilmadi" javobi kelaveradi. Bu xato emas — kutish yoki keshni tozalash kerak.` },
    ],
    s10: [
      { q: 'NAT paket bilan nima qiladi va javob qanday qaytadi?', a: `Chiqishda router ${b('manba IP va portni')} o‘ziniki bilan almashtiradi va ${b('tarjima jadvali')}ga yozadi. Javob kelganda o‘sha jadvaldan asl ichki manzilni topib qaytaradi. Shuning uchun NAT ortidagi hostga ${b('tashqaridan o‘zi boshlab')} ulanib bo‘lmaydi — jadvalda yozuv yo‘q. Buning uchun port forwarding (DNAT) kerak.` },
      { q: 'NAT qaysi arxitektura muammolarini keltirib chiqaradi?', a: `Uchta: ${b('tashqaridan ulanish')} qiyin (peer-to-peer, callback), ${b('manba IP yo‘qoladi')} — loglarda hamma so‘rov bitta manzildan ko‘rinadi (shuning uchun ${c('X-Forwarded-For')} ishlatiladi), va ${b('holat saqlanadi')} — jadval to‘lsa yangi ulanish o‘rnatilmaydi. Shuning uchun IPv6 NAT‘siz ishlashga intiladi.` },
    ],
    s11: [
      { q: 'Paket har qatlamdan o‘tganda unga nima qo‘shiladi?', a: `Application ma‘lumoti Transport‘da ${b('port va TCP sarlavhasi')}ni, Network‘da ${b('IP sarlavhasi')}ni, Link‘da ${b('MAC ramkasi')}ni oladi — bu ${b('inkapsulyatsiya')}. Qabul qiluvchida teskari tartibda ochiladi. Shuning uchun har qatlam faqat o‘z sarlavhasiga qaraydi va ichidagini "qora quti" deb biladi.` },
      { q: 'L4 va L7 load balancer arxitekturada nima bilan farq qiladi?', a: `${b('L4')} faqat IP va portga qaraydi — tez, protokolga befarq, lekin ${b('mazmunni ko‘rmaydi')}. ${b('L7')} HTTP sarlavhasini o‘qiydi — yo‘l bo‘yicha marshrutlash, cookie bo‘yicha yopishtirish, TLS tugatish mumkin, lekin ${b('qimmatroq')} va shifrni ochishi kerak. Ingress — L7, Service ClusterIP — L4 mantiqiga yaqin.` },
    ],
    s12: [
      { q: 'SSH nosozligini qatlamlarga qanday ajratasiz?', a: `${b('Nom')} yechiladimi (${c('getent hosts')}) → ${b('marshrut')} bormi (${c('ip route get')}) → ${b('port')} ochiqmi (${c('nc -vz')}) → ${b('xizmat')} tirikmi (${c('systemctl status ssh')}) → ${b('autentifikatsiya')} o‘tdimi (${c('ssh -v')}, server logi). Har qatlamda boshqa xato matni chiqadi — shuning uchun matnning o‘zi qatlamni ko‘rsatib beradi.` },
      { q: 'Nega SSH ishlamasligi har doim ham tarmoq muammosi emas?', a: `Chunki SSH ${b('application qatlami')}: TCP o‘rnatilib, kalit rad etilishi mumkin (${c('Permission denied')}), yoki server yuklanmagan bo‘lishi (${c('Connection reset')}). Tarmoq muammosi bo‘lsa xato boshqacha: ${b('timeout')} yoki ${b('refused')}. Shuning uchun xato matnini o‘qish birinchi tashxis vositasi.` },
    ],
    s13: [
      { q: 'Bind address arxitekturada nimani hal qiladi?', a: `Dastur qaysi ${b('interfeysdagi')} ulanishlarni qabul qilishini belgilaydi. ${c('127.0.0.1')} — faqat shu mashina ichidan, bu ${b('himoya chegarasi')}. ${c('0.0.0.0')} — mavjud interfeyslar orqali. Shuning uchun xavfsizlikda ichki xizmatlar loopback‘ga bog‘lanadi va faqat proxy tashqariga chiqadi.` },
      { q: 'Konteynerda 127.0.0.1 nega boshqa ma‘no oladi?', a: `Konteynerning ${b('o‘z tarmoq namespace‘i')} bor — undagi loopback host loopback‘i emas. Shuning uchun konteyner ichida ${c('127.0.0.1')} ga bog‘langan dastur port mapping orqali ham ko‘rinmaydi: mapping host interfeysidan konteyner interfeysiga boradi, loopback‘ga emas. Yechim — ${c('0.0.0.0')}.` },
    ],
    s14: [
      { q: 'nc, curl va ping qaysi qatlamni tekshiradi?', a: `${c('ping')} — ${b('L3')} (ICMP): manzil yetib boriladimi, lekin ko‘p joyda bloklangan. ${c('nc -vz')} — ${b('L4')}: TCP ulanish o‘rnatiladimi. ${c('curl')} — ${b('L7')}: dastur to‘g‘ri javob beradimi. Shuning uchun uchtasi ketma-ket ishlatiladi — har biri boshqa xulosaga olib keladi.` },
      { q: 'Nega "ping ishlamayapti" xulosa uchun yetarli emas?', a: `ICMP ko‘p muhitda ${b('ataylab bloklangan')} — cloud security group, korporativ firewall. Shuning uchun ping javob bermasligi xizmat o‘lik degani emas, va aksincha ping ishlashi xizmat sog‘lom degani emas. Ishonchli tekshiruv — haqiqiy porti bo‘yicha ${c('nc')} yoki ${c('curl')}.` },
    ],
    s15: [
      { q: 'Timeout va refused — paket darajasida nima farq?', a: `${b('Refused')}da masofadagi host ${b('RST')} paketini qaytaradi — ya‘ni paket yetib bordi, lekin o‘sha portda listener yo‘q. ${b('Timeout')}da ${b('umuman javob yo‘q')} — paket yo‘lda tashlangan (firewall DROP), marshrut yo‘q yoki host o‘lik. Shuning uchun refused tashxisni bitta hostga qisqartiradi, timeout esa butun yo‘lni tekshirishni talab qiladi.` },
      { q: 'Firewall REJECT va DROP ni tanlash nima o‘zgartiradi?', a: `${b('REJECT')} rad javobini qaytaradi — mijoz ${b('darhol')} biladi, tashxis oson, lekin port yopiqligi tashqariga oshkor bo‘ladi. ${b('DROP')} jim tashlaydi — skanerlash qiyinlashadi, lekin mijoz ${b('timeout')} kutadi va nosozlikni topish uzoq davom etadi. Ichkarida odatda REJECT, tashqi chegarada DROP.` },
    ],
    s16: [
      { q: 'A dan B ga ulanishni nega pastdan yuqoriga tekshirasiz?', a: `Har qatlam pastdagisiga tayanadi: nom yechilmasa marshrut ma‘nosiz, marshrut yo‘q bo‘lsa port tekshirish behuda. Pastdan yurish ${b('imkoniyatlarni tez toraytiradi')} va har qadamda ${b('bitta buyruq')} bo‘ladi. Shuning uchun intervyuda ham aynan shu tartib kutiladi — u sistemali fikrlashni ko‘rsatadi.` },
      { q: 'Ikki tomonlama tekshiruv nima uchun kerak?', a: `Muammo ${b('chiqishda ham, kirishda ham')} bo‘lishi mumkin. Serverda listener bor-yo‘qligini (${c('ss -lntup')}) va mahalliy ulanish ishlayotganini tekshirasiz, mijozdan esa marshrut va portni. Ikkisi mos kelmasa — oradagi ${b('firewall yoki NAT')}. Bitta tomondan qaralsa bu farq ko‘rinmaydi.` },
    ],
    s17: [
      { q: 'Paket chiqishidan oldin tizimda nima tekshiriladi?', a: `Uch narsa: ${b('manzil')} bormi (interfeysda IP), ${b('marshrut')} bormi (jadvalda mos yozuv), va ${b('nom')} yechiladimi (agar domen bo‘lsa). Keyin firewall chiqish qoidalari, so‘ng ARP bilan keyingi qadam. Shuning uchun "internet bor" degan gap ${b('to‘rt alohida tekshiruv')}ga bo‘linadi.` },
      { q: 'Proxy muhitida nosozlik nega chalkash bo‘ladi?', a: `Ba‘zi vositalar ${c('http_proxy')} muhit o‘zgaruvchilarini o‘qiydi, ba‘zilari yo‘q. Shuning uchun ${c('curl')} ishlab ${c('apt')} ishlamasligi mumkin — biri proxy‘dan o‘tadi, ikkinchisi to‘g‘ridan urinadi va bloklanadi. Tekshirishda ${b('qaysi vosita proxy‘ni biladi')} degan savol alohida qo‘yiladi.` },
    ],
    s18: [
      { q: 'Olti pog‘onali modelni Kubernetesga qanday ko‘chirasiz?', a: `${b('Name')} → Service DNS nomi; ${b('IP')} → ClusterIP; ${b('Route')} → kube-proxy qoidalari va NetworkPolicy; ${b('Port')} → targetPort va konteyner porti; ${b('TLS/HTTP')} → Ingress; ${b('Application')} → readiness va dastur logi. Vositalar boshqa, ${b('savollar bir xil')} — shuning uchun bitta model ikkala muhitga yetadi.` },
      { q: 'Tekshiruv natijasini qanday yozib qo‘yasiz va nega?', a: `Har qadam uchun: ${b('gipoteza')}, ${b('buyruq')}, ${b('natija')}, ${b('xulosa')}. Foydasi uchta: boshqa odam yo‘lingizni takrorlay oladi, ikki marta bir xil tekshiruv qilinmaydi, va incident tugagach ${b('postmortem')} tayyor bo‘ladi. Xotiraga tayanish katta incidentda ishlamaydi.` },
    ],
  };

  const Docker = {
    s1: [
      { q: 'Image va container arxitektura jihatidan nima bilan farq qiladi?', a: `${b('Image')} — o‘zgarmas ${b('qatlamlar to‘plami')}, faqat o‘qish uchun. ${b('Container')} — o‘sha image ustiga qo‘shilgan ${b('yoziladigan qatlam')} va ishlayotgan process. Shuning uchun bitta image‘dan o‘nlab container ishga tushadi va ular disk joyini baham ko‘radi; container o‘chirilsa faqat yozilgan qatlam yo‘qoladi.` },
      { q: 'Konteyner qaysi mexanizmlar hisobiga izolyatsiya qilinadi?', a: `${b('Namespace')}lar ko‘rinishni ajratadi: PID (o‘z process daraxti), NET (o‘z interfeysi), MNT (o‘z fayl tizimi), UTS, IPC, USER. ${b('cgroup')}lar resursni cheklaydi: CPU, xotira, I/O. ${b('Capability')} va seccomp huquqni toraytiradi. Ya‘ni konteyner — ${b('oddiy process')}, lekin cheklangan ko‘rinish va resurs bilan.` },
    ],
    s2: [
      { q: 'VM va konteyner arxitekturasi qayerda ajraladi?', a: `VM ${b('o‘z kerneli')} va butun OS‘ni ko‘taradi — hipervizor ustida. Konteyner ${b('host kernelini')} baham ko‘radi va faqat foydalanuvchi qatlamini o‘rab oladi. Shuning uchun konteyner sekundlarda emas millisekundlarda ishga tushadi va kam joy oladi, lekin ${b('izolyatsiya darajasi pastroq')} — kernel zaifligi hammaga tegadi.` },
      { q: 'Qachon VM, qachon konteyner tanlaysiz?', a: `${b('Konteyner')} — bir xil OS oilasidagi ko‘p mayda xizmat, tez chiqarish, zich joylashtirish. ${b('VM')} — boshqa kernel kerak bo‘lganda, qattiq izolyatsiya talab qilinganda (ko‘p ijarachi, tartibga solish talablari), yoki kernel modulini o‘zgartirish kerak bo‘lganda. Amalda ikkisi birga: VM ichida konteyner.` },
    ],
    s3: [
      { q: 'docker run buyrug‘i ostida nima sodir bo‘ladi?', a: `CLI ${b('daemon')}ga so‘rov yuboradi → image lokalda bor-yo‘qligi tekshiriladi, yo‘q bo‘lsa ${b('pull')} qilinadi → yoziladigan qatlam yaratiladi → ${b('namespace va cgroup')} sozlanadi → tarmoq interfeysi ulanadi va port mapping qoidalari yoziladi → nihoyat ${b('ENTRYPOINT + CMD')} ishga tushadi va PID 1 bo‘ladi.` },
      { q: 'Konteyner nega dastur to‘xtaganda o‘chadi?', a: `Konteynerning umri ${b('PID 1 umriga')} teng — u chiqsa konteyner ham tugaydi. Shuning uchun fonda ishlaydigan xizmat PID 1 bo‘lishi kerak; ${c('sh -c "... &"')} yozilsa shell darhol chiqadi va konteyner o‘chadi. Bu xato emas, ${b('dizayn')}: bitta konteyner — bitta asosiy process.` },
    ],
    s4: [
      { q: 'Image qatlamlari qanday tuziladi va nega tartib muhim?', a: `Har ${c('RUN')}, ${c('COPY')}, ${c('ADD')} yangi ${b('qatlam')} yaratadi va u ${b('keshlanadi')}. Qatlam o‘zgarsa undan keyingi hamma qatlam qaytadan quriladi. Shuning uchun ${b('kam o‘zgaradigan')} qadamlar yuqoriga qo‘yiladi: avval dependency fayli va o‘rnatish, oxirida ${c('COPY . .')}. Teskari tartibda har kichik tahrir to‘liq qayta qurilishga olib keladi.` },
      { q: 'Multi-stage build nima beradi?', a: `Birinchi bosqichda ${b('build vositalari')} bilan quriladi (compiler, dev kutubxonalar), ikkinchi bosqichga esa ${b('faqat natija')} ko‘chiriladi. Natijada yakuniy image kichik va ${b('hujum yuzasi kam')} bo‘ladi — ichida compiler ham, manba kod ham qolmaydi. Bu xavfsizlik va tezlikni bir vaqtda beradi.` },
    ],
    s5: [
      { q: 'RUN va CMD qaysi vaqtda bajariladi — farqi nimada?', a: `${c('RUN')} ${b('build vaqtida')} ishlaydi va natijasi ${b('image ichiga muhrlanadi')} — paket o‘rnatish, fayl tayyorlash. ${c('CMD')} esa ${b('run vaqtida')} ishlaydi va image ichiga natija qoldirmaydi — bu konteyner ishga tushganda bajariladigan buyruq. Shuning uchun CMD‘dagi o‘zgarish qayta build talab qilmaydi.` },
      { q: 'Nega Dockerfile‘da paket o‘rnatish va tozalash bitta RUN‘da yoziladi?', a: `Chunki har RUN alohida ${b('qatlam')}. Birinchi qatlamda fayl yaratib, ikkinchisida o‘chirsangiz, image hajmi ${b('kamaymaydi')} — o‘chirilgan fayl pastki qatlamda qolaveradi, faqat ko‘rinmay qoladi. Shuning uchun o‘rnatish va kesh tozalash ${b('bitta buyruqda')} zanjirlanadi.` },
    ],
    s6: [
      { q: 'ENTRYPOINT va CMD qanday birlashadi?', a: `Ishga tushishda ${b('ENTRYPOINT + CMD')} qo‘shiladi. ENTRYPOINT — ${b('o‘zgarmas ijrochi')} (${c('["python"]')}), CMD — ${b('almashtiriladigan argument')} (${c('["app.py"]')}). Foydalanuvchi ${c('docker run image test.py')} desa faqat CMD almashadi. Shuning uchun "bu image nima qiladi" ENTRYPOINT‘da, "qaysi rejimda" CMD‘da yoziladi.` },
      { q: 'Exec form va shell form — nega tanlov muhim?', a: `${b('Exec form')} (${c('["python","app.py"]')}) dasturni ${b('to‘g‘ridan')} ishga tushiradi — u PID 1 bo‘ladi va SIGTERM‘ni oladi. ${b('Shell form')} (${c('python app.py')}) avval shell ishga tushadi, dastur uning bolasi bo‘ladi va ${b('signal yetib bormaydi')} — natijada to‘xtatish SIGKILL bilan tugaydi va ma‘lumot yo‘qoladi.` },
    ],
    s7: [
      { q: 'Konteyner holatlari qanday almashadi?', a: `${b('Created')} → ${b('Running')} → ${b('Exited')} (exit code bilan) yoki ${b('Paused')}. ${c('restart')} yangi process boshlaydi, lekin ${b('o‘sha yoziladigan qatlam')} saqlanadi; ${c('rm')} esa qatlamni ham o‘chiradi. Shuning uchun to‘xtagan konteynerni tekshirish mumkin — loglari va fayllari joyida turadi.` },
      { q: 'Exit code tashxisda nimani beradi?', a: `${b('0')} — normal tugadi. ${b('1')} yoki boshqa kichik son — ${b('dastur o‘zi')} xato bilan chiqdi, sabab logda. ${b('137')} — SIGKILL, odatda ${b('OOM yoki majburiy to‘xtatish')}. ${b('143')} — SIGTERM, ya‘ni to‘g‘ri to‘xtatilgan. Shuning uchun ${c('docker ps -a')} birinchi qaraladigan joy: kod tashxis yo‘nalishini beradi.` },
    ],
    s8: [
      { q: 'docker stop ichida qanday ketma-ketlik bor?', a: `Daemon PID 1 ga ${b('SIGTERM')} yuboradi va ${b('grace period')} (default 10s) kutadi. Dastur shu vaqtda ulanishlarni yopib, buferni yozib chiqishi kerak. Vaqt tugasa ${b('SIGKILL')} yuboriladi. Shuning uchun graceful shutdown uchun dastur signalni ushlashi va grace period yetarli bo‘lishi kerak.` },
      { q: 'Restart policy qanday ishlaydi va qachon zararli bo‘ladi?', a: `${c('always')} — har to‘xtaganda tiriltiradi, ${c('on-failure')} — faqat xato bilan chiqsa, ${c('unless-stopped')} — qo‘lda to‘xtatilmagan bo‘lsa. Orasida ${b('exponential backoff')} bor. Zarari: konfiguratsiya xatosi bo‘lsa cheksiz tsikl hosil bo‘ladi va ${b('haqiqiy sabab')} loglar oqimida ko‘milib ketadi — shuning uchun avval ${c('logs --previous')} o‘qiladi.` },
    ],
    s9: [
      { q: 'Docker tarmog‘i qanday qurilgan?', a: `Har konteyner ${b('o‘z tarmoq namespace‘i')}ga ega va virtual juft (veth) orqali ${b('bridge')}ga ulanadi. Bridge host‘da interfeys sifatida ko‘rinadi (${c('docker0')}). Tashqariga chiqish ${b('SNAT')} bilan, ichkariga kirish ${b('DNAT')} (port mapping) bilan bo‘ladi. Shuning uchun konteyner IP‘lari ichki va vaqtinchalik.` },
      { q: 'Nega default bridge‘da nom orqali topish ishlamaydi?', a: `Default bridge ${b('eski moslik')} uchun qolgan va unda ichki DNS yo‘q. Foydalanuvchi yaratgan tarmoqda esa Docker ${b('ichki DNS')} ishga tushiradi va konteyner nomlarini avtomatik yechadi. Shuning uchun amalda har stack uchun alohida tarmoq yaratiladi — Compose buni o‘zi qiladi.` },
    ],
    s10: [
      { q: 'Konteynerdagi localhost nimani bildiradi?', a: `Har konteynerning ${b('o‘z loopback')}i bor — u host loopback‘i emas va qo‘shni konteynerniki ham emas. Shuning uchun ikki konteyner ${c('localhost')} orqali gaplasha olmaydi; ular ${b('nom yoki IP')} orqali murojaat qiladi. Host‘ga murojaat kerak bo‘lsa alohida nom ishlatiladi.` },
      { q: '0.0.0.0 ga bog‘lanish konteynerda nega majburiy?', a: `Port mapping host interfeysidan konteynerning ${b('tarmoq interfeysiga')} yo‘naltiradi — loopback‘ga emas. Dastur loopback‘da eshitsa, mapping kelgan paket hech kimga tushmaydi va ${b('connection refused')} qaytadi. Shuning uchun konteyner ichidagi xizmat doim ${c('0.0.0.0')}da eshitadi; izolyatsiyani tarmoq va firewall ta‘minlaydi.` },
    ],
    s11: [
      { q: 'EXPOSE va -p o‘rtasidagi farq nimada?', a: `${c('EXPOSE')} — ${b('hujjat')}: image qaysi portda ishlashini bildiradi, hech qanday qoida yaratmaydi. ${c('-p')} esa ${b('haqiqiy DNAT qoidasi')}ni yozadi va host portini band qiladi. Shuning uchun EXPOSE‘siz ham ${c('-p')} ishlaydi, EXPOSE bilan ${c('-p')} siz esa tashqaridan kirib bo‘lmaydi.` },
      { q: 'Port mapping va tarmoqqa ulash qachon qaysi biri kerak?', a: `${c('-p')} — ${b('tashqi dunyo')} uchun: brauzer yoki boshqa mashina kirishi kerak bo‘lsa. Konteynerlar ${b('o‘zaro')} gaplashishi uchun esa port ochish shart emas — bitta tarmoqqa ulash yetadi va bu ${b('xavfsizroq')}, chunki DB porti hostda ochilmaydi.` },
    ],
    s12: [
      { q: 'Volume va bind mount arxitekturada qanday farq qiladi?', a: `${b('Volume')}ni Docker boshqaradi: joylashuvi daemon ixtiyorida, backup va drayver qo‘llab-quvvatlanadi, ko‘chirish oson. ${b('Bind mount')} — host‘dagi aniq katalog: yo‘l qattiq bog‘langan, huquqlar host‘niki. Shuning uchun production ma‘lumot uchun volume, ishlab chiqishda kod ulash uchun bind mount ishlatiladi.` },
      { q: 'Nega ma‘lumotni konteyner ichida saqlash mumkin emas?', a: `Konteynerning yoziladigan qatlami ${b('uning umriga bog‘liq')} — o‘chirilsa ma‘lumot ketadi, va yangi versiyaga o‘tish har doim yangi konteyner demakdir. Bundan tashqari bu qatlam ${b('sekin')} (copy-on-write) va ko‘chirib bo‘lmaydi. Shuning uchun holat tashqariga chiqariladi: volume yoki tashqi xizmat.` },
    ],
    s13: [
      { q: 'CPU va xotira chegarasi nega turlicha ta‘sir qiladi?', a: `CPU ${b('siqiladigan')} resurs: chegaradan oshsa process ${b('sekinlashadi')} (throttling), lekin tirik qoladi. Xotira ${b('siqilmaydi')}: chegaradan oshsa kernel boshqa yo‘l topolmaydi va process ${b('o‘ldiriladi')} (OOMKilled, 137). Shuning uchun xotira chegarasini belgilash ancha xavfliroq va o‘lchovga tayanishi kerak.` },
      { q: 'cgroup chegaralari dastur ichida qanday ko‘rinadi?', a: `Ko‘p dastur host resursini ko‘radi, chegarani emas — masalan JVM yoki Node host xotirasiga qarab bufer oladi va ${b('darhol limitdan oshadi')}. Shuning uchun konteynerga moslangan bayroqlar (${c('MaxRAMPercentage')} kabi) yoki cgroup‘ni biladigan versiyalar ishlatiladi. Bu "hech narsa qilmadim, OOM bo‘ldi" holatining klassik sababi.` },
    ],
    s14: [
      { q: 'Konteyner debug qilishda buyruqlar tartibi nima uchun shunday?', a: `${c('ps -a')} — ${b('tirikmi va exit code')}; ${c('logs')} — ${b('dastur nima dedi')}; ${c('inspect')} — ${b('qanday sozlangan')} (env, mount, limit, OOM); ${c('exec')} — ${b('ichkarida nima ko‘rinadi')} (port, fayl); ${c('stats')} — ${b('resurs')}. Tartib arzondan qimmatga va tashqaridan ichkariga — har qadam maydonni toraytiradi.` },
      { q: 'Konteynerda ichkariga kirish nega har doim mumkin emas?', a: `Kichik image‘larda (distroless, scratch) ${b('shell yo‘q')} — ${c('exec sh')} ishlamaydi. Bu ataylab qilingan: hujum yuzasi kamayadi. Bunday holatda ${b('log va inspect')}ga tayaniladi yoki vaqtincha debug konteyneri (${c('ephemeral container')}) ulanadi.` },
    ],
    s15: [
      { q: 'Compose arxitektura jihatidan nimani hal qiladi?', a: `U bir nechta konteynerni ${b('bitta e‘lon fayli')}da tasvirlaydi: image, env, volume, port, bog‘liqlik tartibi. Ishga tushirganda ${b('umumiy tarmoq')} yaratadi — shuning uchun xizmatlar nom orqali bir-birini topadi. Ya‘ni Compose — bitta mashinadagi ${b('kichik orkestrator')} va Kubernetes manifestlarining soddalashgan ko‘rinishi.` },
      { q: 'depends_on nega "tayyor" degani emas?', a: `U faqat ${b('ishga tushirish tartibini')} beradi — konteyner boshlandi degani, xizmat ${b('so‘rov qabul qilishga tayyor')} degani emas. DB bir necha sekund initsializatsiya qilishi mumkin. Shuning uchun healthcheck shartini qo‘shish yoki dasturda ${b('qayta urinish')} mantiqini yozish kerak — bu Kubernetes readiness bilan bir xil g‘oya.` },
    ],
    s16: [
      { q: 'dockerignore build‘ga qanday ta‘sir qiladi?', a: `Build boshlanishida katalog ${b('build context')} sifatida daemonga yuboriladi. ${c('.dockerignore')} nimani yubormaslikni aytadi. Foydasi uchta: ${b('tezlik')} (og‘ir kataloglar ko‘chmaydi), ${b('kesh')} (keraksiz fayl o‘zgarishi qayta build qilmaydi), ${b('xavfsizlik')} (${c('.env')}, ${c('.git')} image ichiga tushib qolmaydi).` },
      { q: 'Image hajmini kamaytirishning arxitektura yo‘llari qaysi?', a: `${b('Kichik asos')} (slim, alpine, distroless), ${b('multi-stage')} bilan build vositalarini tashlab ketish, ${b('qatlamlarni birlashtirish')} va kesh tozalashni o‘sha buyruqda qilish, ${b('.dockerignore')} bilan keraksizni kiritmaslik. Foyda faqat disk emas: kichik image tez pull bo‘ladi va ${b('zaiflik soni')} kam bo‘ladi.` },
    ],
    s17: [
      { q: 'Konteyner mental modelini bir jumlada qanday ifodalaysiz?', a: `Konteyner — ${b('cheklangan ko‘rinishdagi oddiy process')}: o‘z fayl tizimi va tarmog‘ini ko‘radi, host kernelini baham ko‘radi, resursi cgroup bilan cheklangan, umri PID 1 ga bog‘langan va ${b('holat saqlamaydi')}. Shu beshta xususiyat deyarli barcha Docker xatolarini tushuntiradi.` },
      { q: 'Docker bilimi Kubernetesga qanday ko‘chadi?', a: `Pod — ${b('bir yoki bir nechta konteyner')}, ular tarmoq namespace‘ini baham ko‘radi (shuning uchun ichida localhost ishlaydi). Image, ENTRYPOINT, signal, resurs limiti, volume — hammasi o‘sha. Kubernetes qo‘shadigan narsa: ${b('rejalashtirish, self-healing, Service va desired state')}. Shuning uchun Docker‘ni yaxshi bilish Kubernetes‘ning yarmini beradi.` },
    ],
  };

  window.ArchQ = window.ArchQ || {};
  window.ArchQ.Networking = Networking;
  window.ArchQ.Docker = Docker;
})();
