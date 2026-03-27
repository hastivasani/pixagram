import { useState, useCallback } from "react";

// ── Board layout constants ────────────────────────────────────
// 15x15 grid. Each cell: [row, col]
// Path positions 1-52 (clockwise from blue start)
// Each color has its own home column (positions 53-57)

const BOARD_SIZE = 15;

// Colors: blue(top-left), orange(top-right), green(bottom-right), yellow(bottom-left)
const PLAYERS = ["blue", "orange", "green", "yellow"];

const PLAYER_COLORS = {
  blue:   { bg: "#3b82f6", light: "#bfdbfe", home: "#1d4ed8", text: "text-blue-600",   ring: "ring-blue-400" },
  orange: { bg: "#f97316", light: "#fed7aa", home: "#c2410c", text: "text-orange-600", ring: "ring-orange-400" },
  green:  { bg: "#22c55e", light: "#bbf7d0", home: "#15803d", text: "text-green-600",  ring: "ring-green-400" },
  yellow: { bg: "#eab308", light: "#fef08a", home: "#a16207", text: "text-yellow-600", ring: "ring-yellow-400" },
};

// Home yard positions (row, col) for each color's 4 pieces
const HOME_YARDS = {
  blue:   [[1,1],[1,3],[3,1],[3,3]],
  orange: [[1,11],[1,13],[3,11],[3,13]],
  green:  [[11,11],[11,13],[13,11],[13,13]],
  yellow: [[11,1],[11,3],[13,1],[13,3]],
};

// The 52-step main path (row, col) — clockwise starting from blue entry
const MAIN_PATH = [
  // Blue side going right (row 6)
  [6,1],[6,2],[6,3],[6,4],[6,5],
  // Going up (col 5)
  [5,5],[4,5],[3,5],[2,5],[1,5],[0,5],
  // Top going right (row 0)
  [0,6],
  // Going down right side of top (col 8)
  [0,8],[1,8],[2,8],[3,8],[4,8],[5,8],
  // Orange side going right (row 6 right)
  [6,9],[6,10],[6,11],[6,12],[6,13],[6,14],
  // Going down (col 14)
  [8,14],[8,13],[8,12],[8,11],[8,10],[8,9],
  // Green side going down (col 8 bottom)
  [9,8],[10,8],[11,8],[12,8],[13,8],[14,8],
  // Bottom going left (row 14)
  [14,6],
  // Going up left side of bottom (col 6)
  [14,5],[13,5],[12,5],[11,5],[10,5],[9,5],
  // Yellow side going left (row 8)
  [8,4],[8,3],[8,2],[8,1],[8,0],
  // Going up (col 0)
  [6,0],
];

// Entry cell index on MAIN_PATH for each color (0-indexed)
const ENTRY = { blue: 0, orange: 13, green: 26, yellow: 39 };

// Home stretch cells (row, col) for each color (5 cells leading to center)
const HOME_STRETCH = {
  blue:   [[6,1],[6,2],[6,3],[6,4],[6,5],[7,6]], // actually col 1-6 row 7
  orange: [[1,8],[2,8],[3,8],[4,8],[5,8],[6,7]],
  green:  [[8,13],[8,12],[8,11],[8,10],[8,9],[7,8]],
  yellow: [[13,6],[12,6],[11,6],[10,6],[9,6],[8,7]],
};

// Proper home stretch paths
const HOME_LANES = {
  blue:   [[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]],
  orange: [[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]],
  green:  [[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]],
  yellow: [[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]],
};

// Safe squares (star positions) on main path indices
const SAFE_SQUARES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

// ── Dice faces ────────────────────────────────────────────────
const DICE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

// ── Cell type helper ──────────────────────────────────────────
function getCellType(r, c) {
  // Home yards
  if (r <= 5 && c <= 5 && !(r >= 6 || c >= 6)) {
    if (r <= 4 && c <= 4) return "blue_yard";
  }
  if (r <= 5 && c >= 9) return "orange_yard";
  if (r >= 9 && c >= 9) return "green_yard";
  if (r >= 9 && c <= 5) return "yellow_yard";
  // Center
  if (r >= 6 && r <= 8 && c >= 6 && c <= 8) return "center";
  // Home lanes
  if (r === 7 && c >= 1 && c <= 5) return "blue_lane";
  if (c === 7 && r >= 1 && r <= 5) return "orange_lane";
  if (r === 7 && c >= 9 && c <= 13) return "green_lane";
  if (c === 7 && r >= 9 && r <= 13) return "yellow_lane";
  return "path";
}

