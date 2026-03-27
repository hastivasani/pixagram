import { useState, useEffect } from "react";

const WORDS = [
  "JAVASCRIPT","PYTHON","REACT","FLUTTER","ANDROID","KEYBOARD","MONITOR","LAPTOP","INTERNET","BROWSER",
  "ALGORITHM","DATABASE","NETWORK","SECURITY","FRONTEND","BACKEND","FULLSTACK","DEVELOPER","PROGRAMMING","COMPUTER",
  "ELEPHANT","GIRAFFE","DOLPHIN","PENGUIN","CHEETAH","BUTTERFLY","CROCODILE","KANGAROO","FLAMINGO","OCTOPUS",
  "MOUNTAIN","VOLCANO","GLACIER","TORNADO","TSUNAMI","RAINBOW","THUNDER","LIGHTNING","HURRICANE","EARTHQUAKE",
];

function scramble(word) {
  let s = word.split("").sort(() => Math.random() - 0.5).join("");
  while (s === word) s = word.split("").sort(() => Math.random() - 0.5).join("");
  return s;
}

export default function WordScramble({ onGameEnd }) {
  const [wordList]  = useState(() => [...WORDS].sort(() => Math.random() - 0.5).slice(0, 10));
  const [idx, setIdx]       = useState(0);
  const [scrambled, setScrambled] = useState("");
  const [input, setInput]   = useState("");
  const [score, setScore]   = useState(0);
  const [hint, setHint]     = useState("");
  const [done, setDone]     = useState(false);
  const [timeLeft, setTime] = useState(30);

  useEffect(() => {
    if (idx < wordList.length) setScrambled(scramble(wordList[idx]));
  }, [idx, wordList]);

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => {
      setTime(s => {
        if (s <= 1) { nextWord(false); return 30; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [done, idx]);

  const nextWord = (correct) => {
    if (correct) setScore(s => s + 1);
    setInput(""); setHint("");
    if (idx + 1 >= wordList.length) { setDone(true); return; }
    setIdx(i => i + 1); setTime(30);
  };

  const submit = () => {
    if (input.toUpperCase() === wordList[idx]) { setHint("✅ Correct!"); setTimeout(() => nextWord(true), 600); }
    else setHint("❌ Try again!");
  };

  const skip = () => { setHint(`Answer: ${wordList[idx]}`); setTimeout(() => nextWord(false), 1200); };

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-base font-bold text-theme-primary">🔤 Word Scramble</h2>
          <span className="text-purple-400 font-bold">{score}/{wordList.length}</span>
        </div>

        {done ? (
          <div className="text-center bg-theme-card rounded-2xl p-6 border border-theme">
            <p className="text-4xl mb-2">🎉</p>
            <p className="text-xl font-bold text-theme-primary mb-1">Game Over!</p>
            <p className="text-theme-muted mb-4">Score: {score}/{wordList.length}</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => { setIdx(0); setScore(0); setInput(""); setHint(""); setDone(false); setTime(30); }} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">Play Again</button>
              <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl text-sm">Exit</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between text-xs text-theme-muted mb-3">
              <span>Word {idx + 1}/{wordList.length}</span>
              <span className={`font-bold ${timeLeft <= 10 ? "text-red-400" : "text-green-400"}`}>⏱ {timeLeft}s</span>
            </div>
            <div className="bg-theme-card rounded-2xl p-6 border border-theme text-center mb-4">
              <p className="text-xs text-theme-muted mb-2">Unscramble this word:</p>
              <p className="text-4xl font-black text-purple-400 tracking-widest mb-2">{scrambled}</p>
              {hint && <p className={`text-sm font-bold ${hint.startsWith("✅")?"text-green-400":hint.startsWith("❌")?"text-red-400":"text-yellow-400"}`}>{hint}</p>}
            </div>
            <div className="flex gap-2 mb-3">
              <input value={input} onChange={e => setInput(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === "Enter" && submit()}
                placeholder="Type your answer..."
                className="flex-1 bg-theme-input text-theme-primary rounded-xl px-4 py-3 outline-none border border-theme focus:border-purple-500 font-bold tracking-widest uppercase"/>
              <button onClick={submit} className="bg-purple-600 text-white px-4 rounded-xl font-bold">Go</button>
            </div>
            <button onClick={skip} className="w-full bg-theme-input text-theme-muted py-2 rounded-xl text-sm hover:bg-theme-hover transition">Skip →</button>
          </>
        )}
      </div>
    </div>
  );
}
