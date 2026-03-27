import { useState } from "react";
const SUITS = ["♠","♥","♦","♣"];
const VALS  = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const makeDeck = () => SUITS.flatMap(s => VALS.map(v => ({ s, v })));
const shuffle  = d => [...d].sort(() => Math.random() - 0.5);
const cardVal  = v => ["J","Q","K"].includes(v) ? 10 : v === "A" ? 11 : parseInt(v);
const isRed    = c => c.s === "♥" || c.s === "♦";

function Card({ c, hidden }) {
  if (hidden) return <div className="w-12 h-16 rounded-lg bg-blue-700 border-2 border-blue-500 flex items-center justify-center text-xl">🂠</div>;
  return (
    <div className={`w-12 h-16 rounded-lg border-2 border-gray-300 bg-white flex flex-col items-center justify-center text-sm font-black ${isRed(c) ? "text-red-500" : "text-gray-900"}`}>
      <span>{c.v}</span><span>{c.s}</span>
    </div>
  );
}

function handScore(hand) {
  let s = hand.reduce((a, c) => a + cardVal(c.v), 0);
  let aces = hand.filter(c => c.v === "A").length;
  while (s > 21 && aces-- > 0) s -= 10;
  return s;
}

export default function PokerGame({ onGameEnd }) {
  const [deck, setDeck]     = useState(() => shuffle(makeDeck()));
  const [player, setPlayer] = useState([]);
  const [dealer, setDealer] = useState([]);
  const [phase, setPhase]   = useState("idle"); // idle|playing|done
  const [msg, setMsg]       = useState("");
  const [chips, setChips]   = useState(100);
  const [bet, setBet]       = useState(10);
  const [pot, setPot]       = useState(0);

  const deal = () => {
    if (chips < bet) return;
    const d = shuffle(makeDeck());
    const p = [d[0], d[2]], de = [d[1], d[3]];
    setDeck(d.slice(4)); setPlayer(p); setDealer(de);
    setPhase("playing"); setMsg(""); setPot(bet);
    setChips(c => c - bet);
  };

  const hit = () => {
    const card = deck[0], nd = deck.slice(1);
    const np = [...player, card]; setPlayer(np); setDeck(nd);
    if (handScore(np) > 21) { setPhase("done"); setMsg("💥 Bust! You lose."); }
  };

  const stand = () => {
    let d = [...dealer], dk = [...deck];
    while (handScore(d) < 17) { d = [...d, dk[0]]; dk = dk.slice(1); }
    setDealer(d); setDeck(dk); setPhase("done");
    const pv = handScore(player), dv = handScore(d);
    if (dv > 21 || pv > dv) { setMsg("🎉 You Win!"); setChips(c => c + pot * 2); }
    else if (pv === dv) { setMsg("🤝 Push!"); setChips(c => c + pot); }
    else setMsg("😔 Dealer Wins.");
  };

  const double = () => {
    if (chips < bet) return;
    setChips(c => c - bet); setPot(p => p + bet);
    const card = deck[0], nd = deck.slice(1);
    const np = [...player, card]; setPlayer(np); setDeck(nd);
    if (handScore(np) > 21) { setPhase("done"); setMsg("💥 Bust! You lose."); return; }
    let d = [...dealer], dk = [...nd];
    while (handScore(d) < 17) { d = [...d, dk[0]]; dk = dk.slice(1); }
    setDealer(d); setDeck(dk); setPhase("done");
    const pv = handScore(np), dv = handScore(d);
    if (dv > 21 || pv > dv) { setMsg("🎉 You Win!"); setChips(c => c + (pot + bet) * 2); }
    else if (pv === dv) { setMsg("🤝 Push!"); setChips(c => c + pot + bet); }
    else setMsg("😔 Dealer Wins.");
  };

  return (
    <div className="min-h-screen bg-green-900 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onGameEnd} className="text-white/70 text-sm">← Back</button>
          <h2 className="text-lg font-bold text-white">🃏 Poker (Blackjack)</h2>
          <span className="text-yellow-400 font-bold">{chips} 🪙</span>
        </div>
        {phase === "idle" ? (
          <div className="text-center space-y-4">
            <p className="text-white/70 text-sm">Chips: {chips} | Bet: {bet}</p>
            <div className="flex gap-2 justify-center">
              {[5,10,25,50].map(b => (
                <button key={b} onClick={() => setBet(b)} className={`px-3 py-1.5 rounded-lg text-sm font-bold ${bet===b?"bg-yellow-500 text-black":"bg-white/20 text-white"}`}>{b}</button>
              ))}
            </div>
            <button onClick={deal} disabled={chips < bet} className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-8 py-3 rounded-2xl text-lg disabled:opacity-50">Deal Cards</button>
          </div>
        ) : (
          <>
            <div className="mb-3">
              <p className="text-white/60 text-xs mb-1">Dealer {phase==="done"?`(${handScore(dealer)})`:""}</p>
              <div className="flex gap-2 flex-wrap">{dealer.map((c,i) => <Card key={i} c={c} hidden={phase==="playing"&&i===1}/>)}</div>
            </div>
            <div className="mb-3">
              <p className="text-white/60 text-xs mb-1">You ({handScore(player)}) | Pot: {pot} 🪙</p>
              <div className="flex gap-2 flex-wrap">{player.map((c,i) => <Card key={i} c={c}/>)}</div>
            </div>
            {msg && <div className="text-center text-xl font-black text-yellow-400 mb-3">{msg}</div>}
            {phase === "playing" ? (
              <div className="flex gap-2 justify-center">
                <button onClick={hit} className="bg-green-500 text-white font-bold px-5 py-2 rounded-xl">Hit</button>
                <button onClick={stand} className="bg-red-500 text-white font-bold px-5 py-2 rounded-xl">Stand</button>
                {player.length === 2 && chips >= bet && <button onClick={double} className="bg-yellow-500 text-black font-bold px-5 py-2 rounded-xl">2x</button>}
              </div>
            ) : (
              <div className="flex gap-2 justify-center">
                <button onClick={deal} disabled={chips < bet} className="bg-yellow-500 text-black font-bold px-4 py-2 rounded-xl text-sm disabled:opacity-50">Deal Again</button>
                <button onClick={onGameEnd} className="bg-white/20 text-white px-4 py-2 rounded-xl text-sm">Exit</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
