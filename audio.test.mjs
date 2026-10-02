import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {words} from './words.js';import {letters} from './alphabet.js';import {audioFiles,alphabetAudio} from './audio-manifest.js';
test('every vocabulary pronunciation and letter sample has an authored AAC clip and matching cache manifest',()=>{
  for(const text of [...words.map(w=>w.speak),...letters.map(l=>l.sample)])assert.ok(audioFiles[text],text);
  for(const path of new Set(Object.values(audioFiles))){const data=fs.readFileSync(new URL(path,import.meta.url));assert.ok(data.length>1024,path);assert.equal(data.subarray(4,8).toString(),'ftyp');}
  const context={self:{}};vm.runInNewContext(fs.readFileSync('audio-cache.js','utf8'),context);
  assert.deepEqual([...context.self.HANGEUL_AUDIO.paths].sort(),[...new Set(Object.values(audioFiles))].sort());
  assert.deepEqual([...context.self.HANGEUL_AUDIO.precache],alphabetAudio);
  for(const l of letters)assert.ok(alphabetAudio.includes(audioFiles[l.sample]));
});
