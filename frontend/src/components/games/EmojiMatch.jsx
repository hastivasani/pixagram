import { useState, useEffect } from "react";

const EMOJI_SETS = [
  ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵"],
  ["🍎","🍊","🍋","🍇","🍓","🫐","🍒","🍑","🥭","🍍","🥝","🍅","🫒","🥑","🍆"],
  ["⚽","🏀","🏈","⚾","🎾","🏐","🏉","🎱","🏓","🏸","🥊","🎯","🎳","🏹","🎣"],
];

function makeCards(count = 8) {
  const set = EMOJI_SETS[Math.floor(Math.random() * EMOJI_SETS.length)];
  const emojis = set.slice(0, count);
  return [...emojis, ...emojis].sort(() => Math.random() - 0.5).map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }));
}

export default function EmojiMatch({ onGameEnd }) {
  const [cards, setCards] = useState(() => makeCards(8));
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves]     = useState(0);
  const [won, setWon]         = useState(false);
  const [lock, setLock]       = useState(false);
  const [timeLeft, setTime]   = useState(60);

  useEffect(() => {
    if (won) return;
    const t = setInterval(() => setTime(s => {
      if (s <= 1) { setWon(true); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [won]);

  useEffect(() => {
    if (flipped.length !== 2) return;
    setLock(true);
    const [a, b] = flipped;
    if (cards[a].emoji === cards[b].emoji) {
      setCards(p => p.map((c, i) => i === a || i === b ? { ...c, matched: true } : c));
      setFlipped([]); setLock(false);
      if (cards.filter(c => !c.matched).length <= 2) setWon(true);
    } else {
      setTimeout(() => {
        setCards(p => p.map((c, i) => i === a || i === b ? { ...c, flipped: false } : c));
        setFlipped([]); setLock(false);
      }, 800);
    }
    setMoves(m => m + 1);
  }, [flipped]);

  const flip = (i) => {
    if (lock || cards[i].flipped || cards[i].matched || flipped.length === 2) return;
    setCards(p => p.map((c, j) => j === i ? { ...c, flipped: true } : c));
    setFlipped(p => [...p, i]);
  };

  const allMatched = cards.every(c => c.matched);

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-base font-bold text-theme-primary">😀 Emoji Match</h2>
          <span className="text-purple-400 font-bold">{moves} moves</span>
        </div>

        <div className="flex justify-between text-xs text-theme-muted mb-3">
          <span>Match all pairs!</span>
          <span className={`font-bold ${timeLeft <= 15 ? "text-red-400" : "text-green-400"}`}>⏱ {timeLeft}s</span>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {cards.map((card, i) => (
            <button key={card.id} onClick={() => flip(i)}
              className={`aspect-square rounded-2xl text-3xl flex items-center justify-center transition-all border-2
                ${card.matched ? "bg-green-500/20 border-green-500" :
                  card.flipped ? "bg-theme-card border-purple-500" :
                  "bg-theme-input border-theme hover:border-purple-400 active:scale-95"
                }`}>
              {(card.flipped || card.matched) ? card.emoji : "❓"}
            </button>
          ))}
        </div>

        {(won || allMatched) && (
          <div className="text-center bg-theme-card rounded-2xl p-4 border border-theme">
            <p className="text-2xl mb-1">{allMatched ? "🎉" : "⏱"}</p>
            <p className="font-bold text-theme-primary mb-1">{allMatched ? `Completed in ${moves} moves!` : "Time's Up!"}</p>
            <div className="flex gap-2 justify-center mt-3">
              <button onClick={() => { setCards(makeCards(8)); setFlipped([]); setMoves(0); setWon(false); setTime(60); }} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">Play Again</button>
              <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl text-sm">Exit</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
