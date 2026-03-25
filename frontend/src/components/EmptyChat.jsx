import React from "react";
import { HiPaperAirplane } from "react-icons/hi";

export default function EmptyChat() {
  return (
    <div className="text-center">
      <div className="border border-theme rounded-full p-6 inline-block mb-4">
        <HiPaperAirplane className="text-3xl text-theme-secondary" />
      </div>
      <h2 className="text-xl font-semibold mb-2 text-theme-primary">Your messages</h2>
      <p className="text-theme-muted mb-4">Send a message to start a chat.</p>
      <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
        Send message
      </button>
    </div>
  );
}
