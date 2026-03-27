import { useState, useRef } from "react";
import { FaImage, FaTimes } from "react-icons/fa";
import { createPost } from "../../services/api";
import { getAvatar } from "../../utils/timeAgo";

export default function ComposeBox({ user, onTweet }) {
  const [text, setText]       = useState("");
  const [file, setFile]       = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const fileRef = useRef(null);

  const handleSubmit = async () => {
    if (!text.trim() && !file) return;
    if (text.length > 280) return;
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      if (file) fd.append("media", file);
      else fd.append("type", "text");
      fd.append("caption", text.trim());
      fd.append("source", "twitter");
      const res = await createPost(fd);
      const post = Array.isArray(res.data) ? res.data[0] : res.data;
      onTweet(post);
      setText(""); setFile(null); setPreview(null);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to post. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const pickFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const clearFile = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  return (
    <div className="border-b border-theme px-4 py-3 flex gap-3">
      <img src={getAvatar(user)} className="w-10 h-10 rounded-full object-cover flex-shrink-0" alt="" />
      <div className="flex-1 min-w-0">
        <textarea
          value={text}
          onChange={e => { setText(e.target.value); setError(""); }}
          placeholder="What's happening?"
          rows={text.length > 80 ? 3 : 2}
          className="w-full bg-transparent text-theme-primary placeholder:text-theme-muted text-base outline-none resize-none"
        />
        {preview && (
          <div className="relative mt-2 inline-block">
            <img src={preview} className="max-h-48 rounded-2xl object-cover border border-theme" alt="" />
            <button onClick={clearFile}
              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1">
              <FaTimes size={10} />
            </button>
          </div>
        )}
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-theme">
          <div className="flex gap-3">
            <button onClick={() => fileRef.current?.click()} className="text-blue-400 hover:text-blue-300 transition">
              <FaImage size={16} />
            </button>
            <input ref={fileRef} type="file" hidden accept="image/*,video/*" onChange={pickFile} />
          </div>
          <div className="flex items-center gap-3">
            {text.length > 0 && (
              <span className={`text-xs font-semibold ${text.length > 260 ? "text-red-400" : "text-theme-muted"}`}>
                {280 - text.length}
              </span>
            )}
            <button
              onClick={handleSubmit}
              disabled={loading || (!text.trim() && !file) || text.length > 280}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white text-sm font-bold px-4 py-1.5 rounded-full transition"
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
