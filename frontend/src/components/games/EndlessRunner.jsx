import { useEffect, useRef, useState } from "react";

const W = 320, H = 160, GROUND = 120, PLAYER_W = 24, PLAYER_H = 32;

export default function EndlessRunner({ onGameEnd }) {
  const canvasRef = useRef(null);
  const [score, setScore]   = useState(0);
  const [best, setBest]     = useState(0);
  const [started, setStarted] = useState(false);
  const [dead, setDead]     = useState(false);
  const stateRef = useRef({
    player: { x: 50, y: GROUND - PLAYER_H, vy: 0, jumping: false },
    obstacles: [],
    speed: 3,
    frame: 0,
    score: 0,
    running: false,
  });

  const jump = () => {
    const s = stateRef.current;
    if (!s.player.jumping && s.running) {
      s.player.vy = -10;
      s.player.jumping = true;
    }
  };

  useEffect(() => {
    const onKey = e => { if (e.code === "Space" || e.code === "ArrowUp") { e.preventDefault(); jump(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
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
      s.score++;
      if (s.frame % 60 === 0) setScore(Math.floor(s.score / 10));
      s.speed = 3 + Math.floor(s.score / 500) * 0.5;

      // Player physics
      s.player.vy += 0.6;
      s.player.y += s.player.vy;
      if (s.player.y >= GROUND - PLAYER_H) {
        s.player.y = GROUND - PLAYER_H;
        s.player.vy = 0;
        s.player.jumping = false;
      }

      // Spawn obstacles
      if (s.frame % Math.max(40, 80 - Math.floor(s.score / 200)) === 0) {
        const h = 20 + Math.random() * 30;
        s.obstacles.push({ x: W, y: GROUND - h, w: 15, h });
      }

      // Move obstacles
      s.obstacles = s.obstacles.map(o => ({ ...o, x: o.x - s.speed })).filter(o => o.x > -50);

      // Collision
      const p = s.player;
      for (const o of s.obstacles) {
        if (p.x + PLAYER_W - 4 > o.x + 2 && p.x + 4 < o.x + o.w - 2 && p.y + PLAYER_H - 4 > o.y) {
          s.running = false;
          setBest(b => Math.max(b, Math.floor(s.score / 10)));
          setDead(true);
          return;
        }
      }

      // Draw
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, W, H);
      // Ground
      ctx.fillStyle = "#334155";
      ctx.fillRect(0, GROUND, W, H - GROUND);
      // Player
      ctx.fillStyle = "#a855f7";
      ctx.fillRect(p.x, p.y, PLAYER_W, PLAYER_H);
      ctx.fillStyle = "#c084fc";
      ctx.fillRect(p.x + 4, p.y + 4, 8, 8); // eye
      // Obstacles
      ctx.fillStyle = "#ef4444";
      s.obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.w, o.h));
      // Score
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "12px monospace";
      ctx.fillText(`Score: ${Math.floor(s.score / 10)}`, 10, 20);

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); s.running = false; };
  }, [started]);

  const restart = () => {
    stateRef.current = { player: { x: 50, y: GROUND - PLAYER_H, vy: 0, jumping: false }, obstacles: [], speed: 3, frame: 0, score: 0, running: false };
    setScore(0); setDead(false); setStarted(false);
    setTimeout(() => setStarted(true), 100);
  };

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-base font-bold text-theme-primary">🏃 Endless Runner</h2>
          <span className="text-purple-400 font-bold">Best: {best}</span>
        </div>

        <canvas ref={canvasRef} width={W} height={H} onClick={jump} onTouchStart={jump}
          className="rounded-xl border border-theme w-full cursor-pointer"/>

        <p className="text-xs text-theme-muted text-center mt-1">Press Space / Tap to jump over obstacles</p>

        {!started && !dead && (
          <button onClick={() => setStarted(true)} className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold">Start Running 🏃</button>
        )}

        {dead && (
          <div className="mt-3 text-center">
            <p className="text-lg font-bold text-theme-primary mb-1">💀 Score: {score}</p>
            <div className="flex gap-2 justify-center">
              <button onClick={restart} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">Try Again</button>
              <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl text-sm">Exit</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
