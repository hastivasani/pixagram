import { useState, useEffect, useRef } from "react";
import { createLobby, joinLobbyByCode, getLeaderboard, getMyGameStats, updateScore } from "../services/api";
import { getSocket } from "../utils/socket";
import { useAuth } from "../Context/AuthContext";
import { FaGamepad, FaCopy, FaCheck, FaSignInAlt, FaTrophy, FaChartBar } from "react-icons/fa";

import TicTacToe         from "../components/games/TicTacToe";
import QuizGame          from "../components/games/QuizGame";
import SnakeGame         from "../components/games/SnakeGame";
import MemoryMatch       from "../components/games/MemoryMatch";
import WordGuess         from "../components/games/WordGuess";
import RockPaperScissors from "../components/games/RockPaperScissors";
import Game2048          from "../components/games/Game2048";
import FlappyBird        from "../components/games/FlappyBird";
import WhackAMole        from "../components/games/WhackAMole";
import ColorMatch        from "../components/games/ColorMatch";
import MathSprint        from "../components/games/MathSprint";
import ConnectFour       from "../components/games/ConnectFour";
import BlackjackGame     from "../components/games/BlackjackGame";
import CardMemory        from "../components/games/CardMemory";
import SudokuGame        from "../components/games/SudokuGame";
import Hangman           from "../components/games/Hangman";
import TypingSpeed       from "../components/games/TypingSpeed";
import NumberGuess       from "../components/games/NumberGuess";
import BrickBreaker      from "../components/games/BrickBreaker";
import SimonSays         from "../components/games/SimonSays";
import ReactionTime      from "../components/games/ReactionTime";
import DiceRoller        from "../components/games/DiceRoller";
import ChessGame         from "../components/games/ChessGame";
import CheckersGame      from "../components/games/CheckersGame";
import LudoGame          from "../components/games/LudoGame";
import SnakeLadder       from "../components/games/SnakeLadder";
import PokerGame         from "../components/games/PokerGame";
import UnoGame           from "../components/games/UnoGame";
import SolitaireGame     from "../components/games/SolitaireGame";
import TrumpCards        from "../components/games/TrumpCards";
import SpeedCards        from "../components/games/SpeedCards";
import DominoGame        from "../components/games/DominoGame";
import BattleshipGame    from "../components/games/BattleshipGame";
import MinesweeperGame   from "../components/games/MinesweeperGame";
import TriviaGame        from "../components/games/TriviaGame";
import WordScramble      from "../components/games/WordScramble";
import WordChain         from "../components/games/WordChain";
import PingPong          from "../components/games/PingPong";
import BubbleShooter     from "../components/games/BubbleShooter";
import AimTrainer        from "../components/games/AimTrainer";
import EndlessRunner     from "../components/games/EndlessRunner";
import CatchGame         from "../components/games/CatchGame";
import TowerDefense      from "../components/games/TowerDefense";
import PuzzleSlider      from "../components/games/PuzzleSlider";
import ColorBlast        from "../components/games/ColorBlast";
import EmojiMatch        from "../components/games/EmojiMatch";
import SpinWheel         from "../components/games/SpinWheel";

