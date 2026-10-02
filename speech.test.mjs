import test from 'node:test';
import assert from 'node:assert/strict';
import {createSpeechPlayer} from './speech.js';

function setup(options={}){
  const events=[],calls=[],timers=new Map();let next=0;
  const synth={speaking:false,pending:false,paused:false,voices:[],getVoices(){return this.voices;},cancel(){calls.push('cancel');this.speaking=this.pending=false;},resume(){calls.push('resume');this.paused=false;},speak(u){calls.push('speak');this.utterance=u;this.pending=true;}};
  class Utterance{constructor(text){this.text=text;}}
  const player=createSpeechPlayer({synth,Utterance,onState:(...event)=>events.push(event),setTimer:(fn)=>{timers.set(++next,fn);return next;},clearTimer:id=>timers.delete(id),...options});
  return {player,synth,events,calls,timers,expire:()=>[...timers.values()][0]()};
}

test('empty Safari voice list still starts Korean synchronously and only animates after onstart',()=>{
  const f=setup({automaticVoice:true});assert.ok(f.player.play('안녕하세요'));
  assert.deepEqual(f.calls,['speak']);assert.equal(f.synth.utterance.lang,'ko-KR');assert.equal(f.synth.utterance.voice,undefined);
  assert.equal(f.player.diagnostics().status,'loading');f.synth.utterance.onstart();assert.equal(f.player.diagnostics().status,'playing');
  f.synth.utterance.onend();assert.equal(f.player.diagnostics().status,'ended');assert.equal(f.timers.size,0);
});
test('voice loaded after initialization is selected on next click; Apple keeps language selection',()=>{
  const f=setup();f.player.play('하나');f.synth.utterance.onend();f.synth.pending=false;
  const voice={lang:'ko_KR'};f.synth.voices=[voice];f.player.play('둘',true);assert.equal(f.synth.utterance.voice,voice);assert.equal(f.synth.utterance.rate,.65);
  const apple=setup({automaticVoice:true});apple.synth.voices=[voice];apple.player.play('셋');assert.equal(apple.synth.utterance.voice,undefined);
});
test('paused/stuck queue resets before playback; old callbacks cannot finish the new utterance',()=>{
  const f=setup();f.synth.paused=true;f.synth.pending=true;f.player.play('하나');assert.deepEqual(f.calls,['cancel','resume','speak']);
  const old=f.synth.utterance;f.player.play('둘');old.onend();old.onerror({error:'interrupted'});assert.equal(f.player.diagnostics().status,'loading');
  f.synth.utterance.onstart();assert.equal(f.player.diagnostics().status,'playing');f.player.stop();assert.equal(f.timers.size,0);f.synth.utterance.onstart();assert.equal(f.player.diagnostics().status,'idle');
});
test('missing start/end events time out and allow a user-triggered retry without automatic playback',()=>{
  const f=setup();f.player.play('하나');f.expire();assert.equal(f.player.diagnostics().error,'start-timeout');assert.deepEqual(f.calls,['speak','cancel']);assert.equal(f.timers.size,0);
  f.player.stop();assert.equal(f.player.diagnostics().lastError,'start-timeout');f.player.play('둘');f.synth.utterance.onstart();f.expire();assert.equal(f.player.diagnostics().error,'end-timeout');
  f.player.play('셋');f.synth.utterance.onstart();f.synth.utterance.onend();assert.equal(f.player.diagnostics().lastError,'');
});
test('unsupported, system errors and thrown playback failures produce actionable failure states',()=>{
  const unsupported=setup({synth:undefined,Utterance:undefined});assert.equal(unsupported.player.play('하나'),false);assert.equal(unsupported.player.diagnostics().error,'unsupported');
  const f=setup();f.player.play('하나');f.synth.utterance.onerror({error:'language-unavailable'});assert.equal(f.player.diagnostics().error,'language-unavailable');assert.equal(f.timers.size,0);
  f.synth.speak=()=>{throw new Error('blocked');};assert.equal(f.player.play('하나'),false);assert.equal(f.player.diagnostics().error,'exception');assert.equal(f.timers.size,0);
});

test('packaged audio works without system voices and supports slow playback',async()=>{
  let media;
  class Audio{constructor(path){this.path=path;media=this;}play(){return Promise.resolve();}pause(){}removeAttribute(){}}
  const f=setup({synth:undefined,Utterance:undefined,Audio,resolveAudio:()=> './audio/a.m4a'});
  assert.equal(f.player.supported,true);f.player.play('아',true);assert.equal(media.path,'./audio/a.m4a');assert.equal(media.playbackRate,.75);
  media.onplaying();assert.equal(f.player.diagnostics().status,'playing');media.onended();assert.equal(f.player.diagnostics().status,'ended');
});
test('audio failure offers a user-triggered system retry; stale playback cannot change a new question',async()=>{
  let media;
  class Audio{constructor(){media=this;}play(){return Promise.reject(new Error('offline'));}pause(){}removeAttribute(){}}
  const f=setup({Audio,resolveAudio:()=> './audio/a.m4a'});f.player.play('아');await Promise.resolve();await Promise.resolve();
  assert.equal(f.player.diagnostics().error,'audio-unavailable');assert.equal(f.calls.includes('speak'),false);
  f.player.retrySystem();assert.equal(f.synth.utterance.text,'아');assert.equal(f.player.diagnostics().source,'system');
  const old=media;f.player.stop();old.onended();assert.equal(f.player.diagnostics().status,'idle');
});
