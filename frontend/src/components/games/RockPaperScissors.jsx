import { useState } from "react";

const CHOICES = ["✊","✋","✌️"];
const NAMES   = ["Rock","Paper","Scissors"];
// 0=Rock,1=Paper,2=Scissors  — wins[i] beats wins[i]
const BEATS = { 0:2, 1:0, 2:1 }; // Rock beats Scissors, Paper beats Rock, Scissors beats Paper

export default function RockPaperScissors({ onGameEnd }) {
  const [score,    setScore]    = useState({ you:0, cpu:0 });
  const [result,   setResult]   = useState(null);
  const [cpuPick,  setCpuPick]  = useState(null);
  const [youPick,  setYouPick]  = useState(null);
  const [animating,setAnimating]= useState(false);

  const play = (i) => {
    if (animating) return;
    setAnimating(true);
    setYouPick(i);
    setCpuPick(null);
    setResult(null);

    setTimeout(() => {
      const cpu = Math.floor(Math.random()*3);
      setCpuPick(cpu);
      let res;
      if (i===cpu) res="draw";
      else if (BEATS[i]===cpu) res="win";
      else res="lose";
      setResult(res);
      setScore(s => ({
        you: s.you + (res==="win"?1:0),
        cpu: s.cpu + (res==="lose"?1:0),
      }));
      setAnimating(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-lg font-bold text-theme-primary">✊ Rock Paper Scissors</h2>
          <div />
        </div>

        {/* Score */}
        <div className="flex justify-around bg-theme-card rounded-2xl p-4 border border-theme mb-6">
          <div className="text-center">
            <p className="text-xs text-theme-muted mb-1">You</p>
            <p className="text-3xl font-black text-blue-400">{score.you}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-theme-muted mb-1">CPU</p>
            <p className="text-3xl font-black text-red-400">{score.cpu}</p>
          </div>
        </div>

        {/* Arena */}
        <div className="flex justify-around items-center bg-theme-card rounded-2xl p-6 border border-theme mb-6 min-h-[120px]">
          <div className="text-center">
            <p className="text-xs text-theme-muted mb-2">You</p>
            <div className={`text-6xl transition-all duration-300 ${animating?"opacity-0 scale-50":"opacity-100 scale-100"}`}>
              {youPick!==null ? CHOICES[youPick] : "❓"}
            </div>
          </div>
          <div className="text-2xl font-black text-theme-muted">VS</div>
          <div className="text-center">
            <p className="text-xs text-theme-muted mb-2">CPU</p>
            <div className={`text-6xl transition-all duration-300 ${animating?"opacity-0 scale-50":"opacity-100 scale-100"}`}>
              {cpuPick!==null ? CHOICES[cpuPick] : "❓"}
            </div>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className={`text-center py-3 rounded-xl mb-4 font-bold text-lg ${
            result==="win"?"bg-green-500/20 text-green-400":
            result==="lose"?"bg-red-500/20 text-red-400":
            "bg-theme-input text-theme-muted"
          }`}>
            {result==="win"?"🎉 You Win!":result==="lose"?"😔 You Lose!":"🤝 Draw!"}
          </div>
        )}

        {/* Choices */}
        <div className="flex justify-center gap-4">
          {CHOICES.map((c,i) => (
            <button key={i} onClick={()=>play(i)} disabled={animating}
              className="flex flex-col items-center gap-1 bg-theme-card border-2 border-theme hover:border-purple-500 rounded-2xl p-4 transition-all active:scale-95 disabled:opacity-50">
              <span className="text-4xl">{c}</span>
              <span className="text-xs text-theme-muted">{NAMES[i]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
