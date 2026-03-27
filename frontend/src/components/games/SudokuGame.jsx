import { useState } from "react";

const BASE = [
  [5,3,0,0,7,0,0,0,0],[6,0,0,1,9,5,0,0,0],[0,9,8,0,0,0,0,6,0],
  [8,0,0,0,6,0,0,0,3],[4,0,0,8,0,3,0,0,1],[7,0,0,0,2,0,0,0,6],
  [0,6,0,0,0,0,2,8,0],[0,0,0,4,1,9,0,0,5],[0,0,0,0,8,0,0,7,9],
];
const SOLUTION = [
  [5,3,4,6,7,8,9,1,2],[6,7,2,1,9,5,3,4,8],[1,9,8,3,4,2,5,6,7],
  [8,5,9,7,6,1,4,2,3],[4,2,6,8,5,3,7,9,1],[7,1,3,9,2,4,8,5,6],
  [9,6,1,5,3,7,2,8,4],[2,8,7,4,1,9,6,3,5],[3,4,5,2,8,6,1,7,9],
];

export default function SudokuGame({ onGameEnd }) {
  const [board, setBoard] = useState(BASE.map(r=>[...r]));
  const [selected, setSelected] = useState(null);
  const [errors, setErrors] = useState(new Set());

  const isFixed = (r,c) => BASE[r][c]!==0;

  const setCell = (val) => {
    if(!selected||isFixed(selected[0],selected[1])) return;
    const [r,c]=selected;
    const nb=board.map(row=>[...row]);
    nb[r][c]=val;
    setBoard(nb);
    const key=`${r},${c}`;
    if(val!==0&&val!==SOLUTION[r][c]) setErrors(e=>new Set([...e,key]));
    else setErrors(e=>{const ne=new Set(e);ne.delete(key);return ne;});
  };

  const solved = board.every((row,r)=>row.every((v,c)=>v===SOLUTION[r][c]));

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-lg font-bold text-theme-primary">🔲 Sudoku</h2>
          <button onClick={()=>{setBoard(BASE.map(r=>[...r]));setErrors(new Set());setSelected(null);}} className="text-xs text-purple-400">Reset</button>
        </div>
        {solved&&<div className="text-center mb-4 text-green-400 font-bold text-lg">🎉 Solved!</div>}
        <div className="grid grid-cols-9 border-2 border-theme-primary rounded-xl overflow-hidden mb-4">
          {board.map((row,r)=>row.map((val,c)=>{
            const key=`${r},${c}`;
            const sel=selected&&selected[0]===r&&selected[1]===c;
            const sameBox=selected&&Math.floor(r/3)===Math.floor(selected[0]/3)&&Math.floor(c/3)===Math.floor(selected[1]/3);
            const err=errors.has(key);
            return (
              <button key={key} onClick={()=>setSelected([r,c])}
                className={`aspect-square flex items-center justify-center text-sm font-bold border border-theme/30 transition
                  ${(c+1)%3===0&&c!==8?"border-r-2 border-r-theme-primary":""}
                  ${(r+1)%3===0&&r!==8?"border-b-2 border-b-theme-primary":""}
                  ${sel?"bg-purple-500/30":sameBox?"bg-purple-500/10":""}
                  ${err?"text-red-400":isFixed(r,c)?"text-theme-primary":"text-blue-400"}
                `}>
                {val||""}
              </button>
            );
          }))}
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[1,2,3,4,5,6,7,8,9,0].map(n=>(
            <button key={n} onClick={()=>setCell(n)}
              className="bg-theme-card border border-theme rounded-xl py-2.5 text-theme-primary font-bold hover:border-purple-500 transition">
              {n||"✕"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
