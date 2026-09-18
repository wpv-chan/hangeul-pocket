import test from 'node:test';
import assert from 'node:assert/strict';
import {words,lessons} from './words.js';
import {freshState,review,matches,poolFor,optionsFor,validateBackup} from './core.js';

test('photographed rows stay complete and homographs stay distinct',()=>{
  assert.deepEqual(lessons.map(l=>l.count),[34,33,35,25,38,49,32]);
  assert.equal(words.length,244);assert.equal(new Set(words.map(w=>w.id)).size,244);
  assert.equal(words.reduce((s,w)=>s+w.sources.length,0),246);
  assert.equal(words.filter(w=>w.ko==='저').length,2);
  assert.deepEqual(words.find(w=>w.ko==='오늘').lessons,[4,7]);
  for(const w of words){assert.ok(w.ko&&w.zh&&w.answers.length);assert.ok(w.sources.every(s=>s.file.endsWith('.jpg')));}
});
test('spelling accepts lesson variants and rejects different meanings',()=>{
  const study=words.find(w=>w.ko==='공부(를) 하다');
  assert.ok(matches(study,'공부하다'));assert.ok(matches(study,'공부를 하다.'));assert.ok(matches(study,'공부(를) 하다'));
  assert.ok(matches(study,'공부하다'.normalize('NFD')));assert.equal(matches(study,'공부'),false);
  assert.ok(matches(words.find(w=>w.ko==='6월'),'유월'));assert.ok(matches(words.find(w=>w.ko==='영/공'),'공'));
  assert.equal(matches(words.find(w=>w.ko==='6월'),'육월'),false);
});
test('wrong cards return after ten minutes and clear only after two successes',()=>{
  const now=1_000_000;let p=review(undefined,false,now);assert.equal(p.due,now+600_000);assert.ok(p.weak);
  p=review(p,true,now);assert.equal(p.due,now+86400000);assert.ok(p.weak);
  p=review(p,true,now);assert.equal(p.due,now+3*86400000);assert.equal(p.weak,false);
  p=review(p,true,now);assert.equal(p.streak,3);assert.equal(p.due,now+7*86400000);
  p=review(p,false,now);assert.equal(p.streak,0);assert.ok(p.weak);assert.equal(p.correct+p.wrong,p.seen);
});
test('all choices are unique and do not include a competing homograph',()=>{
  for(const word of words)for(const type of ['kozh','zhko','listen']){
    const options=optionsFor(word,words,type);assert.equal(options.length,4);assert.equal(new Set(options.map(o=>o.label)).size,4);assert.equal(options.filter(o=>o.id===word.id).length,1);
    assert.ok(options.every(o=>o.id===word.id||words.find(w=>w.id===o.id).ko!==word.ko));
  }
});
test('pool filtering and smart priority preserve lesson and review scope',()=>{
  const s=freshState();s.progress[words[0].id]=review(undefined,false,0);s.progress[words[1].id]=review(undefined,true,1e15);
  const config={mode:'kozh',lesson:'1',scope:'smart',count:'all'};const pool=poolFor(words,s,config,1_000_000);
  assert.equal(pool.length,34);assert.equal(pool[0].id,words[0].id);assert.equal(pool.at(-1).id,words[1].id);
  assert.equal(new Set(pool.map(w=>w.id)).size,pool.length);
  assert.equal(poolFor(words,s,{...config,scope:'wrong'}).length,1);
  assert.equal(poolFor(words,s,{...config,scope:'star'}).length,0);
});
test('backups round trip and malformed numeric state is rejected',()=>{
  const state=freshState();state.progress[words[0].id]=review(undefined,true);state.favorites=[words[0].id];
  assert.deepEqual(validateBackup(JSON.parse(JSON.stringify(state)),words),state);
  assert.throws(()=>validateBackup({version:2,progress:{}},words));
  state.progress[words[0].id].due='tomorrow';assert.throws(()=>validateBackup(state,words));
});
