import { useState } from "react";
const WORDS = ["JAVASCRIPT","PYTHON","REACT","GITHUB","KEYBOARD","MONITOR","BROWSER","NETWORK","DATABASE","ALGORITHM"];
const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export default function Hangman({ onGameEnd }) {
  const [word, setWord] = useState(()=>WORDS[Math.floor(Math.random()*WORDS.length)]);
  const [guessed, setGuessed] = useState(new Set());
  const wrong = [...guessed].filter(l=>!word.includes(l));
  const MAX_WRONG = 6;
  const won = word.split("").every(l=>guessed.has(l));
  const lost = wrong.length>=MAX_WRONG;
  const over = won||lost;

  const guess = (l) => { if(over||guessed.has(l)) return; setGuessed(new Set([...guessed,l])); };
  const reset = () => { setWord(WORDS[Math.floor(Math.random()*WORDS.length)]); setGuessed(new Set()); };

  const parts = [
    <line key="head" x1="60" y1="30" x2="60" y2="60" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>,
    <circle key="body" cx="60" cy="20" r="12" fill="none" stroke="currentColor" strokeWidth="3"/>,
    <line key="larm" x1="60" y1="40" x2="40" y2="55" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>,
    <line key="rarm" x1="60" y1="40" x2="80" y2="55" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>,
    <line key="lleg" x1="60" y1="60" x2="40" y2="80" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>,
    <line key="rleg" x1="60" y1="60" x2="80" y2="80" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>,
  ];

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-lg font-bold text-theme-primary">🪢 Hangman</h2>
          <span className="text-red-400 text-sm">{wrong.length}/{MAX_WRONG}</span>
        </div>
        {/* Gallows */}
        <div className="flex justify-center mb-4">
          <svg width="120" height="120" className="text-theme-primary">
            <line x1="10" y1="110" x2="110" y2="110" stroke="currentColor" strokeWidth="3"/>
            <line x1="30" y1="110" x2="30" y2="10" stroke="currentColor" strokeWidth="3"/>
            <line x1="30" y1="10" x2="60" y2="10" stroke="currentColor" strokeWidth="3"/>
            <line x1="60" y1="10" x2="60" y2="8" stroke="currentColor" strokeWidth="3"/>
            {parts.slice(0,wrong.length)}
          </svg>
        </div>
        {/* Word */}
        <div className="flex justify-center gap-2 mb-5 flex-wrap">
          {word.split("").map((l,i)=>(
            <div key={i} className="w-8 h-10 border-b-2 border-theme flex items-end justify-center pb-1">
              <span className={`text-lg font-black ${guessed.has(l)?"text-theme-primary":"text-transparent"}`}>{l}</span>
            </div>
          ))}
        </div>
        {/* Wrong letters */}
        {wrong.length>0&&<p className="text-center text-red-400 text-sm mb-3">Wrong: {wrong.join(", ")}</p>}
        {/* Keyboard */}
        {!over && (
          <div className="flex flex-wrap justify-center gap-1.5">
            {ALPHA.map(l=>(
              <button key={l} onClick={()=>guess(l)} disabled={guessed.has(l)}
                className={`w-9 h-9 rounded-lg text-sm font-bold transition ${
                  guessed.has(l) ? word.includes(l)?"bg-green-600/30 text-green-400":"bg-red-600/20 text-red-400 opacity-50"
                  : "bg-theme-card border border-theme text-theme-primary hover:border-purple-500"
                }`}>{l}</button>
            ))}
          </div>
        )}
        {over&&(
          <div className="text-center mt-4">
            <p className="text-xl font-bold text-theme-primary mb-1">{won?"🎉 You Win!":"😔 Game Over"}</p>
            {lost&&<p className="text-theme-muted text-sm mb-3">Word was: <span className="text-purple-400 font-bold">{word}</span></p>}
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
