import { useState } from "react";
const SUITS=["♠","♥","♦","♣"];
const VALS=["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
function makeDeck(){return SUITS.flatMap(s=>VALS.map(v=>({s,v})));}
function shuffle(d){return [...d].sort(()=>Math.random()-0.5);}
function cardVal(v){if(["J","Q","K"].includes(v))return 10;if(v==="A")return 11;return parseInt(v);}
function handVal(hand){let s=hand.reduce((a,c)=>a+cardVal(c.v),0);let aces=hand.filter(c=>c.v==="A").length;while(s>21&&aces>0){s-=10;aces--;}return s;}
function Card({c}){const red=c.s==="♥"||c.s==="♦";return(<div className={`w-12 h-16 rounded-lg border-2 border-gray-300 bg-white flex flex-col items-center justify-center text-sm font-black ${red?"text-red-500":"text-gray-900"}`}><span>{c.v}</span><span>{c.s}</span></div>);}

export default function BlackjackGame({onGameEnd}){
  const [deck,setDeck]=useState(()=>shuffle(makeDeck()));
  const [player,setPlayer]=useState([]);
  const [dealer,setDealer]=useState([]);
  const [status,setStatus]=useState("idle");// idle|playing|done
  const [msg,setMsg]=useState("");

  const deal=()=>{
    const d=shuffle(makeDeck());
    const p=[d[0],d[2]],de=[d[1],d[3]];
    setDeck(d.slice(4));setPlayer(p);setDealer(de);setStatus("playing");setMsg("");
  };

  const hit=()=>{
    const card=deck[0];const nd=deck.slice(1);
    const np=[...player,card];setPlayer(np);setDeck(nd);
    if(handVal(np)>21){setStatus("done");setMsg("💥 Bust! Dealer wins.");}
  };

  const stand=()=>{
    let d=[...dealer];let dk=[...deck];
    while(handVal(d)<17){d=[...d,dk[0]];dk=dk.slice(1);}
    setDealer(d);setDeck(dk);setStatus("done");
    const pv=handVal(player),dv=handVal(d);
    if(dv>21||pv>dv)setMsg("🎉 You Win!");
    else if(pv===dv)setMsg("🤝 Push!");
    else setMsg("😔 Dealer Wins.");
  };

  return(
    <div className="min-h-screen bg-green-900 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onGameEnd} className="text-white/70 text-sm">← Back</button>
          <h2 className="text-lg font-bold text-white">🃏 Blackjack</h2>
          <div/>
        </div>
        {status==="idle"?(
          <div className="text-center">
            <p className="text-white/70 mb-6 text-sm">Get closer to 21 than the dealer without going over.</p>
            <button onClick={deal} className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-8 py-3 rounded-2xl text-lg">Deal Cards</button>
          </div>
        ):(
          <>
            <div className="mb-4">
              <p className="text-white/60 text-xs mb-2">Dealer {status==="done"?`(${handVal(dealer)})`:""}</p>
              <div className="flex gap-2 flex-wrap">
                {dealer.map((c,i)=>status==="playing"&&i===1?<div key={i} className="w-12 h-16 rounded-lg bg-blue-700 border-2 border-blue-500 flex items-center justify-center text-2xl">🂠</div>:<Card key={i} c={c}/>)}
              </div>
            </div>
            <div className="mb-4">
              <p className="text-white/60 text-xs mb-2">You ({handVal(player)})</p>
              <div className="flex gap-2 flex-wrap">{player.map((c,i)=><Card key={i} c={c}/>)}</div>
            </div>
            {msg&&<div className="text-center text-xl font-black text-yellow-400 mb-4">{msg}</div>}
            {status==="playing"?(
              <div className="flex gap-3 justify-center">
                <button onClick={hit} className="bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-2.5 rounded-xl">Hit</button>
                <button onClick={stand} className="bg-red-500 hover:bg-red-400 text-white font-bold px-6 py-2.5 rounded-xl">Stand</button>
              </div>
            ):(
              <div className="flex gap-2 justify-center">
                <button onClick={deal} className="bg-yellow-500 text-black font-bold px-4 py-2 rounded-xl text-sm">Play Again</button>
                <button onClick={onGameEnd} className="bg-white/20 text-white px-4 py-2 rounded-xl text-sm">Exit</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
