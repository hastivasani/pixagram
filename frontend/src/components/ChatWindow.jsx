import { useState, useRef, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
const EmojiPicker = lazy(() => import("emoji-picker-react"));
import {
  HiEmojiHappy, HiPhotograph, HiPaperAirplane,
  HiPhone, HiVideoCamera, HiInformationCircle, HiArrowLeft,
  HiReply, HiTrash, HiClock,
} from "react-icons/hi";
import { FaMicrophone, FaStop } from "react-icons/fa";
import { getConversation, sendMessage, reactToMessage, deleteMessage } from "../services/api";
import { useAuth } from "../Context/AuthContext";
import { getSocket } from "../utils/socket";
import CallModal from "./CallModal";

export default function ChatWindow({ chat, onBack }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [sending, setSending] = useState(false);
  const [callState, setCallState] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [isDisappearing, setIsDisappearing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const fileRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const typingTimerRef = useRef(null);

  const av = useCallback((u) =>
    u?.avatar || `https://ui-avatars.com/api/?name=${u?.username || "U"}`, []);

  const chatAvatar = useMemo(() => av(chat), [chat?.avatar, chat?.username]);

  useEffect(() => {
    if (!chat || !chat._id) return;
    setMessages([]);
    getConversation(chat._id)
      .then((r) => setMessages(r.data))
      .catch(console.error);
  }, [chat && chat._id]);

  useEffect(() => {
    if (!user || !user._id) return;
    const socket = getSocket(user._id);
    const onMsg = (msg) => {
      const sid = (msg.sender && msg.sender._id) || msg.sender;
      const chatId = chat && chat._id;
      if (sid && chatId && sid.toString() === chatId.toString()) {
        setMessages((p) => [...p, msg]);
      }
    };
    const onReaction = ({ msgId, reactions }) => {
      setMessages(prev => prev.map(m => m._id === msgId ? { ...m, reactions } : m));
    };
    const onDeleted = ({ msgId }) => {
      setMessages(prev => prev.map(m => m._id === msgId ? { ...m, isDeleted: true, text: "" } : m));
    };
    const onTyping = ({ from }) => {
      if (from === chat._id) { setTypingUser(chat.username); clearTimeout(typingTimerRef.current); typingTimerRef.current = setTimeout(() => setTypingUser(null), 2000); }
    };
    socket.on("newMessage", onMsg);
    socket.on("messageReaction", onReaction);
    socket.on("messageDeleted", onDeleted);
    socket.on("typing", onTyping);
    return () => {
      socket.off("newMessage", onMsg);
      socket.off("messageReaction", onReaction);
      socket.off("messageDeleted", onDeleted);
      socket.off("typing", onTyping);
    };
  }, [user && user._id, chat && chat._id]);

  const prevMsgCount = useRef(0);
  useEffect(() => {
    if (messages.length > prevMsgCount.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: prevMsgCount.current === 0 ? "instant" : "smooth" });
    }
    prevMsgCount.current = messages.length;
  }, [messages.length]);

  const handleTyping = () => {
    const socket = getSocket(user._id);
    socket.emit("typing", { to: chat._id });
  };

  const handleSend = async () => {
    if (!text.trim() && !imageFile) return;
    setSending(true);
    try {
      const fd = new FormData();
      fd.append("receiverId", chat._id);
      if (text.trim()) fd.append("text", text.trim());
      if (imageFile) fd.append("media", imageFile);
      if (replyTo) fd.append("replyTo", replyTo._id);
      if (isDisappearing) { fd.append("isDisappearing", "true"); fd.append("disappearAfter", "30"); }
      const res = await sendMessage(fd);
      setMessages((p) => [...p, res.data]);
      setText("");
      setImageFile(null);
      setImagePreview(null);
      setReplyTo(null);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleVoiceRecord = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([blob], "voice.webm", { type: "audio/webm" });
        const fd = new FormData();
        fd.append("receiverId", chat._id);
        fd.append("type", "voice");
        fd.append("media", file);
        try {
          const res = await sendMessage(fd);
          setMessages(p => [...p, res.data]);
        } catch (_) {}
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setIsRecording(true);
    } catch (_) {
      alert("Microphone access required");
    }
  };

  const handleReact = async (msgId, emoji) => {
    try {
      await reactToMessage(msgId, emoji);
    } catch (_) {}
  };

  const handleDelete = async (msgId) => {
    try {
      await deleteMessage(msgId);
      setMessages(prev => prev.map(m => m._id === msgId ? { ...m, isDeleted: true, text: "" } : m));
    } catch (_) {}
  };

  const pickImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const r = new FileReader();
    r.onloadend = () => setImagePreview(r.result);
    r.readAsDataURL(file);
  };

  const isMe = (msg) => {
    const sid = (msg.sender && msg.sender._id) || msg.sender;
    return sid && user && sid.toString() === user._id.toString();
  };

  const fmt = (d) =>
    new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col h-full bg-theme-primary relative">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-theme bg-theme-card flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Back button — mobile only */}
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-1.5 -ml-1 text-theme-primary hover:text-theme-secondary transition flex-shrink-0"
            >
              <HiArrowLeft size={22} />
            </button>
          )}
          <img
            src={chatAvatar}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            alt=""
            loading="lazy"
            decoding="async"
          />
          <div className="min-w-0">
            <p className="font-semibold text-theme-primary text-sm truncate">
              {chat && chat.username}
            </p>
            <p className="text-xs text-theme-muted truncate">
              {(chat && chat.name) || "Active now"}
            </p>
          </div>
        </div>
        <div className="flex gap-4 text-xl text-theme-secondary flex-shrink-0">
          <button
            onClick={() => setCallState({ type: "audio", mode: "caller" })}
            className="hover:text-theme-primary transition"
            title="Audio call"
          >
            <HiPhone />
          </button>
          <button
            onClick={() => setCallState({ type: "video", mode: "caller" })}
            className="hover:text-theme-primary transition"
            title="Video call"
          >
            <HiVideoCamera />
          </button>
          <HiInformationCircle className="cursor-pointer hover:text-theme-primary transition" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide bg-theme-primary">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-theme-muted">
            <img
              src={chatAvatar}
              className="w-16 h-16 rounded-full object-cover"
              alt=""
              loading="lazy"
            />
            <p className="font-semibold text-theme-primary">
              {chat && chat.username}
            </p>
            <p className="text-sm">No messages yet. Say hi!</p>
          </div>
        )}

        {messages.map((msg) => {
          const mine = isMe(msg);
          return (
            <div
              key={msg._id}
              className={"flex items-end gap-2 group " + (mine ? "justify-end" : "justify-start")}
            >
              {!mine && (
                <img
                  src={chatAvatar}
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                  alt=""
                  loading="lazy"
                />
              )}
              <div className={"max-w-[65%] flex flex-col " + (mine ? "items-end" : "items-start")}>
                {/* Reply preview */}
                {msg.replyTo && (
                  <div className="text-xs text-theme-muted bg-theme-input px-2 py-1 rounded-lg mb-1 border-l-2 border-blue-400 max-w-full truncate">
                    {msg.replyTo.sender?.username}: {msg.replyTo.text || "📎 Media"}
                  </div>
                )}
                {msg.isDeleted ? (
                  <div className="px-4 py-2 rounded-2xl text-sm italic text-theme-muted bg-theme-card border border-theme">
                    Message deleted
                  </div>
                ) : (
                  <>
                    {msg.isDisappearing && (
                      <span className="text-[9px] text-orange-400 mb-0.5 flex items-center gap-0.5">
                        <HiClock size={9} /> Disappearing
                      </span>
                    )}
                    {msg.text && (
                      <div
                        className={
                          "px-4 py-2 rounded-2xl text-sm " +
                          (mine
                            ? "bg-blue-500 text-white rounded-br-sm"
                            : "bg-theme-card text-theme-primary border border-theme rounded-bl-sm")
                        }
                      >
                        {msg.text}
                      </div>
                    )}
                    {(msg.imageUrl || msg.mediaUrl) && msg.type !== "voice" && (
                      <img
                        src={msg.imageUrl || msg.mediaUrl}
                        className="mt-1 rounded-xl max-w-[200px]"
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                    {msg.type === "voice" && msg.mediaUrl && (
                      <audio controls src={msg.mediaUrl} className="max-w-[200px] mt-1" />
                    )}
                  </>
                )}
                {/* Reactions */}
                {msg.reactions?.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {msg.reactions.map((r, i) => (
                      <span key={i} className="text-sm bg-theme-card rounded-full px-1 border border-theme">{r.emoji}</span>
                    ))}
                  </div>
                )}
                <span className="text-[10px] text-theme-muted mt-0.5">
                  {fmt(msg.createdAt)}
                </span>
              </div>
              {/* Message actions */}
              {!msg.isDeleted && (
                <div className={`hidden group-hover:flex items-center gap-1 ${mine ? "order-first" : "order-last"}`}>
                  <button onClick={() => setReplyTo(msg)} className="text-theme-muted hover:text-blue-400 p-1">
                    <HiReply size={14} />
                  </button>
                  <button onClick={() => handleReact(msg._id, "❤️")} className="text-theme-muted hover:text-red-400 p-1 text-xs">❤️</button>
                  {mine && (
                    <button onClick={() => handleDelete(msg._id)} className="text-theme-muted hover:text-red-400 p-1">
                      <HiTrash size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji picker */}
      {showEmoji && (
        <div className="absolute bottom-20 left-4 z-10">
          <Suspense fallback={<div className="w-[300px] h-[350px] bg-theme-card rounded-xl animate-pulse" />}>
            <EmojiPicker
              onEmojiClick={(e) => { setText((p) => p + e.emoji); setShowEmoji(false); }}
              height={350}
            />
          </Suspense>
        </div>
      )}

      {/* Typing indicator */}
      {typingUser && (
        <div className="px-4 pb-1">
          <span className="text-xs text-theme-muted italic">{typingUser} is typing...</span>
        </div>
      )}

      {/* Reply preview */}
      {replyTo && (
        <div className="px-4 py-2 bg-theme-input border-t border-theme flex items-center justify-between">
          <div className="text-xs text-theme-muted">
            <span className="text-blue-400 font-semibold">Replying to {replyTo.sender?.username || "you"}: </span>
            {replyTo.text || "📎 Media"}
          </div>
          <button onClick={() => setReplyTo(null)} className="text-theme-muted text-xs ml-2">✕</button>
        </div>
      )}

      {/* Image preview */}
      {imagePreview && (
        <div className="px-4 pb-2 bg-theme-primary flex items-center gap-2">
          <img src={imagePreview} className="w-16 h-16 rounded-lg object-cover" alt="" />
          <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="text-xs text-red-400 hover:text-red-600">
            Remove
          </button>
        </div>
      )}

      {/* Input bar */}
      <div className="p-3 border-t border-theme bg-theme-card flex-shrink-0">
        {/* Disappearing toggle */}
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => setIsDisappearing(p => !p)}
            className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition ${isDisappearing ? "bg-orange-500/20 text-orange-400" : "text-theme-muted"}`}
          >
            <HiClock size={11} /> {isDisappearing ? "Disappearing ON" : "Disappearing"}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowEmoji((p) => !p)} className="text-theme-secondary hover:text-blue-500 flex-shrink-0">
            <HiEmojiHappy className="text-2xl" />
          </button>
          <input
            value={text}
            onChange={(e) => { setText(e.target.value); handleTyping(); }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) handleSend(); }}
            placeholder={"Message " + ((chat && chat.username) || "") + "..."}
            className="flex-1 bg-theme-input text-theme-primary border border-theme rounded-full px-4 py-2 outline-none placeholder:text-theme-muted text-sm"
          />
          <button onClick={() => fileRef.current.click()} className="text-theme-secondary hover:text-blue-500 flex-shrink-0">
            <HiPhotograph className="text-xl" />
          </button>
          <input type="file" ref={fileRef} hidden accept="image/*,video/*" onChange={pickImage} />
          <button
            onClick={handleVoiceRecord}
            className={`flex-shrink-0 p-2 rounded-full transition ${isRecording ? "bg-red-500 text-white animate-pulse" : "text-theme-secondary hover:text-blue-500"}`}
          >
            {isRecording ? <FaStop size={14} /> : <FaMicrophone size={14} />}
          </button>
          <button
            onClick={handleSend}
            disabled={sending || (!text.trim() && !imageFile)}
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 disabled:opacity-40 flex-shrink-0 transition"
          >
            <HiPaperAirplane className="rotate-90" />
          </button>
        </div>
      </div>

      {/* Outgoing call modal */}
      {callState && (
        <CallModal
          callType={callState.type}
          mode={callState.mode}
          remoteUser={chat}
          myUser={user}
          incomingSignal={callState.incomingSignal}
          onClose={() => setCallState(null)}
        />
      )}
    </div>
  );
}
