import { useState } from "react";

const CATEGORIES = ["Speed","Power","Intelligence","Agility","Stamina"];
const HEROES = [
  { name:"Superman",    Speed:95, Power:100, Intelligence:85, Agility:80, Stamina:100, emoji:"🦸" },
  { name:"Batman",      Speed:75, Power:70,  Intelligence:100,Agility:90, Stamina:80,  emoji:"🦇" },
  { name:"Flash",       Speed:100,Power:60,  Intelligence:75, Agility:100,Stamina:85,  emoji:"⚡" },
  { name:"Hulk",        Speed:60, Power:100, Intelligence:40, Agility:50, Stamina:100, emoji:"💚" },
  { name:"Iron Man",    Speed:85, Power:90,  Intelligence:100,Agility:75, Stamina:70,  emoji:"🤖" },
  { name:"Thor",        Speed:80, Power:95,  Intelligence:70, Agility:75, Stamina:95,  emoji:"⚡" },
  { name:"Spider-Man",  Speed:85, Power:75,  Intelligence:90, Agility:100,Stamina:80,  emoji:"🕷" },
  { name:"Wonder Woman",Speed:90, Power:90,  Intelligence:85, Agility:90, Stamina:90,  emoji:"⚔️" },
  { name:"Captain America",Speed:80,Power:80,Intelligence:85,Agility:85, Stamina:95,  emoji:"🛡" },
  { name:"Black Panther",Speed:85,Power:80,  Intelligence:90, Agility:95, Stamina:85,  emoji:"🐾" },
  { name:"Doctor Strange",Speed:70,Power:85, Intelligence:100,Agility:70, Stamina:75,  emoji:"🔮" },
  { name:"Aquaman",     Speed:75, Power:90,  Intelligence:75, Agility:80, Stamina:90,  emoji:"🌊" },
];

function shuffle(a) { return [...a].sort(() => Math.random() - 0.5); }

export default function TrumpCards({ onGameEnd }) {
  const [deck] = useState(() => shuffle(HEROES));
  const [playerDeck, setPlayerDeck] = useState(() => shuffle(HEROES).slice(0, 6));
  const [cpuDeck, setCpuDeck]       = useState(() => shuffle(HEROES).slice(0, 6));
  const [playerCard, setPlayerCard] = useState(null);
  const [cpuCard, setCpuCard]       = useState(null);
  const [result, setResult]         = useState("");
  const [phase, setPhase]           = useState("pick"); // pick|reveal|done

  const play = (category) => {
    if (phase !== "pick" || playerDeck.length === 0) return;
    const pc = playerDeck[0];
    const cc = cpuDeck[0];
    setPlayerCard(pc); setCpuCard(cc);
    const pv = pc[category], cv = cc[category];
    let res;
    if (pv > cv) { res = `🎉 You Win! ${pv} vs ${cv}`; setPlayerDeck(d => [...d.slice(1), pc, cc]); setCpuDeck(d => d.slice(1)); }
    else if (cv > pv) { res = `😔 CPU Wins! ${pv} vs ${cv}`; setCpuDeck(d => [...d.slice(1), pc, cc]); setPlayerDeck(d => d.slice(1)); }
    else { res = `🤝 Draw! ${pv} vs ${cv}`; setPlayerDeck(d => d.slice(1)); setCpuDeck(d => d.slice(1)); }
    setResult(res); setPhase("reveal");
  };

  const next = () => {
    if (playerDeck.length === 0 || cpuDeck.length === 0) { setPhase("done"); return; }
    setPlayerCard(null); setCpuCard(null); setResult(""); setPhase("pick");
  };

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-base font-bold text-theme-primary">🃏 Trump Cards</h2>
          <span className="text-xs text-theme-muted">You:{playerDeck.length} CPU:{cpuDeck.length}</span>
        </div>

        {phase === "done" ? (
          <div className="text-center">
            <p className="text-4xl mb-2">{playerDeck.length > cpuDeck.length ? "🏆" : playerDeck.length < cpuDeck.length ? "😔" : "🤝"}</p>
            <p className="text-xl font-bold text-theme-primary mb-4">
              {playerDeck.length > cpuDeck.length ? "You Win!" : playerDeck.length < cpuDeck.length ? "CPU Wins!" : "Draw!"}
            </p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => { setPlayerDeck(shuffle(HEROES).slice(0,6)); setCpuDeck(shuffle(HEROES).slice(0,6)); setPlayerCard(null); setCpuCard(null); setResult(""); setPhase("pick"); }} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">Play Again</button>
              <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl text-sm">Exit</button>
            </div>
          </div>
        ) : (
          <>
            {/* Cards */}
            <div className="flex gap-3 mb-4">
              {/* Player card */}
              <div className="flex-1 bg-theme-card rounded-2xl p-3 border-2 border-purple-500">
                <p className="text-xs text-theme-muted mb-1">Your Card</p>
                {playerDeck[0] && (
                  <>
                    <p className="text-2xl text-center">{playerDeck[0].emoji}</p>
                    <p className="text-sm font-bold text-theme-primary text-center">{playerDeck[0].name}</p>
                    {CATEGORIES.map(cat => (
                      <div key={cat} className="flex justify-between text-xs mt-1">
                        <span className="text-theme-muted">{cat}</span>
                        <span className={`font-bold ${playerCard && playerCard[cat] > (cpuCard?.[cat]||0) ? "text-green-400" : "text-theme-primary"}`}>
                          {playerDeck[0][cat]}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
              {/* CPU card */}
              <div className="flex-1 bg-theme-card rounded-2xl p-3 border border-theme">
                <p className="text-xs text-theme-muted mb-1">CPU Card</p>
                {phase === "reveal" && cpuCard ? (
                  <>
                    <p className="text-2xl text-center">{cpuCard.emoji}</p>
                    <p className="text-sm font-bold text-theme-primary text-center">{cpuCard.name}</p>
                    {CATEGORIES.map(cat => (
                      <div key={cat} className="flex justify-between text-xs mt-1">
                        <span className="text-theme-muted">{cat}</span>
                        <span className={`font-bold ${cpuCard[cat] > (playerCard?.[cat]||0) ? "text-red-400" : "text-theme-primary"}`}>
                          {cpuCard[cat]}
                        </span>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-32 text-4xl">🂠</div>
                )}
              </div>
            </div>

            {result && <div className="text-center py-2 bg-theme-input rounded-xl text-sm font-bold text-theme-primary mb-3">{result}</div>}

            {phase === "pick" ? (
              <div>
                <p className="text-xs text-theme-muted text-center mb-2">Pick a category to battle:</p>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => play(cat)}
                      className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl text-xs font-bold transition">
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button onClick={next} className="w-full bg-theme-input hover:bg-theme-hover text-theme-primary py-2.5 rounded-xl text-sm font-semibold transition">
                Next Round →
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
