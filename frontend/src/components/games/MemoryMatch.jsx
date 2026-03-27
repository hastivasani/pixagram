import { useState, useEffect } from "react";

const EMOJIS = ["🍎","🍊","🍋","🍇","🍓","🍒","🥝","🍑"];
function shuffle(arr) { return [...arr].sort(() => Math.random()-0.5); }
function makeCards() { return shuffle([...EMOJIS,...EMOJIS]).map((e,i)=>({id:i,emoji:e,flipped:false,matched:false})); }

export default function MemoryMatch({ onGameEnd }) {
  const [cards,   setCards]   = useState(makeCards());
  const [flipped, setFlipped] = useState([]);
  const [moves,   setMoves]   = useState(0);
  const [won,     setWon]     = useState(false);
  const [lock,    setLock]    = useState(false);

  useEffect(() => {
    if (flipped.length !== 2) return;
    setLock(true);
    const [a,b] = flipped;
    if (cards[a].emoji === cards[b].emoji) {
      setCards(prev => prev.map((c,i) => i===a||i===b ? {...c,matched:true} : c));
      setFlipped([]);
      setLock(false);
    } else {
      setTimeout(() => {
        setCards(prev => prev.map((c,i) => i===a||i===b ? {...c,flipped:false} : c));
        setFlipped([]);
        setLock(false);
      }, 900);
    }
    setMoves(m => m+1);
  }, [flipped]);

  useEffect(() => {
    if (cards.every(c => c.matched)) setWon(true);
  }, [cards]);

  const flip = (i) => {
    if (lock || cards[i].flipped || cards[i].matched || flipped.length===2) return;
    setCards(prev => prev.map((c,j) => j===i ? {...c,flipped:true} : c));
    setFlipped(prev => [...prev, i]);
  };

  const reset = () => { setCards(makeCards()); setFlipped([]); setMoves(0); setWon(false); setLock(false); };

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-lg font-bold text-theme-primary">🃏 Memory Match</h2>
          <span className="text-purple-400 font-bold">{moves} moves</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {cards.map((c,i) => (
            <button key={c.id} onClick={()=>flip(i)}
              className={`aspect-square rounded-xl text-2xl flex items-center justify-center border-2 transition-all duration-200 ${
                c.flipped||c.matched
                  ? c.matched ? "bg-green-500/20 border-green-500" : "bg-purple-500/20 border-purple-500"
                  : "bg-theme-card border-theme hover:border-purple-400"
              }`}>
              {(c.flipped||c.matched) ? c.emoji : "❓"}
            </button>
          ))}
        </div>

        {won && (
          <div className="mt-5 bg-theme-card rounded-2xl p-5 border border-theme text-center">
            <div className="text-4xl mb-2">🎉</div>
            <p className="font-bold text-theme-primary mb-1">You Won!</p>
            <p className="text-theme-muted text-sm mb-4">Completed in {moves} moves</p>
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
