import { useState, useCallback } from "react";

function newTarget() { return Math.floor(Math.random() * 100) + 1; }

export default function NumberGuess({ onGameEnd }) {
  const [target,   setTarget]   = useState(newTarget);
  const [guess,    setGuess]    = useState("");
  const [attempts, setAttempts] = useState(0);
  const [hint,     setHint]     = useState("");
  const [won,      setWon]      = useState(false);
  const MAX = 7;

  const submit = () => {
    const n = parseInt(guess);
    if (isNaN(n) || n < 1 || n > 100) return;
    const a = attempts + 1;
    setAttempts(a);
    if (n === target) { setHint("🎉 Correct!"); setWon(true); }
    else if (a >= MAX) { setHint(`😔 It was ${target}`); setWon(true); }
    else setHint(n < target ? "📈 Too low!" : "📉 Too high!");
    setGuess("");
  };

  const reset = useCallback(() => {
    setTarget(newTarget());
    setGuess(""); setAttempts(0); setHint(""); setWon(false);
  }, []);

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-lg font-bold text-theme-primary">🔢 Number Guess</h2>
          <span className="text-purple-400 text-sm">{attempts}/{MAX}</span>
        </div>
        <div className="bg-theme-card rounded-2xl p-6 border border-theme text-center mb-4">
          <p className="text-theme-muted text-sm mb-2">Guess a number between 1–100</p>
          <p className="text-3xl font-black text-theme-primary mb-2">{hint || "🤔"}</p>
          <div className="flex gap-2 mt-4">
            <input value={guess} onChange={e => setGuess(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submit()}
              type="number" min="1" max="100" placeholder="Your guess"
              disabled={won}
              className="flex-1 bg-theme-input text-theme-primary rounded-xl px-4 py-3 text-center text-xl font-bold outline-none border border-theme focus:border-purple-500"/>
            <button onClick={submit} disabled={won || !guess}
              className="bg-purple-600 text-white px-5 rounded-xl font-bold disabled:opacity-50">Go</button>
          </div>
        </div>
        {won && (
          <div className="flex gap-2 justify-center">
            <button onClick={reset} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">Play Again</button>
            <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl text-sm">Exit</button>
          </div>
        )}
      </div>
    </div>
  );
}