// ── Main Component ────────────────────────────────────────────
export default function LudoGame({ onGameEnd }) {
  // pieces[color][i] = { pos: -1(home)|0-51(main)|52-57(lane)|58(done) }
  const initPieces = () => {
    const p = {};
    PLAYERS.forEach(c => { p[c] = [{ pos: -1 }, { pos: -1 }, { pos: -1 }, { pos: -1 }]; });
    return p;
  };

  const [pieces, setPieces]   = useState(initPieces);
  const [turn, setTurn]       = useState(0); // index into PLAYERS
  const [dice, setDice]       = useState(null);
  const [rolled, setRolled]   = useState(false);
  const [selected, setSelected] = useState(null); // { color, idx }
  const [winner, setWinner]   = useState(null);
  const [msg, setMsg]         = useState("");
  const [numPlayers, setNumPlayers] = useState(null); // null = setup screen

  const currentColor = PLAYERS[turn];

  const rollDice = () => {
    if (rolled || winner) return;
    const d = Math.floor(Math.random() * 6) + 1;
    setDice(d);
    setRolled(true);
    setMsg("");

    // Check if any piece can move
    const myPieces = pieces[currentColor];
    const canMove = myPieces.some(p =>
      (p.pos === -1 && d === 6) ||
      (p.pos >= 0 && p.pos < 58)
    );

    if (!canMove) {
      setMsg("No moves available — next turn");
      setTimeout(() => nextTurn(d), 1200);
    }
  };

  const nextTurn = useCallback((d = dice) => {
    if (d === 6) return; // extra turn on 6
    setTurn(t => (t + 1) % (numPlayers || 4));
    setRolled(false);
    setDice(null);
    setSelected(null);
    setMsg("");
  }, [dice, numPlayers]);

  const movePiece = (color, idx) => {
    if (!rolled || color !== currentColor || winner) return;
    const piece = pieces[color][idx];

    // Can't move finished pieces
    if (piece.pos === 58) return;

    // Enter board
    if (piece.pos === -1) {
      if (dice !== 6) { setMsg("Need 6 to enter!"); return; }
      const newPieces = JSON.parse(JSON.stringify(pieces));
      newPieces[color][idx].pos = ENTRY[color];
      setPieces(newPieces);
      setRolled(false); setDice(null); setSelected(null);
      setMsg("Piece entered! Roll again 🎲");
      return; // 6 = extra turn
    }

    // Move on board
    const newPos = piece.pos + dice;

    // Check overshoot (max 57 = done)
    const maxPos = 57;
    if (newPos > maxPos) { setMsg("Can't move — would overshoot!"); return; }

    const newPieces = JSON.parse(JSON.stringify(pieces));
    newPieces[color][idx].pos = newPos === maxPos ? 58 : newPos;

    // Check capture (only on main path 0-51)
    if (newPos < 52 && !SAFE_SQUARES.has(newPos)) {
      PLAYERS.forEach(c => {
        if (c === color) return;
        newPieces[c].forEach(p => {
          if (p.pos === newPos) {
            p.pos = -1; // send home
            setMsg(`💥 ${color} captured ${c}'s piece!`);
          }
        });
      });
    }

    setPieces(newPieces);

    // Check win
    if (newPieces[color].every(p => p.pos === 58)) {
      setWinner(color);
      return;
    }

    setRolled(false); setDice(null); setSelected(null);
    if (dice !== 6) nextTurn(dice);
    else setMsg("Roll again! 🎲");
  };

  const reset = () => {
    setPieces(initPieces());
    setTurn(0); setDice(null); setRolled(false);
    setSelected(null); setWinner(null); setMsg("");
  };

  // ── Setup screen ────────────────────────────────────────────
  if (!numPlayers) {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-4">
        <button onClick={onGameEnd} className="self-start mb-4 text-sm text-gray-500 px-3 py-1 rounded-lg hover:bg-amber-100">← Back</button>
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center">
          <div className="text-6xl mb-4">🎲</div>
          <h1 className="text-3xl font-black text-gray-800 mb-2">Ludo</h1>
          <p className="text-gray-500 mb-8">Classic board game</p>
          <p className="font-semibold text-gray-700 mb-4">Select Players</p>
          <div className="flex gap-3 justify-center">
            {[2, 3, 4].map(n => (
              <button key={n} onClick={() => setNumPlayers(n)}
                className="w-16 h-16 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-2xl font-black shadow-md transition hover:scale-105">
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activePlayers = PLAYERS.slice(0, numPlayers);

  // ── Board renderer ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-start p-2 overflow-auto">
      {/* Header */}
      <div className="w-full max-w-lg flex items-center justify-between mb-2 px-1">
        <button onClick={onGameEnd} className="text-sm text-gray-500 px-3 py-1 rounded-lg hover:bg-amber-100">← Back</button>
        <h2 className="text-lg font-black text-gray-800">🎲 Ludo</h2>
        <button onClick={reset} className="text-sm text-gray-500 px-3 py-1 rounded-lg hover:bg-amber-100">Reset</button>
      </div>

      {/* Turn indicator */}
      {!winner && (
        <div className="flex items-center gap-2 mb-2 px-4 py-2 rounded-full shadow-sm"
          style={{ backgroundColor: PLAYER_COLORS[currentColor].light }}>
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: PLAYER_COLORS[currentColor].bg }} />
          <span className="font-bold text-sm capitalize" style={{ color: PLAYER_COLORS[currentColor].home }}>
            {currentColor}'s Turn
          </span>
          {msg && <span className="text-xs text-gray-600 ml-1">— {msg}</span>}
        </div>
      )}

      {/* Board */}
      <div className="relative" style={{ width: "min(95vw, 480px)", height: "min(95vw, 480px)" }}>
        <LudoBoard
          pieces={pieces}
          activePlayers={activePlayers}
          currentColor={currentColor}
          rolled={rolled}
          dice={dice}
          onMovePiece={movePiece}
          selected={selected}
          setSelected={setSelected}
          winner={winner}
        />
      </div>

      {/* Dice + Roll button */}
      {!winner && (
        <div className="flex items-center gap-4 mt-3">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-md border-2 border-amber-300 flex items-center justify-center text-4xl select-none">
            {dice ? DICE_FACES[dice] : "?"}
          </div>
          <button
            onClick={rollDice}
            disabled={rolled}
            className="px-6 py-3 rounded-2xl font-black text-white shadow-md transition hover:scale-105 disabled:opacity-50 disabled:scale-100"
            style={{ backgroundColor: rolled ? "#9ca3af" : PLAYER_COLORS[currentColor].bg }}
          >
            {rolled ? "Move a piece ↑" : "Roll Dice 🎲"}
          </button>
        </div>
      )}

      {/* Winner */}
      {winner && (
        <div className="mt-4 text-center bg-white rounded-3xl shadow-xl p-6 max-w-xs w-full">
          <div className="text-5xl mb-2">🏆</div>
          <p className="text-2xl font-black capitalize mb-1" style={{ color: PLAYER_COLORS[winner].bg }}>
            {winner} Wins!
          </p>
          <div className="flex gap-2 justify-center mt-4">
            <button onClick={reset} className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold">Play Again</button>
            <button onClick={onGameEnd} className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold">Exit</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Board SVG Component ───────────────────────────────────────
function LudoBoard({ pieces, activePlayers, currentColor, rolled, dice, onMovePiece, selected, setSelected, winner }) {
  const SIZE = 480;
  const CELL = SIZE / 15;

  // Build piece positions on board cells
  const pieceMap = {}; // "r,c" -> [{color, idx}]
  activePlayers.forEach(color => {
    pieces[color].forEach((p, idx) => {
      if (p.pos === -1 || p.pos === 58) return;
      let cell;
      if (p.pos < 52) {
        cell = MAIN_PATH[p.pos];
      } else {
        const laneIdx = p.pos - 52;
        cell = HOME_LANES[color][laneIdx];
      }
      if (!cell) return;
      const key = `${cell[0]},${cell[1]}`;
      if (!pieceMap[key]) pieceMap[key] = [];
      pieceMap[key].push({ color, idx });
    });
  });

  const cellBg = (r, c) => {
    // Home yards
    if (r >= 0 && r <= 5 && c >= 0 && c <= 5) return PLAYER_COLORS.blue.light;
    if (r >= 0 && r <= 5 && c >= 9 && c <= 14) return PLAYER_COLORS.orange.light;
    if (r >= 9 && r <= 14 && c >= 9 && c <= 14) return PLAYER_COLORS.green.light;
    if (r >= 9 && r <= 14 && c >= 0 && c <= 5) return PLAYER_COLORS.yellow.light;
    // Center triangle area
    if (r >= 6 && r <= 8 && c >= 6 && c <= 8) return "#f5f5f5";
    // Home lanes
    if (r === 7 && c >= 1 && c <= 5) return PLAYER_COLORS.blue.light;
    if (c === 7 && r >= 1 && r <= 5) return PLAYER_COLORS.orange.light;
    if (r === 7 && c >= 9 && c <= 13) return PLAYER_COLORS.green.light;
    if (c === 7 && r >= 9 && r <= 13) return PLAYER_COLORS.yellow.light;
    return "#ffffff";
  };

  const isColoredPath = (r, c) => {
    if (r === 6 && c >= 1 && c <= 5) return PLAYER_COLORS.blue.bg;
    if (c === 7 && r >= 1 && r <= 5) return PLAYER_COLORS.orange.bg;
    if (r === 7 && c >= 9 && c <= 13) return PLAYER_COLORS.green.bg;
    if (c === 7 && r >= 9 && r <= 13) return PLAYER_COLORS.yellow.bg;
    return null;
  };

  const isSafe = (r, c) => {
    const idx = MAIN_PATH.findIndex(([pr, pc]) => pr === r && pc === c);
    return idx !== -1 && SAFE_SQUARES.has(idx);
  };

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}
      style={{ borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.18)", background: "#d4a96a" }}>

      {/* Board background */}
      <rect width={SIZE} height={SIZE} fill="#d4a96a" rx={12} />

      {/* Draw all cells */}
      {Array.from({ length: 15 }, (_, r) =>
        Array.from({ length: 15 }, (_, c) => {
          const x = c * CELL;
          const y = r * CELL;
          const bg = cellBg(r, c);
          const coloredPath = isColoredPath(r, c);
          const safe = isSafe(r, c);
          const key = `${r},${c}`;
          const piecesHere = pieceMap[key] || [];

          return (
            <g key={key}>
              <rect x={x + 0.5} y={y + 0.5} width={CELL - 1} height={CELL - 1}
                fill={coloredPath || bg}
                stroke="#00000022" strokeWidth={0.5}
                rx={coloredPath ? 2 : 0}
              />
              {/* Safe star */}
              {safe && !coloredPath && (
                <text x={x + CELL / 2} y={y + CELL / 2 + 4} textAnchor="middle" fontSize={CELL * 0.55} fill="#f59e0b">★</text>
              )}
              {/* Pieces on this cell */}
              {piecesHere.map(({ color, idx }, pi) => {
                const isCurrentPlayer = color === currentColor;
                const canMove = rolled && isCurrentPlayer && pieces[color][idx].pos !== 58;
                const isSelected = selected?.color === color && selected?.idx === idx;
                const ox = pi % 2 === 0 ? CELL * 0.28 : CELL * 0.72;
                const oy = pi < 2 ? CELL * 0.28 : CELL * 0.72;
                return (
                  <g key={`${color}-${idx}`}
                    style={{ cursor: canMove ? "pointer" : "default" }}
                    onClick={() => canMove && onMovePiece(color, idx)}>
                    <circle cx={x + ox} cy={y + oy} r={CELL * 0.28}
                      fill={PLAYER_COLORS[color].bg}
                      stroke={isSelected ? "#fbbf24" : "#fff"}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                    />
                    {canMove && (
                      <circle cx={x + ox} cy={y + oy} r={CELL * 0.32}
                        fill="none" stroke="#fbbf24" strokeWidth={1.5}
                        strokeDasharray="3 2" opacity={0.8}>
                        <animateTransform attributeName="transform" type="rotate"
                          from={`0 ${x + ox} ${y + oy}`} to={`360 ${x + ox} ${y + oy}`}
                          dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle cx={x + ox} cy={y + oy} r={CELL * 0.14} fill="white" opacity={0.7} />
                  </g>
                );
              })}
            </g>
          );
        })
      )}

      {/* Home yard circles */}
      {[
        { color: "blue",   cx: 2.5, cy: 2.5 },
        { color: "orange", cx: 12.5, cy: 2.5 },
        { color: "green",  cx: 12.5, cy: 12.5 },
        { color: "yellow", cx: 2.5, cy: 12.5 },
      ].map(({ color, cx, cy }) => (
        <g key={color}>
          <circle cx={cx * CELL} cy={cy * CELL} r={CELL * 2.2}
            fill={PLAYER_COLORS[color].bg} stroke="#00000033" strokeWidth={1} />
          {/* 4 piece slots */}
          {HOME_YARDS[color].map(([r, c], i) => {
            const piece = pieces[color]?.[i];
            const isHome = piece?.pos === -1;
            const isDone = piece?.pos === 58;
            const isCurrentPlayer = color === currentColor;
            const canEnter = rolled && isCurrentPlayer && isHome && dice === 6;
            return (
              <g key={i}
                style={{ cursor: canEnter ? "pointer" : "default" }}
                onClick={() => canEnter && onMovePiece(color, i)}>
                <circle cx={(c + 0.5) * CELL} cy={(r + 0.5) * CELL} r={CELL * 0.38}
                  fill={isDone ? "#22c55e" : isHome ? "white" : PLAYER_COLORS[color].light}
                  stroke={canEnter ? "#fbbf24" : "#00000033"}
                  strokeWidth={canEnter ? 2.5 : 1}
                />
                {isHome && activePlayers.includes(color) && (
                  <circle cx={(c + 0.5) * CELL} cy={(r + 0.5) * CELL} r={CELL * 0.26}
                    fill={PLAYER_COLORS[color].bg} />
                )}
                {isHome && activePlayers.includes(color) && (
                  <circle cx={(c + 0.5) * CELL} cy={(r + 0.5) * CELL} r={CELL * 0.13}
                    fill="white" opacity={0.7} />
                )}
                {isDone && (
                  <text x={(c + 0.5) * CELL} y={(r + 0.5) * CELL + 4}
                    textAnchor="middle" fontSize={CELL * 0.4} fill="white">✓</text>
                )}
                {canEnter && (
                  <circle cx={(c + 0.5) * CELL} cy={(r + 0.5) * CELL} r={CELL * 0.42}
                    fill="none" stroke="#fbbf24" strokeWidth={2} strokeDasharray="3 2">
                    <animateTransform attributeName="transform" type="rotate"
                      from={`0 ${(c + 0.5) * CELL} ${(r + 0.5) * CELL}`}
                      to={`360 ${(c + 0.5) * CELL} ${(r + 0.5) * CELL}`}
                      dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            );
          })}
        </g>
      ))}

      {/* Center star / finish */}
      <polygon
        points={`${7.5 * CELL},${6 * CELL} ${9 * CELL},${7.5 * CELL} ${7.5 * CELL},${9 * CELL} ${6 * CELL},${7.5 * CELL}`}
        fill="#22c55e" stroke="#fff" strokeWidth={1} />
      <text x={7.5 * CELL} y={7.5 * CELL + 5} textAnchor="middle" fontSize={CELL * 0.7} fill="white">★</text>

      {/* Color triangles pointing to center */}
      <polygon points={`${6 * CELL},${6 * CELL} ${9 * CELL},${6 * CELL} ${7.5 * CELL},${7.5 * CELL}`}
        fill={PLAYER_COLORS.orange.bg} opacity={0.85} />
      <polygon points={`${6 * CELL},${9 * CELL} ${9 * CELL},${9 * CELL} ${7.5 * CELL},${7.5 * CELL}`}
        fill={PLAYER_COLORS.yellow.bg} opacity={0.85} />
      <polygon points={`${6 * CELL},${6 * CELL} ${6 * CELL},${9 * CELL} ${7.5 * CELL},${7.5 * CELL}`}
        fill={PLAYER_COLORS.blue.bg} opacity={0.85} />
      <polygon points={`${9 * CELL},${6 * CELL} ${9 * CELL},${9 * CELL} ${7.5 * CELL},${7.5 * CELL}`}
        fill={PLAYER_COLORS.green.bg} opacity={0.85} />

      {/* Board border */}
      <rect width={SIZE} height={SIZE} fill="none" stroke="#8B5E3C" strokeWidth={4} rx={12} />
    </svg>
  );
}
