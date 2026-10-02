// Release 2026100203: cached audio and storage migration.
importScripts('./audio-cache.js');
const PREFIX='hangeul-pocket-'+new URL(self.registration.scope).pathname+'-';
const CACHE=PREFIX+'v1.4.0',AUDIO_CACHE=PREFIX+'audio-v1';
const ASSETS=['./','./index.html','./style.css','./app.js','./icons.js','./core.js','./storage.js','./speech.js','./alphabet.js','./alphabet-ui.js','./words.js','./words-0930.js','./audio-manifest.js','./icon.svg','./icon-192.png','./icon-512.png','./manifest.webmanifest'];
const absolute=path=>new URL(path,self.registration.scope).href;
const assets=new Set(ASSETS.map(absolute)),audio=new Set(self.HANGEUL_AUDIO.paths.map(absolute));
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  // Activate only after a complete app shell and alphabet audio are cached.
  await cache.addAll(ASSETS.map(path=>new Request(absolute(path),{cache:'reload'})));
  await (await caches.open(AUDIO_CACHE)).addAll(self.HANGEUL_AUDIO.precache.map(path=>new Request(absolute(path),{cache:'reload'})));
  await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  await Promise.all((await caches.keys()).filter(k=>k.startsWith(PREFIX)&&k!==CACHE&&k!==AUDIO_CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
})()));
async function ranged(response,range){
  if(!range||!response.ok)return response;
  const match=/^bytes=(\d*)-(\d*)$/.exec(range);
  if(!match||!match[1]&&!match[2])return response;
  const data=await response.arrayBuffer(),length=data.byteLength;
  const start=match[1]?Number(match[1]):Math.max(0,length-Number(match[2]));
  const end=match[1]?(match[2]?Math.min(Number(match[2]),length-1):length-1):length-1;
  if(start>end||start>=length)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${length}`}});
  const headers=new Headers(response.headers);headers.set('Content-Range',`bytes ${start}-${end}/${length}`);headers.set('Content-Length',String(end-start+1));headers.set('Accept-Ranges','bytes');
  return new Response(data.slice(start,end+1),{status:206,headers});
}
async function respond(request,url,isAudio){
  const cache=await caches.open(isAudio?AUDIO_CACHE:CACHE);
  const key=request.mode==='navigate'?absolute('./index.html'):url;
  const cached=await cache.match(key);
  if(cached)return isAudio?ranged(cached,request.headers.get('Range')):cached;
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),4000);
  try{
    // Cache complete audio; Safari's byte range requests are served below.
    const response=await fetch(key,{signal:controller.signal,cache:'no-cache'});
    if(!response.ok||response.redirected||!['basic','default'].includes(response.type))throw new Error('Unavailable asset');
    try{await cache.put(key,response.clone());}catch{/* Quota must not discard a usable network response. */}
    return isAudio?ranged(response,request.headers.get('Range')):response;
  }catch{
    return await cache.match(key)||new Response('暂时无法加载，请联网后重试。',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});
  }finally{clearTimeout(timer);}
}
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);url.search='';
  if(event.request.method!=='GET'||url.origin!==self.location.origin||!assets.has(url.href)&&!audio.has(url.href))return;
  event.respondWith(respond(event.request,url.href,audio.has(url.href)));
});
