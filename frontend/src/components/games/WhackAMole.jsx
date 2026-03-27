import { useState, useEffect, useRef } from "react";

const HOLES = 9;
const GAME_TIME = 30;

export default function WhackAMole({ onGameEnd }) {
  const [active,   setActive]   = useState(-1);
  const [score,    setScore]    = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [started,  setStarted]  = useState(false);
  const [over,     setOver]     = useState(false);
  const [whacked,  setWhacked]  = useState(-1);
  const moleRef  = useRef(null);
  const timerRef = useRef(null);

  const start = () => {
    setScore(0); setTimeLeft(GAME_TIME); setOver(false); setStarted(true);
  };

  useEffect(() => {
    if (!started || over) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t<=1) { clearInterval(timerRef.current); clearTimeout(moleRef.current); setActive(-1); setOver(true); setStarted(false); return 0; }
        return t-1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started, over]);

  useEffect(() => {
    if (!started || over) return;
    const pop = () => {
      const hole = Math.floor(Math.random()*HOLES);
      setActive(hole);
      moleRef.current = setTimeout(() => { setActive(-1); if (!over) pop(); }, 800 + Math.random()*400);
    };
    pop();
    return () => clearTimeout(moleRef.current);
  }, [started]);

  const whack = (i) => {
    if (i!==active) return;
    setWhacked(i);
    setScore(s=>s+10);
    setActive(-1);
    setTimeout(()=>setWhacked(-1), 200);
  };

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-lg font-bold text-theme-primary">🔨 Whack-a-Mole</h2>
          <span className="text-purple-400 font-bold">{timeLeft}s</span>
        </div>

        <div className="flex justify-between bg-theme-card rounded-xl p-3 border border-theme mb-5">
          <span className="text-theme-muted text-sm">Score</span>
          <span className="font-bold text-green-400 text-lg">{score}</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {Array(HOLES).fill(0).map((_,i)=>(
            <button key={i} onClick={()=>whack(i)}
              className={`aspect-square rounded-2xl text-4xl flex items-center justify-center border-2 transition-all duration-100 ${
                i===active ? "bg-green-500/20 border-green-500 scale-110" :
                i===whacked ? "bg-yellow-500/20 border-yellow-500" :
                "bg-theme-card border-theme"
              }`}>
              {i===active ? "🐹" : "🕳️"}
            </button>
          ))}
        </div>

        {!started && !over && (
          <button onClick={start} className="w-full mt-5 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold">
            Start Game
          </button>
        )}

        {over && (
          <div className="mt-5 bg-theme-card rounded-2xl p-5 border border-theme text-center">
            <p className="text-3xl mb-2">🎯</p>
            <p className="font-bold text-theme-primary mb-1">Time's Up!</p>
            <p className="text-theme-muted text-sm mb-4">Final Score: {score}</p>
            <div className="flex gap-2 justify-center">
              <button onClick={start} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">Play Again</button>
              <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl text-sm">Exit</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
