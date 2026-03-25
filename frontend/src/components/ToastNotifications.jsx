import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { getSocket } from "../utils/socket";
import {
  HiHeart, HiChat, HiUserAdd, HiPhone, HiVideoCamera,
  HiBell, HiX,
} from "react-icons/hi";

let toastId = 0;

const ICONS = {
  like:           { icon: HiHeart,       color: "text-red-500",    bg: "bg-red-50 dark:bg-red-900/30" },
  comment:        { icon: HiChat,        color: "text-blue-500",   bg: "bg-blue-50 dark:bg-blue-900/30" },
  follow:         { icon: HiUserAdd,     color: "text-green-500",  bg: "bg-green-50 dark:bg-green-900/30" },
  follow_request: { icon: HiUserAdd,     color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/30" },
  message:        { icon: HiChat,        color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/30" },
  call_audio:     { icon: HiPhone,       color: "text-green-500",  bg: "bg-green-50 dark:bg-green-900/30" },
  call_video:     { icon: HiVideoCamera, color: "text-blue-500",   bg: "bg-blue-50 dark:bg-blue-900/30" },
  live:           { icon: HiVideoCamera, color: "text-red-500",    bg: "bg-red-50 dark:bg-red-900/30" },
  default:        { icon: HiBell,        color: "text-gray-500",   bg: "bg-gray-50 dark:bg-gray-800" },
};

function getConfig(type) {
  return ICONS[type] || ICONS.default;
}

function getText(type, sender) {
  const name = sender?.username || sender?.name || "Someone";
  switch (type) {
    case "like":           return `${name} liked your post`;
    case "comment":        return `${name} commented on your post`;
    case "follow":         return `${name} started following you`;
    case "follow_request": return `${name} sent you a follow request`;
    case "follow_accepted":return `${name} accepted your follow request`;
    case "message":        return `${name} sent you a message`;
    case "call_audio":     return `${name} is calling you`;
    case "live":           return `${name} is live now! Tap to watch`;
    default:               return `New notification from ${name}`;
  }
}

function Toast({ toast, onClose }) {
  const navigate = useNavigate();
  const { icon: Icon, color, bg } = getConfig(toast.type);

  useEffect(() => {
    const t = setTimeout(() => onClose(toast.id), 5000);
    return () => clearTimeout(t);
  }, []);

  const handleClick = () => {
    onClose(toast.id);
    if (toast.type === "message") navigate("/messages");
    else if (toast.type === "follow_request") navigate("/notifications");
    else if (toast.type === "like" || toast.type === "comment") navigate("/notifications");
    else if (toast.type === "follow" || toast.type === "follow_accepted") navigate("/notifications");
    else if (toast.type === "live" && toast.hostId) navigate("/live", { state: { mode: "viewer", hostId: toast.hostId, hostName: toast.sender?.username, hostAvatar: toast.sender?.avatar } });
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-3 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl px-4 py-3 cursor-pointer hover:shadow-2xl transition-all duration-300 animate-slide-in"
    >
      {/* Avatar or icon */}
      <div className={"w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 " + bg}>
        {toast.sender?.avatar ? (
          <img src={toast.sender.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
        ) : (
          <Icon size={20} className={color} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
          {toast.sender?.username || "Notification"}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{toast.text}</p>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onClose(toast.id); }}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0"
      >
        <HiX size={16} />
      </button>
    </div>
  );
}

export default function ToastNotifications() {
  const { user } = useAuth();
  const [toasts, setToasts] = useState([]);

  const addToast = (type, sender, extra = {}) => {
    const id = ++toastId;
    setToasts(p => [...p, { id, type, sender, text: getText(type, sender), ...extra }]);
  };

  const removeToast = (id) => setToasts(p => p.filter(t => t.id !== id));

  useEffect(() => {
    if (!user?._id) return;
    const socket = getSocket(user._id);

    const handlers = {
      newNotification: (data) => {
        addToast(data.type, data.sender);
      },
      newMessage: (data) => {
        // Don't show if already on messages page
        if (window.location.pathname === "/messages") return;
        addToast("message", data.sender || { username: "New message" });
      },
      incomingCall: (data) => {
        const callType = data.callType === "video" ? "call_video" : "call_audio";
        addToast(callType, { username: data.callerName, avatar: data.callerAvatar });
      },
      liveStarted: (data) => {
        addToast("live", { username: data.hostName, avatar: data.hostAvatar }, { hostId: data.hostId });
      },
    };

    Object.entries(handlers).forEach(([event, handler]) => socket.on(event, handler));
    return () => Object.entries(handlers).forEach(([event, handler]) => socket.off(event, handler));
  }, [user?._id]);

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onClose={removeToast} />
        </div>
      ))}
    </div>
  );
}
