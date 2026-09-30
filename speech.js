// Keep playback in the click handler: delayed retries can lose Safari's user activation.
export function createSpeechPlayer({synth,Utterance,automaticVoice=false,onState=()=>{},setTimer=setTimeout,clearTimer=clearTimeout}) {
  let current=null,timer=null,status='idle',error='',lastError='';
  const supported=!!synth&&typeof Utterance==='function';
  const voices=()=>{try{return synth?.getVoices()||[];}catch{return [];}};
  function clear(){clearTimer(timer);timer=null;current=null;}
  function emit(next,reason=''){status=next;error=reason;if(next==='error')lastError=reason;if(next==='ended')lastError='';onState(next,reason);}
  function stop(){const busy=current||synth?.speaking||synth?.pending||synth?.paused;clear();if(busy)try{synth.cancel();}catch{}emit('idle');}
  function play(text,slow=false){
    if(!supported){emit('error','unsupported');return false;}
    stop();
    try{
      const utterance=new Utterance(text);
      utterance.lang='ko-KR';utterance.rate=slow?.65:.85;
      // Safari may enumerate an incomplete or stale voice list. Let Apple select by language.
      const voice=voices().find(v=>/^ko(?:[-_]|$)/i.test(v.lang));
      if(voice&&!automaticVoice)utterance.voice=voice;
      current=utterance;emit('loading');
      function fail(reason){if(current!==utterance)return;clear();try{synth.cancel();}catch{}emit('error',reason);}
      utterance.onstart=()=>{if(current!==utterance)return;clearTimer(timer);emit('playing');timer=setTimer(()=>fail('end-timeout'),Math.max(20000,text.length*1500));};
      utterance.onend=()=>{if(current!==utterance)return;clear();emit('ended');};
      utterance.onerror=e=>{if(current!==utterance)return;if(['canceled','interrupted'].includes(e.error)){clear();emit('idle');}else fail(e.error||'unknown');};
      timer=setTimer(()=>fail('start-timeout'),7000);
      if(synth.paused)synth.resume();
      synth.speak(utterance);
      return true;
    }catch{clear();try{synth.cancel();}catch{}emit('error','exception');return false;}
  }
  return {play,stop,supported,diagnostics:()=>({status,error,lastError,languages:[...new Set(voices().map(v=>v.lang))],speaking:!!synth?.speaking,pending:!!synth?.pending,paused:!!synth?.paused})};
}
