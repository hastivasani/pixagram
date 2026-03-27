import { useState, useEffect } from "react";

const WORDS = ["REACT","SNAKE","PIXEL","CLOUD","BRAIN","FLAME","STORM","MAGIC","SWIFT","BLOOM",
               "CRANE","FROST","GLOBE","HEART","JUICE","KNIFE","LIGHT","MONEY","NIGHT","OCEAN"];
const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function pickWord() { return WORDS[Math.floor(Math.random()*WORDS.length)]; }

export default function WordGuess({ onGameEnd }) {
  const [word,    setWord]    = useState(pickWord);
  const [guesses, setGuesses] = useState([]);   // array of 5-char strings
  const [current, setCurrent] = useState("");
  const [won,     setWon]     = useState(false);
  const [lost,    setLost]    = useState(false);
  const MAX = 6;

  useEffect(() => {
    const onKey = (e) => {
      if (won||lost) return;
      const k = e.key.toUpperCase();
      if (k==="ENTER") submit();
      else if (k==="BACKSPACE") setCurrent(c=>c.slice(0,-1));
      else if (/^[A-Z]$/.test(k) && current.length<5) setCurrent(c=>c+k);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, won, lost]);

  const submit = () => {
    if (current.length!==5) return;
    const next = [...guesses, current];
    setGuesses(next);
    if (current===word) setWon(true);
    else if (next.length>=MAX) setLost(true);
    setCurrent("");
  };

  const tileColor = (g, i) => {
    if (g[i]===word[i]) return "bg-green-600 border-green-600 text-white";
    if (word.includes(g[i])) return "bg-yellow-500 border-yellow-500 text-white";
    return "bg-gray-700 border-gray-700 text-white";
  };

  const keyColor = (k) => {
    let best = "bg-theme-card border-theme text-theme-primary";
    for (const g of guesses) {
      for (let i=0;i<5;i++) {
        if (g[i]!==k) continue;
        if (word[i]===k) return "bg-green-600 text-white border-green-600";
        if (word.includes(k)) best = "bg-yellow-500 text-white border-yellow-500";
        else if (best==="bg-theme-card border-theme text-theme-primary") best="bg-gray-700 text-white border-gray-700";
      }
    }
    return best;
  };

  const reset = () => { setWord(pickWord()); setGuesses([]); setCurrent(""); setWon(false); setLost(false); };

  const rows = [...guesses, ...(won||lost?[]:[current]), ...Array(Math.max(0,MAX-guesses.length-(won||lost?0:1))).fill("")];

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-lg font-bold text-theme-primary">📝 Word Guess</h2>
          <span className="text-purple-400 text-sm">{guesses.length}/{MAX}</span>
        </div>

        {/* Grid */}
        <div className="flex flex-col gap-1.5 mb-4">
          {rows.slice(0,MAX).map((g,ri) => (
            <div key={ri} className="flex gap-1.5 justify-center">
              {Array(5).fill(0).map((_,ci) => (
                <div key={ci} className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center text-lg font-black uppercase transition-all ${
                  ri < guesses.length ? tileColor(g,ci)
                  : ri===guesses.length && !won && !lost ? "border-purple-500 bg-theme-card text-theme-primary"
                  : "border-theme bg-theme-card text-theme-primary"
                }`}>
                  {g[ci]||""}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Result */}
        {(won||lost) && (
          <div className="bg-theme-card rounded-2xl p-4 border border-theme text-center mb-4">
            <p className="text-2xl mb-1">{won?"🎉":"😔"}</p>
            <p className="font-bold text-theme-primary">{won?"You got it!":"The word was: "+word}</p>
            <div className="flex gap-2 justify-center mt-3">
              <button onClick={reset} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">New Word</button>
              <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl text-sm">Exit</button>
            </div>
          </div>
        )}

        {/* Keyboard */}
        <div className="space-y-1.5">
          {["QWERTYUIOP","ASDFGHJKL","ZXCVBNM"].map((row,ri) => (
            <div key={ri} className="flex justify-center gap-1">
              {ri===2 && <button onClick={submit} className="bg-theme-input text-theme-primary px-2 py-3 rounded-lg text-xs font-bold border border-theme">Enter</button>}
              {row.split("").map(k=>(
                <button key={k} onClick={()=>!won&&!lost&&current.length<5&&setCurrent(c=>c+k)}
                  className={`w-8 h-10 rounded-lg text-xs font-bold border transition ${keyColor(k)}`}>{k}</button>
              ))}
              {ri===2 && <button onClick={()=>setCurrent(c=>c.slice(0,-1))} className="bg-theme-input text-theme-primary px-2 py-3 rounded-lg text-xs font-bold border border-theme">⌫</button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
