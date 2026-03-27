import { useState, useEffect } from "react";

const COLORS = ["red","blue","green","yellow"];
const SPECIALS = ["Skip","Reverse","+2"];
const WILDS = ["Wild","Wild+4"];

function makeDeck() {
  const deck = [];
  COLORS.forEach(color => {
    for (let n = 0; n <= 9; n++) deck.push({ color, value: String(n) });
    SPECIALS.forEach(s => deck.push({ color, value: s }));
  });
  WILDS.forEach(w => { for(let i=0;i<4;i++) deck.push({ color: "wild", value: w }); });
  return deck.sort(() => Math.random() - 0.5);
}

const colorClass = { red:"bg-red-500", blue:"bg-blue-500", green:"bg-green-500", yellow:"bg-yellow-400", wild:"bg-gradient-to-br from-red-500 via-blue-500 to-green-500" };
const textClass  = { red:"text-white", blue:"text-white", green:"text-white", yellow:"text-black", wild:"text-white" };

function UnoCard({ card, onClick, small }) {
  return (
    <button onClick={onClick}
      className={`${small?"w-10 h-14 text-xs":"w-14 h-20 text-sm"} rounded-lg ${colorClass[card.color]} ${textClass[card.color]} font-black flex items-center justify-center border-2 border-white/30 hover:scale-105 transition-transform shadow-md`}>
      {card.value}
    </button>
  );
}

