import { useState, useEffect, useRef } from "react";
import { HiOutlineX, HiOutlineSearch } from "react-icons/hi";
import { searchUsers } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function SearchPanel({ open, setOpen }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem("recentSearches")) || []; }
    catch { return []; }
  });
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try { const res = await searchUsers(query.trim()); setResults(res.data); }
      catch (_) { setResults([]); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const saveRecent = (user) => {
    const updated = [user, ...recent.filter((u) => u._id !== user._id)].slice(0, 10);
    setRecent(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const removeRecent = (id) => {
    const updated = recent.filter((u) => u._id !== id);
    setRecent(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleUserClick = (user) => {
    saveRecent(user);
    setOpen(false);
    navigate(`/profile/${user.username}`);
  };

  const displayList = query.trim() ? results : recent;
  const showRecent = !query.trim() && recent.length > 0;

  return (
    <>
      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 bg-black/60 z-40" />}

      <div className={`fixed top-0 right-0 h-[100dvh] w-full sm:w-[400px] bg-theme-panel text-theme-primary shadow-xl z-50 transform transition-transform duration-300 flex flex-col ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-theme flex-shrink-0">
          <h2 className="text-2xl font-semibold">Search</h2>
          <button onClick={() => setOpen(false)} className="p-2 bg-theme-hover rounded-full"><HiOutlineX size={24} /></button>
        </div>

        <div className="px-6 my-5 flex-shrink-0">
          <div className="flex items-center bg-theme-input rounded-full px-4 py-2">
            <HiOutlineSearch className="text-theme-muted mr-2 flex-shrink-0" size={20} />
            <input
              type="text"
              placeholder="Search users..."
              className="bg-transparent outline-none w-full text-sm text-theme-primary placeholder-theme-muted"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus={open}
            />
            {query && <HiOutlineX className="text-theme-muted cursor-pointer flex-shrink-0" size={18} onClick={() => setQuery("")} />}
          </div>
        </div>

        <div className="flex justify-between items-center px-6 mb-2 flex-shrink-0">
          <h3 className="text-sm font-semibold text-theme-muted">{showRecent ? "Recent" : query ? "Results" : ""}</h3>
          {showRecent && (
            <button onClick={() => { setRecent([]); localStorage.removeItem("recentSearches"); }} className="text-blue-500 text-sm font-medium">
              Clear all
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {loading && <div className="text-center text-theme-muted text-sm py-6">Searching...</div>}
          {!loading && query.trim() && results.length === 0 && (
            <div className="text-center text-theme-muted text-sm py-6">No users found for "{query}"</div>
          )}
          {!loading && displayList.map((user) => (
            <div key={user._id} onClick={() => handleUserClick(user)} className="flex items-center justify-between px-6 py-3 bg-theme-hover cursor-pointer transition">
              <div className="flex items-center gap-3">
                <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}`} alt={user.username} className="w-11 h-11 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold text-theme-primary">{user.username}</p>
                  <p className="text-xs text-theme-muted">{user.name || user.email}</p>
                </div>
              </div>
              {showRecent && (
                <button onClick={(e) => { e.stopPropagation(); removeRecent(user._id); }} className="text-theme-muted p-1">
                  <HiOutlineX size={18} />
                </button>
              )}
            </div>
          ))}
          {!query && recent.length === 0 && <div className="text-center text-theme-muted text-sm py-6">No recent searches</div>}
        </div>
      </div>
    </>
  );
}
