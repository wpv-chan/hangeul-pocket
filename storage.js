import {review,localDate} from './core.js';

const clone=value=>structuredClone(value);
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const uid=()=>crypto.randomUUID();
const canUpdateQuiz=(current,change)=>equal(current,change.before)||change.value===null&&!!current?.id&&current.id===change.before?.id&&(change.before.answers?.length||0)>=(current.answers?.length||0)||!!change.value?.id&&current?.id===change.value.id&&(change.value.answers?.length||0)>=(current.answers?.length||0)&&(current.answers||[]).every((answer,index)=>equal(answer,change.value.answers[index]));

// Persist intent, not a stale whole-page snapshot. IndexedDB serializes all
// read/modify/write transactions, including those from other tabs.
export function makePatch(before,after,reviews=[]){
  const patch={fields:{},config:{},prefs:{},favorites:[],sessions:[],reviews};
  for(const key of ['theme','active'])if(!equal(before[key],after[key]))patch.fields[key]={before:clone(before[key]),value:clone(after[key])};
  for(const key of Object.keys(after.config))if(!equal(before.config[key],after.config[key]))patch.config[key]=after.config[key];
  for(const key of Object.keys(after.alphabet.prefs))if(!equal(before.alphabet.prefs[key],after.alphabet.prefs[key]))patch.prefs[key]=after.alphabet.prefs[key];
  if(!equal(before.alphabet.quiz,after.alphabet.quiz))patch.quiz={before:clone(before.alphabet.quiz),value:clone(after.alphabet.quiz)};
  for(const id of new Set([...before.favorites,...after.favorites]))if(before.favorites.includes(id)!==after.favorites.includes(id))patch.favorites.push({id,value:after.favorites.includes(id)});
  patch.sessions=after.sessions.filter(s=>!before.sessions.some(b=>equal(b,s))).map(s=>({...s,id:s.id||uid()}));
  return patch;
}

export function applyPatch(state,patch,applied=new Set()){
  const next=clone(state);
  for(const [key,change] of Object.entries(patch.fields)){
    // An old paused page must not resurrect or overwrite another quiz.
    if(key!=='active'||canUpdateQuiz(next.active,change))next[key]=clone(change.value);
  }
  Object.assign(next.config,patch.config);Object.assign(next.alphabet.prefs,patch.prefs);
  if(patch.quiz&&(canUpdateQuiz(next.alphabet.quiz,patch.quiz)))next.alphabet.quiz=clone(patch.quiz.value);
  for(const {id,value} of patch.favorites)next.favorites=value?[...new Set([...next.favorites,id])]:next.favorites.filter(x=>x!==id);
  for(const entry of patch.reviews){
    if(applied.has(entry.eventId))continue;applied.add(entry.eventId);
    const progress=entry.alphabet?next.alphabet.progress:next.progress;
    progress[entry.id]=review(progress[entry.id],entry.correct,entry.time);
    if(!entry.alphabet){const day=localDate(entry.time);next.daily[day]??={total:0,correct:0};next.daily[day].total++;if(entry.correct)next.daily[day].correct++;}
  }
  next.sessions=[...next.sessions,...patch.sessions.filter(s=>!next.sessions.some(old=>old.id===s.id))].slice(-200);
  return next;
}

export async function openStore(initial,{indexedDB=globalThis.indexedDB,scope='default',onChange=()=>{},onError=()=>{}}={}){
  const request=indexedDB.open('hangeul-pocket-'+scope,1);
  const db=await new Promise((resolve,reject)=>{
    request.onupgradeneeded=()=>{request.result.createObjectStore('state');request.result.createObjectStore('answers');};
    request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
    request.onblocked=()=>reject(new Error('请关闭其他旧页面后重试。'));
  });
  function transaction(fn){return new Promise((resolve,reject)=>{
    const tx=db.transaction(['state','answers'],'readwrite'),store=tx.objectStore('state');let result;
    tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('保存被中断。'));
    const get=store.get('current');get.onsuccess=()=>{try{result=fn(get.result,store,tx.objectStore('answers'));}catch(e){tx.abort();reject(e);}};
  });}
  let record=await transaction((r,store)=>{if(!r){r={epoch:uid(),state:clone(initial)};store.put(r,'current');}return r;});
  let baseline=clone(record.state),writeEpoch=record.epoch,tail=Promise.resolve(),pending=0,refreshPending=false,failed=false;
  const channel=typeof BroadcastChannel==='function'?new BroadcastChannel('hangeul-pocket-'+scope):null;
  async function refresh(){
    if(failed)return;
    if(pending){refreshPending=true;return;}
    const next=await transaction(r=>r);
    if(pending){refreshPending=true;return;}
    if(!equal(record,next)){record=next;writeEpoch=next.epoch;const snapshot=clone(next.state);onChange(snapshot,true);baseline=clone(snapshot);}
  }
  if(channel)channel.onmessage=()=>refresh().catch(onError);
  function save(state,{reviews=[],replace=false}={}){
    // Reserve the replacement generation now so subsequent local writes join it,
    // while other pages still retain their old generation until they refresh.
    if(replace)writeEpoch=uid();
    const patch=makePatch(baseline,state,reviews),replacement=replace?clone(state):null,epoch=writeEpoch;
    baseline=clone(state);pending++;
    const job=tail.then(()=>{if(failed)throw new Error("请导出备份后重新打开网页。");return new Promise((resolve,reject)=>{
      const tx=db.transaction(['state','answers'],'readwrite'),store=tx.objectStore('state'),answers=tx.objectStore('answers');let next;
      tx.oncomplete=()=>resolve(next);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('保存被中断。'));
      const get=store.get('current');get.onsuccess=()=>{
        const current=get.result;
        if(replacement){next={epoch,state:replacement};answers.clear();store.put(next,'current');return;}
        if(current.epoch!==epoch){next=current;return;} // Reset/import invalidates writes from old pages.
        const applied=new Set();let left=reviews.length;
        const finish=()=>{next={epoch:current.epoch,state:applyPatch(current.state,patch,applied)};for(const e of reviews)answers.put(true,e.eventId);store.put(next,'current');};
        if(!left){finish();return;}
        for(const e of reviews){const query=answers.get(e.eventId);query.onsuccess=()=>{if(query.result)applied.add(e.eventId);if(!--left)finish();};}
      };
    });});
    tail=job.then(next=>{record=next;channel?.postMessage('saved');},error=>{failed=true;onError(error);}).finally(()=>{
      pending--;if(!pending&&!failed){writeEpoch=record.epoch;const snapshot=clone(record.state);onChange(snapshot,false);baseline=clone(snapshot);if(refreshPending){refreshPending=false;refresh().catch(onError);}}
    });
    return job;
  }
  return {state:clone(record.state),adopt:state=>{baseline=clone(state);},save,refresh,flush:()=>tail,close:()=>{channel?.close();db.close();}};
}
