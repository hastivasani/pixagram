import { useState } from "react";

function makeDominoes() {
  const tiles = [];
  for (let i = 0; i <= 6; i++) for (let j = i; j <= 6; j++) tiles.push([i, j]);
  return tiles.sort(() => Math.random() - 0.5);
}

function Domino({ tile, onClick, selected, horizontal }) {
  const [a, b] = tile;
  const dots = n => {
    const pos = {
      0: [],
      1: [[50,50]],
      2: [[25,25],[75,75]],
      3: [[25,25],[50,50],[75,75]],
      4: [[25,25],[75,25],[25,75],[75,75]],
      5: [[25,25],[75,25],[50,50],[25,75],[75,75]],
      6: [[25,25],[75,25],[25,50],[75,50],[25,75],[75,75]],
    };
    return pos[n] || [];
  };

  return (
    <button onClick={onClick}
      className={`inline-flex ${horizontal?"flex-row":"flex-col"} border-2 rounded-lg overflow-hidden transition-transform
        ${selected ? "border-yellow-400 scale-110" : "border-gray-400 hover:border-purple-400"}`}>
      {[a, b].map((n, i) => (
        <div key={i} className={`${horizontal?"w-8 h-14":"w-14 h-8"} bg-white relative flex-shrink-0 ${i===0&&horizontal?"border-r-2 border-gray-400":i===0?"border-b-2 border-gray-400":""}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {dots(n).map(([cx,cy], di) => <circle key={di} cx={cx} cy={cy} r={10} fill="#1e293b"/>)}
          </svg>
        </div>
      ))}
    </button>
  );
}

export default function DominoGame({ onGameEnd }) {
  const [allTiles] = useState(makeDominoes);
  const [playerHand, setPlayer] = useState(() => allTiles.slice(0, 7));
  const [cpuHand, setCpu]       = useState(() => allTiles.slice(7, 14));
  const [board, setBoard]       = useState([allTiles[14]]);
  const [boneyard, setBoneyard] = useState(() => allTiles.slice(15));
  const [selected, setSelected] = useState(null);
  const [turn, setTurn]         = useState("player");
  const [msg, setMsg]           = useState("");

  const leftEnd  = board[0][0];
  const rightEnd = board[board.length - 1][1];

  const canPlay = (tile) => tile[0] === leftEnd || tile[1] === leftEnd || tile[0] === rightEnd || tile[1] === rightEnd;

  const playTile = (tile, side) => {
    const nb = [...board];
    let t = [...tile];
    if (side === "left") {
      if (t[1] !== leftEnd) t = [t[1], t[0]];
      nb.unshift(t);
    } else {
      if (t[0] !== rightEnd) t = [t[1], t[0]];
      nb.push(t);
    }
    const np = playerHand.filter(tt => tt !== tile);
    setBoard(nb); setPlayer(np); setSelected(null);
    if (np.length === 0) { setMsg("🎉 You Win!"); return; }
    setTurn("cpu");
    setTimeout(() => doCpu(np, nb), 800);
  };

  const doCpu = (playerH, curBoard) => {
    const le = curBoard[0][0], re = curBoard[curBoard.length-1][1];
    const playable = cpuHand.find(t => t[0]===le||t[1]===le||t[0]===re||t[1]===re);
    if (playable) {
      const nb = [...curBoard];
      let t = [...playable];
      if (t[0] === re || t[1] === re) {
        if (t[0] !== re) t = [t[1], t[0]];
        nb.push(t);
      } else {
        if (t[1] !== le) t = [t[1], t[0]];
        nb.unshift(t);
      }
      const nc = cpuHand.filter(tt => tt !== playable);
      setCpu(nc); setBoard(nb);
      if (nc.length === 0) { setMsg("🤖 CPU Wins!"); return; }
    } else if (boneyard.length > 0) {
      setCpu(h => [...h, boneyard[0]]);
      setBoneyard(b => b.slice(1));
    }
    setTurn("player");
  };

  const draw = () => {
    if (boneyard.length === 0 || turn !== "player") return;
    setPlayer(h => [...h, boneyard[0]]);
    setBoneyard(b => b.slice(1));
  };

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-base font-bold text-theme-primary">🁣 Domino</h2>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${turn==="player"?"bg-green-500/20 text-green-400":"bg-red-500/20 text-red-400"}`}>
            {turn==="player"?"Your Turn":"CPU Turn"}
          </span>
        </div>

        {/* CPU hand */}
        <div className="bg-theme-card rounded-xl p-2 border border-theme mb-3">
          <p className="text-xs text-theme-muted mb-1">CPU ({cpuHand.length} tiles)</p>
          <div className="flex gap-1 flex-wrap">
            {cpuHand.map((_, i) => <div key={i} className="w-8 h-14 rounded bg-blue-700 border border-blue-500"/>)}
          </div>
        </div>

        {/* Board */}
        <div className="bg-theme-card rounded-xl p-2 border border-theme mb-3 overflow-x-auto">
          <p className="text-xs text-theme-muted mb-1">Board (Left:{leftEnd} | Right:{rightEnd})</p>
          <div className="flex gap-1 items-center min-w-max">
            {board.map((t, i) => <Domino key={i} tile={t} horizontal/>)}
          </div>
        </div>

        {msg && <div className="text-center py-2 bg-theme-card rounded-xl border border-theme text-lg font-bold text-theme-primary mb-3">{msg}</div>}

        {/* Player hand */}
        <div className="bg-theme-card rounded-xl p-2 border border-theme mb-3">
          <p className="text-xs text-theme-muted mb-1">Your Hand ({playerHand.length} tiles)</p>
          <div className="flex gap-1.5 flex-wrap">
            {playerHand.map((tile, i) => (
              <Domino key={i} tile={tile} selected={selected===tile}
                onClick={() => { if(turn==="player"&&!msg) setSelected(selected===tile?null:tile); }}/>
            ))}
          </div>
        </div>

        {selected && (
          <div className="flex gap-2 mb-3">
            {canPlay(selected) ? (
              <>
                <button onClick={() => playTile(selected, "left")} className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm font-bold">← Play Left</button>
                <button onClick={() => playTile(selected, "right")} className="flex-1 bg-green-600 text-white py-2 rounded-xl text-sm font-bold">Play Right →</button>
              </>
            ) : (
              <div className="flex-1 bg-red-500/20 text-red-400 py-2 rounded-xl text-sm text-center">Can't play this tile</div>
            )}
          </div>
        )}

        {!msg && turn === "player" && (
          <button onClick={draw} disabled={boneyard.length === 0}
            className="w-full bg-theme-input text-theme-muted py-2 rounded-xl text-sm hover:bg-theme-hover transition disabled:opacity-50">
            Draw from boneyard ({boneyard.length})
          </button>
        )}

        {msg && (
          <div className="flex gap-2 justify-center">
            <button onClick={() => {
              const newTiles = makeDominoes();
              setPlayerDeck(newTiles.slice(0,7)); setCpuDeck(newTiles.slice(7,14));
              setBoard([newTiles[14]]); setBoneyard(newTiles.slice(15));
              setSelected(null); setTurn("player"); setMsg("");
            }} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">Play Again</button>
            <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl text-sm">Exit</button>
          </div>
        )}
      </div>
    </div>
  );
}
