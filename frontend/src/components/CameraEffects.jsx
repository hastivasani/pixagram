import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

/* ─────────────────────────────────────────────────────────────
   AR Effects drawn on a canvas overlay using FaceDetector API
   (Chrome 74+) with canvas-based fallback overlays.
   Each effect is a function: drawEffect(ctx, faces, W, H, t)
───────────────────────────────────────────────────────────── */

const TAU = Math.PI * 2;

/* ── Helper: draw emoji at position ── */
function emoji(ctx, em, x, y, size) {
  ctx.font = `${size}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(em, x, y);
}

/* ── Effect definitions ── */
const EFFECTS = [
  { id: "none",       name: "None",       icon: "⊘" },

  // Dog ears + nose
  {
    id: "dog",
    name: "Dog",
    icon: "🐶",
    draw(ctx, faces, W, H, t) {
      faces.forEach(({ boundingBox: b }) => {
        const cx = b.x + b.width / 2;
        const ey = b.y + b.height * 0.18;
        const es = b.width * 0.38;
        // ears
        ctx.fillStyle = "#c8a26b";
        ctx.beginPath(); ctx.ellipse(cx - b.width * 0.42, ey - es * 0.3, es * 0.38, es * 0.55, -0.4, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx + b.width * 0.42, ey - es * 0.3, es * 0.38, es * 0.55, 0.4, 0, TAU); ctx.fill();
        // inner ears
        ctx.fillStyle = "#e8b4a0";
        ctx.beginPath(); ctx.ellipse(cx - b.width * 0.42, ey - es * 0.3, es * 0.2, es * 0.35, -0.4, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx + b.width * 0.42, ey - es * 0.3, es * 0.2, es * 0.35, 0.4, 0, TAU); ctx.fill();
        // nose
        const ny = b.y + b.height * 0.62;
        ctx.fillStyle = "#2d1a0e";
        ctx.beginPath(); ctx.ellipse(cx, ny, b.width * 0.1, b.width * 0.07, 0, 0, TAU); ctx.fill();
        // tongue
        ctx.fillStyle = "#e05080";
        ctx.beginPath(); ctx.ellipse(cx, ny + b.width * 0.14, b.width * 0.09, b.width * 0.12, 0, 0, TAU); ctx.fill();
      });
    },
  },

  // Cat ears + whiskers
  {
    id: "cat",
    name: "Cat",
    icon: "🐱",
    draw(ctx, faces, W, H, t) {
      faces.forEach(({ boundingBox: b }) => {
        const cx = b.x + b.width / 2;
        const ey = b.y + b.height * 0.1;
        const es = b.width * 0.28;
        // ears
        const drawEar = (x, flip) => {
          ctx.fillStyle = "#888";
          ctx.beginPath();
          ctx.moveTo(x, ey + es * 0.4);
          ctx.lineTo(x + (flip ? -1 : 1) * es * 0.5, ey - es * 0.8);
          ctx.lineTo(x + (flip ? 1 : -1) * es * 0.5, ey + es * 0.1);
          ctx.closePath(); ctx.fill();
          ctx.fillStyle = "#ffb6c1";
          ctx.beginPath();
          ctx.moveTo(x, ey + es * 0.2);
          ctx.lineTo(x + (flip ? -1 : 1) * es * 0.3, ey - es * 0.5);
          ctx.lineTo(x + (flip ? 1 : -1) * es * 0.3, ey + es * 0.05);
          ctx.closePath(); ctx.fill();
        };
        drawEar(cx - b.width * 0.35, false);
        drawEar(cx + b.width * 0.35, true);
        // nose
        const ny = b.y + b.height * 0.6;
        ctx.fillStyle = "#ff9eb5";
        ctx.beginPath();
        ctx.moveTo(cx, ny); ctx.lineTo(cx - b.width * 0.05, ny + b.width * 0.06);
        ctx.lineTo(cx + b.width * 0.05, ny + b.width * 0.06); ctx.closePath(); ctx.fill();
        // whiskers
        ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 1.5;
        [[-1, -0.05], [-1, 0.02], [-1, 0.09], [1, -0.05], [1, 0.02], [1, 0.09]].forEach(([dir, dy]) => {
          ctx.beginPath();
          ctx.moveTo(cx + dir * b.width * 0.08, ny + b.height * dy);
          ctx.lineTo(cx + dir * b.width * 0.42, ny + b.height * (dy + dir * 0.02));
          ctx.stroke();
        });
      });
    },
  },

  // Sunglasses
  {
    id: "sunglasses",
    name: "Sunnies",
    icon: "😎",
    draw(ctx, faces, W, H, t) {
      faces.forEach(({ boundingBox: b }) => {
        const cx = b.x + b.width / 2;
        const ey = b.y + b.height * 0.35;
        const lw = b.width * 0.32, lh = b.height * 0.14;
        const gap = b.width * 0.06;
        // lenses
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 2;
        // left
        ctx.beginPath(); ctx.roundRect(cx - gap / 2 - lw, ey - lh / 2, lw, lh, lh / 2); ctx.fill(); ctx.stroke();
        // right
        ctx.beginPath(); ctx.roundRect(cx + gap / 2, ey - lh / 2, lw, lh, lh / 2); ctx.fill(); ctx.stroke();
        // bridge
        ctx.beginPath(); ctx.moveTo(cx - gap / 2, ey); ctx.lineTo(cx + gap / 2, ey); ctx.stroke();
        // arms
        ctx.beginPath(); ctx.moveTo(cx - gap / 2 - lw, ey); ctx.lineTo(b.x - b.width * 0.05, ey - lh * 0.2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + gap / 2 + lw, ey); ctx.lineTo(b.x + b.width * 1.05, ey - lh * 0.2); ctx.stroke();
      });
    },
  },

  // Rainbow
  {
    id: "rainbow",
    name: "Rainbow",
    icon: "🌈",
    draw(ctx, faces, W, H, t) {
      faces.forEach(({ boundingBox: b }) => {
        const cx = b.x + b.width / 2;
        const cy = b.y + b.height * 0.45;
        const r = b.width * 0.7;
        const colors = ["#FF0000","#FF7F00","#FFFF00","#00FF00","#0000FF","#8B00FF"];
        colors.forEach((c, i) => {
          ctx.strokeStyle = c; ctx.lineWidth = b.width * 0.045;
          ctx.beginPath(); ctx.arc(cx, cy, r - i * b.width * 0.05, Math.PI, 0); ctx.stroke();
        });
      });
    },
  },

  // Hearts floating
  {
    id: "hearts",
    name: "Hearts",
    icon: "💕",
    draw(ctx, faces, W, H, t) {
      faces.forEach(({ boundingBox: b }) => {
        const cx = b.x + b.width / 2;
        const top = b.y;
        for (let i = 0; i < 5; i++) {
          const x = cx + Math.sin(t * 1.5 + i * 1.3) * b.width * 0.4;
          const y = top - ((t * 60 + i * 40) % (b.height * 0.8));
          const s = 14 + i * 4;
          emoji(ctx, "❤️", x, y, s);
        }
      });
    },
  },

  // Stars crown
  {
    id: "stars",
    name: "Stars",
    icon: "⭐",
    draw(ctx, faces, W, H, t) {
      faces.forEach(({ boundingBox: b }) => {
        const cx = b.x + b.width / 2;
        const ty = b.y - b.height * 0.05;
        for (let i = 0; i < 7; i++) {
          const angle = (i / 7) * TAU - Math.PI / 2;
          const r = b.width * 0.42;
          const x = cx + Math.cos(angle) * r;
          const y = ty + Math.sin(angle) * r * 0.35;
          const pulse = 1 + 0.2 * Math.sin(t * 3 + i);
          emoji(ctx, "⭐", x, y, 18 * pulse);
        }
      });
    },
  },

  // Flower crown
  {
    id: "flowers",
    name: "Flowers",
    icon: "🌸",
    draw(ctx, faces, W, H, t) {
      faces.forEach(({ boundingBox: b }) => {
        const cx = b.x + b.width / 2;
        const ty = b.y + b.height * 0.05;
        const flowers = ["🌸","🌺","🌼","🌻","🌹"];
        for (let i = 0; i < 9; i++) {
          const x = b.x + (i / 8) * b.width;
          const y = ty - Math.sin((i / 8) * Math.PI) * b.height * 0.18;
          emoji(ctx, flowers[i % flowers.length], x, y, 20);
        }
      });
    },
  },

  // Glitter sparkles
  {
    id: "glitter",
    name: "Glitter",
    icon: "✨",
    draw(ctx, faces, W, H, t) {
      faces.forEach(({ boundingBox: b }) => {
        for (let i = 0; i < 12; i++) {
          const x = b.x + Math.random() * b.width;
          const y = b.y + Math.random() * b.height;
          const a = (Math.sin(t * 4 + i) + 1) / 2;
          ctx.globalAlpha = a;
          emoji(ctx, "✨", x, y, 14 + Math.random() * 10);
        }
        ctx.globalAlpha = 1;
      });
    },
  },

  // Vintage vignette + grain
  {
    id: "vintage",
    name: "Vintage",
    icon: "📷",
    draw(ctx, faces, W, H, t) {
      // vignette
      const grad = ctx.createRadialGradient(W/2, H/2, H*0.3, W/2, H/2, H*0.8);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
      // sepia tint
      ctx.fillStyle = "rgba(112,66,20,0.12)"; ctx.fillRect(0, 0, W, H);
    },
  },

  // Neon glow outline
  {
    id: "neon",
    name: "Neon",
    icon: "🌟",
    draw(ctx, faces, W, H, t) {
      faces.forEach(({ boundingBox: b }) => {
        const hue = (t * 60) % 360;
        ctx.strokeStyle = `hsl(${hue},100%,60%)`;
        ctx.lineWidth = 3;
        ctx.shadowColor = `hsl(${hue},100%,60%)`;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.ellipse(b.x + b.width/2, b.y + b.height/2, b.width/2 + 10, b.height/2 + 10, 0, 0, TAU);
        ctx.stroke();
        ctx.shadowBlur = 0;
      });
    },
  },
];

/* ─────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────── */
const CameraEffects = forwardRef(function CameraEffects({ videoRef, effectId, width, height }, ref) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const detRef    = useRef(null);
  const facesRef  = useRef([]);
  const t0Ref     = useRef(Date.now());

  // Expose canvas to parent for capture
  useImperativeHandle(ref, () => ({ canvas: canvasRef.current }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = width  || 640;
    canvas.height = height || 480;
  }, [width, height]);

  // Init FaceDetector
  useEffect(() => {
    if ("FaceDetector" in window) {
      detRef.current = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 2 });
    }
  }, []);

  // Detect faces periodically
  useEffect(() => {
    if (!detRef.current || !videoRef?.current) return;
    let alive = true;
    const detect = async () => {
      if (!alive) return;
      try {
        const v = videoRef.current;
        if (v && v.readyState >= 2) {
          facesRef.current = await detRef.current.detect(v);
        }
      } catch (_) {}
      if (alive) setTimeout(detect, 120);
    };
    detect();
    return () => { alive = false; };
  }, [videoRef]);

  // Draw loop
  useEffect(() => {
    const effect = EFFECTS.find((e) => e.id === effectId);
    if (!effect || effect.id === "none") {
      const canvas = canvasRef.current;
      if (canvas) canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const loop = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const t = (Date.now() - t0Ref.current) / 1000;

      // Mirror faces if front camera (caller handles mirroring via CSS)
      const faces = facesRef.current || [];
      effect.draw(ctx, faces, W, H, t);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [effectId]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 5 }}
    />
  );
});

export { EFFECTS };
export default CameraEffects;
