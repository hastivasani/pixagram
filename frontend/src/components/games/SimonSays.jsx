import { useState, useEffect, useRef } from "react";
const COLORS=["red","blue","green","yellow"];
const BG={red:"bg-red-500",blue:"bg-blue-500",green:"bg-green-500",yellow:"bg-yellow-400"};
const ACTIVE={red:"bg-red-300",blue:"bg-blue-300",green:"bg-green-300",yellow:"bg-yellow-200"};

export default function SimonSays({onGameEnd}){
  const [seq,setSeq]=useState([]);
  const [playerSeq,setPlayerSeq]=useState([]);
  const [active,setActive]=useState(null);
  const [phase,setPhase]=useState("idle");// idle|showing|input|over
  const [score,setScore]=useState(0);

  const addStep=()=>{
    const next=[...seq,COLORS[Math.floor(Math.random()*4)]];
    setSeq(next);setPlayerSeq([]);setPhase("showing");
    let i=0;
    const show=()=>{
      if(i>=next.length){setActive(null);setPhase("input");return;}
      setActive(next[i]);
      setTimeout(()=>{setActive(null);setTimeout(()=>{i++;show();},200);},600);
    };
    setTimeout(show,500);
  };

  const press=(c)=>{
    if(phase!=="input")return;
    const np=[...playerSeq,c];
    const idx=np.length-1;
    if(np[idx]!==seq[idx]){setPhase("over");return;}
    setPlayerSeq(np);
    if(np.length===seq.length){setScore(s=>s+1);setTimeout(addStep,800);}
  };

  return(
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xs">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-lg font-bold text-theme-primary">🎵 Simon Says</h2>
          <span className="text-purple-400 font-bold">{score}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {COLORS.map(c=>(
            <button key={c} onClick={()=>press(c)}
              className={`aspect-square rounded-2xl transition-all ${active===c?ACTIVE[c]:BG[c]} ${phase==="input"?"cursor-pointer active:scale-95":"cursor-default"}`}/>
          ))}
        </div>
        {phase==="idle"&&<button onClick={addStep} className="w-full bg-purple-600 text-white py-3 rounded-2xl font-bold">Start Game</button>}
        {phase==="showing"&&<p className="text-center text-theme-muted text-sm">Watch the sequence...</p>}
        {phase==="input"&&<p className="text-center text-theme-primary text-sm font-semibold">Your turn! ({playerSeq.length}/{seq.length})</p>}
        {phase==="over"&&(
          <div className="text-center">
            <p className="text-xl font-bold text-theme-primary mb-1">😔 Game Over!</p>
            <p className="text-theme-muted text-sm mb-3">Score: {score}</p>
            <div className="flex gap-2 justify-center">
              <button onClick={()=>{setSeq([]);setPlayerSeq([]);setScore(0);setPhase("idle");}} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">Play Again</button>
              <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl text-sm">Exit</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
