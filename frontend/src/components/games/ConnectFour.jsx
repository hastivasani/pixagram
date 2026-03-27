import { useState } from "react";
const ROWS=6,COLS=7;
function empty(){return Array(ROWS).fill(null).map(()=>Array(COLS).fill(0));}
function checkWin(b,p){
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    if(b[r][c]!==p)continue;
    const dirs=[[0,1],[1,0],[1,1],[1,-1]];
    for(const[dr,dc]of dirs){
      let cnt=1;
      for(let i=1;i<4;i++){const nr=r+dr*i,nc=c+dc*i;if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&b[nr][nc]===p)cnt++;else break;}
      if(cnt>=4)return true;
    }
  }
  return false;
}
export default function ConnectFour({onGameEnd}){
  const [board,setBoard]=useState(empty);
  const [turn,setTurn]=useState(1);
  const [winner,setWinner]=useState(0);

  const drop=(c)=>{
    if(winner)return;
    const nb=board.map(r=>[...r]);
    for(let r=ROWS-1;r>=0;r--){
      if(!nb[r][c]){nb[r][c]=turn;break;}
    }
    setBoard(nb);
    if(checkWin(nb,turn)){setWinner(turn);return;}
    setTurn(t=>t===1?2:1);
  };

  const colors={0:"bg-theme-input",1:"bg-red-500",2:"bg-yellow-400"};

  return(
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-lg font-bold text-theme-primary">🔴 Connect Four</h2>
          <span className={`text-sm font-bold ${turn===1?"text-red-400":"text-yellow-400"}`}>{winner?`P${winner} Wins!`:`P${turn}'s turn`}</span>
        </div>
        <div className="bg-blue-700 rounded-2xl p-3 mb-4">
          <div className="flex gap-1 mb-2">
            {Array(COLS).fill(0).map((_,c)=>(
              <button key={c} onClick={()=>drop(c)} className="flex-1 py-1 text-white/50 hover:text-white text-xs transition">▼</button>
            ))}
          </div>
          {board.map((row,r)=>(
            <div key={r} className="flex gap-1 mb-1">
              {row.map((cell,c)=>(
                <div key={c} className={`flex-1 aspect-square rounded-full ${colors[cell]} transition-all`}/>
              ))}
            </div>
          ))}
        </div>
        {winner&&(
          <div className="flex gap-2 justify-center">
            <button onClick={()=>{setBoard(empty());setTurn(1);setWinner(0);}} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">Play Again</button>
            <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl text-sm">Exit</button>
          </div>
        )}
      </div>
    </div>
  );
}
