import { useState, useEffect, useRef } from "react";

const STARTER_WORDS = ["apple","elephant","tiger","rabbit","island","dolphin","night","table","eagle","orange","game","engine","nature","earth","house"];

export default function WordChain({ onGameEnd, lobbyId, players, currentUser, socket }) {
  const [chain, setChain]   = useState([]);
  const [input, setInput]   = useState("");
  const [error, setError]   = useState("");
  const [score, setScore]   = useState(0);
  const [opScore, setOpScore] = useState(0);
  const [timeLeft, setTime] = useState(15);
  const [done, setDone]     = useState(false);
  const [round, setRound]   = useState(0);
  const MAX_ROUNDS = 10;
  const isSolo = !players || players.length < 2;
  const inputRef = useRef(null);

  const startWord = STARTER_WORDS[Math.floor(Math.random() * STARTER_WORDS.length)];
  const [currentWord, setCurrentWord] = useState(startWord);

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setTime(s => {
      if (s <= 1) { handleTimeout(); return 15; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [done, round]);

  useEffect(() => {
    if (!socket || isSolo) return;
    const onAction = ({ action, payload }) => {
      if (action === "wordchain_word") {
        setChain(c => [...c, { word: payload.word, by: "opponent" }]);
        setCurrentWord(payload.word);
        setOpScore(payload.score);
        setTime(15);
      }
    };
    socket.on("gameAction", onAction);
    return () => socket.off("gameAction", onAction);
  }, [socket, isSolo]);

  const handleTimeout = () => {
    if (round + 1 >= MAX_ROUNDS) { setDone(true); return; }
    setRound(r => r + 1);
    setError("⏱ Time's up! CPU plays...");
    // CPU plays a word
    const last = currentWord[currentWord.length - 1];
    const cpuWords = ["apple","ant","tiger","rabbit","table","eagle","elephant","night","island","orange","game","engine","nature","earth","house","sun","net","tree","egg","green"];
    const valid = cpuWords.find(w => w[0] === last && !chain.find(c => c.word === w));
    if (valid) {
      setChain(c => [...c, { word: valid, by: "cpu" }]);
      setCurrentWord(valid);
    }
    setTime(15);
  };

  const submit = () => {
    const word = input.trim().toLowerCase();
    if (!word) return;
    const last = currentWord[currentWord.length - 1];
    if (word[0] !== last) { setError(`❌ Must start with "${last.toUpperCase()}"`); return; }
    if (chain.find(c => c.word === word)) { setError("❌ Word already used!"); return; }
    if (word.length < 2) { setError("❌ Too short!"); return; }

    const newChain = [...chain, { word, by: "player" }];
    const newScore = score + word.length;
    setChain(newChain); setCurrentWord(word); setScore(newScore);
    setInput(""); setError(""); setTime(15);

    if (!isSolo && socket) {
      socket.emit("gameAction", { lobbyId, action: "wordchain_word", payload: { word, score: newScore } });
    }

    if (round + 1 >= MAX_ROUNDS) { setDone(true); return; }
    setRound(r => r + 1);

    // CPU response in solo
    if (isSolo) {
      setTimeout(() => {
        const cpuWords = ["apple","ant","tiger","rabbit","table","eagle","elephant","night","island","orange","game","engine","nature","earth","house","sun","net","tree","egg","green","name","end","dog","go","one","ear","run","new","win","nice","eat","top","pen","now","war","red","day","yes","set","ten"];
        const last2 = word[word.length - 1];
        const valid = cpuWords.find(w => w[0] === last2 && !newChain.find(c => c.word === w));
        if (valid) {
          setChain(c => [...c, { word: valid, by: "cpu" }]);
          setCurrentWord(valid);
        }
        setTime(15);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-base font-bold text-theme-primary">🔗 Word Chain</h2>
          <span className="text-purple-400 font-bold">{score} pts</span>
        </div>

        {done ? (
          <div className="text-center bg-theme-card rounded-2xl p-6 border border-theme">
            <p className="text-4xl mb-2">🏆</p>
            <p className="text-xl font-bold text-theme-primary mb-1">Game Over!</p>
            <p className="text-theme-muted mb-2">Your Score: {score}</p>
            {!isSolo && <p className="text-theme-muted mb-4">Opponent: {opScore}</p>}
            <div className="flex gap-2 justify-center">
              <button onClick={() => { setChain([]); setInput(""); setError(""); setScore(0); setOpScore(0); setTime(15); setDone(false); setRound(0); setCurrentWord(STARTER_WORDS[Math.floor(Math.random()*STARTER_WORDS.length)]); }} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">Play Again</button>
              <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl text-sm">Exit</button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-theme-card rounded-2xl p-4 border border-theme mb-4 text-center">
              <p className="text-xs text-theme-muted mb-1">Current word — next must start with:</p>
              <p className="text-3xl font-black text-purple-400">{currentWord}</p>
              <p className="text-xl font-bold text-yellow-400 mt-1">→ "{currentWord[currentWord.length-1].toUpperCase()}"</p>
            </div>

            <div className="flex justify-between text-xs text-theme-muted mb-2">
              <span>Round {round + 1}/{MAX_ROUNDS}</span>
              <span className={`font-bold ${timeLeft <= 5 ? "text-red-400" : "text-green-400"}`}>⏱ {timeLeft}s</span>
            </div>

            {error && <p className="text-sm text-red-400 mb-2">{error}</p>}

            <div className="flex gap-2 mb-3">
              <input ref={inputRef} value={input} onChange={e => { setInput(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && submit()}
                placeholder={`Word starting with "${currentWord[currentWord.length-1].toUpperCase()}"...`}
                className="flex-1 bg-theme-input text-theme-primary rounded-xl px-4 py-3 outline-none border border-theme focus:border-purple-500"/>
              <button onClick={submit} className="bg-purple-600 text-white px-4 rounded-xl font-bold">Go</button>
            </div>

            {/* Chain history */}
            <div className="bg-theme-card rounded-xl p-3 border border-theme max-h-32 overflow-y-auto">
              {[...chain].reverse().map((c, i) => (
                <div key={i} className={`text-xs py-0.5 ${c.by==="player"?"text-blue-400":c.by==="opponent"?"text-orange-400":"text-theme-muted"}`}>
                  {c.by==="player"?"You":"CPU"}: {c.word}
                </div>
              ))}
              <div className="text-xs text-theme-muted">Start: {startWord}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
