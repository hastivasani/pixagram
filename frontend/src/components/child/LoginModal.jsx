import React from "react";
import { HiX } from "react-icons/hi";

export default function LoginModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

      {/* Modal Card */}
      <div className="bg-[#262626] w-[420px] rounded-2xl px-10 py-10 relative shadow-[0_10px_40px_rgba(0,0,0,0.6)]">

        {/* Close Button */}
        <HiX
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-300 text-2xl cursor-pointer hover:text-white"
        />

        {/* pixagram Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/pixagram_icon.png/512px-pixagram_icon.png"
            alt="pixagram"
            className="w-[110px] opacity-90"
          />
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4 w-full">

          <input
            type="text"
            placeholder="Phone number, username, or email"
            className="w-full bg-[#121212] border border-gray-700 text-gray-200 text-sm px-4 py-3 rounded-md outline-none focus:border-gray-500"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full bg-[#121212] border border-gray-700 text-gray-200 text-sm px-4 py-3 rounded-md outline-none focus:border-gray-500"
          />

          {/* Save login */}
          <label className="flex items-center gap-2 text-gray-300 text-sm mt-1">
            <input type="checkbox" className="accent-gray-400" />
            Save login info
          </label>

          {/* Login Button */}
          <button className="w-full bg-[#4f5bd5] hover:bg-[#405de6] text-white py-3 rounded-md font-semibold transition mt-2">
            Log in
          </button>

          {/* Forgot password */}
          <p className="text-center text-gray-400 text-sm mt-3 cursor-pointer hover:text-white">
            Forgot password?
          </p>

        </div>

      </div>

    </div>
  );
}