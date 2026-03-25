import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlinePhotograph,
  HiOutlineVideoCamera,
  HiOutlinePlay,
  HiOutlinePlus,
  HiX,
} from "react-icons/hi";
import { useContent } from "../Context/ContentContext";
import { createPost, createStory, createReel } from "../services/api";

export default function CreatePopup({ openCreate, onClose }) {
  const navigate = useNavigate();
  const [activeBox, setActiveBox] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]); // array for multiple
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const { prependPost } = useContent();

  if (!openCreate) return null;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    // Generate previews
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
  };

  const removeFile = (idx) => {
    setSelectedFiles((p) => p.filter((_, i) => i !== idx));
    setPreviews((p) => p.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!selectedFiles.length && activeBox !== "live") return;
    setLoading(true);
    try {
      const formData = new FormData();
      if (activeBox === "post") {
        selectedFiles.forEach((f) => formData.append("media", f));
        formData.append("caption", caption);
        const res = await createPost(formData);
        // res.data may be array or single
        const posts = Array.isArray(res.data) ? res.data : [res.data];
        posts.forEach((p) => prependPost(p));
      } else if (activeBox === "story") {
        formData.append("media", selectedFiles[0]);
        await createStory(formData);
      } else if (activeBox === "reel") {
        formData.append("video", selectedFiles[0]);
        formData.append("caption", caption);
        await createReel(formData);
      }
      setSelectedFiles([]);
      setPreviews([]);
      setCaption("");
      setActiveBox(null);
    } catch (err) {
      console.error("Upload error:", err);
      alert(err?.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    post: "Create Post",
    story: "Create Story",
    reel: "Create Reel",
    live: "Start Live",
  };

  return (
    <>
      {/* Backdrop — click outside to close */}
      {!activeBox && <div className="fixed inset-0 z-40" onClick={onClose} />}

      <div className="fixed bottom-24 left-20 w-64 bg-black text-white shadow-2xl rounded-xl p-2 z-50 border border-gray-800">
        <p className="px-3 py-2 text-sm font-semibold text-gray-400">Create</p>

        {[
          { key: "post", icon: <HiOutlinePhotograph size={22} className="text-gray-300" />, label: "Post" },
          { key: "story", icon: <HiOutlineVideoCamera size={22} className="text-gray-300" />, label: "Story" },
          { key: "reel", icon: <HiOutlinePlay size={22} className="text-gray-300" />, label: "Reel" },
          { key: "live", icon: <HiOutlinePlus size={22} className="text-gray-300" />, label: "Live" },
        ].map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => {
              if (key === "live") {
                onClose();
                navigate("/live", { state: { mode: "host" } });
                return;
              }
              setActiveBox(key);
              setSelectedFiles([]);
              setPreviews([]);
              setCaption("");
            }}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            {icon}
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>

      {activeBox && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white w-96 rounded-xl p-6 relative">
            <button
              onClick={() => {
                setActiveBox(null);
                setSelectedFiles([]);
                setPreviews([]);
                setCaption("");
              }}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <HiX size={20} />
            </button>

            <h2 className="text-xl font-semibold mb-4 text-center">{titles[activeBox]}</h2>

            {activeBox !== "live" ? (
              <>
                <input
                  type="file"
                  accept={activeBox === "reel" ? "video/*" : "image/*,video/*"}
                  multiple={activeBox === "post"}
                  onChange={handleFileChange}
                  className="w-full border p-2 rounded mb-3 text-sm"
                />
                {/* Previews for multiple images */}
                {previews.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {previews.map((url, idx) => (
                      <div key={idx} className="relative">
                        <img src={url} className="w-16 h-16 object-cover rounded-lg border" alt="" />
                        <button
                          onClick={() => removeFile(idx)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {activeBox === "post" && previews.length > 0 && (
                  <p className="text-xs text-gray-400 mb-2">{previews.length} file{previews.length > 1 ? "s" : ""} selected</p>
                )}
                {activeBox !== "story" && (
                  <textarea
                    placeholder="Write a caption..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full border p-2 rounded text-sm resize-none"
                    rows={3}
                  />
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500 text-center mb-4">
                You'll go live instantly. Your followers will be notified.
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={(activeBox !== "live" && !selectedFiles.length) || loading}
              className="mt-4 w-full bg-black text-white py-2 rounded-lg disabled:opacity-40"
            >
              {loading ? "Uploading..." : activeBox === "live" ? "Go Live" : "Share"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
