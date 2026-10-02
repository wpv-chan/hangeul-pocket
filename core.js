export const STORAGE_KEY = 'hangeul-pocket-v1';
export const intervals = [1,3,7,14,30,60];
export function localDate(time=Date.now()) { const d=new Date(time);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
export function freshState(){return {version:1,progress:{},favorites:[],sessions:[],daily:{},active:null,config:{mode:'kozh',lesson:'all',scope:'smart',count:10},theme:'light',alphabet:{prefs:{tab:'learn',group:'basic-vowels',showHints:true,quizMode:'read',initial:'ㄱ',vowel:'ㅏ',final:''},progress:{},quiz:null}};}
export function normalize(text){return String(text).normalize('NFC').replace(/[\s?!.,。？！·]/gu,'').toLowerCase();}
export function matches(word,input){return [...word.answers,word.ko].some(a=>normalize(a)===normalize(input));}
export function shuffled(items,random=Math.random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
// Only a due review on a later calendar day advances the interval.
export function review(prev={},correct,now=Date.now()){
  const prior=prev.scheduleVersion===2?prev.streak||0:Math.min(prev.streak||0,1);
  const eligible=!prior||(now>=(prev.due||0)&&localDate(now)!==(prev.stageDay||localDate(prev.last||0)));
  const streak=correct?prior+(eligible?1:0):0;
  const due=!correct?now+600000:eligible?now+intervals[Math.min(streak-1,intervals.length-1)]*86400000:prev.due;
  return {seen:(prev.seen||0)+1,correct:(prev.correct||0)+(correct?1:0),wrong:(prev.wrong||0)+(correct?0:1),streak,lapses:(prev.lapses||0)+(correct?0:1),weak:!correct||(!!prev.weak&&streak<2),due,last:now,scheduleVersion:2,stageDay:correct&&eligible?localDate(now):prev.stageDay||localDate(prev.last||now)};
}
export function poolFor(words,state,config,now=Date.now()){
  let pool=words.filter(w=>config.lesson==='all'||w.lessons.includes(Number(config.lesson)));
  if(config.scope==='added')pool=pool.filter(w=>w.addedDate==='2026-09-30');
  if(config.scope==='wrong')pool=pool.filter(w=>state.progress[w.id]?.weak);
  if(config.scope==='star')pool=pool.filter(w=>state.favorites.includes(w.id));
  pool=shuffled(pool);
  if(config.scope==='smart')pool.sort((a,b)=>{
    const p=w=>{const s=state.progress[w.id];return !s?1:s.due<=now?0:2;};return p(a)-p(b);
  });
  return pool.slice(0,config.count==='all'?pool.length:Number(config.count));
}
export function optionsFor(word,words,type){
  const field=type==='zhko'?'ko':'zh';
  const used=new Set([word[field]]);
  const candidates=shuffled(words.filter(w=>w.id!==word.id&&w.ko!==word.ko&&w.zh!==word.zh&&!word.equivalentIds?.includes(w.id)));
  const options=[{id:word.id,label:word[field]}];
  for(const w of candidates){if(!used.has(w[field])){options.push({id:w.id,label:w[field]});used.add(w[field]);}if(options.length===4)break;}
  return shuffled(options);
}
export function validateBackup(data,words){
  if(!data||data.version!==1||typeof data.progress!=='object'||!data.progress||Array.isArray(data.progress))throw new Error('这不是韩语口袋的进度备份。');
  const validIds=new Set(words.map(w=>w.id));const result=freshState();
  for(const [id,p] of Object.entries(data.progress)){
    if(!validIds.has(id))continue;
    if(!p||typeof p!=='object')throw new Error('备份里的学习记录不完整。');
    const item={};
    for(const key of ['seen','correct','wrong','streak','lapses','due','last']){
      if(!Number.isFinite(p[key])||p[key]<0)throw new Error('备份里的学习记录格式不正确。');item[key]=p[key];
    }
    if(p.correct+p.wrong!==p.seen)throw new Error('备份里的学习次数不一致。');
    item.weak=!!p.weak;item.scheduleVersion=2;item.stageDay=typeof p.stageDay==='string'?p.stageDay:localDate(p.last);if(p.scheduleVersion!==2){item.streak=Math.min(item.streak,1);item.due=Math.min(item.due,Date.now()+86400000);}result.progress[id]=item;
  }
  result.favorites=Array.isArray(data.favorites)?[...new Set(data.favorites.filter(id=>validIds.has(id)))]:[];
  if(data.daily&&typeof data.daily==='object'&&!Array.isArray(data.daily))for(const [date,counts] of Object.entries(data.daily)){
    if(/^\d{4}-\d{2}-\d{2}$/.test(date)&&counts&&Number.isFinite(counts.total)&&Number.isFinite(counts.correct)&&counts.total>=0&&counts.correct>=0&&counts.correct<=counts.total)result.daily[date]={total:counts.total,correct:counts.correct};
  }
  result.sessions=Array.isArray(data.sessions)?data.sessions.filter(s=>s&&Number.isFinite(s.time)&&Number.isInteger(s.total)&&s.total>0&&Number.isInteger(s.correct)&&s.correct>=0&&s.correct<=s.total&&Number.isFinite(s.seconds)&&s.seconds>=0&&typeof s.mode==='string').map(s=>({...(s.id?{id:s.id}:{}),time:s.time,total:s.total,correct:s.correct,seconds:s.seconds,mode:s.mode})).slice(-200):[];
  result.theme=data.theme==='dark'?'dark':'light';
  if(data.config&&['flash','kozh','zhko','spell','listen','mix'].includes(data.config.mode)){
    result.config={mode:data.config.mode,lesson:['all',...new Set(words.flatMap(w=>w.lessons).map(String))].includes(String(data.config.lesson))?String(data.config.lesson):'all',scope:['smart','all','wrong','star','added'].includes(data.config.scope)?data.config.scope:'smart',count:[10,20,'all'].includes(data.config.count)?data.config.count:10};
  }
  if(data.alphabet&&typeof data.alphabet==='object'){
    const a=data.alphabet,p=a.prefs||{},ids=new Set(['ㅏ','ㅑ','ㅓ','ㅕ','ㅗ','ㅛ','ㅜ','ㅠ','ㅡ','ㅣ','ㅐ','ㅒ','ㅔ','ㅖ','ㅘ','ㅙ','ㅚ','ㅝ','ㅞ','ㅟ','ㅢ','ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ','ㄲ','ㄸ','ㅃ','ㅆ','ㅉ']);
    for(const [key,allowed] of Object.entries({tab:['learn','compose','quiz'],group:['all','basic-vowels','basic-consonants','compound-vowels','tense-consonants'],quizMode:['read','listen','flash'],initial:['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'],vowel:['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'],final:['','ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅇ']}))if(allowed.includes(p[key]))result.alphabet.prefs[key]=p[key];
    if(typeof p.showHints==='boolean')result.alphabet.prefs.showHints=p.showHints;
    for(const [id,v] of Object.entries(a.progress||{}))if(ids.has(id)&&v&&['seen','correct','wrong','streak','lapses','due','last'].every(k=>Number.isFinite(v[k])&&v[k]>=0)&&v.correct+v.wrong===v.seen)result.alphabet.progress[id]={...v};
    const q=a.quiz;
    if(q&&typeof q.id==='string'&&Array.isArray(q.queue)&&q.queue.length>0&&q.queue.length<=40&&q.queue.every(x=>ids.has(x.id)&&Array.isArray(x.options)&&x.options.length===4&&x.options.every(id=>ids.has(id)))&&Number.isInteger(q.index)&&q.index>=0&&q.index<=q.queue.length&&Array.isArray(q.answers)&&q.answers.length===(q.index+(q.answer!==null&&q.index<q.queue.length?1:0))&&q.answers.every(x=>ids.has(x.id)&&typeof x.correct==='boolean'))result.alphabet.quiz=q;
  }
  return result;
}
