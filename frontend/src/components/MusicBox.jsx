import React, { useState, useRef, useEffect } from "react";
import { HiX, HiPlay, HiPause } from "react-icons/hi";

const musicList = [
  { title: "Chill Beat", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { title: "Vlog Music", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { title: "Travel Beat", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
];

export default function MusicBox({ onClose, onSelect }) {
  const audioRef = useRef(null);
  const [playingIndex, setPlayingIndex] = useState(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const togglePlay = async (index, url) => {
    if (!audioRef.current) return;

    if (playingIndex === index) {
      audioRef.current.pause();
      setPlayingIndex(null);
    } else {
      try {
        // Stop current audio if any
        if (playingIndex !== null) {
          audioRef.current.pause();
        }

        // Set new source and load (optional but good practice)
        audioRef.current.src = url;
        audioRef.current.load(); // Ensures fresh load

        // Attempt to play
        await audioRef.current.play();
        setPlayingIndex(index);
      } catch (error) {
        console.error("Playback failed:", error);
        // Optionally notify user
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end z-50">
      <div className="w-full bg-zinc-900 rounded-t-3xl p-5 max-h-[60vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-xl font-semibold">Select Music</h2>
          <button onClick={onClose} className="text-white text-2xl">
            <HiX />
          </button>
        </div>

        {/* Music List */}
        {musicList.map((music, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-3 border-b border-zinc-700"
          >
            <span className="text-white">{music.title}</span>
            <div className="flex gap-3">
              <button
                onClick={() => togglePlay(index, music.url)}
                className="text-white text-xl"
              >
                {playingIndex === index ? <HiPause /> : <HiPlay />}
              </button>
              <button
                onClick={() => onSelect(music)}
                className="bg-blue-500 px-3 py-1 rounded text-white"
              >
                Use
              </button>
            </div>
          </div>
        ))}

        {/* Audio element with preload and error event */}
        <audio
          ref={audioRef}
          preload="auto"
          onError={(e) => console.error("Audio error:", e)}
        />
      </div>
    </div>
  );
}