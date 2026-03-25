import { useState } from "react";
import NotesBar from "./child/NotesBar";
import ChatList from "./child/ChatList";
import { HiOutlinePencilAlt, HiChevronDown } from "react-icons/hi";
import { useAuth } from "../Context/AuthContext";

export default function MessagesSidebar({ onSelectChat, selectedUserId }) {
  const { user } = useAuth();
  const username = user?.username || "username";

  return (
    <div className="w-full flex flex-col h-full bg-theme-sidebar">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-theme flex-shrink-0">
        <div className="flex items-center gap-1">
          <h2 className="font-bold text-lg text-theme-primary">{username}</h2>
          <HiChevronDown size={18} className="text-theme-secondary" />
        </div>
        <button className="p-2 hover:bg-theme-hover rounded-full transition">
          <HiOutlinePencilAlt size={22} className="text-theme-primary" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3 flex-shrink-0">
        <input
          type="text"
          placeholder="Search"
          className="w-full bg-theme-input text-theme-primary rounded-xl px-4 py-2.5 outline-none placeholder:text-theme-muted text-sm border border-theme focus:border-gray-400 transition"
        />
      </div>

      {/* Notes bar */}
      <div className="flex-shrink-0">
        <NotesBar />
      </div>

      {/* Chat list — scrollable */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <ChatList onSelectChat={onSelectChat} selectedUserId={selectedUserId} />
      </div>

    </div>
  );
}
