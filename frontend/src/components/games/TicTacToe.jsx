import { useState, useEffect } from "react";

const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

function checkWinner(board) {
  for (const [a,b,c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return board.every(Boolean) ? "draw" : null;
}

function getWinLine(board) {
  for (const line of WIN_LINES) {
    const [a,b,c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return line;
  }
  return null;
}

export default function TicTacToe({ lobbyId, players, currentUser, socket, onGameEnd }) {
  const [board,       setBoard]       = useState(Array(9).fill(null));
  const [mySymbol,    setMySymbol]    = useState(null);
  const [currentTurn, setCurrentTurn] = useState("X");
  const [winner,      setWinner]      = useState(null);
  const [winLine,     setWinLine]     = useState(null);

  const isSolo = players.length < 2;

  // Assign symbol: first player (host) = X, second = O
  useEffect(() => {
    const myIndex = players.findIndex(
      p => (p.user?._id || p.user)?.toString() === currentUser._id?.toString()
    );
    setMySymbol(myIndex === 0 ? "X" : "O");
  }, [players, currentUser._id]);

  // Listen for opponent moves
  useEffect(() => {
    if (!socket || isSolo) return;

    const onAction = (data) => {
      // server relays as { from, action, payload }
      const action  = data.action;
      const payload = data.payload;
      if (action !== "ttt_move") return;

      setBoard(payload.board);
      setCurrentTurn(payload.nextTurn);

      const w = checkWinner(payload.board);
      if (w) {
        setWinner(w);
        setWinLine(getWinLine(payload.board));
      }
    };

    socket.on("gameAction", onAction);
    return () => socket.off("gameAction", onAction);
  }, [socket, isSolo]);

  const handleClick = (idx) => {
    if (!mySymbol || board[idx] || winner) return;
    // In solo mode allow any turn; in multiplayer only your turn
    if (!isSolo && currentTurn !== mySymbol) return;

    const newBoard  = [...board];
    const symbol    = isSolo ? currentTurn : mySymbol;
    newBoard[idx]   = symbol;
    const nextTurn  = symbol === "X" ? "O" : "X";

    setBoard(newBoard);
    setCurrentTurn(nextTurn);

    const w = checkWinner(newBoard);
    if (w) {
      setWinner(w);
      setWinLine(getWinLine(newBoard));
      if (!isSolo && socket) {
        const winnerId = w === mySymbol
          ? currentUser._id
          : players.find(p => (p.user?._id || p.user)?.toString() !== currentUser._id?.toString())?.user?._id;
        socket.emit("gameOver", { lobbyId, winner: winnerId });
      }
    }

    // Emit move to opponent
    if (!isSolo && socket) {
      socket.emit("gameAction", {
        lobbyId,
        action: "ttt_move",
        payload: { board: newBoard, nextTurn },
      });
    }
  };

  const resetGame = () => {
    const fresh = Array(9).fill(null);
    setBoard(fresh);
    setCurrentTurn("X");
    setWinner(null);
    setWinLine(null);
    if (!isSolo && socket) {
      socket.emit("gameAction", {
        lobbyId,
        action: "ttt_move",
        payload: { board: fresh, nextTurn: "X" },
      });
    }
  };

  const isMyTurn  = isSolo || currentTurn === mySymbol;
  const opponent  = players.find(p => (p.user?._id || p.user)?.toString() !== currentUser._id?.toString());

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-6">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={onGameEnd} className="text-theme-muted hover:text-theme-primary transition text-sm flex items-center gap-1">
            ← Back
          </button>
          <h2 className="text-lg font-bold text-theme-primary">Tic Tac Toe</h2>
          <span className="text-sm text-purple-400 font-semibold">
            {isSolo ? "Solo" : `You: ${mySymbol}`}
          </span>
        </div>

        {/* Players bar */}
        <div className="flex items-center justify-between bg-theme-card rounded-2xl p-3 border border-theme mb-4">
          <div className="flex items-center gap-2">
            <img
              src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.username}&background=random`}
              className="w-9 h-9 rounded-full object-cover"
              alt=""
            />
            <div>
              <p className="text-xs font-semibold text-theme-primary">{currentUser.username}</p>
              <p className="text-xs text-blue-400 font-bold">{isSolo ? "X / O" : mySymbol}</p>
            </div>
          </div>

          <div className="text-center">
            <span className="text-theme-muted text-xs font-bold">VS</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs font-semibold text-theme-primary">
                {isSolo ? "CPU" : (opponent?.user?.username || "Waiting...")}
              </p>
              <p className="text-xs text-orange-400 font-bold">{isSolo ? "—" : (mySymbol === "X" ? "O" : "X")}</p>
            </div>
            <img
              src={
                isSolo
                  ? "https://ui-avatars.com/api/?name=CPU&background=6366f1&color=fff"
                  : (opponent?.user?.avatar || `https://ui-avatars.com/api/?name=${opponent?.user?.username || "?"}&background=random`)
              }
              className="w-9 h-9 rounded-full object-cover"
              alt=""
            />
          </div>
        </div>

        {/* Turn indicator */}
        {!winner && (
          <div className={`text-center text-sm font-semibold mb-4 py-2 rounded-xl transition ${
            isMyTurn ? "bg-green-500/10 text-green-400" : "bg-theme-input text-theme-muted"
          }`}>
            {isSolo
              ? `${currentTurn === "X" ? "X" : "O"}'s turn`
              : (isMyTurn ? "Your turn ✨" : `${opponent?.user?.username || "Opponent"}'s turn...`)
            }
          </div>
        )}

        {/* Board */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {board.map((cell, i) => {
            const isWin = winLine?.includes(i);
            return (
              <button
                key={i}
                onClick={() => handleClick(i)}
                className={`
                  aspect-square rounded-2xl text-5xl font-black flex items-center justify-center
                  transition-all duration-150 border-2 select-none
                  ${isWin
                    ? "border-green-500 bg-green-500/20 scale-105"
                    : "border-theme bg-theme-card"
                  }
                  ${!cell && !winner && isMyTurn
                    ? "hover:bg-theme-hover hover:border-purple-400 cursor-pointer active:scale-95"
                    : "cursor-default"
                  }
                `}
              >
                {cell === "X" && <span className="text-blue-400">✕</span>}
                {cell === "O" && <span className="text-orange-400">○</span>}
              </button>
            );
          })}
        </div>

        {/* Result */}
        {winner && (
          <div className="bg-theme-card rounded-2xl p-5 border border-theme text-center">
            <div className="text-4xl mb-2">
              {winner === "draw" ? "🤝" : (isSolo || winner === mySymbol) ? "🎉" : "😔"}
            </div>
            <p className="text-lg font-bold text-theme-primary mb-1">
              {winner === "draw"
                ? "It's a Draw!"
                : isSolo
                  ? `${winner} Wins!`
                  : winner === mySymbol
                    ? "You Win!"
                    : "You Lose!"}
            </p>
            <div className="flex gap-2 mt-4 justify-center">
              <button
                onClick={resetGame}
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition"
              >
                Play Again
              </button>
              <button
                onClick={onGameEnd}
                className="bg-theme-input text-theme-secondary px-5 py-2 rounded-xl text-sm font-semibold hover:bg-theme-hover transition"
              >
                Exit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
