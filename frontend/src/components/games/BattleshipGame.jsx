import { useState } from "react";

const SIZE = 8;
const SHIPS = [4, 3, 3, 2, 2];

function emptyGrid() { return Array(SIZE).fill(null).map(() => Array(SIZE).fill(0)); }

function placeShipsRandom() {
  const grid = emptyGrid();
  SHIPS.forEach(len => {
    let placed = false;
    while (!placed) {
      const horiz = Math.random() > 0.5;
      const r = Math.floor(Math.random() * (horiz ? SIZE : SIZE - len));
      const c = Math.floor(Math.random() * (horiz ? SIZE - len : SIZE));
      let ok = true;
      for (let i = 0; i < len; i++) {
        if (grid[horiz ? r : r + i][horiz ? c + i : c] !== 0) { ok = false; break; }
      }
      if (ok) {
        for (let i = 0; i < len; i++) grid[horiz ? r : r + i][horiz ? c + i : c] = 1;
        placed = true;
      }
    }
  });
  return grid;
}

export default function BattleshipGame({ onGameEnd }) {
  const [cpuGrid, setCpuGrid]     = useState(placeShipsRandom);
  const [cpuShots, setCpuShots]   = useState(emptyGrid); // what cpu shot at player
  const [playerGrid]              = useState(placeShipsRandom);
  const [playerShots, setShots]   = useState(emptyGrid); // what player shot at cpu
  const [msg, setMsg]             = useState("");
  const [phase, setPhase]         = useState("play");

  const totalShipCells = SHIPS.reduce((a, b) => a + b, 0);

  const countHits = (shots, ships) => {
    let h = 0;
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (shots[r][c] === 2 && ships[r][c] === 1) h++;
    return h;
  };

  const playerShoot = (r, c) => {
    if (phase !== "play" || playerShots[r][c] !== 0) return;
    const ns = playerShots.map(row => [...row]);
    ns[r][c] = cpuGrid[r][c] === 1 ? 2 : 1; // 2=hit, 1=miss
    setShots(ns);

    if (countHits(ns, cpuGrid) >= totalShipCells) { setMsg("🎉 You Win! All enemy ships sunk!"); setPhase("done"); return; }

    // CPU shoots
    setTimeout(() => {
      const nc = cpuShots.map(row => [...row]);
      let cr, cc;
      do { cr = Math.floor(Math.random() * SIZE); cc = Math.floor(Math.random() * SIZE); } while (nc[cr][cc] !== 0);
      nc[cr][cc] = playerGrid[cr][cc] === 1 ? 2 : 1;
      setCpuShots(nc);
      if (countHits(nc, playerGrid) >= totalShipCells) { setMsg("😔 CPU Wins! Your fleet is destroyed!"); setPhase("done"); }
    }, 500);
  };

  const reset = () => {
    setCpuGrid(placeShipsRandom()); setCpuShots(emptyGrid()); setShots(emptyGrid());
    setMsg(""); setPhase("play");
  };

  const cellClass = (shots, ships, r, c, showShips) => {
    const s = shots[r][c];
    if (s === 2) return "bg-red-500 text-white";
    if (s === 1) return "bg-blue-300/50 text-blue-400";
    if (showShips && ships[r][c] === 1) return "bg-gray-500";
    return "bg-theme-input hover:bg-theme-hover cursor-pointer";
  };

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-base font-bold text-theme-primary">🚢 Battleship</h2>
          <span className="text-xs text-theme-muted">{countHits(playerShots, cpuGrid)}/{totalShipCells}</span>
        </div>

        {/* Enemy grid */}
        <p className="text-xs text-red-400 font-bold mb-1">Enemy Waters (click to shoot)</p>
        <div className="border border-theme rounded-xl overflow-hidden mb-3">
          {Array(SIZE).fill(0).map((_, r) => (
            <div key={r} className="flex">
              {Array(SIZE).fill(0).map((_, c) => (
                <button key={c} onClick={() => playerShoot(r, c)}
                  className={`flex-1 aspect-square text-xs border border-theme/20 flex items-center justify-center transition
                    ${cellClass(playerShots, cpuGrid, r, c, false)}`}>
                  {playerShots[r][c] === 2 ? "💥" : playerShots[r][c] === 1 ? "•" : ""}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Player grid */}
        <p className="text-xs text-blue-400 font-bold mb-1">Your Waters</p>
        <div className="border border-theme rounded-xl overflow-hidden mb-3">
          {Array(SIZE).fill(0).map((_, r) => (
            <div key={r} className="flex">
              {Array(SIZE).fill(0).map((_, c) => (
                <div key={c} className={`flex-1 aspect-square text-xs border border-theme/20 flex items-center justify-center
                  ${cellClass(cpuShots, playerGrid, r, c, true)}`}>
                  {cpuShots[r][c] === 2 ? "💥" : cpuShots[r][c] === 1 ? "•" : playerGrid[r][c] === 1 ? "🚢" : ""}
                </div>
              ))}
            </div>
          ))}
        </div>

        {msg && (
          <div className="text-center">
            <p className="text-lg font-bold text-theme-primary mb-3">{msg}</p>
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
