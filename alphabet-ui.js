import {letters,letterGroups,alphabetById,INITIALS,MEDIALS,finalHints,composeSyllable,alphabetQuestions} from './alphabet.js';

export function createAlphabetPage({esc,icon,speak,render,toast,supported,getVoiceStatus,stop}){
  let tab='learn',group='basic-vowels',showHints=true,quizMode='read',quiz=null;
  let initial='ㄱ',vowel='ㅏ',final='';
  const audio=(text,label,slow=false)=>`<button class="button ${slow?'outlined':'tonal'}" data-letter-speak="${esc(text)}" data-letter-slow="${slow}" aria-label="${esc(label)}">${icon('audio')} ${slow?'慢速':'试听 '+esc(text)}</button>`;
  const groupOptions=()=>`<option value="all" ${group==='all'?'selected':''}>全部 40 个字母</option>`+letterGroups.map(g=>`<option value="${g.id}" ${group===g.id?'selected':''}>${g.name} · ${letters.filter(l=>l.group===g.id).length} 个</option>`).join('');
  function renderPage(){
    return `<div class="page-heading"><div><h1>从字母，读出韩语。</h1><p>认字母 → 练拼读 → 小测验，按自己的节奏来。</p></div><span class="heading-stamp">21 个元音 · 19 个辅音</span></div>
    <div class="alphabet-tabs segmented" role="group" aria-label="字母学习方式">${[['learn','认字母'],['compose','练拼读'],['quiz','小测验']].map(([id,label])=>`<button class="segment" data-alphabet-tab="${id}" aria-pressed="${tab===id}">${label}</button>`).join('')}</div>
    <p class="alphabet-voice-status" id="alphabet-voice-status" role="status">${esc(getVoiceStatus())}</p>
    ${tab==='learn'?renderLearn():tab==='compose'?renderComposer():renderQuiz()}`;
  }
  function renderLearn(){
    const g=letterGroups.find(g=>g.id===group);
    return `<section class="panel alphabet-intro"><div class="row between wrap"><div><h2>先听一遍，再跟着读</h2><p>中文提示按普通话近似，不加汉语声调。罗马字也只是辅助；遇到陌生的音，结合口型和试听来模仿。</p></div><label class="alphabet-toggle"><input type="checkbox" id="alphabet-hints" ${showHints?'checked':''}> 显示中文提示</label></div><p class="caption">辅音用「辅音 + ㅏ」示范，如 ㄱ → 가；这不是字母名称。元音前的 ㅇ 只占位、不发音。</p></section>
    <div class="filter-chips alphabet-groups" role="group" aria-label="字母分类">${letterGroups.map(g=>`<button class="chip ${group===g.id?'active':''}" data-letter-group="${g.id}" aria-pressed="${group===g.id}">${g.name} ${letters.filter(l=>l.group===g.id).length}</button>`).join('')}</div>
    <p class="alphabet-group-hint">${g?g.hint:'全部 40 个现代韩文字母。'}</p>
    <div class="alphabet-grid">${letters.filter(l=>group==='all'||l.group===group).map(l=>`<article class="panel letter-card"><div class="row between"><strong class="letter-symbol" lang="ko">${l.symbol}</strong><span class="letter-roman">${esc(l.roman)}</span></div><p class="letter-example">${l.kind==='vowel'?'加 ㅇ 读':'配 ㅏ 读'} <strong lang="ko">${l.sample}</strong> <span>${l.sampleRoman}</span></p>${showHints?`<p class="letter-hint"><span>中文近似</span>${esc(l.hint)}</p>`:''}<p class="letter-note">${esc(l.note)}</p><div class="row wrap letter-audio">${audio(l.sample,'试听 '+l.symbol+' 的示范音 '+l.sample)}${audio(l.sample,'慢速试听 '+l.symbol+' 的示范音 '+l.sample,true)}</div></article>`).join('')}</div>
    <section class="panel alphabet-tip"><h2>容易混淆？成组对比听</h2><p>平音轻放开，送气音有明显气流，紧音收紧后短促放开。把手放在嘴前感受差别。</p><div class="alphabet-comparisons">${[['가','카','까'],['다','타','따'],['바','파','빠'],['자','차','짜'],['사','싸']].map(row=>`<div class="row wrap">${row.map((text,i)=>`<button class="button outlined" data-letter-speak="${text}">${icon('audio')} <span lang="ko">${text}</span> <small>${row.length===2?(i===0?'平音':'紧音'):['平音','送气','紧音'][i]}</small></button>`).join('')}</div>`).join('')}</div></section>
    ${sources()}`;
  }
  function sources(){return `<p class="source-note">字母分类与罗马字参考韩国国立国语院的 <a href="https://www.korean.go.kr/hangeul/principle/001.html" target="_blank" rel="noopener">韩文字母说明</a>、<a href="https://www.korean.go.kr/front_eng/roman/roman_01.do" target="_blank" rel="noopener">罗马字表记</a>。中文近似与口型提示为本页学习辅助，不是标准音标。试听使用设备的韩语合成声音。</p>`;}
  function renderComposer(){
    const syllable=composeSyllable(initial,vowel,final);
    return `<section class="panel alphabet-intro"><h2>一个方块，就是一个音节</h2><p>先选辅音和元音，看看它们怎么合成一个字；再试试把收音放到底部。这里只练单个音节，连成词后还会有音变。</p></section>
    <div class="alphabet-compose"><section class="panel"><div class="stack"><label class="field">① 开头辅音<select id="compose-initial">${INITIALS.map(s=>`<option ${s===initial?'selected':''}>${s}</option>`).join('')}</select></label><label class="field">② 元音<select id="compose-vowel">${MEDIALS.map(s=>`<option value="${s}" ${s===vowel?'selected':''}>${s} · ${alphabetById.get(s).roman}</option>`).join('')}</select></label><label class="field">③ 收音 · 先练 7 种基本收尾音<select id="compose-final">${finalHints.map(([s,h])=>`<option value="${s}" ${s===final?'selected':''}>${s?s+' · ':''}${esc(h)}</option>`).join('')}</select></label></div></section>
    <section class="panel syllable-panel" aria-live="polite"><p class="caption">${initial} + ${vowel}${final?' + '+final:''}</p><strong class="composed-syllable" lang="ko">${syllable}</strong><p>${initial==='ㅇ'?'开头 ㅇ 不发音。':`开头用 ${initial}。`}${final?'收音放到底部，收住后不要再加元音。':'没有收音，读到元音就结束。'}</p><div class="row wrap">${audio(syllable,'试听拼读 '+syllable)}${audio(syllable,'慢速试听拼读 '+syllable,true)}</div></section></div>
    <section class="panel alphabet-tip"><h2>先把这几组读顺</h2><div class="row wrap alphabet-presets">${[['ㅇ','ㅏ','','아'],['ㄴ','ㅏ','','나'],['ㄱ','ㅗ','','고'],['ㅁ','ㅜ','','무'],['ㅎ','ㅏ','ㄴ','한']].map(([l,v,t,s])=>`<button class="chip" data-compose-preset="${l},${v},${t}"><span lang="ko">${s}</span></button>`).join('')}</div><p>竖向元音通常写在辅音右侧（나），横向元音通常写在下方（고），组合元音会占右侧与下方（과）。收音统称 받침，完整规则可以在掌握字母后继续学。</p></section>${sources()}`;
  }
  function renderQuiz(){
    if(!quiz)return `<section class="panel alphabet-quiz-setup"><h2>认得出，也听得出</h2><p class="alphabet-group-hint">每轮最多 10 个字母；先从基本元音开始。这里的练习独立于词汇测验。</p><div class="stack"><label class="field">练习范围<select id="letter-quiz-group">${groupOptions()}</select></label><label class="field">测验方式<select id="letter-quiz-mode">${[['read','看字选音 · 选择示范音的罗马字'],['listen','听音认字 · 点击播放后选字母'],['flash','字母闪卡 · 回想后翻卡']].map(([id,label])=>`<option value="${id}" ${quizMode===id?'selected':''}>${label}</option>`).join('')}</select></label></div><p class="source-note">听音题不把 ㅐ / ㅔ、ㅒ / ㅖ、ㅙ / ㅚ / ㅞ 放在同一道题里，以免相近读音造成误判。看字题练习字母对应的罗马字写法。</p><button class="button" data-letter-action="start">开始字母测验 ${icon('arrow')}</button></section>`;
    if(quiz.index===quiz.queue.length){
      const wrong=quiz.answers.filter(a=>!a.correct).map(a=>alphabetById.get(a.id));
      return `<section class="panel alphabet-summary"><span class="eyebrow">${quizMode==='flash'?'闪卡回想完成':'字母测验完成'}</span><h2>${quiz.answers.filter(a=>a.correct).length} / ${quiz.queue.length} ${quizMode==='flash'?'个认识':'题答对'}</h2><p>${wrong.length?'再听一遍不熟的字母，然后重新练习。':'继续练拼读，把字母组合成音节。'}</p>${wrong.length?`<div class="alphabet-review">${wrong.map(l=>`<div><strong lang="ko">${l.symbol}</strong><span>${l.sample} · ${l.sampleRoman}<br>${esc(l.hint)}</span>${audio(l.sample,'重听 '+l.symbol)}</div>`).join('')}</div>`:''}<div class="row wrap"><button class="button" data-letter-action="restart">再练一轮</button>${wrong.length?'<button class="button tonal" data-letter-action="retry">只练不熟的</button>':''}<button class="button outlined" data-letter-action="exit">返回选择</button></div><p class="source-note">本轮结果供即时复习，关闭网页后不保留，不计入词汇学习进度。</p></section>`;
    }
    const q=quiz.queue[quiz.index],l=q.letter,answered=quiz.answer!==null,revealed=answered||quiz.flipped;
    return `<div class="quiz-wrap alphabet-quiz"><div class="quiz-toolbar"><div><h2>${quizMode==='listen'?'听音认字':quizMode==='flash'?'字母闪卡':'看字选音'}</h2><p>第 ${quiz.index+1} / ${quiz.queue.length} 题</p></div><button class="button text" data-letter-action="exit">结束本轮</button></div><div class="progress-track"><div class="progress-fill" style="width:${quiz.index/quiz.queue.length*100}%"></div></div>
    <section class="panel alphabet-question"><p class="caption">${quizMode==='listen'?'先点播放，再选择对应字母。辅音读的是配 ㅏ 的音节。':quizMode==='flash'?'回想这个字母的示范音，再翻卡检查。':l.kind==='vowel'?'加无声的 ㅇ 后，这个元音用哪种罗马字表示？':'给这个辅音配上 ㅏ，示范音节用哪种罗马字表示？'}</p>${quizMode==='listen'?`<div class="alphabet-listen">${audio(l.sample,'播放本题示范音').replace('试听 '+l.sample,'播放题目')}${audio(l.sample,'慢速播放本题示范音',true)}</div>`:`<strong class="quiz-letter" lang="ko">${l.symbol}</strong>`}${quizMode==='flash'?`<button class="button tonal" data-letter-action="flip">${revealed?'已翻卡':'翻卡看答案'}</button>`:''}</section>
    ${quizMode!=='flash'?`<div class="answer-grid">${q.options.map(o=>`<button class="answer ${answered?(o.id===l.id?'correct':o.id===quiz.answer?'incorrect':''):''}" data-letter-answer="${o.id}" ${answered?'disabled':''}><span class="alphabet-answer-label" ${quizMode==='listen'?'lang="ko"':''}>${esc(quizMode==='listen'?o.symbol:o.sampleRoman)}</span>${answered&&o.id===l.id?icon('check'):''}</button>`).join('')}</div>`:''}
    ${revealed?`<section class="feedback ${answered&&!quiz.answers.at(-1).correct?'bad':'good'}" role="status"><h3>${answered?(quiz.answers.at(-1).correct?(quizMode==='flash'?'已认识':'答对了'):'再记一次'):'示范音'}</h3><p><strong lang="ko">${l.symbol} → ${l.sample}</strong> · ${l.sampleRoman}<br>中文近似：${esc(l.hint)}<br>${esc(l.note)}</p><div class="row wrap">${audio(l.sample,'试听答案 '+l.sample)}${answered?`<button class="button" data-letter-action="next">${quiz.index+1===quiz.queue.length?'查看结果':'下一题'} ${icon('arrow')}</button>`:`<button class="button" data-letter-action="known">认识了</button><button class="button outlined" data-letter-action="unknown">再记一次</button>`}</div></section>`:''}</div>`;
  }
  function start(explicit){stop();if(quizMode==='listen'&&!supported){toast('此浏览器不支持语音播放，请用 Safari 打开，或选择看字题。');return;}quiz={queue:alphabetQuestions(group,quizMode,explicit),index:0,answers:[],answer:null,flipped:false};render();window.scrollTo(0,0);}
  function grade(correct,answer){if(!quiz||quiz.answer!==null)return;const l=quiz.queue[quiz.index].letter;quiz.answer=answer;quiz.answers.push({id:l.id,correct});render();document.querySelector('.feedback')?.scrollIntoView({block:'nearest',behavior:'smooth'});}
  function bind(){
    document.querySelectorAll('[data-alphabet-tab]').forEach(el=>el.onclick=()=>{stop();tab=el.dataset.alphabetTab;render();});
    document.querySelectorAll('[data-letter-group]').forEach(el=>el.onclick=()=>{group=el.dataset.letterGroup;render();});
    document.querySelectorAll('[data-letter-speak]').forEach(el=>el.onclick=()=>speak({speak:el.dataset.letterSpeak},el.dataset.letterSlow==='true'));
    document.querySelector('#alphabet-hints')?.addEventListener('change',e=>{showHints=e.target.checked;render();});
    for(const [id,set] of [['compose-initial',v=>initial=v],['compose-vowel',v=>vowel=v],['compose-final',v=>final=v]])document.querySelector('#'+id)?.addEventListener('change',e=>{set(e.target.value);render();document.querySelector('#'+id)?.focus({preventScroll:true});});
    document.querySelectorAll('[data-compose-preset]').forEach(el=>el.onclick=()=>{[initial,vowel,final]=el.dataset.composePreset.split(',');render();});
    document.querySelector('#letter-quiz-group')?.addEventListener('change',e=>group=e.target.value);
    document.querySelector('#letter-quiz-mode')?.addEventListener('change',e=>quizMode=e.target.value);
    document.querySelectorAll('[data-letter-answer]').forEach(el=>el.onclick=()=>grade(el.dataset.letterAnswer===quiz.queue[quiz.index].letter.id,el.dataset.letterAnswer));
    document.querySelectorAll('[data-letter-action]').forEach(el=>el.onclick=()=>{
      const action=el.dataset.letterAction;
      if(action==='start'||action==='restart')return start();
      if(action==='retry')return start(quiz.answers.filter(a=>!a.correct).map(a=>alphabetById.get(a.id)));
      if(action==='exit'){stop();quiz=null;render();}
      if(action==='flip'){quiz.flipped=true;render();}
      if(action==='known'||action==='unknown')grade(action==='known',action);
      if(action==='next'&&quiz.answer!==null){stop();quiz.index++;quiz.answer=null;quiz.flipped=false;render();window.scrollTo(0,0);}
    });
  }
  return {render:renderPage,bind};
}
