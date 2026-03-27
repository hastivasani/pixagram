import { useState, useEffect } from "react";
// Card matching with suits
const SUITS = ["♠","♥","♦","♣"];
const VALUES = ["A","K","Q","J","10"];
function makeCards() {
  const pairs = [];
  SUITS.forEach(s=>VALUES.forEach(v=>pairs.push(`${v}${s}`)));
  const selected = pairs.slice(0,8);
  return [...selected,...selected].sort(()=>Math.random()-0.5).map((c,i)=>({id:i,val:c,flipped:false,matched:false}));
}
export default function CardMemory({ onGameEnd }) {
  const [cards,setCards]=useState(makeCards);
  const [flipped,setFlipped]=useState([]);
  const [moves,setMoves]=useState(0);
  const [won,setWon]=useState(false);
  const [lock,setLock]=useState(false);

  useEffect(()=>{
    if(flipped.length!==2) return;
    setLock(true);
    const [a,b]=flipped;
    if(cards[a].val===cards[b].val){
      setCards(p=>p.map((c,i)=>i===a||i===b?{...c,matched:true}:c));
      setFlipped([]);setLock(false);
    } else {
      setTimeout(()=>{
        setCards(p=>p.map((c,i)=>i===a||i===b?{...c,flipped:false}:c));
        setFlipped([]);setLock(false);
      },900);
    }
    setMoves(m=>m+1);
  },[flipped]);

  useEffect(()=>{if(cards.every(c=>c.matched))setWon(true);},[cards]);

  const flip=(i)=>{
    if(lock||cards[i].flipped||cards[i].matched||flipped.length===2) return;
    setCards(p=>p.map((c,j)=>j===i?{...c,flipped:true}:c));
    setFlipped(p=>[...p,i]);
  };

  const isRed = (v) => v.includes("♥")||v.includes("♦");

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-lg font-bold text-theme-primary">🃏 Card Memory</h2>
          <span className="text-purple-400 font-bold">{moves} moves</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {cards.map((c,i)=>(
            <button key={c.id} onClick={()=>flip(i)}
              className={`aspect-[2/3] rounded-xl flex items-center justify-center text-lg font-black border-2 transition-all ${
                c.flipped||c.matched
                  ? c.matched?"bg-green-500/20 border-green-500":"bg-white border-gray-300"
                  : "bg-blue-700 border-blue-600 hover:bg-blue-600"
              }`}>
              {(c.flipped||c.matched)
                ? <span className={isRed(c.val)?"text-red-500":"text-gray-900"}>{c.val}</span>
                : <span className="text-white text-2xl">🂠</span>}
            </button>
          ))}
        </div>
        {won&&(
          <div className="mt-4 bg-theme-card rounded-2xl p-4 border border-theme text-center">
            <p className="text-2xl mb-1">🎉</p>
            <p className="font-bold text-theme-primary mb-3">Completed in {moves} moves!</p>
            <div className="flex gap-2 justify-center">
              <button onClick={()=>{setCards(makeCards());setFlipped([]);setMoves(0);setWon(false);}} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">Play Again</button>
              <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl text-sm">Exit</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