export default function UnoGame({ onGameEnd }) {
  const [deck, setDeck]         = useState([]);
  const [playerHand, setPlayer] = useState([]);
  const [cpuHand, setCpu]       = useState([]);
  const [pile, setPile]         = useState([]);
  const [turn, setTurn]         = useState("player");
  const [msg, setMsg]           = useState("");
  const [colorPick, setColorPick] = useState(false);
  const [pendingWild, setPendingWild] = useState(null);

  useEffect(() => { startGame(); }, []);

  const startGame = () => {
    const d = makeDeck();
    const p = d.splice(0, 7);
    const c = d.splice(0, 7);
    // Find first non-wild card for pile
    let startIdx = d.findIndex(card => card.color !== "wild");
    const startCard = d.splice(startIdx, 1)[0];
    setDeck(d); setPlayer(p); setCpu(c); setPile([startCard]);
    setTurn("player"); setMsg(""); setColorPick(false);
  };

  const topCard = pile[pile.length - 1];

  const canPlay = (card) => {
    if (!topCard) return true;
    if (card.color === "wild") return true;
    return card.color === topCard.color || card.value === topCard.value;
  };

  const playCard = (card, fromHand, setHand, isPlayer) => {
    const newHand = fromHand.filter(c => c !== card);
    setHand(newHand);
    if (newHand.length === 0) { setMsg(isPlayer ? "🎉 You Win! UNO!" : "🤖 CPU Wins!"); return; }

    let newDeck = [...deck];
    let newPile = [...pile, card];
    let nextTurn = isPlayer ? "cpu" : "player";

    if (card.value === "Skip" || card.value === "Reverse") nextTurn = isPlayer ? "player" : "cpu";
    if (card.value === "+2") {
      const drawn = newDeck.splice(0, 2);
      if (isPlayer) setCpu(h => [...h, ...drawn]);
      else setPlayer(h => [...h, ...drawn]);
      nextTurn = isPlayer ? "player" : "cpu";
    }
    if (card.value === "Wild+4") {
      const drawn = newDeck.splice(0, 4);
      if (isPlayer) setCpu(h => [...h, ...drawn]);
      else setPlayer(h => [...h, ...drawn]);
    }

    setDeck(newDeck); setPile(newPile);

    if (card.color === "wild" && isPlayer) {
      setPendingWild({ newHand, newDeck, newPile, nextTurn });
      setColorPick(true);
      return;
    }

    setTurn(nextTurn);
    if (nextTurn === "cpu") setTimeout(() => doCpuTurn(newHand, newDeck, newPile), 800);
  };

  const pickColor = (color) => {
    if (!pendingWild) return;
    const { newDeck, newPile, nextTurn } = pendingWild;
    const updatedPile = [...newPile];
    updatedPile[updatedPile.length - 1] = { ...updatedPile[updatedPile.length - 1], color };
    setPile(updatedPile); setColorPick(false); setPendingWild(null);
    setTurn(nextTurn);
    if (nextTurn === "cpu") setTimeout(() => doCpuTurn(playerHand, newDeck, updatedPile), 800);
  };

  const cpuHandRef = useRef(cpuHand);
  useEffect(() => { cpuHandRef.current = cpuHand; }, [cpuHand]);

  const doCpuTurn = (playerH, curDeck, curPile) => {
    const currentCpuHand = cpuHandRef.current;
    const top = curPile[curPile.length - 1];
    if (!top) return;
    const playable = currentCpuHand.filter(c => c.color === "wild" || c.color === top.color || c.value === top.value);
    if (playable.length > 0) {
      const card = playable[0];
      const newCpu = currentCpuHand.filter(c => c !== card);
      if (newCpu.length === 0) { setMsg("🤖 CPU Wins!"); setCpu(newCpu); return; }
      let newPile = [...curPile, card];
      let newDeck = [...curDeck];
      if (card.color === "wild") {
        const rc = COLORS[Math.floor(Math.random() * 4)];
        newPile[newPile.length - 1] = { ...card, color: rc };
      }
      if (card.value === "+2") { const drawn = newDeck.splice(0, 2); setPlayer(h => [...h, ...drawn]); }
      if (card.value === "Wild+4") { const drawn = newDeck.splice(0, 4); setPlayer(h => [...h, ...drawn]); }
      setCpu(newCpu); setPile(newPile); setDeck(newDeck); setTurn("player");
    } else {
      if (curDeck.length > 0) {
        const drawn = curDeck[0];
        setCpu(h => [...h, drawn]);
        setDeck(curDeck.slice(1));
      }
      setTurn("player");
    }
  };

  const drawCard = () => {
    if (turn !== "player" || deck.length === 0) return;
    const card = deck[0];
    setPlayer(h => [...h, card]);
    setDeck(d => d.slice(1));
    setTurn("cpu");
    setTimeout(() => doCpuTurn(playerHand, deck.slice(1), pile), 800);
  };

  const isOver = msg !== "";

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-lg font-bold text-theme-primary">🎴 UNO</h2>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${turn==="player"?"bg-green-500/20 text-green-400":"bg-red-500/20 text-red-400"}`}>
            {turn==="player"?"Your Turn":"CPU Turn"}
          </span>
        </div>

        {/* CPU hand */}
        <div className="bg-theme-card rounded-xl p-3 border border-theme mb-3">
          <p className="text-xs text-theme-muted mb-2">CPU ({cpuHand.length} cards)</p>
          <div className="flex flex-wrap gap-1">
            {cpuHand.map((_, i) => <div key={i} className="w-8 h-12 rounded bg-blue-700 border border-blue-500"/>)}
          </div>
        </div>

        {/* Pile */}
        <div className="flex items-center justify-center gap-6 my-4">
          <div className="text-center">
            <p className="text-xs text-theme-muted mb-1">Deck ({deck.length})</p>
            <button onClick={drawCard} disabled={turn!=="player"||isOver}
              className="w-14 h-20 rounded-lg bg-blue-700 border-2 border-blue-500 text-white text-2xl flex items-center justify-center hover:bg-blue-600 disabled:opacity-50 transition">🂠</button>
          </div>
          <div className="text-center">
            <p className="text-xs text-theme-muted mb-1">Top Card</p>
            {topCard && <UnoCard card={topCard}/>}
          </div>
        </div>

        {/* Color picker */}
        {colorPick && (
          <div className="bg-theme-card rounded-xl p-3 border border-purple-500 mb-3">
            <p className="text-xs text-theme-muted mb-2 text-center">Pick a color:</p>
            <div className="flex gap-2 justify-center">
              {COLORS.map(c => (
                <button key={c} onClick={() => pickColor(c)}
                  className={`w-10 h-10 rounded-full ${colorClass[c]} border-2 border-white/30 hover:scale-110 transition`}/>
              ))}
            </div>
          </div>
        )}

        {/* Message */}
        {msg && (
          <div className="text-center py-3 bg-theme-card rounded-xl border border-theme mb-3">
            <p className="text-xl font-bold text-theme-primary">{msg}</p>
            <div className="flex gap-2 justify-center mt-3">
              <button onClick={startGame} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">Play Again</button>
              <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl text-sm">Exit</button>
            </div>
          </div>
        )}

        {/* Player hand */}
        <div className="bg-theme-card rounded-xl p-3 border border-theme">
          <p className="text-xs text-theme-muted mb-2">Your Hand ({playerHand.length} cards)</p>
          <div className="flex flex-wrap gap-1.5">
            {playerHand.map((card, i) => (
              <UnoCard key={i} card={card} small
                onClick={() => { if(turn==="player"&&!isOver&&canPlay(card)) playCard(card, playerHand, setPlayer, true); }}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
