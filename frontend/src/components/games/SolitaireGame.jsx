import { useState } from "react";

const SUITS = ["♠","♥","♦","♣"];
const VALS  = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const isRed = c => c.suit === "♥" || c.suit === "♦";
const cardNum = v => VALS.indexOf(v);

function makeDeck() {
  return SUITS.flatMap(suit => VALS.map(val => ({ suit, val, faceUp: false })));
}
function shuffle(d) { return [...d].sort(() => Math.random() - 0.5); }

function initGame() {
  const deck = shuffle(makeDeck());
  const tableau = [];
  for (let i = 0; i < 7; i++) {
    const col = deck.splice(0, i + 1);
    col[col.length - 1].faceUp = true;
    tableau.push(col);
  }
  return { tableau, stock: deck.map(c => ({ ...c, faceUp: false })), waste: [], foundations: [[],[],[],[]] };
}

function CardView({ card, small, onClick, selected }) {
  if (!card.faceUp) return (
    <div onClick={onClick} className={`${small?"w-9 h-12":"w-12 h-16"} rounded bg-blue-700 border border-blue-500 cursor-pointer hover:bg-blue-600`}/>
  );
  return (
    <div onClick={onClick}
      className={`${small?"w-9 h-12 text-xs":"w-12 h-16 text-sm"} rounded border-2 bg-white flex flex-col items-center justify-center font-black cursor-pointer transition
        ${isRed(card)?"text-red-500 border-red-300":"text-gray-900 border-gray-300"}
        ${selected?"ring-2 ring-yellow-400":""}`}>
      <span>{card.val}</span><span>{card.suit}</span>
    </div>
  );
}

export default function SolitaireGame({ onGameEnd }) {
  const [game, setGame]       = useState(initGame);
  const [selected, setSelected] = useState(null); // { from, cards }
  const [won, setWon]           = useState(false);

  const drawStock = () => {
    setGame(g => {
      if (g.stock.length === 0) {
        return { ...g, stock: [...g.waste].reverse().map(c => ({ ...c, faceUp: false })), waste: [] };
      }
      const card = { ...g.stock[0], faceUp: true };
      return { ...g, stock: g.stock.slice(1), waste: [card, ...g.waste] };
    });
    setSelected(null);
  };

  const canPlaceOnTableau = (card, col) => {
    if (col.length === 0) return card.val === "K";
    const top = col[col.length - 1];
    if (!top.faceUp) return false;
    return cardNum(card.val) === cardNum(top.val) - 1 && isRed(card) !== isRed(top);
  };

  const canPlaceOnFoundation = (card, foundation) => {
    if (foundation.length === 0) return card.val === "A";
    const top = foundation[foundation.length - 1];
    return card.suit === top.suit && cardNum(card.val) === cardNum(top.val) + 1;
  };

  const selectCard = (from, cards) => {
    if (selected) {
      // Try to place
      const { from: sf, cards: sc } = selected;
      if (from.type === "tableau") {
        const col = game.tableau[from.idx];
        if (canPlaceOnTableau(sc[0], col)) {
          setGame(g => {
            const nt = g.tableau.map(c => [...c]);
            // Remove from source
            if (sf.type === "tableau") {
              nt[sf.idx] = nt[sf.idx].slice(0, nt[sf.idx].length - sc.length);
              if (nt[sf.idx].length > 0) nt[sf.idx][nt[sf.idx].length - 1].faceUp = true;
            }
            nt[from.idx] = [...nt[from.idx], ...sc];
            return { ...g, tableau: nt, waste: sf.type === "waste" ? g.waste.slice(1) : g.waste };
          });
          setSelected(null); return;
        }
      }
      if (from.type === "foundation") {
        const fd = game.foundations[from.idx];
        if (sc.length === 1 && canPlaceOnFoundation(sc[0], fd)) {
          setGame(g => {
            const nf = g.foundations.map(f => [...f]);
            nf[from.idx] = [...nf[from.idx], sc[0]];
            const nt = g.tableau.map(c => [...c]);
            if (sf.type === "tableau") {
              nt[sf.idx] = nt[sf.idx].slice(0, -1);
              if (nt[sf.idx].length > 0) nt[sf.idx][nt[sf.idx].length - 1].faceUp = true;
            }
            const nw = sf.type === "waste" ? g.waste.slice(1) : g.waste;
            const allDone = nf.every(f => f.length === 13);
            if (allDone) setWon(true);
            return { ...g, foundations: nf, tableau: nt, waste: nw };
          });
          setSelected(null); return;
        }
      }
      setSelected(null);
    } else {
      setSelected({ from, cards });
    }
  };

  return (
    <div className="min-h-screen bg-green-900 flex flex-col items-center px-2 py-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onGameEnd} className="text-white/70 text-sm">← Back</button>
          <h2 className="text-base font-bold text-white">🃏 Solitaire</h2>
          <button onClick={() => { setGame(initGame()); setSelected(null); setWon(false); }} className="text-white/70 text-xs">New Game</button>
        </div>

        {/* Top row: stock, waste, foundations */}
        <div className="flex gap-2 mb-3 items-start">
          {/* Stock */}
          <button onClick={drawStock} className="w-10 h-14 rounded bg-blue-700 border border-blue-500 flex items-center justify-center text-white text-lg hover:bg-blue-600">
            {game.stock.length > 0 ? "🂠" : "↺"}
          </button>
          {/* Waste */}
          <div className="w-10 h-14">
            {game.waste[0] && (
              <CardView card={game.waste[0]} small
                selected={selected?.from.type==="waste"}
                onClick={() => selectCard({ type:"waste" }, [game.waste[0]])}/>
            )}
          </div>
          <div className="flex-1"/>
          {/* Foundations */}
          {game.foundations.map((f, i) => (
            <div key={i} onClick={() => selected && selectCard({ type:"foundation", idx:i }, selected?.cards)}
              className="w-10 h-14 rounded border-2 border-white/30 bg-white/10 flex items-center justify-center text-white/40 text-xs cursor-pointer hover:bg-white/20">
              {f.length > 0 ? <CardView card={f[f.length-1]} small/> : SUITS[i]}
            </div>
          ))}
        </div>

        {/* Tableau */}
        <div className="flex gap-1">
          {game.tableau.map((col, ci) => (
            <div key={ci} className="flex-1 flex flex-col" style={{ minHeight: 60 }}>
              {col.length === 0 ? (
                <div onClick={() => selected && selectCard({ type:"tableau", idx:ci }, selected?.cards)}
                  className="w-full h-14 rounded border-2 border-dashed border-white/20 cursor-pointer hover:border-white/40"/>
              ) : (
                col.map((card, ri) => (
                  <div key={ri} style={{ marginTop: ri === 0 ? 0 : -36 }}>
                    <CardView card={card} small
                      selected={selected?.from.type==="tableau" && selected?.from.idx===ci && ri >= col.length - selected?.cards.length}
                      onClick={() => {
                        if (!card.faceUp) return;
                        const cards = col.slice(ri);
                        selectCard({ type:"tableau", idx:ci }, cards);
                      }}/>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>

        {won && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
            <div className="bg-theme-card rounded-2xl p-6 text-center border border-theme">
              <p className="text-4xl mb-2">🎉</p>
              <p className="text-xl font-bold text-theme-primary mb-4">You Won!</p>
              <div className="flex gap-2 justify-center">
                <button onClick={() => { setGame(initGame()); setSelected(null); setWon(false); }} className="bg-purple-600 text-white px-4 py-2 rounded-xl font-bold">Play Again</button>
                <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl">Exit</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
