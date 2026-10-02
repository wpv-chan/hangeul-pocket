import test from 'node:test';
import assert from 'node:assert/strict';
import {indexedDB} from 'fake-indexeddb';
import {freshState,review,validateBackup,quizViewFor} from './core.js';
import {words} from './words.js';
import {openStore} from './storage.js';

async function pair(t){
  const scope=crypto.randomUUID(),base=freshState();
  const a=await openStore(base,{indexedDB,scope}),b=await openStore(base,{indexedDB,scope});
  t.after(()=>{a.close();b.close();});return {a,b,base,scope};
}
function answer(state,id,eventId,correct=true){
  const time=Date.now();state.progress[id]=review(state.progress[id],correct,time);
  return {reviews:[{id,eventId,correct,time}]};
}
test('a stale tab changing mode cannot erase another tab answer or favorite',async t=>{
  const {a,b}=await pair(t);const sa=a.state,sb=b.state;
  sa.favorites.push('l1-1');const ra=answer(sa,'l1-1','a:1');sb.config.mode='spell';
  await Promise.all([a.save(sa,ra),b.save(sb)]);await b.refresh();
  sa.config.count=20;const saved=await a.save(sa);
  assert.equal(saved.state.progress['l1-1'].seen,1);assert.deepEqual(saved.state.favorites,['l1-1']);assert.equal(saved.state.config.mode,'spell');
});
test('concurrent answers merge and answering the same question twice is idempotent',async t=>{
  const {a,b}=await pair(t);const sa=a.state,sb=b.state;
  const [x,y]=await Promise.all([a.save(sa,answer(sa,'l1-1','a:1')),b.save(sb,answer(sb,'l1-1','b:1',false))]);
  const latest=await a.save(sa,{reviews:[{id:'l1-1',eventId:'a:1',correct:true,time:Date.now()}]});
  const p=latest.state.progress['l1-1'];assert.equal(p.seen,2);assert.equal(p.correct,1);assert.equal(p.wrong,1);assert.equal(Object.values(latest.state.daily)[0].total,2);
});
test('reset or import invalidates writes queued from the previous data generation',async t=>{
  const {a,b}=await pair(t);const stale=b.state;
  await a.save(freshState(),{replace:true});
  const result=await b.save(stale,answer(stale,'l1-1','stale:1'));
  assert.deepEqual(result.state.progress,{});
});
test('letter preferences, quiz and mastery survive close, reopen and backup round trip',async t=>{
  const {a,scope}=await pair(t);const s=a.state;
  s.alphabet.prefs.showHints=false;s.alphabet.prefs.tab='quiz';
  s.alphabet.quiz={id:'letters-1',queue:[{id:'ㅏ',options:['ㅏ','ㅑ','ㅓ','ㅕ']}],index:0,answers:[{id:'ㅏ',correct:false}],answer:'ㅑ',flipped:false};
  const saved=await a.save(s,{reviews:[{id:'ㅏ',eventId:'letters:1',correct:false,time:Date.now(),alphabet:true}]});
  const reader=await openStore(freshState(),{indexedDB,scope});t.after(()=>reader.close());
  assert.equal(reader.state.alphabet.prefs.showHints,false);assert.equal(reader.state.alphabet.progress['ㅏ'].weak,true);assert.equal(reader.state.alphabet.quiz.answer,'ㅑ');
  assert.deepEqual(validateBackup(JSON.parse(JSON.stringify(saved.state)),words).alphabet,saved.state.alphabet);
  assert.deepEqual(saved.state.progress,{});assert.deepEqual(saved.state.daily,{});
});
test('a stale quiz cannot regress an answered question or change its accepted answer',async t=>{
  const {a,b}=await pair(t);const base=a.state;
  base.active={id:'same-round',index:0,answers:[],queue:[{id:'l1-1'}],open:true};await a.save(base);await b.refresh();
  const before=structuredClone(base),left=structuredClone(base),right=structuredClone(base);
  left.active.answers=[{id:'l1-1',correct:true}];right.active.answers=[{id:'l1-1',correct:false}];
  // Both tabs started this question; first committed answer is authoritative.
  await a.save(left,{reviews:[{eventId:'same-round:0',id:'l1-1',correct:true,time:Date.now()}]});
  const result=await b.save(right,{reviews:[{eventId:'same-round:0',id:'l1-1',correct:false,time:Date.now()}]});
  assert.equal(result.state.progress['l1-1'].seen,1);assert.equal(result.state.progress['l1-1'].correct,1);assert.equal(result.state.active.answers[0].correct,true);
});
test('first upgrade migrates legacy records once and later stale legacy snapshots cannot replace them',async t=>{
  const scope=crypto.randomUUID(),legacy=freshState();
  legacy.progress['l1-1']={seen:7,correct:6,wrong:1,streak:4,lapses:1,weak:false,last:Date.now(),due:Date.now()+86400000};legacy.favorites=['l1-1'];delete legacy.alphabet;
  const a=await openStore(validateBackup(legacy,words),{indexedDB,scope});t.after(()=>a.close());
  assert.equal(a.state.progress['l1-1'].seen,7);assert.equal(a.state.progress['l1-1'].streak,1);assert.deepEqual(a.state.favorites,['l1-1']);
  await a.save(a.state,answer(a.state,'l1-2','new:1'));
  const b=await openStore(validateBackup(legacy,words),{indexedDB,scope});t.after(()=>b.close());
  assert.equal(b.state.progress['l1-1'].seen,7);assert.equal(b.state.progress['l1-2'].seen,1);
});

