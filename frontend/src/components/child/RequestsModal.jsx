import React, { useState } from "react";
import { HiX } from "react-icons/hi";

const suggested = [
  {
    name: "Kajal C Pansheriya",
    username: "kajal_c_pansheriya",
    img: "https://i.pravatar.cc/100?img=32",
  },
  {
    name: "Milan Savaj",
    username: "savaj_963",
    img: "https://i.pravatar.cc/100?img=7",
  },
  {
    name: "priyansi ribadiya",
    username: "pivu_nik_001",
    img: "https://i.pravatar.cc/100?img=21",
  },
];

export default function RequestsModal({ onClose }) {

  const [selected, setSelected] = useState(null);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      <div className="bg-[#1f1f1f] w-[420px] rounded-2xl text-white overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="font-semibold">New message</h2>
          <HiX
            className="cursor-pointer text-xl"
            onClick={onClose}
          />
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-700">
          <input
            placeholder="Search..."
            className="w-full bg-transparent outline-none"
          />
        </div>

        {/* Suggested users */}
        <div className="max-h-[300px] overflow-y-auto">

          {suggested.map((user, index) => (

            <div
              key={index}
              onClick={() => setSelected(user)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-[#2a2a2a] cursor-pointer"
            >

              <img
                src={user.img}
                className="w-10 h-10 rounded-full"
              />

              <div className="flex-1">
                <p className="text-sm">{user.name}</p>
                <p className="text-xs text-gray-400">{user.username}</p>
              </div>

              <div
                className={`w-5 h-5 rounded-full border ${
                  selected?.username === user.username
                    ? "bg-blue-500 border-blue-500"
                    : "border-gray-400"
                }`}
              />

            </div>

          ))}

        </div>

        {/* Button */}
        <div className="p-4">
          <button className="w-full bg-indigo-600 py-2 rounded-lg">
            Chat
          </button>
        </div>

      </div>

    </div>
  );
}