import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {words,lessons,SOURCE_ROW_COUNT,NEW_WORD_COUNT} from './words.js';
import {freshState,review,matches,poolFor,optionsFor,validateBackup} from './core.js';

test('all photographed rows stay complete and homographs stay distinct after September additions',()=>{
  assert.deepEqual(lessons.map(l=>l.count),[34,33,35,25,38,49,51,25,26,49,20,43,36,37,32,27,34,26,30,46,25,28,21,33,15,25,24,22,28,21]);
  assert.equal(words.length,905);assert.equal(new Set(words.map(w=>w.id)).size,905);
  assert.equal(SOURCE_ROW_COUNT,938);assert.equal(NEW_WORD_COUNT,661);
  const rows=new Set(words.flatMap(w=>w.sources.map(s=>`${s.lesson}:${s.row}`)));assert.equal(rows.size,938);
  for(const l of lessons)for(let row=1;row<=l.count;row++)assert.ok(rows.has(`${l.id}:${row}`));
  assert.equal(words.filter(w=>w.ko==='저').length,2);
  assert.deepEqual(words.find(w=>w.ko==='오늘').lessons,[4,7]);
  for(const [ko,count] of [['배',3],['일',3],['분',2],['달',2],['개',2],['도',2],['쓰다',2],['이',3]])assert.equal(words.filter(w=>w.ko===ko).length,count,ko);
  for(const w of words){assert.ok(w.ko&&w.zh&&w.answers.length);assert.ok(w.sources.every(s=>s.file.endsWith('.jpg')));}
});
test('old card IDs, meanings and pronunciation remain stable for saved learning records',()=>{
  const old=words.filter(w=>!w.addedDate);assert.equal(old.length,244);
  const hash=createHash('sha256').update(JSON.stringify(old.map(({id,ko,zh,speak})=>({id,ko,zh,speak})))).digest('hex');
  assert.equal(hash,'cd714f1aef479a69e4e1d1a2aa334a2c44c3754cb485316397e28fbda077e6cb');
  const s=freshState();for(const w of old){s.progress[w.id]=review(undefined,true);s.favorites.push(w.id);}
  s.config.lesson='30';s.config.scope='added';assert.deepEqual(validateBackup(JSON.parse(JSON.stringify(s)),words),s);
});
test('spelling accepts lesson variants and rejects different meanings',()=>{
  const study=words.find(w=>w.ko==='공부(를) 하다');
  assert.ok(matches(study,'공부하다'));assert.ok(matches(study,'공부를 하다.'));assert.ok(matches(study,'공부(를) 하다'));
  assert.ok(matches(study,'공부하다'.normalize('NFD')));assert.equal(matches(study,'공부'),false);
  assert.ok(matches(words.find(w=>w.ko==='6월'),'유월'));assert.ok(matches(words.find(w=>w.ko==='영/공'),'공'));
  assert.equal(matches(words.find(w=>w.ko==='6월'),'육월'),false);
  const photos=words.find(w=>w.id==='l10-48');assert.ok(matches(photos,'사진찍다'));assert.ok(matches(photos,'사진을 찍다'));
  const noodles=words.find(w=>w.ko==='자장면/짜장면');assert.ok(matches(noodles,'짜장면'));assert.ok(matches(noodles,'자장면'));
  assert.deepEqual(photos.lessons,[10,14]);
});
test('same-day repeats and early practice cannot advance mastery or postpone a due review',()=>{
  const now=new Date(2026,9,2,12).getTime(),day=86400000;
  let p=review(undefined,false,now);assert.equal(p.due,now+600000);assert.ok(p.weak);
  p=review(p,true,now);assert.equal(p.streak,1);assert.equal(p.due,now+day);assert.ok(p.weak);
  for(let i=0;i<5;i++)p=review(p,true,now+1000+i);assert.equal(p.streak,1);assert.equal(p.due,now+day);assert.ok(p.weak);
  p=review(p,true,now+day);assert.equal(p.streak,2);assert.equal(p.due,now+4*day);assert.equal(p.weak,false);
  p=review(p,true,now+2*day);assert.equal(p.streak,2);assert.equal(p.due,now+4*day);
  p=review(p,true,now+4*day);assert.equal(p.streak,3);assert.equal(p.due,now+11*day);
  p=review(p,false,now+5*day);assert.equal(p.streak,0);assert.ok(p.weak);assert.equal(p.correct+p.wrong,p.seen);
});
test('curated synonyms work in both directions and ambiguous parts of speech get specific prompts',()=>{
  for(const w of words.filter(w=>w.equivalentIds))for(const id of w.equivalentIds){const other=words.find(x=>x.id===id);for(const answer of other.answers)assert.ok(matches(w,answer),w.ko+' / '+answer);}
  assert.ok(matches(words.find(w=>w.id==='l5-22'),'노래를 부르다'));
  assert.ok(matches(words.find(w=>w.id==='l2-23'),'한국말'));
  const noun=words.find(w=>w.id==='l12-27'),verb=words.find(w=>w.id==='l4-5');
  assert.equal(matches(noun,'운동하다'),false);assert.equal(matches(verb,'운동'),false);
  assert.notEqual(noun.spellingPrompt,verb.spellingPrompt);
  assert.ok(words.find(w=>w.id==='l8-10').spellingPrompt.includes('淋浴'));
});
test('old backups retain counts and favorites but migrate unverified mastery conservatively',()=>{
  const s=freshState(),p=review(undefined,true);delete p.scheduleVersion;delete p.stageDay;p.streak=6;p.due=Date.now()+60*86400000;
  s.progress[words[0].id]=p;s.favorites=[words[0].id];delete s.alphabet;
  const migrated=validateBackup(s,words);assert.equal(migrated.progress[words[0].id].streak,1);assert.equal(migrated.progress[words[0].id].seen,1);assert.deepEqual(migrated.favorites,s.favorites);assert.deepEqual(migrated.alphabet,freshState().alphabet);
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
  const added=poolFor(words,s,{...config,lesson:'all',scope:'added'});assert.equal(added.length,661);assert.ok(added.every(w=>w.addedDate==='2026-09-30'));
  assert.equal(poolFor(words,s,{...config,lesson:'30',scope:'added'}).length,21);
});
test('backups round trip and malformed numeric state is rejected',()=>{
  const state=freshState();state.progress[words[0].id]=review(undefined,true);state.favorites=[words[0].id];
  assert.deepEqual(validateBackup(JSON.parse(JSON.stringify(state)),words),state);
  assert.throws(()=>validateBackup({version:2,progress:{}},words));
  state.progress[words[0].id].due='tomorrow';assert.throws(()=>validateBackup(state,words));
});
