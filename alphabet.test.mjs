import test from 'node:test';
import assert from 'node:assert/strict';
import {letters,letterGroups,INITIALS,MEDIALS,composeSyllable,alphabetQuestions} from './alphabet.js';

test('all modern initial and vowel letters have a playable syllable and learning hint',()=>{
  assert.equal(letters.length,40);assert.equal(new Set(letters.map(l=>l.id)).size,40);
  assert.deepEqual(letters.filter(l=>l.kind==='consonant').map(l=>l.symbol).sort(),[...INITIALS].sort());
  assert.deepEqual(letters.filter(l=>l.kind==='vowel').map(l=>l.symbol).sort(),[...MEDIALS].sort());
  assert.deepEqual(letterGroups.map(g=>letters.filter(l=>l.group===g.id).length),[10,14,11,5]);
  for(const l of letters){assert.match(l.sample,/^[가-힣]$/);assert.ok(l.roman&&l.sampleRoman&&l.hint&&l.note);}
});
test('composition follows Unicode syllable positions, including final consonants',()=>{
  assert.equal(composeSyllable('ㅇ','ㅏ'),'아');assert.equal(composeSyllable('ㄱ','ㅘ'),'과');
  assert.equal(composeSyllable('ㅎ','ㅏ','ㄴ'),'한');assert.equal(composeSyllable('ㅎ','ㅣ','ㅎ'),'힣');
  assert.throws(()=>composeSyllable('a','ㅏ'));assert.throws(()=>composeSyllable('ㄱ','ㅏ','x'));
  const syllables=new Set();for(const c of INITIALS)for(const v of MEDIALS)syllables.add(composeSyllable(c,v));
  assert.equal(syllables.size,399);
});
test('quizzes preserve selected scope and never offer equivalent vowel audio as a wrong answer',()=>{
  for(const group of ['all',...letterGroups.map(g=>g.id)])for(const mode of ['read','listen','flash'])for(let run=0;run<20;run++){
    const questions=alphabetQuestions(group,mode);
    assert.equal(questions.length,Math.min(10,letters.filter(l=>group==='all'||l.group===group).length));
    assert.equal(new Set(questions.map(q=>q.letter.id)).size,questions.length);
    for(const q of questions){
      assert.ok(group==='all'||q.letter.group===group);assert.equal(q.options.length,4);
      assert.equal(q.options.filter(o=>o.id===q.letter.id).length,1);
      assert.ok(q.options.every(o=>o.kind===q.letter.kind));
      assert.equal(new Set(q.options.map(o=>mode==='listen'?o.soundKey:o.sampleRoman)).size,4);
    }
  }
  const missed=[letters[0],letters[3]];assert.deepEqual(new Set(alphabetQuestions('all','listen',missed).map(q=>q.letter.id)),new Set(missed.map(l=>l.id)));
});
