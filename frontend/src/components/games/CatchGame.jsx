import { useEffect, useRef, useState } from "react";

const W = 320, H = 300, BASKET_W = 60, BASKET_H = 20;

export default function CatchGame({ onGameEnd }) {
  const canvasRef = useRef(null);
  const [score, setScore]   = useState(0);
  const [lives, setLives]   = useState(3);
  const [started, setStarted] = useState(false);
  const [done, setDone]     = useState(false);
  const stateRef = useRef({
    basket: W / 2 - BASKET_W / 2,
    items: [],
    frame: 0,
    score: 0,
    lives: 3,
    running: false,
  });
  const mouseRef = useRef(W / 2);

  useEffect(() => {
    const onMove = e => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
      mouseRef.current = x;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("touchmove", onMove); };
  }, []);

  useEffect(() => {
    if (!started) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const s = stateRef.current;
    s.running = true;
    let raf;

    const loop = () => {
      if (!s.running) return;
      s.frame++;

      // Move basket
      s.basket = Math.max(0, Math.min(W - BASKET_W, mouseRef.current - BASKET_W / 2));

      // Spawn items
      if (s.frame % Math.max(20, 50 - Math.floor(s.score / 50)) === 0) {
        const good = Math.random() > 0.3;
        s.items.push({ x: Math.random() * (W - 20) + 10, y: 0, speed: 2 + Math.random() * 2, good, emoji: good ? ["🍎","🍊","🍋","⭐","💎"][Math.floor(Math.random()*5)] : ["💣","☠️","🔥"][Math.floor(Math.random()*3)] });
      }

      // Move items
      s.items = s.items.map(i => ({ ...i, y: i.y + i.speed }));

      // Check catches
      const basketY = H - BASKET_H - 10;
      s.items = s.items.filter(item => {
        if (item.y > basketY && item.y < basketY + BASKET_H && item.x > s.basket && item.x < s.basket + BASKET_W) {
          if (item.good) { s.score += 10; setScore(s.score); }
          else { s.lives--; setLives(s.lives); if (s.lives <= 0) { s.running = false; setDone(true); } }
          return false;
        }
        if (item.y > H) {
          if (item.good) { s.lives--; setLives(s.lives); if (s.lives <= 0) { s.running = false; setDone(true); } }
          return false;
        }
        return true;
      });

      // Draw
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, W, H);
      // Items
      ctx.font = "20px serif";
      s.items.forEach(i => ctx.fillText(i.emoji, i.x - 10, i.y));
      // Basket
      ctx.fillStyle = "#a855f7";
      ctx.fillRect(s.basket, basketY, BASKET_W, BASKET_H);
      ctx.fillStyle = "#c084fc";
      ctx.fillRect(s.basket + 5, basketY + 5, BASKET_W - 10, 5);
      // HUD
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = "12px monospace";
      ctx.fillText(`Score: ${s.score}`, 10, 20);
      ctx.fillText(`Lives: ${"❤️".repeat(s.lives)}`, 10, 36);

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); s.running = false; };
  }, [started]);

  const reset = () => {
    stateRef.current = { basket: W/2-BASKET_W/2, items: [], frame: 0, score: 0, lives: 3, running: false };
    setScore(0); setLives(3); setDone(false); setStarted(false);
    setTimeout(() => setStarted(true), 100);
  };

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-base font-bold text-theme-primary">🧺 Catch Game</h2>
          <span className="text-purple-400 font-bold">{score} pts</span>
        </div>

        <canvas ref={canvasRef} width={W} height={H} className="rounded-xl border border-theme w-full cursor-none"/>
        <p className="text-xs text-theme-muted text-center mt-1">Move mouse/finger to catch fruits, avoid bombs!</p>

        {!started && !done && (
          <button onClick={() => setStarted(true)} className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold">Start!</button>
        )}
        {done && (
          <div className="mt-3 text-center">
            <p className="text-lg font-bold text-theme-primary mb-3">Game Over! Score: {score}</p>
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
