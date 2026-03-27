import { useState, useEffect } from "react";

const COLORS = ["red","blue","green","yellow","purple","orange"];
const COLOR_BG = { red:"bg-red-500",blue:"bg-blue-500",green:"bg-green-500",yellow:"bg-yellow-400",purple:"bg-purple-500",orange:"bg-orange-500" };
const COLS = 8, ROWS = 10;

function makeGrid() {
  return Array(ROWS).fill(null).map(() =>
    Array(COLS).fill(null).map(() => COLORS[Math.floor(Math.random() * COLORS.length)])
  );
}

export default function ColorBlast({ onGameEnd }) {
  const [grid, setGrid]   = useState(makeGrid);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(20);
  const [done, setDone]   = useState(false);

  const blast = (r, c) => {
    if (done || moves <= 0) return;
    const color = grid[r][c];
    if (!color) return;

    // Flood fill
    const visited = new Set();
    const flood = (r, c) => {
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
      const key = `${r},${c}`;
      if (visited.has(key) || grid[r][c] !== color) return;
      visited.add(key);
      flood(r-1,c); flood(r+1,c); flood(r,c-1); flood(r,c+1);
    };
    flood(r, c);

    if (visited.size < 2) return; // Need at least 2 to blast

    const ng = grid.map(row => [...row]);
    visited.forEach(key => {
      const [r, c] = key.split(",").map(Number);
      ng[r][c] = null;
    });

    // Drop cells down
    for (let c = 0; c < COLS; c++) {
      const col = ng.map(row => row[c]).filter(Boolean);
      while (col.length < ROWS) col.unshift(COLORS[Math.floor(Math.random() * COLORS.length)]);
      for (let r = 0; r < ROWS; r++) ng[r][c] = col[r];
    }

    const pts = visited.size * visited.size * 10;
    setGrid(ng);
    setScore(s => s + pts);
    setMoves(m => {
      const nm = m - 1;
      if (nm <= 0) setDone(true);
      return nm;
    });
  };

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-base font-bold text-theme-primary">💥 Color Blast</h2>
          <span className="text-purple-400 font-bold">{score} pts</span>
        </div>

        <div className="flex justify-between text-xs text-theme-muted mb-2">
          <span>Moves left: {moves}</span>
          <span>Match 2+ same color</span>
        </div>

        <div className="border border-theme rounded-xl overflow-hidden mb-3">
          {grid.map((row, r) => (
            <div key={r} className="flex">
              {row.map((color, c) => (
                <button key={c} onClick={() => blast(r, c)}
                  className={`flex-1 aspect-square ${COLOR_BG[color] || "bg-theme-input"} transition-all hover:opacity-80 active:scale-90`}/>
              ))}
            </div>
          ))}
        </div>

        {done && (
          <div className="text-center bg-theme-card rounded-2xl p-4 border border-theme">
            <p className="text-2xl mb-1">🎯</p>
            <p className="font-bold text-theme-primary mb-1">Game Over!</p>
            <p className="text-theme-muted mb-3">Final Score: {score}</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => { setGrid(makeGrid()); setScore(0); setMoves(20); setDone(false); }} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">Play Again</button>
              <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl text-sm">Exit</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
