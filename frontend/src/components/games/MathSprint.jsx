import { useState, useEffect, useRef } from "react";

function genQ() {
  const ops = ["+","-","×"];
  const op  = ops[Math.floor(Math.random()*ops.length)];
  let a,b,ans;
  if (op==="+") { a=Math.floor(Math.random()*50)+1; b=Math.floor(Math.random()*50)+1; ans=a+b; }
  else if (op==="-") { a=Math.floor(Math.random()*50)+10; b=Math.floor(Math.random()*a)+1; ans=a-b; }
  else { a=Math.floor(Math.random()*12)+1; b=Math.floor(Math.random()*12)+1; ans=a*b; }
  // Wrong options
  const wrongs = new Set();
  while (wrongs.size<3) {
    const w = ans + (Math.floor(Math.random()*10)-5);
    if (w!==ans && w>0) wrongs.add(w);
  }
  const opts = [...wrongs, ans].sort(()=>Math.random()-0.5);
  return { q:`${a} ${op} ${b}`, ans, opts };
}

const TOTAL = 10, TIME = 60;

export default function MathSprint({ onGameEnd }) {
  const [q,        setQ]        = useState(genQ);
  const [qNum,     setQNum]     = useState(1);
  const [score,    setScore]    = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME);
  const [feedback, setFeedback] = useState(null);
  const [over,     setOver]     = useState(false);
  const timerRef = useRef(null);

  useEffect(()=>{
    if (over) return;
    timerRef.current = setInterval(()=>{
      setTimeLeft(t=>{ if(t<=1){ clearInterval(timerRef.current); setOver(true); return 0; } return t-1; });
    },1000);
    return ()=>clearInterval(timerRef.current);
  },[over]);

  const answer = (opt) => {
    if (feedback) return;
    const correct = opt===q.ans;
    setFeedback(correct?"✅":"❌");
    if (correct) setScore(s=>s+10);
    setTimeout(()=>{
      setFeedback(null);
      if (qNum>=TOTAL) { setOver(true); clearInterval(timerRef.current); }
      else { setQ(genQ()); setQNum(n=>n+1); }
    }, 500);
  };

  const reset = () => { setQ(genQ()); setQNum(1); setScore(0); setTimeLeft(TIME); setFeedback(null); setOver(false); };

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-lg font-bold text-theme-primary">⚡ Math Sprint</h2>
          <span className="text-red-400 font-mono font-bold">{timeLeft}s</span>
        </div>

        <div className="flex justify-between bg-theme-card rounded-xl p-3 border border-theme mb-4">
          <span className="text-theme-muted text-sm">Q {qNum}/{TOTAL}</span>
          <span className="font-bold text-purple-400">{score} pts</span>
        </div>

        <div className="bg-theme-card rounded-2xl p-8 border border-theme text-center mb-5 relative">
          <p className="text-4xl font-black text-theme-primary">{q.q} = ?</p>
          {feedback && <div className="absolute inset-0 flex items-center justify-center text-5xl bg-theme-card/90 rounded-2xl">{feedback}</div>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {q.opts.map((opt,i)=>(
            <button key={i} onClick={()=>answer(opt)} disabled={!!feedback}
              className="bg-theme-card border-2 border-theme hover:border-purple-500 rounded-2xl py-4 text-xl font-bold text-theme-primary transition active:scale-95 disabled:opacity-60">
              {opt}
            </button>
          ))}
        </div>

        {over && (
          <div className="mt-5 bg-theme-card rounded-2xl p-5 border border-theme text-center">
            <p className="text-3xl mb-2">{score>=70?"🏆":score>=40?"👍":"😅"}</p>
            <p className="font-bold text-theme-primary mb-1">
              {score>=70?"Genius!":score>=40?"Good Job!":"Keep Practicing!"}
            </p>
            <p className="text-theme-muted text-sm mb-4">Score: {score}/{TOTAL*10}</p>
            <div className="flex gap-2 justify-center">
              <button onClick={reset} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">Play Again</button>
              <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl text-sm">Exit</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
