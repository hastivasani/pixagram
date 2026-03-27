import { useState, useEffect, useRef, useCallback } from "react";
const W=320,H=400,BR=8,BW=50,BH=12,BALL_R=8,COLS=8,ROWS=5;
function makeBricks(){return Array(ROWS).fill(null).map((_,r)=>Array(COLS).fill(null).map((_,c)=>({x:c*(W/COLS)+2,y:r*22+30,alive:true,color:`hsl(${r*40+c*15},70%,55%)`})));}

export default function BrickBreaker({onGameEnd}){
  const canvasRef=useRef(null);
  const state=useRef({ball:{x:W/2,y:H-60,vx:3,vy:-4},paddle:{x:W/2-BW/2},bricks:makeBricks(),score:0,lives:3,started:false,over:false,won:false});
  const rafRef=useRef(null);
  const [display,setDisplay]=useState({score:0,lives:3,over:false,won:false});

  const draw=useCallback(()=>{
    const c=canvasRef.current;if(!c)return;
    const ctx=c.getContext("2d");const s=state.current;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle="#1a1a2e";ctx.fillRect(0,0,W,H);
    // Bricks
    s.bricks.forEach(row=>row.forEach(b=>{if(!b.alive)return;ctx.fillStyle=b.color;ctx.beginPath();ctx.roundRect(b.x,b.y,W/COLS-4,BH,3);ctx.fill();}));
    // Paddle
    ctx.fillStyle="#7c3aed";ctx.beginPath();ctx.roundRect(s.paddle.x,H-20,BW,BH,6);ctx.fill();
    // Ball
    ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(s.ball.x,s.ball.y,BALL_R,0,Math.PI*2);ctx.fill();
    // Score
    ctx.fillStyle="#fff";ctx.font="12px sans-serif";ctx.fillText(`Score: ${s.score}  Lives: ${"❤️".repeat(s.lives)}`,8,18);
    if(!s.started){ctx.fillStyle="rgba(0,0,0,0.6)";ctx.fillRect(0,0,W,H);ctx.fillStyle="#fff";ctx.font="bold 20px sans-serif";ctx.textAlign="center";ctx.fillText("Click to Start",W/2,H/2);ctx.textAlign="left";}
    if(s.over){ctx.fillStyle="rgba(0,0,0,0.7)";ctx.fillRect(0,0,W,H);ctx.fillStyle="#fff";ctx.font="bold 22px sans-serif";ctx.textAlign="center";ctx.fillText(s.won?"🎉 You Win!":"💀 Game Over",W/2,H/2-10);ctx.font="14px sans-serif";ctx.fillText(`Score: ${s.score}`,W/2,H/2+20);ctx.fillText("Click to restart",W/2,H/2+45);ctx.textAlign="left";}
  },[]);

  const loop=useCallback(()=>{
    const s=state.current;if(!s.started||s.over){draw();return;}
    s.ball.x+=s.ball.vx;s.ball.y+=s.ball.vy;
    if(s.ball.x<=BALL_R||s.ball.x>=W-BALL_R)s.ball.vx*=-1;
    if(s.ball.y<=BALL_R)s.ball.vy*=-1;
    if(s.ball.y>=H-20-BALL_R&&s.ball.x>=s.paddle.x&&s.ball.x<=s.paddle.x+BW){s.ball.vy=-Math.abs(s.ball.vy);s.ball.vx+=((s.ball.x-(s.paddle.x+BW/2))/BW)*3;}
    if(s.ball.y>H){s.lives--;if(s.lives<=0){s.over=true;setDisplay({score:s.score,lives:0,over:true,won:false});}else{s.ball={x:W/2,y:H-60,vx:3,vy:-4};}}
    s.bricks.forEach(row=>row.forEach(b=>{if(!b.alive)return;if(s.ball.x>b.x&&s.ball.x<b.x+W/COLS-4&&s.ball.y>b.y&&s.ball.y<b.y+BH){b.alive=false;s.ball.vy*=-1;s.score+=10;setDisplay(d=>({...d,score:s.score}));}}));
    if(s.bricks.every(row=>row.every(b=>!b.alive))){s.over=true;s.won=true;setDisplay({score:s.score,lives:s.lives,over:true,won:true});}
    draw();rafRef.current=requestAnimationFrame(loop);
  },[draw]);

  useEffect(()=>{draw();return()=>cancelAnimationFrame(rafRef.current);},[draw]);

  const handleClick=()=>{
    const s=state.current;
    if(s.over){state.current={ball:{x:W/2,y:H-60,vx:3,vy:-4},paddle:{x:W/2-BW/2},bricks:makeBricks(),score:0,lives:3,started:true,over:false,won:false};setDisplay({score:0,lives:3,over:false,won:false});}
    else if(!s.started)s.started=true;
    cancelAnimationFrame(rafRef.current);rafRef.current=requestAnimationFrame(loop);
  };

  const handleMove=(e)=>{
    const rect=canvasRef.current?.getBoundingClientRect();if(!rect)return;
    const x=(e.clientX||e.touches?.[0]?.clientX||0)-rect.left;
    state.current.paddle.x=Math.max(0,Math.min(W-BW,x-BW/2));
  };

  return(
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-lg font-bold text-theme-primary">🧱 Brick Breaker</h2>
          <span className="text-purple-400 font-bold">{display.score}</span>
        </div>
        <canvas ref={canvasRef} width={W} height={H} onClick={handleClick} onMouseMove={handleMove} onTouchMove={handleMove}
          className="rounded-2xl border-2 border-theme cursor-none w-full" style={{maxWidth:W,display:"block",margin:"0 auto"}}/>
        <p className="text-center text-theme-muted text-xs mt-2">Move mouse/finger to control paddle</p>
      </div>
    </div>
  );
}
