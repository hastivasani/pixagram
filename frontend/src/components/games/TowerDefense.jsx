import { useState, useEffect, useRef } from "react";

const GRID = 8;
const PATH = [[0,0],[0,1],[0,2],[1,2],[2,2],[2,3],[2,4],[3,4],[4,4],[4,5],[4,6],[4,7],[5,7],[6,7],[7,7]];
const PATH_SET = new Set(PATH.map(([r,c]) => `${r},${c}`));

export default function TowerDefense({ onGameEnd }) {
  const [towers, setTowers]   = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [gold, setGold]       = useState(100);
  const [lives, setLives]     = useState(10);
  const [wave, setWave]       = useState(0);
  const [score, setScore]     = useState(0);
  const [phase, setPhase]     = useState("build"); // build|wave|done
  const tickRef = useRef(null);
  const enemyId = useRef(0);

  const startWave = () => {
    const count = 5 + wave * 2;
    const newEnemies = Array(count).fill(null).map((_, i) => ({
      id: ++enemyId.current,
      pathIdx: 0,
      hp: 2 + wave,
      maxHp: 2 + wave,
      delay: i * 8,
    }));
    setEnemies(newEnemies);
    setPhase("wave");
    setWave(w => w + 1);
  };

  const towersRef = useRef(towers);
  useEffect(() => { towersRef.current = towers; }, [towers]);

  useEffect(() => {
    if (phase !== "wave") return;
    tickRef.current = setInterval(() => {
      setEnemies(prev => {
        let newLives = 0;
        const updated = prev.map(e => {
          if (e.delay > 0) return { ...e, delay: e.delay - 1 };
          if (e.pathIdx >= PATH.length - 1) { newLives++; return null; }
          return { ...e, pathIdx: e.pathIdx + 1 };
        }).filter(Boolean);

        if (newLives > 0) setLives(l => {
          const nl = l - newLives;
          if (nl <= 0) setPhase("done");
          return Math.max(0, nl);
        });

        // Tower attacks - use ref to get fresh towers
        const currentTowers = towersRef.current;
        let killed = 0;
        const afterAttack = updated.map(e => {
          if (e.pathIdx >= PATH.length) return null;
          let hp = e.hp;
          const [er, ec] = PATH[e.pathIdx];
          currentTowers.forEach(t => {
            if (Math.abs(t.r - er) <= 1 && Math.abs(t.c - ec) <= 1) hp -= 0.5;
          });
          if (hp <= 0) { killed++; return null; }
          return { ...e, hp };
        }).filter(Boolean);

        if (killed > 0) {
          setGold(g => g + killed * 10);
          setScore(s => s + killed * 10);
        }

        if (afterAttack.length === 0 && prev.length > 0) setPhase("build");
        return afterAttack;
      });
    }, 200);
    return () => clearInterval(tickRef.current);
  }, [phase]);

  const placeTower = (r, c) => {
    if (phase !== "build" || gold < 25) return;
    if (PATH_SET.has(`${r},${c}`)) return;
    if (towers.find(t => t.r === r && t.c === c)) return;
    setTowers(t => [...t, { r, c }]);
    setGold(g => g - 25);
  };

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-base font-bold text-theme-primary">🏰 Tower Defense</h2>
          <span className="text-xs text-theme-muted">Wave {wave}</span>
        </div>

        <div className="flex justify-between text-xs mb-2">
          <span className="text-yellow-400">🪙 {gold}</span>
          <span className="text-red-400">❤️ {lives}</span>
          <span className="text-purple-400">⭐ {score}</span>
        </div>

        {phase === "done" ? (
          <div className="text-center bg-theme-card rounded-2xl p-6 border border-theme">
            <p className="text-4xl mb-2">💀</p>
            <p className="text-xl font-bold text-theme-primary mb-1">Game Over!</p>
            <p className="text-theme-muted mb-4">Survived {wave - 1} waves | Score: {score}</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => { setTowers([]); setEnemies([]); setGold(100); setLives(10); setWave(0); setScore(0); setPhase("build"); }}
                className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">Play Again</button>
              <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl text-sm">Exit</button>
            </div>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="border border-theme rounded-xl overflow-hidden mb-3">
              {Array(GRID).fill(0).map((_, r) => (
                <div key={r} className="flex">
                  {Array(GRID).fill(0).map((_, c) => {
                    const isPath   = PATH_SET.has(`${r},${c}`);
                    const hasTower = towers.find(t => t.r === r && t.c === c);
                    const enemy    = enemies.find(e => PATH[e.pathIdx]?.[0] === r && PATH[e.pathIdx]?.[1] === c);
                    const isStart  = r === 0 && c === 0;
                    const isEnd    = r === 7 && c === 7;
                    return (
                      <button key={c} onClick={() => placeTower(r, c)}
                        className={`flex-1 aspect-square text-xs flex items-center justify-center border border-theme/20 transition
                          ${isPath ? "bg-amber-900/40" : hasTower ? "bg-purple-600/30" : "bg-theme-card hover:bg-theme-hover"}`}>
                        {isStart ? "🚩" : isEnd ? "🏁" : hasTower ? "🗼" : enemy ? (
                          <div className="flex flex-col items-center">
                            <span>👾</span>
                            <div className="w-4 h-0.5 bg-gray-600 rounded">
                              <div className="h-full bg-red-500 rounded" style={{ width: `${(enemy.hp/enemy.maxHp)*100}%` }}/>
                            </div>
                          </div>
                        ) : isPath ? "·" : ""}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              {phase === "build" && (
                <button onClick={startWave} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-bold transition">
                  Start Wave {wave + 1} 👾
                </button>
              )}
              {phase === "wave" && (
                <div className="flex-1 bg-theme-input text-theme-muted py-2.5 rounded-xl text-sm text-center">
                  Wave in progress... ({enemies.length} enemies)
                </div>
              )}
              <div className="bg-theme-card border border-theme px-3 py-2.5 rounded-xl text-xs text-theme-muted text-center">
                Tower: 25🪙<br/>Click empty cell
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
