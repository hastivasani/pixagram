import { useState, useEffect, useRef } from "react";
const TEXTS = [
  "The quick brown fox jumps over the lazy dog.",
  "React is a JavaScript library for building user interfaces.",
  "Practice makes perfect when it comes to typing speed.",
  "The sun sets in the west and rises in the east every day.",
];
export default function TypingSpeed({ onGameEnd }) {
  const [text] = useState(()=>TEXTS[Math.floor(Math.random()*TEXTS.length)]);
  const [typed, setTyped] = useState("");
  const [started, setStarted] = useState(false);
  const [time, setTime] = useState(0);
  const [done, setDone] = useState(false);
  const ref = useRef(null);
  const timerRef = useRef(null);

  useEffect(()=>{
    if(started&&!done){
      timerRef.current=setInterval(()=>setTime(t=>t+1),1000);
      return ()=>clearInterval(timerRef.current);
    }
  },[started,done]);

  const handleChange = (e) => {
    const val = e.target.value;
    if(!started){setStarted(true);}
    setTyped(val);
    if(val===text){clearInterval(timerRef.current);setDone(true);}
  };

  const wpm = done&&time>0 ? Math.round((text.split(" ").length/(time/60))) : 0;
  const accuracy = typed.length>0 ? Math.round((typed.split("").filter((c,i)=>c===text[i]).length/typed.length)*100) : 100;

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-lg font-bold text-theme-primary">⌨️ Typing Speed</h2>
          <span className="text-purple-400 font-mono">{time}s</span>
        </div>
        <div className="bg-theme-card rounded-2xl p-5 border border-theme mb-4">
          <p className="text-theme-primary text-base leading-relaxed font-mono">
            {text.split("").map((c,i)=>{
              let cls="";
              if(i<typed.length) cls=typed[i]===c?"text-green-400":"text-red-400 bg-red-500/20";
              else if(i===typed.length) cls="border-b-2 border-purple-400";
              return <span key={i} className={cls}>{c}</span>;
            })}
          </p>
        </div>
        {!done ? (
          <textarea value={typed} onChange={handleChange} ref={ref}
            placeholder="Start typing here..."
            className="w-full bg-theme-input text-theme-primary rounded-xl px-4 py-3 outline-none border border-theme focus:border-purple-500 resize-none font-mono"
            rows={3}/>
        ) : (
          <div className="bg-theme-card rounded-2xl p-5 border border-theme text-center">
            <p className="text-3xl mb-2">🏆</p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div><p className="text-2xl font-black text-purple-400">{wpm}</p><p className="text-xs text-theme-muted">WPM</p></div>
              <div><p className="text-2xl font-black text-green-400">{accuracy}%</p><p className="text-xs text-theme-muted">Accuracy</p></div>
              <div><p className="text-2xl font-black text-blue-400">{time}s</p><p className="text-xs text-theme-muted">Time</p></div>
            </div>
            <div className="flex gap-2 justify-center">
              <button onClick={()=>{setTyped("");setStarted(false);setTime(0);setDone(false);}} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">Try Again</button>
              <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl text-sm">Exit</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
