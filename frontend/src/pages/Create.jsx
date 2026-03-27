import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlinePhotograph, HiOutlineVideoCamera, HiOutlinePlay,
  HiOutlinePlus, HiX, HiClock, HiExclamation,
} from "react-icons/hi";
import { FaPoll, FaPlus, FaTrash } from "react-icons/fa";
import { useContent } from "../Context/ContentContext";
import { createPost, createStory, createReel } from "../services/api";

export default function CreatePopup({ openCreate, onClose }) {
  const navigate = useNavigate();
  const [activeBox, setActiveBox] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const { prependPost } = useContent();

  // Poll state
  const [isPoll, setIsPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollEndsAt, setPollEndsAt] = useState("");
  const [multipleChoice, setMultipleChoice] = useState(false);

  // Scheduling
  const [scheduledAt, setScheduledAt] = useState("");

  // Content warning
  const [hasContentWarning, setHasContentWarning] = useState(false);
  const [contentWarningText, setContentWarningText] = useState("");

  if (!openCreate) return null;

  const resetAll = () => {
    setSelectedFiles([]); setPreviews([]); setCaption(""); setActiveBox(null);
    setIsPoll(false); setPollQuestion(""); setPollOptions(["", ""]); setPollEndsAt(""); setMultipleChoice(false);
    setScheduledAt(""); setHasContentWarning(false); setContentWarningText("");
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const removeFile = (idx) => {
    setSelectedFiles(p => p.filter((_, i) => i !== idx));
    setPreviews(p => p.filter((_, i) => i !== idx));
  };

  const addPollOption = () => {
    if (pollOptions.length < 6) setPollOptions(p => [...p, ""]);
  };
  const removePollOption = (i) => {
    if (pollOptions.length > 2) setPollOptions(p => p.filter((_, idx) => idx !== i));
  };
  const updatePollOption = (i, val) => {
    setPollOptions(p => p.map((o, idx) => idx === i ? val : o));
  };

  const handleSubmit = async () => {
    if (!selectedFiles.length && activeBox !== "live" && !isPoll) return;
    setLoading(true);
    try {
      const formData = new FormData();
      if (activeBox === "post") {
        if (isPoll) {
          formData.append("mediaType", "poll");
          formData.append("caption", caption);
          formData.append("poll[question]", pollQuestion);
          pollOptions.filter(o => o.trim()).forEach((o, i) => formData.append(`poll[options][${i}]`, o));
          if (pollEndsAt) formData.append("poll[endsAt]", pollEndsAt);
          formData.append("poll[multipleChoice]", multipleChoice);
        } else {
          selectedFiles.forEach(f => formData.append("media", f));
          formData.append("caption", caption);
        }
        if (scheduledAt) { formData.append("scheduledAt", scheduledAt); formData.append("isPublished", "false"); }
        if (hasContentWarning) {
          formData.append("hasContentWarning", "true");
          formData.append("contentWarningText", contentWarningText);
        }
        const res = await createPost(formData);
        if (!scheduledAt) {
          const posts = Array.isArray(res.data) ? res.data : [res.data];
          posts.forEach(p => prependPost(p));
        }
      } else if (activeBox === "story") {
        formData.append("media", selectedFiles[0]);
        await createStory(formData);
      } else if (activeBox === "reel") {
        formData.append("video", selectedFiles[0]);
        formData.append("caption", caption);
        await createReel(formData);
      }
      resetAll();
    } catch (err) {
      console.error("Upload error:", err);
      alert(err?.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const titles = { post: "Create Post", story: "Create Story", reel: "Create Reel", live: "Start Live" };

  return (
    <>
      {!activeBox && <div className="fixed inset-0 z-40" onClick={onClose} />}

      <div className="fixed bottom-24 left-20 w-64 bg-black text-white shadow-2xl rounded-xl p-2 z-50 border border-gray-800">
        <p className="px-3 py-2 text-sm font-semibold text-gray-400">Create</p>
        {[
          { key: "post",  icon: <HiOutlinePhotograph size={22} className="text-gray-300" />, label: "Post" },
          { key: "story", icon: <HiOutlineVideoCamera size={22} className="text-gray-300" />, label: "Story" },
          { key: "reel",  icon: <HiOutlinePlay size={22} className="text-gray-300" />, label: "Reel" },
          { key: "live",  icon: <HiOutlinePlus size={22} className="text-gray-300" />, label: "Live" },
        ].map(({ key, icon, label }) => (
          <button key={key} onClick={() => {
            if (key === "live") { onClose(); navigate("/live", { state: { mode: "host" } }); return; }
            setActiveBox(key); setSelectedFiles([]); setPreviews([]); setCaption(""); setIsPoll(false);
          }} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-800 transition">
            {icon}
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>

      {activeBox && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={resetAll} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-white">
              <HiX size={20} />
            </button>

            <h2 className="text-xl font-semibold mb-4 text-center text-gray-900 dark:text-white">{titles[activeBox]}</h2>

            {activeBox === "post" && (
              <>
                {/* Poll toggle */}
                <div className="flex items-center gap-2 mb-3">
                  <button onClick={() => setIsPoll(p => !p)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition font-semibold ${isPoll ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300"}`}>
                    <FaPoll size={11} /> Poll
                  </button>
                  <button onClick={() => setHasContentWarning(p => !p)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition font-semibold ${hasContentWarning ? "bg-orange-500 text-white border-orange-500" : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300"}`}>
                    <HiExclamation size={12} /> CW
                  </button>
                  <button onClick={() => setScheduledAt(scheduledAt ? "" : new Date(Date.now() + 3600000).toISOString().slice(0, 16))}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition font-semibold ${scheduledAt ? "bg-purple-600 text-white border-purple-600" : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300"}`}>
                    <HiClock size={12} /> Schedule
                  </button>
                </div>

                {/* Content Warning */}
                {hasContentWarning && (
                  <div className="mb-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                    <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-1">Content Warning</p>
                    <input value={contentWarningText} onChange={e => setContentWarningText(e.target.value)}
                      placeholder="Describe the sensitive content..."
                      className="w-full text-sm bg-transparent outline-none text-gray-700 dark:text-gray-200 placeholder:text-gray-400" />
                  </div>
                )}

                {/* Schedule */}
                {scheduledAt && (
                  <div className="mb-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                    <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">Schedule Post</p>
                    <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
                      className="w-full text-sm bg-transparent outline-none text-gray-700 dark:text-gray-200" />
                  </div>
                )}

                {/* Poll creation */}
                {isPoll ? (
                  <div className="space-y-2 mb-3">
                    <input value={pollQuestion} onChange={e => setPollQuestion(e.target.value)}
                      placeholder="Poll question..."
                      className="w-full border dark:border-gray-700 p-2 rounded text-sm bg-transparent dark:text-white" />
                    {pollOptions.map((opt, i) => (
                      <div key={i} className="flex gap-2">
                        <input value={opt} onChange={e => updatePollOption(i, e.target.value)}
                          placeholder={`Option ${i + 1}`}
                          className="flex-1 border dark:border-gray-700 p-2 rounded text-sm bg-transparent dark:text-white" />
                        {pollOptions.length > 2 && (
                          <button onClick={() => removePollOption(i)} className="text-red-400 hover:text-red-600">
                            <FaTrash size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                    {pollOptions.length < 6 && (
                      <button onClick={addPollOption} className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700">
                        <FaPlus size={10} /> Add option
                      </button>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={multipleChoice} onChange={e => setMultipleChoice(e.target.checked)} />
                        Multiple choice
                      </label>
                      <div className="flex items-center gap-1">
                        <span>Ends:</span>
                        <input type="datetime-local" value={pollEndsAt} onChange={e => setPollEndsAt(e.target.value)}
                          className="bg-transparent outline-none text-xs" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <input type="file" accept="image/*,video/*" multiple onChange={handleFileChange}
                      className="w-full border dark:border-gray-700 p-2 rounded mb-3 text-sm dark:text-white dark:bg-gray-800" />
                    {previews.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {previews.map((url, idx) => (
                          <div key={idx} className="relative">
                            <img src={url} className="w-16 h-16 object-cover rounded-lg border" alt="" />
                            <button onClick={() => removeFile(idx)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                <textarea placeholder="Write a caption..." value={caption} onChange={e => setCaption(e.target.value)}
                  className="w-full border dark:border-gray-700 p-2 rounded text-sm resize-none dark:bg-gray-800 dark:text-white" rows={3} />
              </>
            )}

            {activeBox === "story" && (
              <input type="file" accept="image/*,video/*" onChange={handleFileChange}
                className="w-full border p-2 rounded mb-3 text-sm" />
            )}

            {activeBox === "reel" && (
              <>
                <input type="file" accept="video/*" onChange={handleFileChange}
                  className="w-full border p-2 rounded mb-3 text-sm" />
                <textarea placeholder="Write a caption..." value={caption} onChange={e => setCaption(e.target.value)}
                  className="w-full border p-2 rounded text-sm resize-none" rows={3} />
              </>
            )}

            {activeBox === "live" && (
              <p className="text-sm text-gray-500 text-center mb-4">You'll go live instantly. Your followers will be notified.</p>
            )}

            <button onClick={handleSubmit}
              disabled={(activeBox !== "live" && !selectedFiles.length && !isPoll) || loading}
              className="mt-4 w-full bg-black dark:bg-white dark:text-black text-white py-2 rounded-lg disabled:opacity-40 font-semibold">
              {loading ? "Uploading..." : scheduledAt ? "Schedule" : activeBox === "live" ? "Go Live" : "Share"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
