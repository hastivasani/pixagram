import { useState, useEffect, useRef, useCallback } from "react";

const W = 320, H = 480, BIRD_X = 60, BIRD_R = 18;
const GRAVITY = 0.5, JUMP = -9, PIPE_W = 52, GAP = 130, PIPE_SPEED = 3;

function randPipeY() { return 80 + Math.floor(Math.random()*(H-GAP-160)); }

export default function FlappyBird({ onGameEnd }) {
  const canvasRef = useRef(null);
  const state     = useRef({
    bird:{ y:H/2, vy:0 },
    pipes:[{ x:W+60, top:randPipeY() }],
    score:0, started:false, over:false, frame:0,
  });
  const rafRef    = useRef(null);
  const [display, setDisplay] = useState({ score:0, over:false, started:false });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const s   = state.current;

    ctx.clearRect(0,0,W,H);

    // Sky
    ctx.fillStyle="#87CEEB"; ctx.fillRect(0,0,W,H);

    // Pipes
    ctx.fillStyle="#4ade80";
    s.pipes.forEach(p=>{
      ctx.fillRect(p.x,0,PIPE_W,p.top);
      ctx.fillRect(p.x,p.top+GAP,PIPE_W,H-p.top-GAP);
      ctx.fillStyle="#22c55e";
      ctx.fillRect(p.x-4,p.top-20,PIPE_W+8,20);
      ctx.fillRect(p.x-4,p.top+GAP,PIPE_W+8,20);
      ctx.fillStyle="#4ade80";
    });

    // Ground
    ctx.fillStyle="#92400e"; ctx.fillRect(0,H-30,W,30);
    ctx.fillStyle="#a3e635"; ctx.fillRect(0,H-30,W,8);

    // Bird
    const by = s.bird.y;
    ctx.save();
    ctx.translate(BIRD_X, by);
    ctx.rotate(Math.min(Math.max(s.bird.vy*0.05,-0.5),1));
    ctx.fillStyle="#fbbf24";
    ctx.beginPath(); ctx.arc(0,0,BIRD_R,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#f97316";
    ctx.beginPath(); ctx.arc(6,-4,8,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#fff";
    ctx.beginPath(); ctx.arc(8,-6,4,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#1e293b";
    ctx.beginPath(); ctx.arc(9,-6,2,0,Math.PI*2); ctx.fill();
    ctx.restore();

    // Score
    ctx.fillStyle="#1e293b"; ctx.font="bold 28px sans-serif"; ctx.textAlign="center";
    ctx.fillText(s.score, W/2, 50);

    if (!s.started) {
      ctx.fillStyle="rgba(0,0,0,0.5)"; ctx.fillRect(0,0,W,H);
      ctx.fillStyle="#fff"; ctx.font="bold 24px sans-serif";
      ctx.fillText("Tap to Start", W/2, H/2);
    }
    if (s.over) {
      ctx.fillStyle="rgba(0,0,0,0.6)"; ctx.fillRect(0,0,W,H);
      ctx.fillStyle="#fff"; ctx.font="bold 26px sans-serif";
      ctx.fillText("Game Over!", W/2, H/2-20);
      ctx.font="18px sans-serif";
      ctx.fillText(`Score: ${s.score}`, W/2, H/2+15);
      ctx.fillText("Tap to Restart", W/2, H/2+50);
    }
  }, []);

  const loop = useCallback(() => {
    const s = state.current;
    if (!s.started || s.over) { draw(); return; }

    s.bird.vy += GRAVITY;
    s.bird.y  += s.bird.vy;
    s.frame++;

    // Pipes
    s.pipes.forEach(p=>{ p.x -= PIPE_SPEED; });
    if (s.pipes[s.pipes.length-1].x < W-200) s.pipes.push({ x:W+20, top:randPipeY() });
    s.pipes = s.pipes.filter(p=>p.x>-PIPE_W);

    // Score
    s.pipes.forEach(p=>{ if (p.x+PIPE_W===BIRD_X) s.score++; });

    // Collision
    const by = s.bird.y;
    if (by-BIRD_R<0 || by+BIRD_R>H-30) { s.over=true; setDisplay({score:s.score,over:true,started:true}); return; }
    for (const p of s.pipes) {
      if (BIRD_X+BIRD_R>p.x && BIRD_X-BIRD_R<p.x+PIPE_W) {
        if (by-BIRD_R<p.top || by+BIRD_R>p.top+GAP) { s.over=true; setDisplay({score:s.score,over:true,started:true}); return; }
      }
    }

    setDisplay(d=>d.score!==s.score?{...d,score:s.score}:d);
    draw();
    rafRef.current = requestAnimationFrame(loop);
  }, [draw]);

  useEffect(() => {
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  const tap = () => {
    const s = state.current;
    if (s.over) {
      s.bird={y:H/2,vy:0}; s.pipes=[{x:W+60,top:randPipeY()}]; s.score=0; s.over=false; s.frame=0;
      setDisplay({score:0,over:false,started:true});
    }
    if (!s.started) { s.started=true; setDisplay(d=>({...d,started:true})); }
    s.bird.vy = JUMP;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(()=>{
    const onKey=(e)=>{ if(e.code==="Space"||e.code==="ArrowUp"){ e.preventDefault(); tap(); } };
    window.addEventListener("keydown",onKey);
    return ()=>window.removeEventListener("keydown",onKey);
  },[loop]);

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-lg font-bold text-theme-primary">🐦 Flappy Bird</h2>
          <span className="text-purple-400 font-bold">{display.score}</span>
        </div>
        <canvas ref={canvasRef} width={W} height={H}
          onClick={tap}
          className="rounded-2xl border-2 border-theme cursor-pointer w-full"
          style={{maxWidth:W, display:"block", margin:"0 auto"}}
        />
        <p className="text-center text-theme-muted text-xs mt-2">Tap / Space to flap</p>
      </div>
    </div>
  );
}
