import { useEffect, useRef, useState } from "react";

const W = 320, H = 200, PAD_H = 50, PAD_W = 8, BALL_R = 6, SPEED = 3;

export default function PingPong({ onGameEnd }) {
  const canvasRef = useRef(null);
  const state     = useRef({
    ball: { x: W/2, y: H/2, vx: SPEED, vy: SPEED },
    p1: H/2 - PAD_H/2,
    p2: H/2 - PAD_H/2,
    score: { p1: 0, p2: 0 },
    running: false,
  });
  const [score, setScore] = useState({ p1: 0, p2: 0 });
  const [started, setStarted] = useState(false);
  const [winner, setWinner] = useState("");
  const keysRef = useRef({});

  useEffect(() => {
    const onKey = e => { keysRef.current[e.key] = e.type === "keydown"; };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("keyup", onKey); };
  }, []);

  useEffect(() => {
    if (!started) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;

    const loop = () => {
      const s = state.current;
      if (!s.running) return;

      // Move paddles
      if (keysRef.current["w"] || keysRef.current["W"]) s.p1 = Math.max(0, s.p1 - 4);
      if (keysRef.current["s"] || keysRef.current["S"]) s.p1 = Math.min(H - PAD_H, s.p1 + 4);
      // CPU for p2
      const center = s.p2 + PAD_H / 2;
      if (center < s.ball.y - 5) s.p2 = Math.min(H - PAD_H, s.p2 + 3);
      if (center > s.ball.y + 5) s.p2 = Math.max(0, s.p2 - 3);

      // Move ball
      s.ball.x += s.ball.vx;
      s.ball.y += s.ball.vy;

      // Wall bounce
      if (s.ball.y <= BALL_R || s.ball.y >= H - BALL_R) s.ball.vy *= -1;

      // Paddle collision
      if (s.ball.x <= PAD_W + BALL_R + 10 && s.ball.y >= s.p1 && s.ball.y <= s.p1 + PAD_H) {
        s.ball.vx = Math.abs(s.ball.vx) + 0.1;
        s.ball.vy += (s.ball.y - (s.p1 + PAD_H/2)) * 0.1;
      }
      if (s.ball.x >= W - PAD_W - BALL_R - 10 && s.ball.y >= s.p2 && s.ball.y <= s.p2 + PAD_H) {
        s.ball.vx = -(Math.abs(s.ball.vx) + 0.1);
        s.ball.vy += (s.ball.y - (s.p2 + PAD_H/2)) * 0.1;
      }

      // Score
      if (s.ball.x < 0) {
        s.score.p2++; setScore({ ...s.score });
        if (s.score.p2 >= 7) { s.running = false; setWinner("🤖 CPU Wins!"); return; }
        s.ball = { x: W/2, y: H/2, vx: -SPEED, vy: SPEED };
      }
      if (s.ball.x > W) {
        s.score.p1++; setScore({ ...s.score });
        if (s.score.p1 >= 7) { s.running = false; setWinner("🎉 You Win!"); return; }
        s.ball = { x: W/2, y: H/2, vx: SPEED, vy: SPEED };
      }

      // Draw
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, W, H);
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.beginPath(); ctx.moveTo(W/2, 0); ctx.lineTo(W/2, H); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#a855f7";
      ctx.fillRect(10, s.p1, PAD_W, PAD_H);
      ctx.fillRect(W - 10 - PAD_W, s.p2, PAD_W, PAD_H);
      ctx.fillStyle = "white";
      ctx.beginPath(); ctx.arc(s.ball.x, s.ball.y, BALL_R, 0, Math.PI*2); ctx.fill();

      raf = requestAnimationFrame(loop);
    };

    state.current.running = true;
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); state.current.running = false; };
  }, [started]);

  const reset = () => {
    state.current = { ball: { x: W/2, y: H/2, vx: SPEED, vy: SPEED }, p1: H/2-PAD_H/2, p2: H/2-PAD_H/2, score: { p1:0, p2:0 }, running: false };
    setScore({ p1: 0, p2: 0 }); setWinner(""); setStarted(false);
  };

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-base font-bold text-theme-primary">🏓 Ping Pong</h2>
          <span className="text-purple-400 font-bold">{score.p1} : {score.p2}</span>
        </div>

        <canvas ref={canvasRef} width={W} height={H} className="rounded-xl border border-theme w-full"/>

        <p className="text-xs text-theme-muted text-center mt-2">Use W/S keys to move your paddle (left side)</p>

        {!started && !winner && (
          <button onClick={() => setStarted(true)} className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold transition">
            Start Game 🏓
          </button>
        )}

        {winner && (
          <div className="mt-3 text-center">
            <p className="text-xl font-bold text-theme-primary mb-3">{winner}</p>
            <div className="flex gap-2 justify-center">
              <button onClick={reset} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">Play Again</button>
              <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl text-sm">Exit</button>
            </div>
          </div>
        )}

        {/* Mobile controls */}
        <div className="flex gap-2 mt-3">
          <button onPointerDown={() => { keysRef.current["w"] = true; }} onPointerUp={() => { keysRef.current["w"] = false; }}
            className="flex-1 bg-theme-input text-theme-primary py-3 rounded-xl font-bold text-lg active:bg-theme-hover">▲</button>
          <button onPointerDown={() => { keysRef.current["s"] = true; }} onPointerUp={() => { keysRef.current["s"] = false; }}
            className="flex-1 bg-theme-input text-theme-primary py-3 rounded-xl font-bold text-lg active:bg-theme-hover">▼</button>
        </div>
      </div>
    </div>
  );
}
