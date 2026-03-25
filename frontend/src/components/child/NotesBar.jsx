import { useState, useEffect, useRef } from "react";
import { HiPlus, HiX, HiMusicNote, HiPencil, HiTrash } from "react-icons/hi";
import { useAuth } from "../../Context/AuthContext";
import { getNotes, upsertNote, deleteNote } from "../../services/api";

// A few popular songs to pick from (can be extended)
const SONG_SUGGESTIONS = [
  { title: "Blinding Lights",   artist: "The Weeknd" },
  { title: "Shape of You",      artist: "Ed Sheeran" },
  { title: "Levitating",        artist: "Dua Lipa" },
  { title: "Stay",              artist: "The Kid LAROI" },
  { title: "As It Was",         artist: "Harry Styles" },
  { title: "Flowers",           artist: "Miley Cyrus" },
  { title: "Unholy",            artist: "Sam Smith" },
  { title: "Anti-Hero",         artist: "Taylor Swift" },
  { title: "Calm Down",         artist: "Rema" },
  { title: "Tum Hi Ho",         artist: "Arijit Singh" },
  { title: "Kesariya",          artist: "Arijit Singh" },
  { title: "Raataan Lambiyan",  artist: "Jubin Nautiyal" },
  { title: "Apna Bana Le",      artist: "Arijit Singh" },
  { title: "Tera Yaar Hoon Main", artist: "Arijit Singh" },
];

function timeLeft(expiresAt) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

// ── Note bubble shown above avatar ──────────────────────────────
function NoteBubble({ note, isMe, onClick }) {
  const label = note.song
    ? `🎵 ${note.song}`
    : note.text;

  return (
    <div className="flex flex-col items-center flex-shrink-0 cursor-pointer" onClick={onClick}>
      {/* Bubble */}
      <div className="relative mb-1 max-w-[90px]">
        <div className="bg-theme-card border border-theme rounded-2xl rounded-bl-none px-2.5 py-1.5 shadow-sm">
          <p className="text-[11px] text-theme-primary leading-tight line-clamp-2 text-center">
            {label}
          </p>
        </div>
      </div>
      {/* Avatar */}
      <div className="relative">
        <img
          src={note.user?.avatar || `https://ui-avatars.com/api/?name=${note.user?.username}`}
          className="w-14 h-14 rounded-full object-cover border-2 border-theme"
          alt={note.user?.username}
        />
        {isMe && (
          <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-blue-500 border-2 border-white dark:border-gray-900 rounded-full flex items-center justify-center">
            <HiPencil size={9} className="text-white" />
          </span>
        )}
      </div>
      <p className="text-[10px] text-theme-muted mt-1 max-w-[70px] truncate text-center">
        {isMe ? "Your note" : note.user?.username}
      </p>
      {isMe && note.expiresAt && (
        <p className="text-[9px] text-theme-muted">{timeLeft(note.expiresAt)} left</p>
      )}
    </div>
  );
}

// ── Add note button (when I have no note) ───────────────────────
function AddNoteButton({ onClick }) {
  return (
    <div className="flex flex-col items-center flex-shrink-0 cursor-pointer" onClick={onClick}>
      <div className="relative mb-1">
        <div className="bg-theme-card border border-dashed border-theme rounded-2xl rounded-bl-none px-2.5 py-1.5">
          <p className="text-[11px] text-theme-muted text-center">Add note</p>
        </div>
      </div>
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-2 border-dashed border-theme flex items-center justify-center bg-theme-input">
          <HiPlus size={20} className="text-theme-muted" />
        </div>
      </div>
      <p className="text-[10px] text-theme-muted mt-1">Your note</p>
    </div>
  );
}

