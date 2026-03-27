import { useState, useEffect, useCallback, useRef } from "react";

const GRID = 20;
const CELL = 18;
const DIRS = { ArrowUp:[0,-1], ArrowDown:[0,1], ArrowLeft:[-1,0], ArrowRight:[1,0] };

function rand() { return Math.floor(Math.random() * GRID); }
function newFood(snake) {
  let f;
  do { f = [rand(), rand()]; } while (snake.some(s => s[0]===f[0] && s[1]===f[1]));
  return f;
}

export default function SnakeGame({ onGameEnd }) {
  const [snake,    setSnake]    = useState([[10,10],[9,10],[8,10]]);
  const [dir,      setDir]      = useState([1,0]);
  const [food,     setFood]     = useState([15,15]);
  const [score,    setScore]    = useState(0);
  const [dead,     setDead]     = useState(false);
  const [started,  setStarted]  = useState(false);
  const dirRef  = useRef([1,0]);
  const loopRef = useRef(null);

  const tick = useCallback(() => {
    setSnake(prev => {
      const head = [prev[0][0] + dirRef.current[0], prev[0][1] + dirRef.current[1]];
      if (head[0]<0||head[0]>=GRID||head[1]<0||head[1]>=GRID||prev.some(s=>s[0]===head[0]&&s[1]===head[1])) {
        setDead(true);
        clearInterval(loopRef.current);
        return prev;
      }
      setFood(f => {
        if (head[0]===f[0] && head[1]===f[1]) {
          setScore(s => s+10);
          const next = [head, ...prev];
          const nf = newFood(next);
          setTimeout(() => setFood(nf), 0);
          return f;
        }
        return f;
      });
      return [head, ...prev.slice(0,-1)];
    });
  }, []);

  useEffect(() => {
    if (!started || dead) return;
    loopRef.current = setInterval(tick, 130);
    return () => clearInterval(loopRef.current);
  }, [started, dead, tick]);

  useEffect(() => {
    const onKey = (e) => {
      if (DIRS[e.key]) {
        e.preventDefault();
        const [dx,dy] = DIRS[e.key];
        if (dx !== -dirRef.current[0] || dy !== -dirRef.current[1]) {
          dirRef.current = [dx,dy];
          setDir([dx,dy]);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const reset = () => {
    const s = [[10,10],[9,10],[8,10]];
    setSnake(s); setDir([1,0]); dirRef.current=[1,0];
    setFood(newFood(s)); setScore(0); setDead(false); setStarted(true);
  };

  const swipe = (dx, dy) => {
    if (dx !== -dirRef.current[0] || dy !== -dirRef.current[1]) {
      dirRef.current = [dx,dy]; setDir([dx,dy]);
    }
  };

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-lg font-bold text-theme-primary">🐍 Snake</h2>
          <span className="text-purple-400 font-bold">{score}</span>
        </div>

        {/* Board */}
        <div className="relative mx-auto rounded-2xl overflow-hidden border-2 border-theme bg-gray-900"
          style={{ width: GRID*CELL, height: GRID*CELL }}>
          {/* Food */}
          <div className="absolute rounded-full bg-red-500 transition-all"
            style={{ width:CELL-2, height:CELL-2, left:food[0]*CELL+1, top:food[1]*CELL+1 }} />
          {/* Snake */}
          {snake.map((s,i) => (
            <div key={i} className={`absolute rounded-sm ${i===0?"bg-green-400":"bg-green-600"}`}
              style={{ width:CELL-1, height:CELL-1, left:s[0]*CELL, top:s[1]*CELL }} />
          ))}
          {/* Overlay */}
          {(!started || dead) && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
              {dead && <p className="text-white font-bold text-lg">Game Over! Score: {score}</p>}
              <button onClick={reset} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold">
                {dead ? "Play Again" : "Start"}
              </button>
              {dead && <button onClick={onGameEnd} className="text-white/60 text-sm">Exit</button>}
            </div>
          )}
        </div>

        {/* Mobile controls */}
        <div className="mt-5 grid grid-cols-3 gap-2 max-w-[160px] mx-auto">
          <div />
          <button onClick={()=>swipe(0,-1)} className="bg-theme-card border border-theme rounded-xl py-3 text-xl flex items-center justify-center">↑</button>
          <div />
          <button onClick={()=>swipe(-1,0)} className="bg-theme-card border border-theme rounded-xl py-3 text-xl flex items-center justify-center">←</button>
          <button onClick={()=>swipe(0,1)}  className="bg-theme-card border border-theme rounded-xl py-3 text-xl flex items-center justify-center">↓</button>
          <button onClick={()=>swipe(1,0)}  className="bg-theme-card border border-theme rounded-xl py-3 text-xl flex items-center justify-center">→</button>
        </div>
      </div>
    </div>
  );
}
