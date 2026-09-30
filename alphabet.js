// Modern Korean letters; Mandarin hints are learning aids, not phonetic transcriptions.
export const letterGroups=[
  {id:'basic-vowels',name:'基本元音',hint:'先学这 10 个，再学组合元音。'},
  {id:'basic-consonants',name:'基本辅音',hint:'用「辅音 + ㅏ」跟读，先感受口型和气流。'},
  {id:'compound-vowels',name:'组合元音',hint:'这里按字形组合归类，不表示每个都是双元音。'},
  {id:'tense-consonants',name:'紧音辅音',hint:'发音部位收紧、气流短促；不是把声音喊大。'}
];
const vowelRows=[
  ['ㅏ','a','阿','嘴自然张开，舌头放松。','basic-vowels'],
  ['ㅑ','ya','呀','从很短的「衣」滑向「阿」，合成一个音。','basic-vowels'],
  ['ㅓ','eo','张嘴的「哦」','嘴比 ㅗ 张得更开，唇不圆；普通话没有完全对应的音。','basic-vowels'],
  ['ㅕ','yeo','短「衣」接 ㅓ','一口气滑向 ㅓ，不要读成两个分开的音。','basic-vowels'],
  ['ㅗ','o','哦（圆唇）','嘴唇收圆、稍向前；不要读成「欧」的滑音。','basic-vowels'],
  ['ㅛ','yo','哟（圆唇）','短「衣」滑向圆唇的 ㅗ。','basic-vowels'],
  ['ㅜ','u','乌','双唇收圆向前，开口较小。','basic-vowels'],
  ['ㅠ','yu','短「衣」接「乌」','类似「优」的起音，但结尾保持乌音，不是汉语拼音 ü。','basic-vowels'],
  ['ㅡ','eu','扁唇的「乌」','普通话没有完全对应的音：嘴唇放平不圆，舌头靠后。','basic-vowels'],
  ['ㅣ','i','衣','嘴角稍向两侧展开。','basic-vowels'],
  ['ㅐ','ae','近「诶」','传统发音开口比 ㅔ 大；现代口语两者常很接近，不读成「爱」。','compound-vowels','ae-e'],
  ['ㅒ','yae','短「衣」接「诶」','由 ㅑ + ㅣ 的字形组成；和 ㅖ 在口语中常接近。','compound-vowels','yae-ye'],
  ['ㅔ','e','近「诶」','保持单一元音，不要拖成两个音；与 ㅐ 常很接近。','compound-vowels','ae-e'],
  ['ㅖ','ye','短「衣」接「诶」','轻轻滑入 ㅔ；实际词语中读法还会受位置影响。','compound-vowels','yae-ye'],
  ['ㅘ','wa','哇','由圆唇的 ㅗ 很快滑向 ㅏ。','compound-vowels'],
  ['ㅙ','wae','近「歪」的起音','从乌式起音滑向「诶」，不要读成汉语「歪」的 ai 尾音。','compound-vowels','wae-oe-we'],
  ['ㅚ','oe','近「喂」','可以听到接近 we 的读法；不要按字母拼成 o-e 两个音。','compound-vowels','wae-oe-we'],
  ['ㅝ','wo','乌式起音接 ㅓ','滑向不圆唇的 ㅓ，开口比 ㅗ 更大。','compound-vowels'],
  ['ㅞ','we','近「喂」','乌式起音滑向「诶」；ㅙ、ㅚ、ㅞ 在现代口语中常接近。','compound-vowels','wae-oe-we'],
  ['ㅟ','wi','短「乌」接「衣」','常听到 wi 的滑音读法；不要只读汉语「威」的 ei。','compound-vowels'],
  ['ㅢ','ui','扁唇 ㅡ 接「衣」','练习 의 的起音；在词中还可能读作 이，助词 의 也可读作 에。','compound-vowels']
];
const consonantRows=[
  ['ㄱ','g / k','가','ga','近「嘎」（轻读）','舌后部轻触软腭；与送气的 ㅋ、收紧的 ㄲ 对比。','basic-consonants'],
  ['ㄴ','n','나','na','近「拿」','舌尖抵上齿龈，声音从鼻腔出来。','basic-consonants'],
  ['ㄷ','d / t','다','da','近「搭」（轻读）','舌尖轻触上齿龈；与 ㅌ、ㄸ 对比气流和紧张度。','basic-consonants'],
  ['ㄹ','r / l','라','ra','近「拉」（轻弹舌）','起音时舌尖轻弹一下，不是普通话翘舌 r；作收音更接近 l。','basic-consonants'],
  ['ㅁ','m','마','ma','近「妈」','双唇闭合后张开，带鼻音。','basic-consonants'],
  ['ㅂ','b / p','바','ba','近「巴」（轻读）','双唇轻合再打开；与 ㅍ、ㅃ 对比。','basic-consonants'],
  ['ㅅ','s','사','sa','近「撒」','让气流从齿间擦出；遇 ㅣ 等音时听感会变化。','basic-consonants'],
  ['ㅇ','起音无声 / 收音 ng','아','a','在 아 中读「阿」','放在音节开头只占位、不发音；放在底部作收音时读 ng。','basic-consonants'],
  ['ㅈ','j','자','ja','介于「扎／加」的起音','舌面靠近硬腭，先阻住再轻放开；普通话没有完全对应的音。','basic-consonants'],
  ['ㅊ','ch','차','cha','近「掐」的起音','与 ㅈ 相同部位，但放开时有明显气流；不要翘舌。','basic-consonants'],
  ['ㅋ','k','카','ka','近「卡」（送气）','舌后部放开时送出明显气流。','basic-consonants'],
  ['ㅌ','t','타','ta','近「他」（送气）','舌尖放开时送出明显气流。','basic-consonants'],
  ['ㅍ','p','파','pa','近「趴」（送气）','双唇放开时送出明显气流。','basic-consonants'],
  ['ㅎ','h','하','ha','近「哈」','轻轻呼气，再接元音；实际词中会有音变。','basic-consonants'],
  ['ㄲ','kk','까','kka','收紧的「嘎」','舌后部收紧后短促放开，少送气；和 ㄱ、ㅋ 反复对比。','tense-consonants'],
  ['ㄸ','tt','따','tta','收紧的「搭」','舌尖阻塞更紧、放开短促，少送气。','tense-consonants'],
  ['ㅃ','pp','빠','ppa','收紧的「巴」','双唇收紧后短促放开，少送气。','tense-consonants'],
  ['ㅆ','ss','싸','ssa','收紧的「撒」','摩擦比 ㅅ 更紧，不靠提高音量来区分。','tense-consonants'],
  ['ㅉ','jj','짜','jja','收紧的 ㅈ 起音','发音部位收紧，短促放开；与 ㅈ、ㅊ 对比。','tense-consonants']
];
export const INITIALS=[...'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'];
export const MEDIALS=[...'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'];
const FINALS=['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
export const finalHints=[['','无收音'],['ㄱ','k：舌后封住，不加「克」'],['ㄴ','n：舌尖抵住，鼻音'],['ㄷ','t：舌尖封住，不加「特」'],['ㄹ','l：舌尖抵住，不加「勒」'],['ㅁ','m：闭唇鼻音'],['ㅂ','p：闭唇停住，不加「坡」'],['ㅇ','ng：像「昂」的尾音']];
export function composeSyllable(initial,vowel,final=''){
  const l=INITIALS.indexOf(initial),v=MEDIALS.indexOf(vowel),t=FINALS.indexOf(final);
  if(l<0||v<0||t<0)throw new Error('无效的韩文字母组合');
  return String.fromCharCode(0xAC00+(l*21+v)*28+t);
}
export const letters=[
  ...vowelRows.map(([symbol,roman,hint,note,group,soundKey])=>({id:symbol,symbol,roman,hint,note,group,kind:'vowel',sample:composeSyllable('ㅇ',symbol),sampleRoman:roman,soundKey:soundKey||symbol})),
  ...consonantRows.map(([symbol,roman,sample,sampleRoman,hint,note,group])=>({id:symbol,symbol,roman,sample,sampleRoman,hint,note,group,kind:'consonant',soundKey:symbol}))
];
export const alphabetById=new Map(letters.map(l=>[l.id,l]));
const shuffle=list=>{const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
export function alphabetQuestions(group='all',mode='read',explicit){
  const pool=explicit||letters.filter(l=>group==='all'||l.group===group);
  return shuffle(pool).slice(0,10).map(letter=>{
    // Modern vowel mergers must not be marked wrong in an audio-only question.
    const seen=new Set([mode==='listen'?letter.soundKey:letter.sampleRoman]);
    const distractors=shuffle(letters.filter(l=>l.kind===letter.kind&&l.id!==letter.id)).filter(l=>{const key=mode==='listen'?l.soundKey:l.sampleRoman;if(seen.has(key))return false;seen.add(key);return true;}).slice(0,3);
    return {letter,options:shuffle([letter,...distractors])};
  });
}