const GAMES = [
  { id:"tictactoe",    name:"Tic Tac Toe",        icon:"⭕", cat:"Board",  maxPlayers:2, desc:"Classic 3×3 strategy",           color:"from-blue-600 to-purple-600",   canSolo:true },
  { id:"chess",        name:"Chess",               icon:"♟", cat:"Board",  maxPlayers:2, desc:"Classic chess game",              color:"from-amber-700 to-yellow-600",  canSolo:true },
  { id:"checkers",     name:"Checkers",            icon:"🔴", cat:"Board",  maxPlayers:2, desc:"Jump & capture pieces",           color:"from-red-600 to-orange-600",    canSolo:true },
  { id:"connectfour",  name:"Connect Four",        icon:"🟡", cat:"Board",  maxPlayers:2, desc:"Drop discs, connect 4",           color:"from-blue-700 to-yellow-500",   canSolo:true },
  { id:"ludo",         name:"Ludo",                icon:"🎲", cat:"Board",  maxPlayers:2, desc:"Race your pieces home",           color:"from-green-600 to-teal-600",    canSolo:true },
  { id:"snakeladder",  name:"Snake & Ladder",      icon:"🐍", cat:"Board",  maxPlayers:2, desc:"Classic dice board game",         color:"from-emerald-600 to-green-700", canSolo:true },
  { id:"battleship",   name:"Battleship",          icon:"🚢", cat:"Board",  maxPlayers:2, desc:"Sink the enemy fleet",            color:"from-sky-700 to-blue-800",      canSolo:true },
  { id:"blackjack",    name:"Blackjack",           icon:"🃏", cat:"Cards",  maxPlayers:1, desc:"Beat dealer, get to 21",          color:"from-green-800 to-green-900",   canSolo:true },
  { id:"poker",        name:"Poker",               icon:"♠",  cat:"Cards",  maxPlayers:1, desc:"Blackjack with betting",          color:"from-green-700 to-emerald-800", canSolo:true },
  { id:"uno",          name:"UNO",                 icon:"🎴", cat:"Cards",  maxPlayers:2, desc:"Match colors & numbers",          color:"from-red-600 to-yellow-500",    canSolo:true },
  { id:"solitaire",    name:"Solitaire",           icon:"🂡", cat:"Cards",  maxPlayers:1, desc:"Classic card patience",           color:"from-green-600 to-teal-700",    canSolo:true },
  { id:"cardmemory",   name:"Card Memory",         icon:"🃏", cat:"Cards",  maxPlayers:1, desc:"Flip & match card pairs",         color:"from-pink-500 to-rose-600",     canSolo:true },
  { id:"trumpcards",   name:"Trump Cards",         icon:"🦸", cat:"Cards",  maxPlayers:2, desc:"Battle with hero stats",          color:"from-purple-600 to-indigo-700", canSolo:true },
  { id:"speedcards",   name:"Speed Cards",         icon:"⚡", cat:"Cards",  maxPlayers:1, desc:"Play cards faster than CPU",      color:"from-yellow-500 to-orange-600", canSolo:true },
  { id:"domino",       name:"Domino",              icon:"🁣", cat:"Cards",  maxPlayers:2, desc:"Match domino tiles",              color:"from-gray-600 to-gray-800",     canSolo:true },
  { id:"sudoku",       name:"Sudoku",              icon:"🔢", cat:"Puzzle", maxPlayers:1, desc:"Fill the 9×9 grid",               color:"from-indigo-600 to-blue-700",   canSolo:true },
  { id:"memory",       name:"Memory Match",        icon:"🧠", cat:"Puzzle", maxPlayers:1, desc:"Match the hidden pairs",          color:"from-pink-500 to-rose-600",     canSolo:true },
  { id:"2048",         name:"2048",                icon:"🔢", cat:"Puzzle", maxPlayers:1, desc:"Merge tiles to reach 2048",       color:"from-amber-500 to-yellow-600",  canSolo:true },
  { id:"minesweeper",  name:"Minesweeper",         icon:"💣", cat:"Puzzle", maxPlayers:1, desc:"Find all mines safely",           color:"from-gray-500 to-slate-700",    canSolo:true },
  { id:"puzzleslider", name:"Puzzle Slider",       icon:"🧩", cat:"Puzzle", maxPlayers:1, desc:"Slide tiles to solve",            color:"from-teal-500 to-cyan-600",     canSolo:true },
  { id:"emojimatch",   name:"Emoji Match",         icon:"😀", cat:"Puzzle", maxPlayers:1, desc:"Match emoji pairs in time",       color:"from-yellow-400 to-orange-500", canSolo:true },
  { id:"wordguess",    name:"Word Guess",          icon:"📝", cat:"Word",   maxPlayers:1, desc:"Wordle-style word puzzle",        color:"from-teal-500 to-cyan-600",     canSolo:true },
  { id:"hangman",      name:"Hangman",             icon:"🪢", cat:"Word",   maxPlayers:1, desc:"Guess the word letter by letter", color:"from-slate-600 to-gray-700",    canSolo:true },
  { id:"wordscramble", name:"Word Scramble",       icon:"🔤", cat:"Word",   maxPlayers:2, desc:"Unscramble words fast",           color:"from-violet-500 to-purple-600", canSolo:true },
  { id:"wordchain",    name:"Word Chain",          icon:"🔗", cat:"Word",   maxPlayers:2, desc:"Chain words by last letter",      color:"from-cyan-500 to-blue-600",     canSolo:true },
  { id:"typingspeed",  name:"Typing Speed",        icon:"⌨",  cat:"Word",   maxPlayers:1, desc:"Type as fast as you can",         color:"from-blue-500 to-indigo-600",   canSolo:true },
  { id:"quiz",         name:"Quiz Battle",         icon:"🧠", cat:"Quiz",   maxPlayers:2, desc:"10 questions, fastest wins",      color:"from-orange-500 to-pink-600",   canSolo:true },
  { id:"trivia",       name:"Trivia",              icon:"❓", cat:"Quiz",   maxPlayers:2, desc:"General knowledge quiz",          color:"from-blue-500 to-purple-600",   canSolo:true },
  { id:"mathsprint",   name:"Math Sprint",         icon:"⚡", cat:"Quiz",   maxPlayers:1, desc:"Solve math questions fast",       color:"from-red-500 to-pink-600",      canSolo:true },
  { id:"numberguess",  name:"Number Guess",        icon:"🔢", cat:"Quiz",   maxPlayers:1, desc:"Guess the secret number",         color:"from-green-500 to-teal-600",    canSolo:true },
  { id:"snake",        name:"Snake",               icon:"🐍", cat:"Arcade", maxPlayers:1, desc:"Eat food, don't hit walls",       color:"from-green-600 to-emerald-700", canSolo:true },
  { id:"flappy",       name:"Flappy Bird",         icon:"🐦", cat:"Arcade", maxPlayers:1, desc:"Tap to fly through pipes",        color:"from-sky-500 to-blue-600",      canSolo:true },
  { id:"brickbreaker", name:"Brick Breaker",       icon:"🧱", cat:"Arcade", maxPlayers:1, desc:"Break all the bricks",            color:"from-orange-500 to-red-600",    canSolo:true },
  { id:"whack",        name:"Whack-a-Mole",        icon:"🔨", cat:"Arcade", maxPlayers:1, desc:"Smash the moles in 30s",          color:"from-lime-500 to-green-600",    canSolo:true },
  { id:"pingpong",     name:"Ping Pong",           icon:"🏓", cat:"Arcade", maxPlayers:2, desc:"Classic table tennis",            color:"from-blue-500 to-cyan-600",     canSolo:true },
  { id:"endlessrunner",name:"Endless Runner",      icon:"🏃", cat:"Arcade", maxPlayers:1, desc:"Jump over obstacles",             color:"from-purple-600 to-indigo-700", canSolo:true },
  { id:"catchgame",    name:"Catch Game",          icon:"🧺", cat:"Arcade", maxPlayers:1, desc:"Catch fruits, avoid bombs",       color:"from-green-500 to-emerald-600", canSolo:true },
  { id:"bubbleshooter",name:"Bubble Shooter",      icon:"🫧", cat:"Arcade", maxPlayers:1, desc:"Match 3+ bubbles to pop",         color:"from-pink-500 to-purple-600",   canSolo:true },
  { id:"aimtrainer",   name:"Aim Trainer",         icon:"🎯", cat:"Arcade", maxPlayers:1, desc:"Click targets as fast as you can",color:"from-red-500 to-orange-600",    canSolo:true },
  { id:"towerdefense", name:"Tower Defense",       icon:"🏰", cat:"Arcade", maxPlayers:1, desc:"Build towers, stop enemies",      color:"from-amber-600 to-yellow-700",  canSolo:true },
  { id:"rps",          name:"Rock Paper Scissors", icon:"✊", cat:"Casual", maxPlayers:2, desc:"Beat the opponent",               color:"from-yellow-500 to-orange-600", canSolo:true },
  { id:"colormatch",   name:"Color Match",         icon:"🎨", cat:"Casual", maxPlayers:1, desc:"Match text color, not word",      color:"from-purple-500 to-violet-600", canSolo:true },
  { id:"simonSays",    name:"Simon Says",          icon:"🔵", cat:"Casual", maxPlayers:1, desc:"Repeat the color sequence",       color:"from-blue-500 to-indigo-600",   canSolo:true },
  { id:"reactiontime", name:"Reaction Time",       icon:"⚡", cat:"Casual", maxPlayers:2, desc:"Test your reflexes",              color:"from-yellow-400 to-red-500",    canSolo:true },
  { id:"diceroller",   name:"Dice Roller",         icon:"🎲", cat:"Casual", maxPlayers:2, desc:"Roll dice, highest wins",         color:"from-gray-500 to-slate-600",    canSolo:true },
  { id:"colorblast",   name:"Color Blast",         icon:"💥", cat:"Casual", maxPlayers:1, desc:"Blast matching color groups",     color:"from-red-500 to-pink-600",      canSolo:true },
  { id:"spinwheel",    name:"Spin Wheel",          icon:"🎡", cat:"Casual", maxPlayers:1, desc:"Spin for points!",                color:"from-purple-500 to-pink-600",   canSolo:true },
  { id:"trumpcards2",  name:"Hero Battle",         icon:"⚔️", cat:"Casual", maxPlayers:2, desc:"Trump card hero battle",          color:"from-indigo-600 to-purple-700", canSolo:true },
];

