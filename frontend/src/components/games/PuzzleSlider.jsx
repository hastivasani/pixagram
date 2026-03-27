import { useState } from "react";

const SIZE = 4;
const TOTAL = SIZE * SIZE;

function initPuzzle() {
  let tiles = Array.from({ length: TOTAL }, (_, i) => i);
  // Shuffle with valid solvable state
  do {
    tiles = tiles.sort(() => Math.random() - 0.5);
  } while (!isSolvable(tiles) || isSolved(tiles));
  return tiles;
}

function isSolvable(tiles) {
  let inv = 0;
  for (let i = 0; i < tiles.length; i++)
    for (let j = i + 1; j < tiles.length; j++)
      if (tiles[i] && tiles[j] && tiles[i] > tiles[j]) inv++;
  const blankRow = Math.floor(tiles.indexOf(0) / SIZE);
  return SIZE % 2 === 1 ? inv % 2 === 0 : (inv + blankRow) % 2 === 1;
}

function isSolved(tiles) {
  return tiles.every((t, i) => t === (i + 1) % TOTAL);
}

export default function PuzzleSlider({ onGameEnd }) {
  const [tiles, setTiles] = useState(initPuzzle);
  const [moves, setMoves] = useState(0);
  const [won, setWon]     = useState(false);

  const click = (idx) => {
    if (won) return;
    const blank = tiles.indexOf(0);
    const r = Math.floor(idx / SIZE), c = idx % SIZE;
    const br = Math.floor(blank / SIZE), bc = blank % SIZE;
    if (Math.abs(r - br) + Math.abs(c - bc) !== 1) return;
    const nt = [...tiles];
    [nt[idx], nt[blank]] = [nt[blank], nt[idx]];
    setTiles(nt);
    setMoves(m => m + 1);
    if (isSolved(nt)) setWon(true);
  };

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-4">
      <div className="w-full max-w-xs">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-base font-bold text-theme-primary">🧩 Puzzle Slider</h2>
          <span className="text-purple-400 font-bold">{moves} moves</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 mb-4">
          {tiles.map((tile, i) => (
            <button key={i} onClick={() => click(i)}
              className={`aspect-square rounded-xl text-xl font-black flex items-center justify-center transition-all
                ${tile === 0 ? "bg-theme-input opacity-0" :
                  tile === (i + 1) % TOTAL ? "bg-green-500/20 border-2 border-green-500 text-green-400" :
                  "bg-theme-card border-2 border-theme text-theme-primary hover:border-purple-500 active:scale-95"
                }`}>
              {tile !== 0 ? tile : ""}
            </button>
          ))}
        </div>

        {won ? (
          <div className="text-center bg-theme-card rounded-2xl p-4 border border-theme">
            <p className="text-2xl mb-1">🎉</p>
            <p className="font-bold text-theme-primary mb-3">Solved in {moves} moves!</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => { setTiles(initPuzzle()); setMoves(0); setWon(false); }} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">New Puzzle</button>
              <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl text-sm">Exit</button>
            </div>
          </div>
        ) : (
          <button onClick={() => { setTiles(initPuzzle()); setMoves(0); }} className="w-full bg-theme-input text-theme-muted py-2 rounded-xl text-sm hover:bg-theme-hover transition">Shuffle</button>
        )}
      </div>
    </div>
  );
}
