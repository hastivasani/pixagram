import { useState } from "react";

// 0=empty, 1=red, 2=black, 3=red king, 4=black king
function initBoard() {
  const b = Array(8).fill(null).map(() => Array(8).fill(0));
  for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) if ((r + c) % 2 === 1) b[r][c] = 2;
  for (let r = 5; r < 8; r++) for (let c = 0; c < 8; c++) if ((r + c) % 2 === 1) b[r][c] = 1;
  return b;
}

const isRed   = p => p === 1 || p === 3;
const isBlack = p => p === 2 || p === 4;
const isKing  = p => p === 3 || p === 4;

function getMoves(board, r, c) {
  const p = board[r][c];
  if (!p) return [];
  const moves = [];
  const dirs = isKing(p) ? [[-1,-1],[-1,1],[1,-1],[1,1]] : isRed(p) ? [[-1,-1],[-1,1]] : [[1,-1],[1,1]];
  dirs.forEach(([dr, dc]) => {
    const nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      if (board[nr][nc] === 0) moves.push({ r: nr, c: nc, jump: false });
      else if ((isRed(p) && isBlack(board[nr][nc])) || (isBlack(p) && isRed(board[nr][nc]))) {
        const jr = nr + dr, jc = nc + dc;
        if (jr >= 0 && jr < 8 && jc >= 0 && jc < 8 && board[jr][jc] === 0)
          moves.push({ r: jr, c: jc, jump: true, captR: nr, captC: nc });
      }
    }
  });
  return moves;
}

export default function CheckersGame({ onGameEnd }) {
  const [board, setBoard]     = useState(initBoard);
  const [selected, setSelected] = useState(null);
  const [moves, setMoves]       = useState([]);
  const [turn, setTurn]         = useState("red");
  const [msg, setMsg]           = useState("");

  const select = (r, c) => {
    if (msg) return;
    const p = board[r][c];
    if (selected) {
      const mv = moves.find(m => m.r === r && m.c === c);
      if (mv) {
        const nb = board.map(row => [...row]);
        nb[r][c] = nb[selected[0]][selected[1]];
        nb[selected[0]][selected[1]] = 0;
        if (mv.jump) nb[mv.captR][mv.captC] = 0;
        // King promotion
        if (nb[r][c] === 1 && r === 0) nb[r][c] = 3;
        if (nb[r][c] === 2 && r === 7) nb[r][c] = 4;
        setBoard(nb); setSelected(null); setMoves([]);
        // Check win
        const reds   = nb.flat().filter(isRed).length;
        const blacks = nb.flat().filter(isBlack).length;
        if (!reds)   { setMsg("⬛ Black Wins!"); return; }
        if (!blacks) { setMsg("🔴 Red Wins!"); return; }
        setTurn(t => t === "red" ? "black" : "red");
      } else {
        if (p && (turn === "red" ? isRed(p) : isBlack(p))) {
          setSelected([r, c]); setMoves(getMoves(board, r, c));
        } else { setSelected(null); setMoves([]); }
      }
    } else {
      if (p && (turn === "red" ? isRed(p) : isBlack(p))) {
        setSelected([r, c]); setMoves(getMoves(board, r, c));
      }
    }
  };

  const reset = () => { setBoard(initBoard()); setSelected(null); setMoves([]); setTurn("red"); setMsg(""); };

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-base font-bold text-theme-primary">🔴 Checkers</h2>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${turn==="red"?"bg-red-500/20 text-red-400":"bg-gray-500/20 text-gray-400"}`}>
            {msg || (turn === "red" ? "Red's Turn" : "Black's Turn")}
          </span>
        </div>

        <div className="border-2 border-theme rounded-xl overflow-hidden">
          {board.map((row, r) => (
            <div key={r} className="flex">
              {row.map((cell, c) => {
                const dark    = (r + c) % 2 === 1;
                const isSel   = selected?.[0] === r && selected?.[1] === c;
                const isMove  = moves.some(m => m.r === r && m.c === c);
                return (
                  <button key={c} onClick={() => select(r, c)}
                    className={`flex-1 aspect-square flex items-center justify-center text-2xl transition
                      ${dark ? "bg-amber-800" : "bg-amber-100"}
                      ${isSel ? "ring-2 ring-yellow-400 ring-inset" : ""}
                      ${isMove ? "ring-2 ring-green-400 ring-inset" : ""}
                    `}>
                    {cell === 1 && "🔴"}
                    {cell === 2 && "⚫"}
                    {cell === 3 && "👑"}
                    {cell === 4 && "🖤"}
                    {!cell && isMove && <span className="w-3 h-3 rounded-full bg-green-400/50 block"/>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {msg && (
          <div className="mt-3 flex gap-2 justify-center">
            <button onClick={reset} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">Play Again</button>
            <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl text-sm">Exit</button>
          </div>
        )}
      </div>
    </div>
  );
}
