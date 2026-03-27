import { useState, useEffect, useRef } from "react";

const SUITS = ["♠","♥","♦","♣"];
const VALS  = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const isRed = c => c.suit === "♥" || c.suit === "♦";
const cardNum = v => VALS.indexOf(v);

function makeDeck() {
  return SUITS.flatMap(suit => VALS.map(val => ({ suit, val }))).sort(() => Math.random() - 0.5);
}

function canPlay(card, pile) {
  if (!pile || pile.length === 0) return true;
  const top = pile[pile.length - 1];
  const diff = Math.abs(cardNum(card.val) - cardNum(top.val));
  return diff === 1 || diff === 12; // wrap A-K
}

export default function SpeedCards({ onGameEnd }) {
  const [playerHand, setPlayer] = useState([]);
  const [cpuHand, setCpu]       = useState([]);
  const [leftPile, setLeft]     = useState([]);
  const [rightPile, setRight]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [msg, setMsg]           = useState("");
  const [phase, setPhase]       = useState("idle");
  const cpuRef = useRef(cpuHand);
  cpuRef.current = cpuHand;

  const start = () => {
    const deck = makeDeck();
    setPlayer(deck.slice(0, 5));
    setCpu(deck.slice(5, 10));
    setLeft([deck[10]]);
    setRight([deck[11]]);
    setPhase("play"); setMsg(""); setSelected(null);
  };

  const leftRef  = useRef(leftPile);
  const rightRef = useRef(rightPile);
  useEffect(() => { leftRef.current  = leftPile; }, [leftPile]);
  useEffect(() => { rightRef.current = rightPile; }, [rightPile]);

  // CPU auto-play - uses refs to always have fresh pile state
  useEffect(() => {
    if (phase !== "play") return;
    const interval = setInterval(() => {
      const hand = cpuRef.current;
      const lPile = leftRef.current;
      const rPile = rightRef.current;
      const playable = hand.find(c => canPlay(c, lPile) || canPlay(c, rPile));
      if (playable) {
        const toLeft = canPlay(playable, lPile);
        if (toLeft) setLeft(p => [...p, playable]);
        else setRight(p => [...p, playable]);
        setCpu(h => {
          const nh = h.filter(c => c !== playable);
          if (nh.length === 0) { setMsg("🤖 CPU Wins!"); setPhase("done"); }
          return nh;
        });
      }
    }, 1200);
    return () => clearInterval(interval);
  }, [phase]);

  const playCard = (pile, setPile) => {
    if (!selected || phase !== "play") return;
    if (!canPlay(selected, pile)) return;
    setPile(p => [...p, selected]);
    setPlayer(h => {
      const nh = h.filter(c => c !== selected);
      if (nh.length === 0) { setMsg("🎉 You Win!"); setPhase("done"); }
      return nh;
    });
    setSelected(null);
  };

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-base font-bold text-theme-primary">⚡ Speed Cards</h2>
          <span className="text-xs text-theme-muted">You:{playerHand.length} CPU:{cpuHand.length}</span>
        </div>

        {phase === "idle" ? (
          <div className="text-center">
            <p className="text-theme-muted text-sm mb-4">Play cards one higher or lower than the pile. First to empty hand wins!</p>
            <button onClick={start} className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-2xl font-bold">Start Game</button>
          </div>
        ) : (
          <>
            {/* CPU hand */}
            <div className="flex gap-1 justify-center mb-4">
              {cpuHand.map((_, i) => <div key={i} className="w-10 h-14 rounded-lg bg-blue-700 border border-blue-500"/>)}
            </div>

            {/* Piles */}
            <div className="flex gap-4 justify-center mb-4">
              {[{ pile: leftPile, set: setLeft }, { pile: rightPile, set: setRight }].map(({ pile, set }, i) => (
                <button key={i} onClick={() => playCard(pile, set)}
                  className="w-16 h-22 flex flex-col items-center justify-center">
                  {pile.length > 0 ? (
                    <div className={`w-14 h-20 rounded-xl border-2 border-gray-300 bg-white flex flex-col items-center justify-center font-black text-sm
                      ${isRed(pile[pile.length-1])?"text-red-500":"text-gray-900"}`}>
                      <span>{pile[pile.length-1].val}</span>
                      <span>{pile[pile.length-1].suit}</span>
                    </div>
                  ) : (
                    <div className="w-14 h-20 rounded-xl border-2 border-dashed border-theme flex items-center justify-center text-theme-muted text-xs">Empty</div>
                  )}
                </button>
              ))}
            </div>

            {msg && <div className="text-center py-2 bg-theme-card rounded-xl border border-theme text-lg font-bold text-theme-primary mb-3">{msg}</div>}

            {/* Player hand */}
            <div className="flex gap-1.5 flex-wrap justify-center">
              {playerHand.map((card, i) => (
                <button key={i} onClick={() => setSelected(selected === card ? null : card)}
                  className={`w-12 h-16 rounded-xl border-2 bg-white flex flex-col items-center justify-center font-black text-sm transition
                    ${isRed(card)?"text-red-500":"text-gray-900"}
                    ${selected === card ? "border-yellow-400 scale-110 ring-2 ring-yellow-400" : "border-gray-300 hover:scale-105"}`}>
                  <span>{card.val}</span><span>{card.suit}</span>
                </button>
              ))}
            </div>

            {phase === "done" && (
              <div className="flex gap-2 justify-center mt-4">
                <button onClick={start} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">Play Again</button>
                <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl text-sm">Exit</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
