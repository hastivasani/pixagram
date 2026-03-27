import { useState, useEffect, useRef } from "react";

export default function AimTrainer({ onGameEnd }) {
  const [targets, setTargets] = useState([]);
  const [score, setScore]     = useState(0);
  const [misses, setMisses]   = useState(0);
  const [timeLeft, setTime]   = useState(30);
  const [started, setStarted] = useState(false);
  const [done, setDone]       = useState(false);
  const areaRef = useRef(null);
  const idRef   = useRef(0);

  useEffect(() => {
    if (!started || done) return;
    const t = setInterval(() => setTime(s => {
      if (s <= 1) { setDone(true); setStarted(false); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [started, done]);

  useEffect(() => {
    if (!started || done) return;
    const spawn = () => {
      const area = areaRef.current;
      if (!area) return;
      const { width, height } = area.getBoundingClientRect();
      const size = Math.random() * 30 + 20;
      const x = Math.random() * (width - size);
      const y = Math.random() * (height - size);
      const id = ++idRef.current;
      setTargets(t => [...t, { id, x, y, size }]);
      // Auto-remove after 2s (miss)
      setTimeout(() => {
        setTargets(t => {
          const exists = t.find(tt => tt.id === id);
          if (exists) setMisses(m => m + 1);
          return t.filter(tt => tt.id !== id);
        });
      }, 2000);
    };
    const interval = setInterval(spawn, 800);
    return () => clearInterval(interval);
  }, [started, done]);

  const hit = (id) => {
    setTargets(t => t.filter(tt => tt.id !== id));
    setScore(s => s + 1);
  };

  const accuracy = score + misses > 0 ? Math.round((score / (score + misses)) * 100) : 0;

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-base font-bold text-theme-primary">🎯 Aim Trainer</h2>
          <span className="text-purple-400 font-bold">{score} hits</span>
        </div>

        {!started && !done ? (
          <div className="text-center">
            <p className="text-theme-muted text-sm mb-4">Click the targets as fast as you can! 30 seconds.</p>
            <button onClick={() => setStarted(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-2xl font-bold">Start!</button>
          </div>
        ) : done ? (
          <div className="text-center bg-theme-card rounded-2xl p-6 border border-theme">
            <p className="text-4xl mb-2">🎯</p>
            <p className="text-xl font-bold text-theme-primary mb-3">Time's Up!</p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-theme-input rounded-xl p-2 text-center">
                <p className="text-xl font-bold text-green-400">{score}</p>
                <p className="text-xs text-theme-muted">Hits</p>
              </div>
              <div className="bg-theme-input rounded-xl p-2 text-center">
                <p className="text-xl font-bold text-red-400">{misses}</p>
                <p className="text-xs text-theme-muted">Misses</p>
              </div>
              <div className="bg-theme-input rounded-xl p-2 text-center">
                <p className="text-xl font-bold text-purple-400">{accuracy}%</p>
                <p className="text-xs text-theme-muted">Accuracy</p>
              </div>
            </div>
            <div className="flex gap-2 justify-center">
              <button onClick={() => { setScore(0); setMisses(0); setTime(30); setTargets([]); setDone(false); setStarted(true); }}
                className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">Play Again</button>
              <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl text-sm">Exit</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between text-xs text-theme-muted mb-2">
              <span>Score: {score} | Misses: {misses}</span>
              <span className={`font-bold ${timeLeft <= 10 ? "text-red-400" : "text-green-400"}`}>⏱ {timeLeft}s</span>
            </div>
            <div ref={areaRef} className="relative bg-theme-card rounded-2xl border border-theme overflow-hidden" style={{ height: 300 }}>
              {targets.map(t => (
                <button key={t.id} onClick={() => hit(t.id)}
                  style={{ position:"absolute", left: t.x, top: t.y, width: t.size, height: t.size, fontSize: t.size * 0.4 }}
                  className="rounded-full bg-red-500 hover:bg-red-400 border-2 border-red-300 transition-transform hover:scale-110 active:scale-90 flex items-center justify-center text-white font-bold">
                  ×
                </button>
              ))}
              {targets.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-theme-muted text-sm">Targets incoming...</div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
