import { useState } from "react";

const SNAKES  = { 99:78, 95:75, 92:88, 89:68, 74:53, 64:60, 62:19, 49:11, 46:25, 16:6 };
const LADDERS = { 2:38, 7:14, 8:31, 15:26, 21:42, 28:84, 36:44, 51:67, 71:91, 78:98, 87:94 };

function buildBoard() {
  const cells = [];
  for (let row = 9; row >= 0; row--) {
    const rowCells = [];
    for (let col = 0; col < 10; col++) {
      const num = row % 2 === 1 ? row * 10 + (9 - col) + 1 : row * 10 + col + 1;
      rowCells.push(num);
    }
    cells.push(rowCells);
  }
  return cells;
}

const BOARD = buildBoard();

export default function SnakeLadder({ onGameEnd }) {
  const [pos, setPos]     = useState({ p1: 0, p2: 0 });
  const [turn, setTurn]   = useState("p1");
  const [dice, setDice]   = useState(null);
  const [msg, setMsg]     = useState("");
  const [log, setLog]     = useState([]);

  const roll = () => {
    if (msg) return;
    const d = Math.floor(Math.random() * 6) + 1;
    setDice(d);
    let newPos = pos[turn] + d;
    let note = `${turn === "p1" ? "🔴" : "🔵"} rolled ${d}`;

    if (newPos > 100) { newPos = pos[turn]; note += " (can't move)"; }
    else if (SNAKES[newPos]) { note += ` → 🐍 Snake! ${newPos}→${SNAKES[newPos]}`; newPos = SNAKES[newPos]; }
    else if (LADDERS[newPos]) { note += ` → 🪜 Ladder! ${newPos}→${LADDERS[newPos]}`; newPos = LADDERS[newPos]; }

    const newPosState = { ...pos, [turn]: newPos };
    setPos(newPosState);
    setLog(l => [note, ...l.slice(0, 4)]);

    if (newPos === 100) { setMsg(`${turn === "p1" ? "🔴 Player 1" : "🔵 Player 2"} Wins! 🎉`); return; }
    setTurn(t => t === "p1" ? "p2" : "p1");
  };

  const reset = () => { setPos({ p1: 0, p2: 0 }); setTurn("p1"); setDice(null); setMsg(""); setLog([]); };

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-2 py-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-base font-bold text-theme-primary">🐍 Snake & Ladder</h2>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${turn==="p1"?"bg-red-500/20 text-red-400":"bg-blue-500/20 text-blue-400"}`}>
            {turn==="p1"?"P1 🔴":"P2 🔵"}
          </span>
        </div>

        {/* Board */}
        <div className="border border-theme rounded-xl overflow-hidden mb-3">
          {BOARD.map((row, ri) => (
            <div key={ri} className="flex">
              {row.map(num => {
                const hasSnake  = SNAKES[num];
                const hasLadder = LADDERS[num];
                const p1Here    = pos.p1 === num;
                const p2Here    = pos.p2 === num;
                return (
                  <div key={num} className={`flex-1 aspect-square flex flex-col items-center justify-center border border-theme/30 text-[8px] relative
                    ${hasSnake?"bg-red-500/10":hasLadder?"bg-green-500/10":"bg-theme-card"}`}>
                    <span className="text-theme-muted">{num}</span>
                    {hasSnake  && <span className="text-red-400 text-[10px]">🐍</span>}
                    {hasLadder && <span className="text-green-400 text-[10px]">🪜</span>}
                    <div className="flex gap-0.5">
                      {p1Here && <span className="text-[10px]">🔴</span>}
                      {p2Here && <span className="text-[10px]">🔵</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Positions */}
        <div className="flex justify-around bg-theme-card rounded-xl p-2 border border-theme mb-3 text-sm">
          <span className="text-red-400 font-bold">🔴 P1: {pos.p1}</span>
          <span className="text-blue-400 font-bold">🔵 P2: {pos.p2}</span>
        </div>

        {/* Log */}
        {log.length > 0 && (
          <div className="bg-theme-input rounded-xl p-2 mb-3 space-y-1">
            {log.map((l, i) => <p key={i} className="text-xs text-theme-muted">{l}</p>)}
          </div>
        )}

        {msg ? (
          <div className="text-center">
            <p className="text-xl font-bold text-theme-primary mb-3">{msg}</p>
            <div className="flex gap-2 justify-center">
              <button onClick={reset} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">Play Again</button>
              <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl text-sm">Exit</button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4">
            <div className="w-14 h-14 rounded-xl border-2 border-theme bg-theme-card flex items-center justify-center text-3xl font-black text-theme-primary">
              {dice ? ["","⚀","⚁","⚂","⚃","⚄","⚅"][dice] : "?"}
            </div>
            <button onClick={roll} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition">
              Roll 🎲
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
