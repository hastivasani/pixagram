import { useState } from "react";

const INIT = [
  ["r","n","b","q","k","b","n","r"],
  ["p","p","p","p","p","p","p","p"],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  ["P","P","P","P","P","P","P","P"],
  ["R","N","B","Q","K","B","N","R"],
];

const PIECES = {
  k:"♚",q:"♛",r:"♜",b:"♝",n:"♞",p:"♟",
  K:"♔",Q:"♕",R:"♖",B:"♗",N:"♘",P:"♙",
};

const isWhite = p => p && p === p.toUpperCase();
const isBlack = p => p && p === p.toLowerCase();

function getLegalMoves(board, row, col) {
  const piece = board[row][col];
  if (!piece) return [];
  const moves = [];
  const white = isWhite(piece);
  const type = piece.toLowerCase();

  const add = (r, c) => {
    if (r < 0 || r > 7 || c < 0 || c > 7) return false;
    const target = board[r][c];
    if (target && (white ? isWhite(target) : isBlack(target))) return false;
    moves.push([r, c]);
    return !target;
  };

  if (type === "p") {
    const dir = white ? -1 : 1;
    const startRow = white ? 6 : 1;
    if (!board[row + dir]?.[col]) {
      moves.push([row + dir, col]);
      if (row === startRow && !board[row + 2 * dir]?.[col]) moves.push([row + 2 * dir, col]);
    }
    [-1, 1].forEach(dc => {
      const target = board[row + dir]?.[col + dc];
      if (target && (white ? isBlack(target) : isWhite(target))) moves.push([row + dir, col + dc]);
    });
  } else if (type === "r") {
    [[0,1],[0,-1],[1,0],[-1,0]].forEach(([dr,dc]) => { for(let i=1;i<8;i++) if(!add(row+dr*i,col+dc*i)) break; });
  } else if (type === "b") {
    [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc]) => { for(let i=1;i<8;i++) if(!add(row+dr*i,col+dc*i)) break; });
  } else if (type === "q") {
    [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc]) => { for(let i=1;i<8;i++) if(!add(row+dr*i,col+dc*i)) break; });
  } else if (type === "n") {
    [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr,dc]) => add(row+dr,col+dc));
  } else if (type === "k") {
    [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr,dc]) => add(row+dr,col+dc));
  }
  return moves;
}

export default function ChessGame({ onGameEnd, lobbyId, players, currentUser, socket }) {
  const [board, setBoard]   = useState(INIT.map(r => [...r]));
  const [selected, setSelected] = useState(null);
  const [legalMoves, setLegal]  = useState([]);
  const [turn, setTurn]         = useState("white");
  const [captured, setCaptured] = useState({ white: [], black: [] });
  const [status, setStatus]     = useState("");

  const isSolo = !players || players.length < 2;
  const myColor = isSolo ? turn : (players?.findIndex(p => (p.user?._id||p.user)?.toString() === currentUser?._id?.toString()) === 0 ? "white" : "black");

  const handleSquare = (r, c) => {
    if (status) return;
    if (!isSolo && turn !== myColor) return;

    const piece = board[r][c];
    if (selected) {
      const isLegal = legalMoves.some(([lr, lc]) => lr === r && lc === c);
      if (isLegal) {
        const nb = board.map(row => [...row]);
        const captured_piece = nb[r][c];
        nb[r][c] = nb[selected[0]][selected[1]];
        nb[selected[0]][selected[1]] = null;
        // Pawn promotion
        if (nb[r][c] === "P" && r === 0) nb[r][c] = "Q";
        if (nb[r][c] === "p" && r === 7) nb[r][c] = "q";

        if (captured_piece) {
          setCaptured(prev => ({
            ...prev,
            [turn]: [...prev[turn], captured_piece],
          }));
          if (captured_piece === "K") { setStatus("⬛ Black Wins!"); }
          if (captured_piece === "k") { setStatus("⬜ White Wins!"); }
        }

        const nextTurn = turn === "white" ? "black" : "white";
        setBoard(nb); setSelected(null); setLegal([]); setTurn(nextTurn);

        if (!isSolo && socket) {
          socket.emit("gameAction", { lobbyId, action: "chess_move", payload: { board: nb, nextTurn } });
        }
      } else {
        if (piece && (turn === "white" ? isWhite(piece) : isBlack(piece))) {
          setSelected([r, c]); setLegal(getLegalMoves(board, r, c));
        } else { setSelected(null); setLegal([]); }
      }
    } else {
      if (piece && (turn === "white" ? isWhite(piece) : isBlack(piece))) {
        setSelected([r, c]); setLegal(getLegalMoves(board, r, c));
      }
    }
  };

  const reset = () => {
    setBoard(INIT.map(r => [...r])); setSelected(null); setLegal([]);
    setTurn("white"); setCaptured({ white: [], black: [] }); setStatus("");
  };

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-2 py-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-base font-bold text-theme-primary">♟ Chess</h2>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${turn==="white"?"bg-white/20 text-white":"bg-gray-800 text-gray-300"}`}>
            {status || (turn === "white" ? "⬜ White" : "⬛ Black")}
          </span>
        </div>

        {/* Board */}
        <div className="border-2 border-theme rounded-xl overflow-hidden">
          {board.map((row, r) => (
            <div key={r} className="flex">
              {row.map((piece, c) => {
                const isLight = (r + c) % 2 === 0;
                const isSel   = selected?.[0] === r && selected?.[1] === c;
                const isLegal = legalMoves.some(([lr, lc]) => lr === r && lc === c);
                return (
                  <button key={c} onClick={() => handleSquare(r, c)}
                    className={`flex-1 aspect-square flex items-center justify-center text-xl transition
                      ${isLight ? "bg-amber-100" : "bg-amber-800"}
                      ${isSel ? "ring-2 ring-yellow-400 ring-inset" : ""}
                      ${isLegal ? "ring-2 ring-green-400 ring-inset" : ""}
                    `}>
                    {piece ? PIECES[piece] : isLegal ? <span className="w-3 h-3 rounded-full bg-green-400/50 block"/> : null}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Captured */}
        <div className="flex justify-between mt-2 text-xs text-theme-muted">
          <span>⬜ Captured: {captured.white.map(p => PIECES[p]).join("")}</span>
          <span>⬛ Captured: {captured.black.map(p => PIECES[p]).join("")}</span>
        </div>

        {status && (
          <div className="mt-3 flex gap-2 justify-center">
            <button onClick={reset} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">Play Again</button>
            <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl text-sm">Exit</button>
          </div>
        )}
      </div>
    </div>
  );
}
