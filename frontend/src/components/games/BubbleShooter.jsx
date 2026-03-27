import { useEffect, useRef, useState } from "react";

const COLS = 8, ROWS = 8, R = 20;
const COLORS = ["#ef4444","#3b82f6","#22c55e","#f59e0b","#a855f7","#ec4899"];

function makeGrid() {
  return Array(5).fill(null).map(() =>
    Array(COLS).fill(null).map(() => COLORS[Math.floor(Math.random() * COLORS.length)])
  );
}

export default function BubbleShooter({ onGameEnd }) {
  const canvasRef = useRef(null);
  const [score, setScore]   = useState(0);
  const [started, setStarted] = useState(false);
  const [done, setDone]     = useState(false);
  const stateRef = useRef({
    grid: makeGrid(),
    current: COLORS[Math.floor(Math.random() * COLORS.length)],
    next: COLORS[Math.floor(Math.random() * COLORS.length)],
    bullet: null,
    score: 0,
  });

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const s = stateRef.current;

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, W, H);

    // Draw grid
    s.grid.forEach((row, ri) => {
      row.forEach((color, ci) => {
        if (!color) return;
        const x = ci * R * 2 + R + (ri % 2 === 1 ? R : 0);
        const y = ri * R * 1.8 + R;
        ctx.beginPath();
        ctx.arc(x, y, R - 2, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    });

    // Draw shooter
    const sx = W / 2, sy = H - R - 10;
    ctx.beginPath();
    ctx.arc(sx, sy, R - 2, 0, Math.PI * 2);
    ctx.fillStyle = s.current;
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw bullet
    if (s.bullet) {
      ctx.beginPath();
      ctx.arc(s.bullet.x, s.bullet.y, R - 2, 0, Math.PI * 2);
      ctx.fillStyle = s.bullet.color;
      ctx.fill();
    }
  };

  useEffect(() => {
    if (!started) return;
    let raf;
    let running = true;
    const s = stateRef.current;

    const loop = () => {
      if (!running) return;
      if (s.bullet) {
        s.bullet.x += s.bullet.vx;
        s.bullet.y += s.bullet.vy;
        const canvas = canvasRef.current;
        if (!canvas) return;
        if (s.bullet.x <= R || s.bullet.x >= canvas.width - R) s.bullet.vx *= -1;
        // Check collision with grid
        let hit = false;
        s.grid.forEach((row, ri) => {
          row.forEach((color, ci) => {
            if (!color) return;
            const x = ci * R * 2 + R + (ri % 2 === 1 ? R : 0);
            const y = ri * R * 1.8 + R;
            const dist = Math.hypot(s.bullet.x - x, s.bullet.y - y);
            if (dist < R * 2) hit = true;
          });
        });
        if (hit || s.bullet.y <= R) {
          // Place bubble
          const ri = Math.max(0, Math.round((s.bullet.y - R) / (R * 1.8)));
          const ci = Math.max(0, Math.min(COLS - 1, Math.round((s.bullet.x - R - (ri % 2 === 1 ? R : 0)) / (R * 2))));
          if (ri < s.grid.length) {
            s.grid[ri][ci] = s.bullet.color;
            const bulletColor = s.bullet.color;
            // Remove matches
            const visited = new Set();
            const flood = (r, c) => {
              const key = `${r},${c}`;
              if (visited.has(key) || r < 0 || r >= s.grid.length || c < 0 || c >= COLS) return;
              if (s.grid[r]?.[c] !== bulletColor) return;
              visited.add(key);
              flood(r-1,c); flood(r+1,c); flood(r,c-1); flood(r,c+1);
            };
            flood(ri, ci);
            if (visited.size >= 3) {
              visited.forEach(key => {
                const [r, c] = key.split(",").map(Number);
                s.grid[r][c] = null;
              });
              s.score += visited.size * 10;
              setScore(s.score);
            }
          }
          s.bullet = null;
          s.current = s.next;
          s.next = COLORS[Math.floor(Math.random() * COLORS.length)];
          // Check win
          if (s.grid.every(row => row.every(c => !c))) { running = false; setDone(true); return; }
        }
      }
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { running = false; cancelAnimationFrame(raf); };
  }, [started]);

  const shoot = (e) => {
    const s = stateRef.current;
    if (s.bullet || !started) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const my = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    const sx = canvas.width / 2, sy = canvas.height - R - 10;
    const angle = Math.atan2(my - sy, mx - sx);
    const speed = 8;
    s.bullet = { x: sx, y: sy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, color: s.current };
  };

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-base font-bold text-theme-primary">🫧 Bubble Shooter</h2>
          <span className="text-purple-400 font-bold">{score} pts</span>
        </div>

        {!started ? (
          <div className="text-center">
            <p className="text-theme-muted text-sm mb-4">Click to aim and shoot bubbles. Match 3+ to pop!</p>
            <button onClick={() => setStarted(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-2xl font-bold">Start!</button>
          </div>
        ) : (
          <>
            <canvas ref={canvasRef} width={320} height={400} onClick={shoot} onTouchStart={shoot}
              className="rounded-xl border border-theme w-full cursor-crosshair"/>
            {done && (
              <div className="mt-3 text-center">
                <p className="text-xl font-bold text-green-400 mb-3">🎉 You cleared the board! Score: {score}</p>
                <div className="flex gap-2 justify-center">
                  <button onClick={() => { stateRef.current = { grid: makeGrid(), current: COLORS[0], next: COLORS[1], bullet: null, score: 0 }; setScore(0); setDone(false); }}
                    className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">Play Again</button>
                  <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl text-sm">Exit</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