for(const kind of ['import','reset'])test(`${kind} preserves settings and answers queued before replacement finishes`,async t=>{
  const {a,scope}=await pair(t),next=freshState();
  if(kind==='import'){next.progress['l1-2']=review(undefined,false);next.favorites=['l1-2'];}
  const replacing=a.save(next,{replace:true});
  next.config.mode='spell';const settings=a.save(next);
  const grading=a.save(next,answer(next,'l1-1',`${kind}:first`));
  const [, ,saved]=await Promise.all([replacing,settings,grading]);await a.flush();
  assert.equal(saved.state.config.mode,'spell');assert.equal(saved.state.progress['l1-1'].seen,1);
  assert.equal(Object.values(saved.state.daily)[0].total,1);
  if(kind==='import'){assert.equal(saved.state.progress['l1-2'].wrong,1);assert.deepEqual(saved.state.favorites,['l1-2']);}
  const reopened=await openStore(freshState(),{indexedDB,scope});t.after(()=>reopened.close());
  assert.deepEqual(reopened.state,saved.state);
});

test('multiple queued replacements retain only the latest replacement and its following answer',async t=>{
  const {a}=await pair(t),first=freshState(),second=freshState();
  first.favorites=['l1-1'];second.favorites=['l1-2'];
  const jobs=[a.save(first,{replace:true}),a.save(first,answer(first,'l1-1','before-second')),a.save(second,{replace:true}),a.save(second,answer(second,'l1-2','after-second'))];
  const saved=(await Promise.all(jobs)).at(-1);await a.flush();
  assert.deepEqual(saved.state.favorites,['l1-2']);assert.equal(saved.state.progress['l1-1'],undefined);assert.equal(saved.state.progress['l1-2'].seen,1);
});

test('reopening then changing settings keeps the saved quiz paused until explicitly resumed',async t=>{
  const scope=crypto.randomUUID(),initial=freshState();
  initial.active={id:'unfinished',mode:'flash',open:true,resumed:100,index:0,answers:[],queue:[{id:'l1-1',type:'flash',options:[]}]};
  const first=await openStore(initial,{indexedDB,scope});first.close();
  let view;
  const store=await openStore(freshState(),{indexedDB,scope,onChange:next=>{next.active=quizViewFor(next.active,view.active);view=next;}});t.after(()=>store.close());
  view=store.state;view.active=quizViewFor(view.active);store.adopt(view);
  for(const change of [s=>s.config.mode='spell',s=>s.config.count=20,s=>s.config.lesson='2',s=>s.favorites.push('l1-1')]){
    change(view);await store.save(view);await store.flush();
    assert.equal(view.active.open,false);assert.equal(view.active.resumed,null);assert.deepEqual(view.active.queue,initial.active.queue);
  }
  view.active.open=true;view.active.resumed=200;
  await store.save(view);await store.flush();
  assert.equal(view.active.open,true);assert.equal(view.active.resumed,200);assert.equal(view.config.mode,'spell');
});
