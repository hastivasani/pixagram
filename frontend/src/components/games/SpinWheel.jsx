import { useState, useRef, useEffect } from "react";

const SEGMENTS = [
  { label: "100 pts", color: "#ef4444", pts: 100 },
  { label: "50 pts",  color: "#f59e0b", pts: 50  },
  { label: "200 pts", color: "#22c55e", pts: 200  },
  { label: "0 pts",   color: "#6b7280", pts: 0   },
  { label: "150 pts", color: "#3b82f6", pts: 150  },
  { label: "JACKPOT", color: "#a855f7", pts: 500  },
  { label: "25 pts",  color: "#ec4899", pts: 25   },
  { label: "75 pts",  color: "#14b8a6", pts: 75   },
];

const N = SEGMENTS.length;
const SLICE = (2 * Math.PI) / N;

export default function SpinWheel({ onGameEnd }) {
  const canvasRef = useRef(null);
  const [angle, setAngle]   = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [total, setTotal]   = useState(0);
  const [spins, setSpins]   = useState(0);
  const angleRef = useRef(0);

  const draw = (a) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cx = canvas.width / 2, cy = canvas.height / 2, r = cx - 10;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    SEGMENTS.forEach((seg, i) => {
      const start = a + i * SLICE - Math.PI / 2;
      const end   = start + SLICE;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + SLICE / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "white";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(seg.label, r - 8, 4);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.fillStyle = "#1e293b";
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Pointer
    ctx.beginPath();
    ctx.moveTo(cx + r + 5, cy);
    ctx.lineTo(cx + r - 15, cy - 10);
    ctx.lineTo(cx + r - 15, cy + 10);
    ctx.closePath();
    ctx.fillStyle = "#fbbf24";
    ctx.fill();
  };

  useEffect(() => { draw(0); }, []);

  const spin = () => {
    if (spinning) return;
    setSpinning(true); setResult(null);
    const extra = Math.random() * Math.PI * 2;
    const totalRot = Math.PI * 2 * (5 + Math.floor(Math.random() * 5)) + extra;
    const duration = 3000;
    const start = performance.now();
    const startAngle = angleRef.current;

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startAngle + totalRot * ease;
      angleRef.current = current;
      draw(current);

      if (progress < 1) { requestAnimationFrame(animate); return; }

      // Find result
      const normalized = ((current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const idx = Math.floor(((Math.PI * 2 - normalized) / SLICE + 0.5) % N);
      const seg = SEGMENTS[idx % N];
      setResult(seg);
      setTotal(t => t + seg.pts);
      setSpins(s => s + 1);
      setSpinning(false);
    };
    requestAnimationFrame(animate);
  };

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-base font-bold text-theme-primary">🎡 Spin Wheel</h2>
          <span className="text-yellow-400 font-bold">{total} pts</span>
        </div>

        <canvas ref={canvasRef} width={280} height={280} className="w-full rounded-full border-4 border-theme mb-4"/>

        {result && (
          <div className={`text-center py-3 rounded-xl mb-3 font-bold text-lg ${result.pts >= 200 ? "bg-yellow-500/20 text-yellow-400" : result.pts === 0 ? "bg-gray-500/20 text-gray-400" : "bg-purple-500/20 text-purple-400"}`}>
            {result.pts === 500 ? "🎉 JACKPOT! " : ""}{result.label}
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={spin} disabled={spinning}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold disabled:opacity-50 transition">
            {spinning ? "Spinning..." : "Spin! 🎡"}
          </button>
          {spins > 0 && (
            <div className="bg-theme-card border border-theme px-3 py-3 rounded-xl text-center">
              <p className="text-xs text-theme-muted">Spins</p>
              <p className="font-bold text-theme-primary">{spins}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
