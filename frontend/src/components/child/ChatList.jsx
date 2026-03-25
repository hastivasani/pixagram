import { useState, useEffect } from "react";
import { getConversationList } from "../../services/api";
import { useAuth } from "../../Context/AuthContext";
import { getSocket } from "../../utils/socket";

export default function ChatList({ onSelectChat, selectedUserId }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      const res = await getConversationList();
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Real-time: when a new message arrives, refresh conversation list
  useEffect(() => {
    if (!user?._id) return;
    const socket = getSocket(user._id);
    const handleNew = () => fetchConversations();
    socket.on("newMessage", handleNew);
    return () => socket.off("newMessage", handleNew);
  }, [user?._id]);

  const timeAgo = (date) => {
    if (!date) return "";
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  };

  return (
    <div className="flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {loading && (
          <div className="space-y-1 px-2 pt-2">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex items-center gap-3 px-3 py-3 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-theme-secondary flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-theme-secondary rounded w-1/2" />
                  <div className="h-2 bg-theme-secondary rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-theme-secondary flex items-center justify-center text-3xl">
              💬
            </div>
            <p className="font-semibold text-theme-primary text-sm">No messages yet</p>
            <p className="text-theme-muted text-xs">Start a conversation with someone you follow.</p>
          </div>
        )}
        {conversations.map((conv) => {
          const other      = conv.user;
          const isSelected = selectedUserId === other._id;
          return (
            <div
              key={other._id}
              onClick={() => onSelectChat(other)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                isSelected ? "bg-theme-hover" : "hover:bg-theme-hover"
              }`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={other.avatar || `https://ui-avatars.com/api/?name=${other.username}`}
                  alt={other.username}
                  className="w-14 h-14 rounded-full object-cover"
                />
                {/* Online dot placeholder */}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm truncate ${conv.unread > 0 ? "font-bold text-theme-primary" : "font-semibold text-theme-primary"}`}>
                    {other.username}
                  </p>
                  {conv.lastMessage && (
                    <span className="text-[11px] text-theme-muted flex-shrink-0">
                      {timeAgo(conv.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                <p className={`text-xs truncate mt-0.5 ${conv.unread > 0 ? "font-semibold text-theme-primary" : "text-theme-muted"}`}>
                  {conv.lastMessage?.text
                    || (conv.lastMessage?.imageUrl ? "📷 Photo" : "")
                    || "No messages yet"}
                </p>
              </div>
              {conv.unread > 0 && (
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