const CATEGORIES = ["All", "Board", "Cards", "Puzzle", "Word", "Quiz", "Arcade", "Casual"];
const RANK_COLORS = { Bronze:"text-amber-600", Silver:"text-gray-400", Gold:"text-yellow-400", Platinum:"text-cyan-400", Diamond:"text-blue-400" };

function LobbyCard({ lobby, selectedGame, currentUser, onStart, onLeave }) {
  const [copied, setCopied] = useState(false);
  const copyCode = () => { navigator.clipboard.writeText(lobby.inviteCode); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const isHost  = lobby.host?.toString() === currentUser._id?.toString() || lobby.host === currentUser._id;
  const canStart = isHost && lobby.players?.length >= 2;
  const waiting  = lobby.players?.length < lobby.maxPlayers;
  return (
    <div className="bg-theme-card border-2 border-purple-500 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-theme-primary">{selectedGame?.name} Lobby</p>
          <p className="text-xs text-theme-muted mt-0.5">{waiting ? `Waiting... (${lobby.players?.length}/${lobby.maxPlayers})` : "Ready!"}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${waiting ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}`}>
          {lobby.players?.length}/{lobby.maxPlayers}
        </span>
      </div>
      <div className="flex items-center gap-2 bg-theme-input rounded-xl px-3 py-2">
        <span className="text-xs text-theme-muted flex-1">Invite Code:</span>
        <span className="font-mono font-bold text-purple-400 text-sm tracking-widest">{lobby.inviteCode}</span>
        <button onClick={copyCode} className="text-theme-muted hover:text-purple-400 transition">
          {copied ? <FaCheck size={12} className="text-green-400" /> : <FaCopy size={12} />}
        </button>
      </div>
      <div className="space-y-2">
        {lobby.players?.map((p, i) => (
          <div key={p.user?._id || i} className="flex items-center gap-2">
            <img src={p.user?.avatar || `https://ui-avatars.com/api/?name=${p.user?.username||"?"}&background=random`} className="w-8 h-8 rounded-full object-cover" alt="" />
            <span className="text-sm text-theme-primary flex-1">{p.user?.username || "Unknown"}</span>
            {p.user?._id?.toString() === currentUser._id?.toString() && <span className="text-xs text-blue-400">You</span>}
            {lobby.host?.toString() === p.user?._id?.toString() && <span className="text-xs text-yellow-400">Host</span>}
          </div>
        ))}
        {Array.from({ length: (lobby.maxPlayers||2) - (lobby.players?.length||0) }).map((_,i) => (
          <div key={"e"+i} className="flex items-center gap-2 opacity-40">
            <div className="w-8 h-8 rounded-full bg-theme-input border-2 border-dashed border-theme" />
            <span className="text-sm text-theme-muted">Waiting...</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2 pt-1">
        {canStart
          ? <button onClick={onStart} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-sm font-bold transition">Start Game 🎮</button>
          : isHost
            ? <div className="flex-1 bg-theme-input text-theme-muted py-2.5 rounded-xl text-sm text-center">Waiting for opponent...</div>
            : <div className="flex-1 bg-theme-input text-theme-muted py-2.5 rounded-xl text-sm text-center">Waiting for host...</div>
        }
        <button onClick={onLeave} className="px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl text-sm font-semibold transition">Leave</button>
      </div>
    </div>
  );
}

export default function Gaming() {
  const { user } = useAuth();
  const [tab,           setTab]           = useState("play");
  const [lobby,         setLobby]         = useState(null);
  const [selectedGame,  setSelectedGame]  = useState(null);
  const [joinCode,      setJoinCode]      = useState("");
  const [joinError,     setJoinError]     = useState("");
  const [leaderboard,   setLeaderboard]   = useState([]);
  const [lbGame,        setLbGame]        = useState("tictactoe");
  const [myStats,       setMyStats]       = useState([]);
  const [activeGame,    setActiveGame]    = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [gameInvite,    setGameInvite]    = useState(null);
  const [catFilter,     setCatFilter]     = useState("All");
  const [search,        setSearch]        = useState("");
  const [tournament,    setTournament]    = useState(null);
  const [showTournament,setShowTournament]= useState(false);

  const socket = getSocket(user?._id);
  const lobbyRef      = useRef(lobby);
  const activeGameRef = useRef(activeGame);
  useEffect(() => { lobbyRef.current      = lobby;      }, [lobby]);
  useEffect(() => { activeGameRef.current = activeGame; }, [activeGame]);

  useEffect(() => { getMyGameStats().then(r => setMyStats(r.data || [])).catch(() => {}); }, []);

  useEffect(() => {
    if (!socket) return;
    const onLobbyUpdate     = (l) => setLobby(l);
    const onGameStateUpdate = ({ state }) => {
      const cur = lobbyRef.current;
      if (state?.started && cur) setActiveGame({ lobbyId: cur._id, game: cur.game, players: cur.players });
    };
    const onGameOver  = ({ winner }) => {
      const won = String(winner) === String(user?._id);
      updateScore({ game: activeGameRef.current?.game || lobbyRef.current?.game, won, xpGained: won ? 50 : 10 }).catch(() => {});
      setActiveGame(null);
    };
    const onGameInvite = (invite) => setGameInvite(invite);
    socket.on("lobbyUpdate",     onLobbyUpdate);
    socket.on("gameStateUpdate", onGameStateUpdate);
    socket.on("gameOver",        onGameOver);
    socket.on("gameInvite",      onGameInvite);
    return () => {
      socket.off("lobbyUpdate",     onLobbyUpdate);
      socket.off("gameStateUpdate", onGameStateUpdate);
      socket.off("gameOver",        onGameOver);
      socket.off("gameInvite",      onGameInvite);
    };
  }, [socket, user?._id]);

  const handleCreateLobby = async (game) => {
    setLoading(true); setJoinError("");
    try {
      const res = await createLobby({ game: game.id, maxPlayers: game.maxPlayers });
      setLobby(res.data); setSelectedGame(game);
      socket.emit("joinLobby", { lobbyId: res.data._id });
    } catch (err) { setJoinError(err.response?.data?.message || "Failed to create lobby"); }
    finally { setLoading(false); }
  };

  const handleJoinLobby = async (code) => {
    const c = (code || joinCode).trim().toUpperCase();
    if (!c) return;
    setLoading(true); setJoinError("");
    try {
      const res = await joinLobbyByCode(c);
      const data = res.data;
      setLobby(data); setSelectedGame(GAMES.find(g => g.id === data.game));
      socket.emit("joinLobby", { lobbyId: data._id });
      setJoinCode(""); setGameInvite(null);
    } catch (err) { setJoinError(err.response?.data?.message || "Invalid invite code"); }
    finally { setLoading(false); }
  };

  const handleStartGame = () => {
    if (!lobby) return;
    setActiveGame({ lobbyId: lobby._id, game: lobby.game, players: lobby.players });
    socket.emit("gameStateUpdate", { lobbyId: lobby._id, state: { started: true } });
  };

  const handleSoloPlay = (game) => {
    setActiveGame({ lobbyId: "solo_" + Date.now(), game: game.id, players: [{ user: { _id: user._id, username: user.username, avatar: user.avatar } }] });
  };

  const handleLeaveLobby = () => {
    if (lobby) socket.emit("leaveLobby", { lobbyId: lobby._id });
    setLobby(null); setSelectedGame(null); setJoinError("");
  };

  const handleGameEnd = () => { setActiveGame(null); setLobby(null); setSelectedGame(null); };

  const loadLeaderboard = async (game) => {
    try { const res = await getLeaderboard(game); setLeaderboard(res.data || []); setLbGame(game); } catch (_) {}
  };

  const startTournament = (gameId) => {
    const game = GAMES.find(g => g.id === gameId);
    if (!game) return;
    setTournament({
      game,
      bracket: [
        { round:1, match:1, player1: user?.username, player2:"Bot Alpha", winner:null },
        { round:1, match:2, player1:"Bot Beta",       player2:"Bot Gamma", winner:null },
        { round:2, match:1, player1:"TBD",            player2:"TBD",       winner:null },
      ],
      currentMatch: 0,
      score: 0,
    });
    setShowTournament(true);
  };

  const advanceTournament = (won) => {
    if (!tournament) return;
    const updated = { ...tournament, bracket: tournament.bracket.map(b => ({ ...b })) };
    updated.bracket[updated.currentMatch].winner = won ? user?.username : "Bot";
    updated.score += won ? 100 : 0;
    const next = updated.currentMatch + 1;
    if (next < updated.bracket.length) {
      updated.bracket[next].player1 = won ? user?.username : "Bot";
      updated.currentMatch = next;
      setTournament(updated);
    } else {
      setShowTournament(false);
      setTournament(null);
    }
  };

  // Daily challenge
  const dailyChallenge = user?.gamingStats?.dailyChallenge;
  const todayStr = new Date().toISOString().slice(0, 10);
  const challengeActive = dailyChallenge?.date === todayStr && !dailyChallenge?.completed;
  const challengeGame   = GAMES.find(g => g.id === dailyChallenge?.game);

  const gameProps = { onGameEnd: handleGameEnd, lobbyId: activeGame?.lobbyId, players: activeGame?.players, currentUser: user, socket };
  const gameMap = {
    tictactoe: <TicTacToe {...gameProps}/>, chess: <ChessGame {...gameProps}/>, checkers: <CheckersGame {...gameProps}/>,
    connectfour: <ConnectFour {...gameProps}/>, ludo: <LudoGame {...gameProps}/>, snakeladder: <SnakeLadder {...gameProps}/>,
    battleship: <BattleshipGame {...gameProps}/>, blackjack: <BlackjackGame {...gameProps}/>, poker: <PokerGame {...gameProps}/>,
    uno: <UnoGame {...gameProps}/>, solitaire: <SolitaireGame {...gameProps}/>, cardmemory: <CardMemory {...gameProps}/>,
    trumpcards: <TrumpCards {...gameProps}/>, trumpcards2: <TrumpCards {...gameProps}/>, speedcards: <SpeedCards {...gameProps}/>,
    domino: <DominoGame {...gameProps}/>, sudoku: <SudokuGame {...gameProps}/>, memory: <MemoryMatch {...gameProps}/>,
    "2048": <Game2048 {...gameProps}/>, minesweeper: <MinesweeperGame {...gameProps}/>, puzzleslider: <PuzzleSlider {...gameProps}/>,
    emojimatch: <EmojiMatch {...gameProps}/>, wordguess: <WordGuess {...gameProps}/>, hangman: <Hangman {...gameProps}/>,
    wordscramble: <WordScramble {...gameProps}/>, wordchain: <WordChain {...gameProps}/>, typingspeed: <TypingSpeed {...gameProps}/>,
    quiz: <QuizGame {...gameProps}/>, trivia: <TriviaGame {...gameProps}/>, mathsprint: <MathSprint {...gameProps}/>,
    numberguess: <NumberGuess {...gameProps}/>, snake: <SnakeGame {...gameProps}/>, flappy: <FlappyBird {...gameProps}/>,
    brickbreaker: <BrickBreaker {...gameProps}/>, whack: <WhackAMole {...gameProps}/>, pingpong: <PingPong {...gameProps}/>,
    endlessrunner: <EndlessRunner {...gameProps}/>, catchgame: <CatchGame {...gameProps}/>, bubbleshooter: <BubbleShooter {...gameProps}/>,
    aimtrainer: <AimTrainer {...gameProps}/>, towerdefense: <TowerDefense {...gameProps}/>, rps: <RockPaperScissors {...gameProps}/>,
    colormatch: <ColorMatch {...gameProps}/>, simonSays: <SimonSays {...gameProps}/>, reactiontime: <ReactionTime {...gameProps}/>,
    diceroller: <DiceRoller {...gameProps}/>, colorblast: <ColorBlast {...gameProps}/>, spinwheel: <SpinWheel {...gameProps}/>,
  };

  if (activeGame && gameMap[activeGame.game]) return <div className="md:pl-0">{gameMap[activeGame.game]}</div>;

  const filteredGames = GAMES.filter(g => {
    const matchCat    = catFilter === "All" || g.cat === catFilter;
    const matchSearch = !search || g.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-theme-primary pb-24 md:pb-6 px-4 pt-4 w-full">

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <FaGamepad className="text-purple-500 text-2xl" />
        <h1 className="text-xl font-bold text-theme-primary">Gaming</h1>
        <span className="ml-auto text-xs text-theme-muted bg-theme-input px-2 py-1 rounded-full">{GAMES.length} games</span>
      </div>

      {/* Daily Challenge Banner */}
      {challengeActive && challengeGame && (
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-yellow-400 uppercase tracking-wide mb-0.5">🔥 Daily Challenge</p>
              <p className="text-sm font-semibold text-theme-primary">{challengeGame.name} — Score {dailyChallenge.target}+</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-theme-input rounded-full overflow-hidden max-w-[120px]">
                  <div className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (dailyChallenge.progress / dailyChallenge.target) * 100)}%` }} />
                </div>
                <span className="text-xs text-theme-muted">{dailyChallenge.progress}/{dailyChallenge.target}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-yellow-400 font-bold">+{dailyChallenge.reward} XP</p>
              <button onClick={() => handleSoloPlay(challengeGame)}
                className="mt-1 bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-bold px-3 py-1.5 rounded-lg transition">
                Play
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tournament Modal */}
      {showTournament && tournament && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">🏆 {tournament.game.name} Tournament</h3>
              <button onClick={() => { setShowTournament(false); setTournament(null); }} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-2 mb-4">
              {tournament.bracket.map((match, i) => (
                <div key={i} className={`flex items-center justify-between p-2 rounded-lg text-sm ${i === tournament.currentMatch ? "bg-purple-600/30 border border-purple-500" : "bg-gray-800"}`}>
                  <span className="text-gray-300 text-xs">R{match.round} M{match.match}</span>
                  <span className={`text-xs ${match.player1 === user?.username ? "text-blue-400" : "text-gray-400"}`}>{match.player1}</span>
                  <span className="text-gray-500 text-xs">vs</span>
                  <span className="text-xs text-gray-400">{match.player2}</span>
                  {match.winner && <span className="text-xs text-green-400">✓ {match.winner}</span>}
                </div>
              ))}
            </div>
            <p className="text-center text-yellow-400 text-sm font-bold mb-3">Score: {tournament.score} pts</p>
            <div className="flex gap-2">
              <button onClick={() => { handleSoloPlay(tournament.game); setShowTournament(false); }}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl text-sm font-bold">
                Play Match
              </button>
              <button onClick={() => advanceTournament(true)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl text-sm font-bold">
                Win (Test)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game invite banner */}
      {gameInvite && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-4 mb-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-bold text-sm truncate">🎮 {gameInvite.fromName} invited you!</p>
            <p className="text-xs opacity-80 mt-0.5">Game: {gameInvite.game} · Code: <span className="font-mono font-bold">{gameInvite.inviteCode}</span></p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => handleJoinLobby(gameInvite.inviteCode)} className="bg-white text-purple-600 px-3 py-1.5 rounded-lg text-xs font-bold">Accept</button>
            <button onClick={() => setGameInvite(null)} className="text-white/70 text-xs px-2">✕</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4 bg-theme-input rounded-xl p-1">
        {[
          { id:"play",       label:"Play",       icon:"🎮" },
          { id:"challenges", label:"Challenges", icon:"🔥" },
          { id:"tournament", label:"Tournament", icon:"🏆" },
          { id:"leaderboard",label:"Board",      icon:"📊" },
          { id:"stats",      label:"Stats",      icon:"📈" },
        ].map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); if (t.id === "leaderboard") loadLeaderboard(lbGame); }}
            className={`flex-1 py-2 rounded-lg text-[10px] font-semibold transition flex items-center justify-center gap-0.5 ${tab === t.id ? "bg-theme-card text-theme-primary shadow-sm" : "text-theme-muted"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── PLAY TAB ── */}
      {tab === "play" && (
        <div className="space-y-4">
          {!lobby && (
            <div className="bg-theme-card rounded-2xl p-4 border border-theme">
              <p className="text-xs font-semibold text-theme-muted uppercase tracking-wide mb-2">Join with Code</p>
              <div className="flex gap-2">
                <input value={joinCode} onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleJoinLobby()}
                  placeholder="Enter invite code" maxLength={8}
                  className="flex-1 bg-theme-input text-theme-primary rounded-xl px-3 py-2.5 text-sm outline-none font-mono border border-theme focus:border-purple-500 transition" />
                <button onClick={() => handleJoinLobby()} disabled={loading || !joinCode.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50 transition">
                  <FaSignInAlt size={12} /> Join
                </button>
              </div>
              {joinError && <p className="text-xs text-red-400 mt-2">{joinError}</p>}
            </div>
          )}
          {lobby && selectedGame && (
            <LobbyCard lobby={lobby} selectedGame={selectedGame} currentUser={user} onStart={handleStartGame} onLeave={handleLeaveLobby} />
          )}
          {!lobby && (
            <>
              <div className="space-y-2">
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search games..."
                  className="w-full bg-theme-input text-theme-primary rounded-xl px-4 py-2.5 text-sm outline-none border border-theme focus:border-purple-500 transition" />
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setCatFilter(cat)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition ${catFilter === cat ? "bg-purple-600 text-white" : "bg-theme-input text-theme-secondary hover:bg-theme-hover"}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs font-semibold text-theme-muted uppercase tracking-wide">{filteredGames.length} Games</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filteredGames.map(game => (
                  <div key={game.id} className="bg-theme-card border border-theme rounded-2xl overflow-hidden flex flex-col hover:border-purple-500/50 transition-colors">
                    <div className={`bg-gradient-to-br ${game.color} p-3 flex flex-col items-center justify-center gap-1 min-h-[80px]`}>
                      <span className="text-3xl">{game.icon}</span>
                      <p className="font-bold text-white text-xs text-center leading-tight">{game.name}</p>
                      <span className="text-white/60 text-[9px] bg-white/10 px-1.5 py-0.5 rounded-full">{game.cat}</span>
                    </div>
                    <p className="text-[10px] text-theme-muted px-2 pt-1.5 text-center leading-tight">{game.desc}</p>
                    <div className="p-2 flex flex-col gap-1 flex-1 justify-end">
                      <button onClick={() => handleSoloPlay(game)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1">
                        ▶ Play Now
                      </button>
                      {game.maxPlayers > 1 && (
                        <button onClick={() => handleCreateLobby(game)} disabled={loading}
                          className="w-full bg-theme-input hover:bg-theme-hover text-theme-primary py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1 disabled:opacity-50 border border-theme">
                          👥 Multiplayer
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── CHALLENGES TAB ── */}
      {tab === "challenges" && (
        <div className="space-y-3">
          <div className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/30 rounded-2xl p-4">
            <p className="text-sm font-bold text-theme-primary mb-1">🔥 Daily Challenges</p>
            <p className="text-xs text-theme-muted mb-3">Complete challenges to earn bonus XP every day</p>
            {[
              { game:"snake",       target:50,  reward:30, label:"Score 50 in Snake" },
              { game:"quiz",        target:7,   reward:50, label:"Answer 7 Quiz questions correctly" },
              { game:"typingspeed", target:60,  reward:40, label:"Type 60 WPM in Typing Speed" },
              { game:"flappy",      target:10,  reward:35, label:"Pass 10 pipes in Flappy Bird" },
            ].map((ch, i) => {
              const g    = GAMES.find(x => x.id === ch.game);
              const done = dailyChallenge?.game === ch.game && dailyChallenge?.completed;
              return (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl mb-2 ${done ? "bg-green-500/10 border border-green-500/30" : "bg-theme-card border border-theme"}`}>
                  <span className="text-2xl">{g?.icon || "🎮"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-theme-primary">{ch.label}</p>
                    <p className="text-[10px] text-yellow-400 font-bold">+{ch.reward} XP</p>
                  </div>
                  {done
                    ? <span className="text-green-400 text-xs font-bold">✓ Done</span>
                    : <button onClick={() => g && handleSoloPlay(g)} className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition flex-shrink-0">Play</button>
                  }
                </div>
              );
            })}
          </div>
          <div className="bg-theme-card border border-theme rounded-2xl p-4">
            <p className="text-sm font-bold text-theme-primary mb-3">🏅 Weekly Challenges</p>
            {[
              { label:"Win 5 multiplayer games",  reward:200, progress:user?.gamingStats?.wins||0,        target:5   },
              { label:"Play 10 different games",   reward:150, progress:user?.gamingStats?.gamesPlayed||0, target:10  },
              { label:"Reach 500 total XP",        reward:100, progress:user?.gamingStats?.xp||0,          target:500 },
            ].map((ch, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-theme-primary font-medium">{ch.label}</span>
                  <span className="text-yellow-400 font-bold">+{ch.reward} XP</span>
                </div>
                <div className="h-2 bg-theme-input rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (ch.progress / ch.target) * 100)}%` }} />
                </div>
                <p className="text-[10px] text-theme-muted mt-0.5">{Math.min(ch.progress, ch.target)}/{ch.target}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TOURNAMENT TAB ── */}
      {tab === "tournament" && (
        <div className="space-y-3">
          <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-2xl p-4">
            <p className="text-sm font-bold text-theme-primary mb-1">🏆 Tournaments</p>
            <p className="text-xs text-theme-muted mb-3">Enter single-elimination brackets and compete for glory</p>
            <div className="grid grid-cols-2 gap-2">
              {GAMES.filter(g => g.canSolo).slice(0, 8).map(g => (
                <button key={g.id} onClick={() => startTournament(g.id)}
                  className={`bg-gradient-to-br ${g.color} p-3 rounded-xl flex flex-col items-center gap-1 hover:opacity-90 transition`}>
                  <span className="text-2xl">{g.icon}</span>
                  <span className="text-white text-xs font-bold text-center leading-tight">{g.name}</span>
                  <span className="text-white/70 text-[9px]">3-round bracket</span>
                </button>
              ))}
            </div>
          </div>
          <div className="bg-theme-card border border-theme rounded-2xl p-4">
            <p className="text-xs font-semibold text-theme-muted uppercase tracking-wide mb-2">How it works</p>
            <div className="space-y-2 text-xs text-theme-secondary">
              <p>1. Choose a game to enter the tournament</p>
              <p>2. Play through 3 rounds against opponents</p>
              <p>3. Win all 3 to claim the championship</p>
              <p>4. Earn bonus XP for each round won</p>
            </div>
          </div>
        </div>
      )}

      {/* ── LEADERBOARD TAB ── */}
      {tab === "leaderboard" && (
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {GAMES.filter(g => g.maxPlayers > 1).map(g => (
              <button key={g.id} onClick={() => loadLeaderboard(g.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${lbGame === g.id ? "bg-purple-600 text-white" : "bg-theme-input text-theme-secondary"}`}>
                {g.icon} {g.name}
              </button>
            ))}
          </div>
          {leaderboard.length === 0 ? (
            <div className="text-center py-12 text-theme-muted">
              <FaTrophy size={36} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">No entries yet. Play to get on the board!</p>
            </div>
          ) : leaderboard.map((entry, i) => (
            <div key={entry._id} className="flex items-center gap-3 bg-theme-card rounded-xl p-3 border border-theme">
              <span className={`w-8 text-center font-bold text-sm flex-shrink-0 ${i===0?"text-yellow-400":i===1?"text-gray-400":i===2?"text-amber-600":"text-theme-muted"}`}>
                {i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}
              </span>
              <img src={entry.user?.avatar||`https://ui-avatars.com/api/?name=${entry.user?.username||"?"}&background=random`} className="w-9 h-9 rounded-full object-cover flex-shrink-0" alt="" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-theme-primary truncate">{entry.user?.username}</p>
                <p className={`text-xs font-semibold ${RANK_COLORS[entry.rank]||"text-theme-muted"}`}>{entry.rank}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-purple-400">{entry.xp} XP</p>
                <p className="text-xs text-theme-muted">{entry.wins}W / {entry.losses}L</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── STATS TAB ── */}
      {tab === "stats" && (
        <div className="space-y-3">
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl p-4 border border-purple-500/30">
            <div className="flex items-center gap-3 mb-4">
              <img src={user?.avatar||`https://ui-avatars.com/api/?name=${user?.username}&background=random`} className="w-12 h-12 rounded-full object-cover" alt="" />
              <div>
                <p className="font-bold text-theme-primary">{user?.username}</p>
                <p className={`text-sm font-semibold ${RANK_COLORS[user?.gamingStats?.rank]||"text-amber-600"}`}>{user?.gamingStats?.rank||"Bronze"} Rank</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-theme-card/50 rounded-xl p-2"><p className="text-xl font-bold text-theme-primary">{user?.gamingStats?.gamesPlayed||0}</p><p className="text-xs text-theme-muted">Games</p></div>
              <div className="bg-theme-card/50 rounded-xl p-2"><p className="text-xl font-bold text-green-400">{user?.gamingStats?.wins||0}</p><p className="text-xs text-theme-muted">Wins</p></div>
              <div className="bg-theme-card/50 rounded-xl p-2"><p className="text-xl font-bold text-purple-400">{user?.gamingStats?.xp||0}</p><p className="text-xs text-theme-muted">XP</p></div>
            </div>
          </div>
          {myStats.length === 0 ? (
            <div className="text-center py-8 text-theme-muted">
              <FaChartBar size={32} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm">No game history yet. Start playing!</p>
            </div>
          ) : myStats.map(stat => {
            const game = GAMES.find(g => g.id === stat.game);
            return (
              <div key={stat._id} className="bg-theme-card rounded-xl p-3 border border-theme flex items-center gap-3">
                <span className="text-2xl">{game?.icon||"🎮"}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-theme-primary capitalize">{stat.game}</p>
                  <p className={`text-xs font-semibold ${RANK_COLORS[stat.rank]||"text-theme-muted"}`}>{stat.rank}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-purple-400">{stat.xp} XP</p>
                  <p className="text-xs text-theme-muted">{stat.wins}W / {stat.losses}L</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
