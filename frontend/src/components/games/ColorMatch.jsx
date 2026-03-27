import { useState, useEffect, useCallback } from "react";

const COLORS = [
  { name:"Red",    bg:"bg-red-500"    },
  { name:"Blue",   bg:"bg-blue-500"   },
  { name:"Green",  bg:"bg-green-500"  },
  { name:"Yellow", bg:"bg-yellow-400" },
  { name:"Purple", bg:"bg-purple-500" },
  { name:"Orange", bg:"bg-orange-500" },
];

function pick() {
  const text  = COLORS[Math.floor(Math.random()*COLORS.length)];
  const color = COLORS[Math.floor(Math.random()*COLORS.length)];
  return { text, color };
}

export default function ColorMatch({ onGameEnd }) {
  const [card,     setCard]     = useState(pick);
  const [score,    setScore]    = useState(0);
  const [lives,    setLives]    = useState(3);
  const [feedback, setFeedback] = useState(null);
  const [over,     setOver]     = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);

  const next = useCallback((correct) => {
    setFeedback(correct?"✅":"❌");
    if (correct) setScore(s=>s+10);
    else setLives(l=>{ if(l-1<=0){ setOver(true); return 0; } return l-1; });
    setTimeout(()=>{ setFeedback(null); setCard(pick()); setTimeLeft(5); }, 600);
  }, []);

  useEffect(() => {
    if (over||feedback) return;
    const t = setInterval(()=>{
      setTimeLeft(tl=>{ if(tl<=1){ next(false); return 5; } return tl-1; });
    },1000);
    return ()=>clearInterval(t);
  }, [over, feedback, next]);

  const reset = () => { setCard(pick()); setScore(0); setLives(3); setFeedback(null); setOver(false); setTimeLeft(5); };

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-lg font-bold text-theme-primary">🎨 Color Match</h2>
          <span className="text-red-400">{"❤️".repeat(lives)}</span>
        </div>

        <p className="text-center text-theme-muted text-sm mb-4">Does the TEXT match the COLOR?</p>

        <div className="bg-theme-card rounded-2xl p-8 border border-theme text-center mb-4 relative">
          <p className={`text-5xl font-black ${card.color.bg.replace("bg-","text-")}`}>
            {card.text.name}
          </p>
          <div className="absolute top-3 right-3 text-xs text-theme-muted font-mono">{timeLeft}s</div>
          {feedback && <div className="absolute inset-0 flex items-center justify-center text-6xl bg-theme-card/80 rounded-2xl">{feedback}</div>}
        </div>

        <div className="flex gap-3">
          <button onClick={()=>next(card.text.name===card.color.name)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl text-lg font-bold transition active:scale-95">
            ✅ Match
          </button>
          <button onClick={()=>next(card.text.name!==card.color.name)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl text-lg font-bold transition active:scale-95">
            ❌ No Match
          </button>
        </div>

        <div className="flex justify-between mt-4 text-sm text-theme-muted">
          <span>Score: <span className="text-purple-400 font-bold">{score}</span></span>
        </div>

        {over && (
          <div className="mt-4 bg-theme-card rounded-2xl p-5 border border-theme text-center">
            <p className="text-2xl mb-1">💀</p>
            <p className="font-bold text-theme-primary mb-1">Game Over!</p>
            <p className="text-theme-muted text-sm mb-3">Score: {score}</p>
            <div className="flex gap-2 justify-center">
              <button onClick={reset} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">Try Again</button>
              <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl text-sm">Exit</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
