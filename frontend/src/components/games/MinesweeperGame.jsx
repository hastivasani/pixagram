import { useState, useEffect } from "react";

const ROWS = 9, COLS = 9, MINES = 10;

function initGrid() {
  const cells = Array(ROWS).fill(null).map((_, r) =>
    Array(COLS).fill(null).map((_, c) => ({ r, c, mine: false, revealed: false, flagged: false, count: 0 }))
  );
  // Place mines
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS), c = Math.floor(Math.random() * COLS);
    if (!cells[r][c].mine) { cells[r][c].mine = true; placed++; }
  }
  // Count neighbors
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (cells[r][c].mine) continue;
    let cnt = 0;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && cells[nr][nc].mine) cnt++;
    }
    cells[r][c].count = cnt;
  }
  return cells;
}

const NUM_COLORS = ["","text-blue-500","text-green-500","text-red-500","text-purple-700","text-red-700","text-cyan-500","text-black","text-gray-500"];

export default function MinesweeperGame({ onGameEnd }) {
  const [grid, setGrid]   = useState(initGrid);
  const [phase, setPhase] = useState("play"); // play|won|lost
  const [flags, setFlags] = useState(0);
  const [time, setTime]   = useState(0);

  useEffect(() => {
    if (phase !== "play") return;
    const t = setInterval(() => setTime(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const reveal = (r, c) => {
    if (phase !== "play") return;
    const cell = grid[r][c];
    if (cell.revealed || cell.flagged) return;
    if (cell.mine) {
      // Reveal all mines
      setGrid(g => g.map(row => row.map(cell => cell.mine ? { ...cell, revealed: true } : cell)));
      setPhase("lost"); return;
    }
    const ng = grid.map(row => row.map(c => ({ ...c })));
    const flood = (r, c) => {
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
      if (ng[r][c].revealed || ng[r][c].flagged || ng[r][c].mine) return;
      ng[r][c].revealed = true;
      if (ng[r][c].count === 0) {
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) flood(r + dr, c + dc);
      }
    };
    flood(r, c);
    setGrid(ng);
    const unrevealed = ng.flat().filter(c => !c.revealed && !c.mine).length;
    if (unrevealed === 0) setPhase("won");
  };

  const flag = (e, r, c) => {
    e.preventDefault();
    if (phase !== "play" || grid[r][c].revealed) return;
    setGrid(g => g.map((row, ri) => row.map((cell, ci) => ri === r && ci === c ? { ...cell, flagged: !cell.flagged } : cell)));
    setFlags(f => grid[r][c].flagged ? f - 1 : f + 1);
  };

  const reset = () => { setGrid(initGrid()); setPhase("play"); setFlags(0); setTime(0); };

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-base font-bold text-theme-primary">💣 Minesweeper</h2>
          <span className="text-xs text-theme-muted">🚩{MINES - flags} ⏱{time}s</span>
        </div>

        {(phase === "won" || phase === "lost") && (
          <div className={`text-center py-2 rounded-xl mb-3 font-bold ${phase==="won"?"bg-green-500/20 text-green-400":"bg-red-500/20 text-red-400"}`}>
            {phase === "won" ? "🎉 You Win!" : "💥 Game Over!"}
          </div>
        )}

        <div className="border border-theme rounded-xl overflow-hidden">
          {grid.map((row, r) => (
            <div key={r} className="flex">
              {row.map((cell, c) => (
                <button key={c}
                  onClick={() => reveal(r, c)}
                  onContextMenu={e => flag(e, r, c)}
                  className={`flex-1 aspect-square text-xs font-black flex items-center justify-center border border-theme/20 transition
                    ${cell.revealed
                      ? cell.mine ? "bg-red-500" : "bg-theme-card"
                      : "bg-theme-input hover:bg-theme-hover"
                    }`}>
                  {cell.revealed
                    ? cell.mine ? "💣" : cell.count > 0 ? <span className={NUM_COLORS[cell.count]}>{cell.count}</span> : ""
                    : cell.flagged ? "🚩" : ""}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-center mt-3">
          <button onClick={reset} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">New Game</button>
          <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl text-sm">Exit</button>
        </div>
      </div>
    </div>
  );
}
