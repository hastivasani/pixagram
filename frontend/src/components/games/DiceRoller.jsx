import { useState } from "react";
const FACES=["⚀","⚁","⚂","⚃","⚄","⚅"];
export default function DiceRoller({onGameEnd}){
  const [dice,setDice]=useState([1,1]);
  const [rolling,setRolling]=useState(false);
  const [score,setScore]=useState({p1:0,p2:0});
  const [turn,setTurn]=useState(1);
  const [target]=useState(50);

  const roll=()=>{
    setRolling(true);
    setTimeout(()=>{
      const d=[Math.floor(Math.random()*6)+1,Math.floor(Math.random()*6)+1];
      setDice(d);
      const sum=d[0]+d[1];
      setScore(s=>{
        const ns={...s};
        if(turn===1)ns.p1=Math.min(ns.p1+sum,target);
        else ns.p2=Math.min(ns.p2+sum,target);
        return ns;
      });
      setTurn(t=>t===1?2:1);
      setRolling(false);
    },600);
  };

  const winner=score.p1>=target?1:score.p2>=target?2:0;

  return(
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-lg font-bold text-theme-primary">🎲 Dice Battle</h2>
          <span className="text-xs text-theme-muted">First to {target}</span>
        </div>
        <div className="flex justify-around mb-6">
          <div className="text-center">
            <p className="text-theme-muted text-xs mb-1">Player 1</p>
            <p className="text-3xl font-black text-blue-400">{score.p1}</p>
          </div>
          <div className="text-center">
            <p className="text-theme-muted text-xs mb-1">Player 2</p>
            <p className="text-3xl font-black text-red-400">{score.p2}</p>
          </div>
        </div>
        <div className="flex justify-center gap-6 mb-6">
          {dice.map((d,i)=>(
            <div key={i} className={`text-7xl transition-all ${rolling?"animate-bounce":""}`}>{FACES[d-1]}</div>
          ))}
        </div>
        <p className="text-center text-theme-muted text-sm mb-4">Sum: <span className="text-purple-400 font-bold">{dice[0]+dice[1]}</span> · {winner?`Player ${winner} Wins! 🎉`:`Player ${turn}'s turn`}</p>
        {!winner?(
          <button onClick={roll} disabled={rolling}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-2xl font-bold text-lg disabled:opacity-50 transition">
            {rolling?"Rolling...":"🎲 Roll Dice"}
          </button>
        ):(
          <div className="flex gap-2 justify-center">
            <button onClick={()=>{setScore({p1:0,p2:0});setTurn(1);setDice([1,1]);}} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">Play Again</button>
            <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl text-sm">Exit</button>
          </div>
        )}
      </div>
    </div>
  );
}
