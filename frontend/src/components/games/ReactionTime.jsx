import { useState, useEffect, useRef } from "react";
export default function ReactionTime({onGameEnd}){
  const [state,setState]=useState("idle");// idle|waiting|ready|result
  const [time,setTime]=useState(0);
  const [best,setBest]=useState(null);
  const startRef=useRef(0);
  const timerRef=useRef(null);

  const start=()=>{
    setState("waiting");
    const delay=1500+Math.random()*3000;
    timerRef.current=setTimeout(()=>{setState("ready");startRef.current=Date.now();},delay);
  };

  const click=()=>{
    if(state==="waiting"){clearTimeout(timerRef.current);setState("idle");alert("Too early! Wait for green.");}
    else if(state==="ready"){
      const t=Date.now()-startRef.current;
      setTime(t);setBest(b=>b===null||t<b?t:b);setState("result");
    } else start();
  };

  const bg={idle:"bg-blue-600",waiting:"bg-red-600",ready:"bg-green-500",result:"bg-purple-600"};
  const msg={idle:"Click to Start",waiting:"Wait for green...",ready:"CLICK NOW!",result:`${time}ms`};

  return(
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-lg font-bold text-theme-primary">⚡ Reaction Time</h2>
          {best&&<span className="text-green-400 text-sm font-bold">Best: {best}ms</span>}
        </div>
        <button onClick={click}
          className={`w-full h-64 ${bg[state]} rounded-3xl flex flex-col items-center justify-center transition-all active:scale-95`}>
          <span className="text-white text-4xl font-black">{msg[state]}</span>
          {state==="result"&&<span className="text-white/70 text-sm mt-2">Click to try again</span>}
        </button>
        {state==="result"&&(
          <div className="mt-4 text-center">
            <p className="text-theme-muted text-sm">
              {time<200?"🚀 Superhuman!":time<300?"⚡ Excellent!":time<400?"👍 Good":time<500?"😐 Average":"🐢 Slow"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
