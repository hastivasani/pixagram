import { useState, useEffect } from "react";

const QUESTIONS = [
  { q:"What is the capital of France?", opts:["London","Berlin","Paris","Madrid"], ans:2 },
  { q:"Which planet is closest to the Sun?", opts:["Venus","Mercury","Earth","Mars"], ans:1 },
  { q:"What is 15 × 15?", opts:["200","215","225","235"], ans:2 },
  { q:"Who painted the Mona Lisa?", opts:["Van Gogh","Picasso","Da Vinci","Rembrandt"], ans:2 },
  { q:"What is the largest ocean?", opts:["Atlantic","Indian","Arctic","Pacific"], ans:3 },
  { q:"How many sides does a hexagon have?", opts:["5","6","7","8"], ans:1 },
  { q:"What year did World War II end?", opts:["1943","1944","1945","1946"], ans:2 },
  { q:"What is the chemical symbol for Gold?", opts:["Go","Gd","Au","Ag"], ans:2 },
  { q:"Which country invented pizza?", opts:["France","Spain","Greece","Italy"], ans:3 },
  { q:"What is the fastest land animal?", opts:["Lion","Cheetah","Horse","Leopard"], ans:1 },
  { q:"How many bones are in the human body?", opts:["196","206","216","226"], ans:1 },
  { q:"What is the smallest country in the world?", opts:["Monaco","San Marino","Vatican City","Liechtenstein"], ans:2 },
  { q:"Which element has atomic number 1?", opts:["Helium","Oxygen","Hydrogen","Carbon"], ans:2 },
  { q:"What is the longest river in the world?", opts:["Amazon","Nile","Yangtze","Mississippi"], ans:1 },
  { q:"Who wrote Romeo and Juliet?", opts:["Dickens","Shakespeare","Austen","Tolstoy"], ans:1 },
];

export default function TriviaGame({ onGameEnd, lobbyId, players, currentUser, socket }) {
  const [questions] = useState(() => [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10));
  const [idx, setIdx]       = useState(0);
  const [score, setScore]   = useState(0);
  const [opScore, setOpScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const [done, setDone]     = useState(false);
  const [timeLeft, setTime] = useState(15);

  const isSolo = !players || players.length < 2;

  useEffect(() => {
    if (done || picked !== null) return;
    const t = setInterval(() => setTime(s => {
      if (s <= 1) { handleAnswer(-1); return 15; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [done, picked, idx]);

  useEffect(() => {
    if (!socket || isSolo) return;
    const onAction = ({ action, payload }) => {
      if (action === "trivia_score") setOpScore(payload.score);
    };
    socket.on("gameAction", onAction);
    return () => socket.off("gameAction", onAction);
  }, [socket, isSolo]);

  const handleAnswer = (i) => {
    if (picked !== null) return;
    setPicked(i);
    const correct = i === questions[idx].ans;
    const newScore = correct ? score + 1 : score;
    if (correct) setScore(newScore);

    if (!isSolo && socket) {
      socket.emit("gameAction", { lobbyId, action: "trivia_score", payload: { score: newScore } });
    }

    setTimeout(() => {
      if (idx + 1 >= questions.length) { setDone(true); return; }
      setIdx(i => i + 1); setPicked(null); setTime(15);
    }, 1200);
  };

  const q = questions[idx];

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4 py-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-base font-bold text-theme-primary">🧠 Trivia</h2>
          <span className="text-purple-400 font-bold">{score}/{questions.length}</span>
        </div>

        {done ? (
          <div className="text-center bg-theme-card rounded-2xl p-6 border border-theme">
            <p className="text-4xl mb-2">{score >= 7 ? "🏆" : score >= 5 ? "😊" : "😔"}</p>
            <p className="text-xl font-bold text-theme-primary mb-1">Game Over!</p>
            <p className="text-theme-muted mb-2">Your Score: {score}/{questions.length}</p>
            {!isSolo && <p className="text-theme-muted mb-4">Opponent: {opScore}/{questions.length}</p>}
            {!isSolo && <p className={`text-lg font-bold mb-4 ${score > opScore ? "text-green-400" : score < opScore ? "text-red-400" : "text-yellow-400"}`}>
              {score > opScore ? "🎉 You Win!" : score < opScore ? "😔 You Lose!" : "🤝 Draw!"}
            </p>}
            <div className="flex gap-2 justify-center">
              <button onClick={() => { setIdx(0); setScore(0); setOpScore(0); setPicked(null); setDone(false); setTime(15); }} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold">Play Again</button>
              <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-xl text-sm">Exit</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between text-xs text-theme-muted mb-2">
              <span>Q {idx + 1}/{questions.length}</span>
              <span className={`font-bold ${timeLeft <= 5 ? "text-red-400" : "text-green-400"}`}>⏱ {timeLeft}s</span>
            </div>
            <div className="w-full bg-theme-input rounded-full h-1.5 mb-4">
              <div className="bg-purple-500 h-1.5 rounded-full transition-all" style={{ width: `${(timeLeft/15)*100}%` }}/>
            </div>
            <div className="bg-theme-card rounded-2xl p-4 border border-theme mb-4">
              <p className="text-base font-semibold text-theme-primary">{q.q}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {q.opts.map((opt, i) => (
                <button key={i} onClick={() => handleAnswer(i)} disabled={picked !== null}
                  className={`py-3 px-3 rounded-xl text-sm font-semibold transition border-2
                    ${picked === null ? "bg-theme-card border-theme hover:border-purple-500 text-theme-primary" :
                      i === q.ans ? "bg-green-500/20 border-green-500 text-green-400" :
                      picked === i ? "bg-red-500/20 border-red-500 text-red-400" :
                      "bg-theme-card border-theme text-theme-muted opacity-50"
                    }`}>
                  {opt}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
