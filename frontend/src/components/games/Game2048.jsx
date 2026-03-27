import { useState, useEffect, useCallback } from "react";

function empty() { return Array(4).fill(null).map(()=>Array(4).fill(0)); }
function addTile(b) {
  const cells = [];
  b.forEach((r,i)=>r.forEach((v,j)=>{ if(!v) cells.push([i,j]); }));
  if (!cells.length) return b;
  const [i,j] = cells[Math.floor(Math.random()*cells.length)];
  const nb = b.map(r=>[...r]);
  nb[i][j] = Math.random()<0.9?2:4;
  return nb;
}
function init() { return addTile(addTile(empty())); }

function slideRow(row) {
  let r = row.filter(v=>v);
  let score = 0;
  for (let i=0;i<r.length-1;i++) {
    if (r[i]===r[i+1]) { r[i]*=2; score+=r[i]; r[i+1]=0; }
  }
  r = r.filter(v=>v);
  while (r.length<4) r.push(0);
  return { row:r, score };
}

function move(board, dir) {
  let b = board.map(r=>[...r]);
  let score = 0;
  const rotate = (m) => m[0].map((_,i)=>m.map(r=>r[i]).reverse());
  const rotateBack = (m) => m[0].map((_,i)=>m.map(r=>r[r.length-1-i]));

  if (dir==="up")    b = rotate(b);
  if (dir==="down")  b = rotateBack(b);
  if (dir==="right") b = b.map(r=>[...r].reverse());

  b = b.map(row=>{ const s=slideRow(row); score+=s.score; return s.row; });

  if (dir==="up")    b = rotateBack(b);
  if (dir==="down")  b = rotate(b);
  if (dir==="right") b = b.map(r=>[...r].reverse());

  return { board:b, score };
}

const COLORS = {0:"bg-gray-800",2:"bg-yellow-100 text-gray-800",4:"bg-yellow-200 text-gray-800",
  8:"bg-orange-300 text-white",16:"bg-orange-400 text-white",32:"bg-orange-500 text-white",
  64:"bg-red-500 text-white",128:"bg-yellow-400 text-white",256:"bg-yellow-500 text-white",
  512:"bg-yellow-600 text-white",1024:"bg-yellow-700 text-white",2048:"bg-yellow-800 text-white"};

export default function Game2048({ onGameEnd }) {
  const [board, setBoard] = useState(init);
  const [score, setScore] = useState(0);
  const [best,  setBest]  = useState(0);
  const [over,  setOver]  = useState(false);

  const doMove = useCallback((dir) => {
    if (over) return;
    setBoard(prev => {
      const { board:nb, score:s } = move(prev, dir);
      const changed = nb.some((r,i)=>r.some((v,j)=>v!==prev[i][j]));
      if (!changed) return prev;
      const next = addTile(nb);
      setScore(sc => { const ns=sc+s; setBest(b=>Math.max(b,ns)); return ns; });
      // Check game over
      const hasMoves = next.some((r,i)=>r.some((v,j)=>{
        if(!v) return true;
        if(i<3&&next[i+1][j]===v) return true;
        if(j<3&&next[i][j+1]===v) return true;
        return false;
      }));
      if (!hasMoves) setOver(true);
      return next;
    });
  }, [over]);

  useEffect(() => {
    const onKey = (e) => {
      const map = {ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right"};
      if (map[e.key]) { e.preventDefault(); doMove(map[e.key]); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doMove]);

  const reset = () => { setBoard(init()); setScore(0); setOver(false); };

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-lg font-bold text-theme-primary">🔢 2048</h2>
          <button onClick={reset} className="text-xs text-purple-400 font-semibold">New</button>
        </div>

        <div className="flex justify-around mb-3">
          <div className="bg-theme-card rounded-xl px-4 py-2 text-center border border-theme">
            <p className="text-xs text-theme-muted">Score</p>
            <p className="font-bold text-theme-primary">{score}</p>
          </div>
          <div className="bg-theme-card rounded-xl px-4 py-2 text-center border border-theme">
            <p className="text-xs text-theme-muted">Best</p>
            <p className="font-bold text-yellow-400">{best}</p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl p-2 grid grid-cols-4 gap-2">
          {board.flat().map((v,i)=>(
            <div key={i} className={`aspect-square rounded-xl flex items-center justify-center font-black text-lg transition-all ${COLORS[v]||"bg-yellow-900 text-white"}`}>
              {v||""}
            </div>
          ))}
        </div>

        {/* Mobile swipe buttons */}
        <div className="mt-4 grid grid-cols-3 gap-2 max-w-[160px] mx-auto">
          <div/>
          <button onClick={()=>doMove("up")}    className="bg-theme-card border border-theme rounded-xl py-3 text-xl flex items-center justify-center">↑</button>
          <div/>
          <button onClick={()=>doMove("left")}  className="bg-theme-card border border-theme rounded-xl py-3 text-xl flex items-center justify-center">←</button>
          <button onClick={()=>doMove("down")}  className="bg-theme-card border border-theme rounded-xl py-3 text-xl flex items-center justify-center">↓</button>
          <button onClick={()=>doMove("right")} className="bg-theme-card border border-theme rounded-xl py-3 text-xl flex items-center justify-center">→</button>
        </div>

        {over && (
          <div className="mt-4 bg-theme-card rounded-2xl p-5 border border-theme text-center">
            <p className="text-2xl mb-1">😔</p>
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
