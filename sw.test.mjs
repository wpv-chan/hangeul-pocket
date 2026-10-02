import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
function worker({cached=null,network=async()=>new Response('network'),quota=false}={}){
  const handlers={},puts=[];let calls=0;
  const self={registration:{scope:'https://example.test/app/'},location:{origin:'https://example.test'},HANGEUL_AUDIO:{paths:['./audio/test.m4a'],precache:[]},addEventListener:(name,fn)=>handlers[name]=fn};
  vm.runInNewContext(fs.readFileSync('sw.js','utf8'),{self,importScripts:()=>{},URL,Request,Response,Headers,AbortController,setTimeout:(fn)=>setTimeout(fn,10),clearTimeout,caches:{open:async()=>({match:async()=>cached?.clone(),put:async(...args)=>{if(quota)throw new Error('quota');puts.push(args);}})},fetch:async(...args)=>{calls++;return network(...args);}});
  return {request:async(path='./index.html',headers={})=>{let response;handlers.fetch({request:new Request(new URL(path,self.registration.scope),{headers}),respondWith:p=>response=p});return response;},calls:()=>calls,puts};
}
test('a complete cache responds immediately even if the network returns 503 or never completes',async()=>{
  for(const network of [async()=>new Response('bad',{status:503}),()=>new Promise(()=>{})]){
    const w=worker({cached:new Response('cached'),network}),r=await w.request();assert.equal(await r.text(),'cached');assert.equal(w.calls(),0);
  }
});
test('uncached requests time out and HTTP errors never poison the cache',async()=>{
  const w=worker({network:(_url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('timeout'))))});
  assert.equal((await w.request()).status,503);
  const bad=worker({network:async()=>new Response('bad',{status:503})});assert.equal((await bad.request()).status,503);assert.equal(bad.puts.length,0);
});
test('cache quota failure preserves a valid online response',async()=>{
  const w=worker({quota:true});assert.equal(await (await w.request()).text(),'network');
});
test('cached audio supports Safari byte range and suffix requests offline',async()=>{
  const w=worker({cached:new Response('0123456789',{headers:{'Content-Type':'audio/mp4'}})});
  const r=await w.request('./audio/test.m4a',{Range:'bytes=2-5'});assert.equal(r.status,206);assert.equal(r.headers.get('Content-Range'),'bytes 2-5/10');assert.equal(await r.text(),'2345');
  assert.equal(await(await w.request('./audio/test.m4a',{Range:'bytes=-3'})).text(),'789');
  assert.equal((await w.request('./audio/test.m4a',{Range:'bytes=20-30'})).status,416);
});
