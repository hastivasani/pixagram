import { useState, useEffect, useRef } from "react";

const QUESTIONS = [
  { q: "What is the capital of France?",       options: ["Berlin","Madrid","Paris","Rome"],        ans: 2 },
  { q: "2 + 2 × 2 = ?",                        options: ["8","6","4","16"],                        ans: 1 },
  { q: "Which planet is closest to the Sun?",  options: ["Venus","Earth","Mars","Mercury"],        ans: 3 },
  { q: "HTML stands for?",                     options: ["HyperText Markup Language","High Tech ML","HyperTransfer ML","None"], ans: 0 },
  { q: "Who invented the telephone?",          options: ["Edison","Bell","Tesla","Marconi"],       ans: 1 },
  { q: "What is 12 × 12?",                     options: ["124","144","134","154"],                 ans: 1 },
  { q: "Which language runs in a browser?",    options: ["Python","Java","JavaScript","C++"],      ans: 2 },
  { q: "How many sides does a hexagon have?",  options: ["5","6","7","8"],                         ans: 1 },
  { q: "What is the largest ocean?",           options: ["Atlantic","Indian","Arctic","Pacific"],  ans: 3 },
  { q: "CSS stands for?",                      options: ["Cascading Style Sheets","Computer Style Syntax","Creative Style System","None"], ans: 0 },
];

const TIME_PER_Q = 15; // seconds

export default function QuizGame({ lobbyId, players, currentUser, socket, onGameEnd }) {
  const [qIndex,    setQIndex]    = useState(0);
  const [selected,  setSelected]  = useState(null);
  const [scores,    setScores]    = useState({});        // userId -> score
  const [timeLeft,  setTimeLeft]  = useState(TIME_PER_Q);
  const [showResult,setShowResult]= useState(false);
  const [finished,  setFinished]  = useState(false);
  const timerRef = useRef(null);

  const myId       = currentUser._id;
  const question   = QUESTIONS[qIndex];
  const isSolo     = players.length < 2;
  const opponent   = players.find(p => (p.user?._id || p.user) !== myId);

  // Init scores
  useEffect(() => {
    const init = {};
    players.forEach(p => { init[p.user?._id || p.user] = 0; });
    setScores(init);
  }, []);

  // Timer
  useEffect(() => {
    if (finished || showResult) return;
    setTimeLeft(TIME_PER_Q);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [qIndex, finished]);

  // Socket: receive opponent answer
  useEffect(() => {
    if (!socket || isSolo) return;
    const onAction = ({ from, action, payload }) => {
      if (action === "quiz_answer") {
        setScores(prev => ({ ...prev, [from]: (prev[from] || 0) + (payload.correct ? 1 : 0) }));
      }
    };
    socket.on("gameAction", onAction);
    return () => socket.off("gameAction", onAction);
  }, [socket, isSolo]);

  const handleTimeout = () => {
    setSelected(-1); // -1 = timed out
    setShowResult(true);
    setTimeout(() => nextQuestion(), 1500);
  };

  const handleAnswer = (idx) => {
    if (selected !== null) return;
    clearInterval(timerRef.current);
    setSelected(idx);
    const correct = idx === question.ans;

    setScores(prev => ({ ...prev, [myId]: (prev[myId] || 0) + (correct ? 1 : 0) }));

    // Emit to opponent
    if (!isSolo && socket) {
      socket.emit("gameAction", {
        lobbyId,
        action: "quiz_answer",
        payload: { correct, qIndex },
      });
    }

    setShowResult(true);
    setTimeout(() => nextQuestion(), 1500);
  };

  const nextQuestion = () => {
    setSelected(null);
    setShowResult(false);
    if (qIndex + 1 >= QUESTIONS.length) {
      setFinished(true);
    } else {
      setQIndex(q => q + 1);
    }
  };

  const myScore  = scores[myId] || 0;
  const oppScore = opponent ? (scores[opponent.user?._id || opponent.user] || 0) : 0;

  if (finished) {
    const won = isSolo ? true : myScore > oppScore;
    const draw = !isSolo && myScore === oppScore;
    return (
      <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm bg-theme-card rounded-2xl p-6 border border-theme text-center">
          <div className="text-5xl mb-3">{draw ? "🤝" : won ? "🏆" : "😔"}</div>
          <h2 className="text-xl font-bold text-theme-primary mb-1">
            {draw ? "It's a Draw!" : won ? "You Win!" : "You Lose!"}
          </h2>
          <p className="text-theme-muted text-sm mb-4">
            Your score: {myScore}/{QUESTIONS.length}
            {!isSolo && ` · Opponent: ${oppScore}/${QUESTIONS.length}`}
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => { setQIndex(0); setScores({}); setFinished(false); setSelected(null); setShowResult(false); }}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >Play Again</button>
            <button onClick={onGameEnd} className="bg-theme-input text-theme-secondary px-4 py-2 rounded-lg text-sm font-semibold">
              Exit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-primary flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={onGameEnd} className="text-theme-muted text-sm">← Back</button>
          <h2 className="text-base font-bold text-theme-primary">Quiz Battle</h2>
          <span className="text-sm text-purple-400 font-mono">{timeLeft}s</span>
        </div>

        {/* Score bar */}
        <div className="flex items-center justify-between bg-theme-card rounded-xl p-3 border border-theme mb-4">
          <div className="text-center">
            <p className="text-xs text-theme-muted truncate max-w-[80px]">{currentUser.username}</p>
            <p className="text-lg font-bold text-blue-400">{myScore}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-theme-muted">{qIndex + 1}/{QUESTIONS.length}</p>
            <div className="w-16 h-1.5 bg-theme-input rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-purple-500 transition-all" style={{ width: `${(timeLeft / TIME_PER_Q) * 100}%` }} />
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-theme-muted truncate max-w-[80px]">{opponent?.user?.username || "Solo"}</p>
            <p className="text-lg font-bold text-orange-400">{oppScore}</p>
          </div>
        </div>

        {/* Question */}
        <div className="bg-theme-card rounded-2xl p-5 border border-theme mb-4">
          <p className="text-sm font-semibold text-theme-primary text-center leading-relaxed">{question.q}</p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-2">
          {question.options.map((opt, i) => {
            let style = "bg-theme-card border-theme text-theme-primary hover:border-purple-500";
            if (showResult) {
              if (i === question.ans) style = "bg-green-600/20 border-green-500 text-green-400";
              else if (i === selected) style = "bg-red-600/20 border-red-500 text-red-400";
              else style = "bg-theme-card border-theme text-theme-muted opacity-50";
            }
            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={selected !== null}
                className={`border-2 rounded-xl px-3 py-3 text-sm font-medium transition-all text-left ${style}`}
              >
                <span className="text-xs opacity-60 mr-1">{["A","B","C","D"][i]}.</span> {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
