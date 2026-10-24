const V='devops-v14';
const CORE=['./','index.html','cloud.js','devops-data.js','devops-data-middle.js','themes.css','kutubxona/lib/svg-theme.css','kutubxona/hub.html','kutubxona/lib/shell.js','kutubxona/lib/kutubxona.css','kutubxona/lib/classical-fonts.css','support.js','devops-data.js','apple-touch-icon.png','icon-192.png','icon-512.png','manifest.webmanifest','_ds/classical-a33ac8c1-c349-49da-acef-e2ae46ebadc9/styles.css','_ds/classical-a33ac8c1-c349-49da-acef-e2ae46ebadc9/_ds_bundle.js',
'https://unpkg.com/react@18.3.1/umd/react.production.min.js','https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(CORE.map(u=>c.add(new Request(u,u.startsWith('http')?{mode:'cors'}:{})).catch(()=>{}))))); self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=e.request.url;if(/googleapis\.com|firestore|identitytoolkit|securetoken/.test(u))return;
  e.respondWith(caches.open(V).then(async c=>{
    const hit=await c.match(e.request,{ignoreSearch:true});
    const net=fetch(e.request).then(r=>{if(r&&(r.ok||r.type==='opaque'))c.put(e.request,r.clone());return r;}).catch(()=>hit);
    return hit||net;
  }));
});
