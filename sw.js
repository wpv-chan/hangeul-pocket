const PREFIX='hangeul-pocket-'+new URL(self.registration.scope).pathname+'-';
const CACHE=PREFIX+'v1.3.1';
const ASSETS=['./','./index.html','./style.css','./app.js','./icons.js','./core.js','./speech.js','./alphabet.js','./alphabet-ui.js','./words.js','./words-0930.js','./icon.svg','./icon-192.png','./icon-512.png','./manifest.webmanifest'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
  // Cache only authored app assets. Authentication redirects and other URLs are never cached.
  const allowed=ASSETS.some(path=>new URL(path,self.registration.scope).pathname===url.pathname);
  if(!allowed)return;
  event.respondWith(fetch(event.request).then(async response=>{
    if(response.ok&&!response.redirected&&response.type==='basic'){
      const copy=response.clone();const cache=await caches.open(CACHE);await cache.put(event.request,copy);
    }
    return response;
  }).catch(async()=>{const cache=await caches.open(CACHE);return await cache.match(event.request)||(event.request.mode==='navigate'?await cache.match('./index.html'):new Response('Offline asset unavailable',{status:503}));}));
});