// ── Create / Edit modal ─────────────────────────────────────────
function NoteModal({ existing, onClose, onSave }) {
  const [tab,        setTab]        = useState(existing?.song ? "song" : "text");
  const [text,       setText]       = useState(existing?.text || "");
  const [song,       setSong]       = useState(existing?.song || "");
  const [songArtist, setSongArtist] = useState(existing?.songArtist || "");
  const [songQuery,  setSongQuery]  = useState(existing?.song || "");
  const [saving,     setSaving]     = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, [tab]);

  const filteredSongs = SONG_SUGGESTIONS.filter(
    (s) =>
      !songQuery.trim() ||
      s.title.toLowerCase().includes(songQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(songQuery.toLowerCase())
  );

  const handleSave = async () => {
    if (tab === "text" && !text.trim()) return;
    if (tab === "song" && !song.trim()) return;
    setSaving(true);
    try {
      const payload = tab === "text"
        ? { text: text.trim(), song: "", songArtist: "" }
        : { text: "", song: song.trim(), songArtist: songArtist.trim() };
      const res = await upsertNote(payload);
      onSave(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="w-full sm:w-[380px] bg-theme-card rounded-t-2xl sm:rounded-2xl border border-theme shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-theme">
          <h3 className="font-semibold text-theme-primary">
            {existing ? "Edit note" : "New note"}
          </h3>
          <button onClick={onClose} className="text-theme-muted hover:text-theme-primary">
            <HiX size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-theme">
          {[
            { key: "text", label: "✏️ Note" },
            { key: "song", label: "🎵 Song" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                tab === key
                  ? "text-theme-primary border-b-2 border-blue-500"
                  : "text-theme-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === "text" ? (
            <>
              <textarea
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 60))}
                placeholder="Share a thought..."
                rows={3}
                className="w-full bg-theme-input text-theme-primary text-sm rounded-xl px-4 py-3 outline-none placeholder:text-theme-muted border border-theme resize-none"
              />
              <p className="text-right text-[11px] text-theme-muted mt-1">{text.length}/60</p>
            </>
          ) : (
            <>
              {/* Search songs */}
              <div className="flex items-center gap-2 bg-theme-input border border-theme rounded-xl px-3 py-2 mb-3">
                <HiMusicNote size={15} className="text-theme-muted flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={songQuery}
                  onChange={(e) => { setSongQuery(e.target.value); setSong(e.target.value); setSongArtist(""); }}
                  placeholder="Search or type a song..."
                  className="flex-1 bg-transparent text-sm text-theme-primary outline-none placeholder:text-theme-muted"
                />
                {songQuery && (
                  <button onClick={() => { setSongQuery(""); setSong(""); setSongArtist(""); }}>
                    <HiX size={14} className="text-theme-muted" />
                  </button>
                )}
              </div>

              {/* Song list */}
              <div className="max-h-44 overflow-y-auto scrollbar-hide space-y-1">
                {filteredSongs.map((s) => (
                  <button
                    key={s.title + s.artist}
                    onClick={() => { setSong(s.title); setSongArtist(s.artist); setSongQuery(s.title); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition ${
                      song === s.title
                        ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-400"
                        : "hover:bg-theme-hover"
                    }`}
                  >
                    <span className="text-lg">🎵</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-theme-primary truncate">{s.title}</p>
                      <p className="text-xs text-theme-muted truncate">{s.artist}</p>
                    </div>
                    {song === s.title && (
                      <span className="ml-auto text-blue-500 text-xs font-bold flex-shrink-0">✓</span>
                    )}
                  </button>
                ))}
                {filteredSongs.length === 0 && (
                  <p className="text-xs text-theme-muted text-center py-3">No songs found. Your typed text will be used.</p>
                )}
              </div>
            </>
          )}

          <p className="text-[11px] text-theme-muted mt-3 mb-4">
            Your note will be visible to people you follow for 24 hours.
          </p>

          <button
            onClick={handleSave}
            disabled={saving || (tab === "text" ? !text.trim() : !song.trim())}
            className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm rounded-xl disabled:opacity-40 transition"
          >
            {saving ? "Sharing..." : "Share note"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── View note modal (other user's note) ─────────────────────────
function ViewNoteModal({ note, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={onClose}>
      <div
        className="w-72 bg-theme-card rounded-2xl border border-theme shadow-2xl p-5 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={note.user?.avatar || `https://ui-avatars.com/api/?name=${note.user?.username}`}
          className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-2 border-theme"
          alt={note.user?.username}
        />
        <p className="font-semibold text-theme-primary text-sm mb-1">{note.user?.username}</p>
        {note.song ? (
          <div className="flex items-center justify-center gap-2 bg-theme-input rounded-xl px-4 py-2 mt-2">
            <HiMusicNote size={14} className="text-blue-500 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-semibold text-theme-primary">{note.song}</p>
              {note.songArtist && <p className="text-xs text-theme-muted">{note.songArtist}</p>}
            </div>
          </div>
        ) : (
          <p className="text-sm text-theme-secondary mt-2 bg-theme-input rounded-xl px-4 py-2">{note.text}</p>
        )}
        {note.expiresAt && (
          <p className="text-[10px] text-theme-muted mt-3">{timeLeft(note.expiresAt)} remaining</p>
        )}
        <button onClick={onClose} className="mt-4 text-xs text-blue-500 font-semibold">Close</button>
      </div>
    </div>
  );
}

// ── Main NotesBar ────────────────────────────────────────────────
export default function NotesBar() {
  const { user } = useAuth();
  const [notes,       setNotes]       = useState([]);
  const [showCreate,  setShowCreate]  = useState(false);
  const [viewNote,    setViewNote]    = useState(null);

  useEffect(() => {
    if (!user) return;
    getNotes()
      .then((res) => setNotes(res.data))
      .catch(() => {});
  }, [user]);

  if (!user) return null;

  const myNote    = notes.find((n) => n.user?._id === user._id || n.user === user._id);
  const otherNotes = notes.filter((n) => (n.user?._id || n.user) !== user._id);

  const handleSave = (saved) => {
    setNotes((prev) => {
      const filtered = prev.filter((n) => (n.user?._id || n.user) !== user._id);
      return [saved, ...filtered];
    });
    setShowCreate(false);
  };

  const handleDelete = async () => {
    try {
      await deleteNote();
      setNotes((prev) => prev.filter((n) => (n.user?._id || n.user) !== user._id));
    } catch (_) {}
    setShowCreate(false);
  };

  return (
    <>
      <div className="flex gap-5 px-4 pb-4 overflow-x-auto scrollbar-hide">
        {/* My note or add button */}
        {myNote ? (
          <NoteBubble
            note={{ ...myNote, user: { ...myNote.user, _id: myNote.user?._id || user._id } }}
            isMe
            onClick={() => setShowCreate(true)}
          />
        ) : (
          <AddNoteButton onClick={() => setShowCreate(true)} />
        )}

        {/* Other users' notes */}
        {otherNotes.map((note) => (
          <NoteBubble
            key={note._id}
            note={note}
            isMe={false}
            onClick={() => setViewNote(note)}
          />
        ))}
      </div>

      {/* Create / Edit modal */}
      {showCreate && (
        <NoteModal
          existing={myNote}
          onClose={() => setShowCreate(false)}
          onSave={handleSave}
        />
      )}

      {/* Delete button inside edit modal — shown as extra option */}
      {showCreate && myNote && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 text-xs text-red-500 bg-white dark:bg-gray-900 border border-red-300 dark:border-red-800 px-4 py-2 rounded-full shadow-lg"
          >
            <HiTrash size={13} /> Delete note
          </button>
        </div>
      )}

      {/* View other user's note */}
      {viewNote && (
        <ViewNoteModal note={viewNote} onClose={() => setViewNote(null)} />
      )}
    </>
  );
}
