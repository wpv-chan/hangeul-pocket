// Keep playback in the click handler: delayed retries can lose Safari's user activation.
export function createSpeechPlayer({synth,Utterance,Audio,resolveAudio=()=>null,automaticVoice=false,onState=()=>{},setTimer=setTimeout,clearTimer=clearTimeout}) {
  let current=null,timer=null,status='idle',error='',lastError='',media=null,lastText='',lastSlow=false,source='system';
  const systemSupported=!!synth&&typeof Utterance==='function';
  const supported=systemSupported||typeof Audio==='function';
  const voices=()=>{try{return synth?.getVoices()||[];}catch{return [];}};
  function clear(){clearTimer(timer);timer=null;current=null;}
  function emit(next,reason=''){status=next;error=reason;if(next==='error')lastError=reason;if(next==='ended')lastError='';onState(next,reason);}
  function stop(){const busy=current||synth?.speaking||synth?.pending||synth?.paused;clear();if(media){media.onplaying=media.onended=media.onerror=null;media.pause();media.removeAttribute('src');media=null;}if(busy)try{synth.cancel();}catch{}emit('idle');}
  function play(text,slow=false,forceSystem=false){
    stop();
    lastText=text;lastSlow=slow;
    const file=!forceSystem&&resolveAudio(text);
    if(file&&Audio){
      source='audio';const audio=new Audio(file);media=audio;audio.playbackRate=slow?.75:1;audio.preservesPitch=true;
      const fail=reason=>{if(media!==audio)return;clearTimer(timer);audio.pause();media=null;emit('error',reason);};
      audio.onplaying=()=>{if(media!==audio)return;clearTimer(timer);emit('playing');timer=setTimer(()=>fail('end-timeout'),Math.max(20000,text.length*1500));};
      audio.onended=()=>{if(media!==audio)return;clearTimer(timer);media=null;emit('ended');};
      audio.onerror=()=>fail('audio-unavailable');emit('loading');timer=setTimer(()=>fail('audio-unavailable'),7000);
      try{Promise.resolve(audio.play()).catch(()=>fail('audio-unavailable'));return true;}catch{fail('audio-unavailable');return false;}
    }
    source='system';
    if(!systemSupported){emit('error','unsupported');return false;}
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
  return {play,stop,supported,retrySystem:()=>play(lastText||'안녕하세요',lastSlow,true),diagnostics:()=>({status,error,lastError,source,languages:[...new Set(voices().map(v=>v.lang))],speaking:!!synth?.speaking,pending:!!synth?.pending,paused:!!synth?.paused})};
}
