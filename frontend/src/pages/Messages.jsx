import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import MessagesSidebar from "../components/MessagesSidebar";
import ChatWindow from "../components/ChatWindow";
import EmptyChat from "../components/EmptyChat";

export default function Messages() {
  const location = useLocation();
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    if (location.state?.chatUser) {
      setSelectedChat(location.state.chatUser);
    }
  }, [location.state]);

  const handleSelectChat = (user) => setSelectedChat(user);
  const handleBack       = ()     => setSelectedChat(null);

  return (
    <div className="messages-page-wrapper flex overflow-hidden bg-theme-primary">

      {/* ── LEFT: Conversation list ──────────────────────────────
          Mobile  : full screen, hidden when chat is open
          md+     : fixed 360px wide, always visible             */}
      <div
        className={`
          flex-shrink-0 flex flex-col
          w-full md:w-[360px] lg:w-[400px]
          border-r border-theme bg-theme-sidebar
          ${selectedChat ? "hidden md:flex" : "flex"}
        `}
      >
        <MessagesSidebar
          onSelectChat={handleSelectChat}
          selectedUserId={selectedChat?._id}
        />
      </div>

      {/* ── RIGHT: Chat window ───────────────────────────────────
          Mobile  : full screen, shown only when chat selected
          md+     : fills remaining space, always visible        */}
      <div
        className={`
          flex-1 min-w-0 flex flex-col
          ${selectedChat ? "flex" : "hidden md:flex"}
        `}
      >
        {selectedChat ? (
          <ChatWindow
            key={selectedChat._id}
            chat={selectedChat}
            onBack={handleBack}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyChat />
          </div>
        )}
      </div>

    </div>
  );
}
