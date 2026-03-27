import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import {
  adminGetStats, adminGetUsers, adminUpdateUser, adminDeleteUser,
  adminGetPosts, adminDeletePost, adminGetOrders, adminGetBookings,
} from "../services/api";
import {
  FaUsers, FaFileAlt, FaShoppingBag, FaCalendarCheck,
  FaChartBar, FaTachometerAlt, FaTrash, FaCheck, FaTimes,
  FaShieldAlt, FaSearch, FaChevronLeft, FaChevronRight,
  FaSignOutAlt, FaBars, FaVideo, FaStar, FaUserShield,
  FaArrowUp, FaArrowDown, FaEye,
} from "react-icons/fa";

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, trend }) {
  return (
    <div className="bg-theme-secondary rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="text-white text-xl" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-theme-secondary">{label}</p>
        <p className="text-2xl font-bold">{value?.toLocaleString() ?? "—"}</p>
        {sub && <p className="text-xs text-theme-secondary">{sub}</p>}
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? "text-green-400" : "text-red-400"}`}>
          {trend >= 0 ? <FaArrowUp /> : <FaArrowDown />} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────
function Overview({ stats }) {
  if (!stats) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;

  const cards = [
    { icon: FaUsers,         label: "Total Users",     value: stats.totalUsers,    sub: `+${stats.newUsersToday} today`,   color: "from-blue-500 to-cyan-500",    trend: 12 },
    { icon: FaFileAlt,       label: "Total Posts",     value: stats.totalPosts,    sub: `${stats.totalReels} reels`,       color: "from-purple-500 to-pink-500",  trend: 8  },
    { icon: FaShoppingBag,   label: "Total Orders",    value: stats.totalOrders,   sub: `₹${stats.totalRevenue?.toLocaleString()} revenue`, color: "from-green-500 to-teal-500", trend: 5 },
    { icon: FaCalendarCheck, label: "Bookings",        value: stats.totalBookings, sub: "All time",                        color: "from-orange-500 to-yellow-500", trend: 3  },
    { icon: FaUserShield,    label: "Verified Users",  value: stats.verifiedUsers, sub: `${stats.adminUsers} admins`,      color: "from-indigo-500 to-purple-500", trend: 2  },
    { icon: FaUsers,         label: "Active (7d)",     value: stats.activeUsers,   sub: "Unique active users",             color: "from-pink-500 to-rose-500",    trend: 15 },
  ];

  // Build chart data — fill missing days
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().split("T")[0];
    const found = stats.dailySignups?.find(s => s._id === key);
    chartData.push({ day: d.toLocaleDateString("en", { weekday: "short" }), count: found?.count || 0 });
  }
  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map((c, i) => <StatCard key={i} {...c} />)}
      </div>

      {/* Signups Chart */}
      <div className="bg-theme-secondary rounded-2xl p-5">
        <p className="font-semibold mb-4">New Signups — Last 7 Days</p>
        <div className="flex items-end gap-2 h-32">
          {chartData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-theme-secondary">{d.count}</span>
              <div
                className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all"
                style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count ? "4px" : "2px" }}
              />
              <span className="text-xs text-theme-secondary">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Revenue", value: `₹${stats.totalRevenue?.toLocaleString() || 0}`, icon: "💰" },
          { label: "Total Reels",   value: stats.totalReels,   icon: "🎬" },
          { label: "Admin Users",   value: stats.adminUsers,   icon: "🛡️" },
          { label: "Today Signups", value: stats.newUsersToday, icon: "🆕" },
        ].map((item, i) => (
          <div key={i} className="bg-theme-secondary rounded-2xl p-4 text-center">
            <div className="text-2xl mb-1">{item.icon}</div>
            <p className="text-xl font-bold">{item.value}</p>
            <p className="text-xs text-theme-secondary">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Users Tab ─────────────────────────────────────────────────
function UsersTab() {
  const [data, setData]     = useState({ users: [], total: 0, pages: 1 });
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = `?page=${page}&limit=15&search=${encodeURIComponent(search)}`;
      const res = await adminGetUsers(params);
      setData(res.data);
    } catch {}
    setLoading(false);
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (id, field, val) => {
    await adminUpdateUser(id, { [field]: val });
    load();
  };
  const del = async (id) => {
    if (!confirm("Delete this user?")) return;
    await adminDeleteUser(id);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-secondary text-sm" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search users..."
            className="w-full pl-9 pr-4 py-2.5 bg-theme-secondary rounded-xl text-sm outline-none" />
        </div>
        <span className="text-sm text-theme-secondary">{data.total} users</span>
      </div>

      <div className="bg-theme-secondary rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-theme text-theme-secondary text-xs">
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-center px-4 py-3">Followers</th>
                <th className="text-center px-4 py-3">Verified</th>
                <th className="text-center px-4 py-3">Admin</th>
                <th className="text-center px-4 py-3">Joined</th>
                <th className="text-center px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-theme-secondary">Loading...</td></tr>
              ) : data.users.map(u => (
                <tr key={u._id} className="border-b border-theme hover:bg-theme-primary/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {u.avatar
                        ? <img src={u.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                        : <div className="w-8 h-8 rounded-full bg-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xs">{u.username?.[0]?.toUpperCase()}</div>
                      }
                      <div>
                        <p className="font-medium">{u.username}</p>
                        <p className="text-xs text-theme-secondary">{u.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-theme-secondary text-xs">{u.email}</td>
                  <td className="px-4 py-3 text-center">{u.followers?.length || 0}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggle(u._id, "isVerified", !u.isVerified)}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${u.isVerified ? "bg-blue-500/20 text-blue-400" : "bg-theme-primary text-theme-secondary"}`}>
                      {u.isVerified ? "✓ Yes" : "No"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggle(u._id, "isAdmin", !u.isAdmin)}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${u.isAdmin ? "bg-purple-500/20 text-purple-400" : "bg-theme-primary text-theme-secondary"}`}>
                      {u.isAdmin ? "Admin" : "User"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-theme-secondary">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => del(u._id)} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
                      <FaTrash className="text-xs" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
          className="flex items-center gap-1 px-3 py-2 bg-theme-secondary rounded-xl text-sm disabled:opacity-40">
          <FaChevronLeft /> Prev
        </button>
        <span className="text-sm text-theme-secondary">Page {page} / {data.pages}</span>
        <button disabled={page >= data.pages} onClick={() => setPage(p => p + 1)}
          className="flex items-center gap-1 px-3 py-2 bg-theme-secondary rounded-xl text-sm disabled:opacity-40">
          Next <FaChevronRight />
        </button>
      </div>
    </div>
  );
}

// ── Posts Tab ─────────────────────────────────────────────────
function PostsTab() {
  const [data, setData]     = useState({ posts: [], total: 0, pages: 1 });
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGetPosts(`?page=${page}&limit=15&search=${encodeURIComponent(search)}`);
      setData(res.data);
    } catch {}
    setLoading(false);
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const del = async (id) => {
    if (!confirm("Delete this post?")) return;
    await adminDeletePost(id);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-secondary text-sm" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search posts..."
            className="w-full pl-9 pr-4 py-2.5 bg-theme-secondary rounded-xl text-sm outline-none" />
        </div>
        <span className="text-sm text-theme-secondary">{data.total} posts</span>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-10 text-theme-secondary">Loading...</div>
        ) : data.posts.map(p => (
          <div key={p._id} className="bg-theme-secondary rounded-2xl p-4 flex items-start gap-3">
            {p.media?.[0] && (
              <img src={p.media[0]} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" alt="" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {p.user?.avatar
                  ? <img src={p.user.avatar} className="w-6 h-6 rounded-full object-cover" alt="" />
                  : <div className="w-6 h-6 rounded-full bg-purple-500/30 flex items-center justify-center text-xs text-purple-400">{p.user?.username?.[0]?.toUpperCase()}</div>
                }
                <span className="text-sm font-medium">{p.user?.username}</span>
                <span className="text-xs text-theme-secondary ml-auto">{new Date(p.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-theme-secondary line-clamp-2">{p.caption || "(no caption)"}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-theme-secondary">
                <span>❤️ {p.likes?.length || 0}</span>
                <span>💬 {p.comments?.length || 0}</span>
                <span className="capitalize">{p.source || "post"}</span>
              </div>
            </div>
            <button onClick={() => del(p._id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors flex-shrink-0">
              <FaTrash />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
          className="flex items-center gap-1 px-3 py-2 bg-theme-secondary rounded-xl text-sm disabled:opacity-40">
          <FaChevronLeft /> Prev
        </button>
        <span className="text-sm text-theme-secondary">Page {page} / {data.pages}</span>
        <button disabled={page >= data.pages} onClick={() => setPage(p => p + 1)}
          className="flex items-center gap-1 px-3 py-2 bg-theme-secondary rounded-xl text-sm disabled:opacity-40">
          Next <FaChevronRight />
        </button>
      </div>
    </div>
  );
}

// ── Orders Tab ────────────────────────────────────────────────
function OrdersTab() {
  const [data, setData]   = useState({ orders: [], total: 0, pages: 1 });
  const [page, setPage]   = useState(1);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGetOrders(`?page=${page}&limit=15`);
      setData(res.data);
    } catch {}
    setLoading(false);
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const STATUS_COLOR = {
    pending:   "bg-yellow-500/20 text-yellow-400",
    confirmed: "bg-blue-500/20 text-blue-400",
    shipped:   "bg-purple-500/20 text-purple-400",
    delivered: "bg-green-500/20 text-green-400",
    cancelled: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-theme-secondary">{data.total} orders</p>
      </div>
      <div className="bg-theme-secondary rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-theme text-theme-secondary text-xs">
                <th className="text-left px-4 py-3">Order ID</th>
                <th className="text-left px-4 py-3">Buyer</th>
                <th className="text-left px-4 py-3">Items</th>
                <th className="text-right px-4 py-3">Amount</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-center px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-theme-secondary">Loading...</td></tr>
              ) : data.orders.map(o => (
                <tr key={o._id} className="border-b border-theme hover:bg-theme-primary/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-purple-400">#{o._id.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {o.buyer?.avatar
                        ? <img src={o.buyer.avatar} className="w-7 h-7 rounded-full object-cover" alt="" />
                        : <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center text-xs text-purple-400">{o.buyer?.username?.[0]?.toUpperCase()}</div>
                      }
                      <span>{o.buyer?.username || "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-theme-secondary">{o.items?.length || 0} item(s)</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-400">₹{o.totalAmount?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLOR[o.status] || "bg-theme-primary text-theme-secondary"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-theme-secondary">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
          className="flex items-center gap-1 px-3 py-2 bg-theme-secondary rounded-xl text-sm disabled:opacity-40">
          <FaChevronLeft /> Prev
        </button>
        <span className="text-sm text-theme-secondary">Page {page} / {data.pages}</span>
        <button disabled={page >= data.pages} onClick={() => setPage(p => p + 1)}
          className="flex items-center gap-1 px-3 py-2 bg-theme-secondary rounded-xl text-sm disabled:opacity-40">
          Next <FaChevronRight />
        </button>
      </div>
    </div>
  );
}

// ── Bookings Tab ──────────────────────────────────────────────
function BookingsTab() {
  const [data, setData]   = useState({ bookings: [], total: 0, pages: 1 });
  const [page, setPage]   = useState(1);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGetBookings(`?page=${page}&limit=15`);
      setData(res.data);
    } catch {}
    setLoading(false);
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const STATUS_COLOR = {
    pending:   "bg-yellow-500/20 text-yellow-400",
    confirmed: "bg-green-500/20 text-green-400",
    cancelled: "bg-red-500/20 text-red-400",
    completed: "bg-blue-500/20 text-blue-400",
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-theme-secondary">{data.total} bookings</p>
      <div className="bg-theme-secondary rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-theme text-theme-secondary text-xs">
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Service</th>
                <th className="text-right px-4 py-3">Amount</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-center px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-theme-secondary">Loading...</td></tr>
              ) : data.bookings.map(b => (
                <tr key={b._id} className="border-b border-theme hover:bg-theme-primary/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-purple-400">#{b._id.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {b.user?.avatar
                        ? <img src={b.user.avatar} className="w-7 h-7 rounded-full object-cover" alt="" />
                        : <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center text-xs text-purple-400">{b.user?.username?.[0]?.toUpperCase()}</div>
                      }
                      <span>{b.user?.username || "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-theme-secondary text-xs">{b.serviceTitle || b.type || "—"}</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-400">₹{b.totalAmount?.toLocaleString() || "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLOR[b.status] || "bg-theme-primary text-theme-secondary"}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-theme-secondary">{new Date(b.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
          className="flex items-center gap-1 px-3 py-2 bg-theme-secondary rounded-xl text-sm disabled:opacity-40">
          <FaChevronLeft /> Prev
        </button>
        <span className="text-sm text-theme-secondary">Page {page} / {data.pages}</span>
        <button disabled={page >= data.pages} onClick={() => setPage(p => p + 1)}
          className="flex items-center gap-1 px-3 py-2 bg-theme-secondary rounded-xl text-sm disabled:opacity-40">
          Next <FaChevronRight />
        </button>
      </div>
    </div>
  );
}

// ── Main AdminPanel ───────────────────────────────────────────
const NAV = [
  { id: "overview",  label: "Overview",  icon: FaTachometerAlt },
  { id: "users",     label: "Users",     icon: FaUsers         },
  { id: "posts",     label: "Posts",     icon: FaFileAlt       },
  { id: "orders",    label: "Orders",    icon: FaShoppingBag   },
  { id: "bookings",  label: "Bookings",  icon: FaCalendarCheck },
];

export default function AdminPanel() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab]         = useState("overview");
  const [stats, setStats]     = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading) return;                          // wait for auth to resolve
    if (!user) { navigate("/login"); return; }
    if (!user.isAdmin) { navigate("/"); return; }
    adminGetStats().then(r => setStats(r.data)).catch(() => {});
  }, [user, loading, navigate]);

  // Show spinner while auth is resolving
  if (loading || !user) return (
    <div className="min-h-screen bg-theme-primary flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Show access denied only after auth resolved and user is not admin
  if (!user.isAdmin) return (
    <div className="min-h-screen bg-theme-primary flex items-center justify-center">
      <div className="text-center">
        <FaShieldAlt className="text-5xl text-red-400 mx-auto mb-4" />
        <p className="text-xl font-bold mb-2">Access Denied</p>
        <p className="text-theme-secondary mb-4">Admin access required</p>
        <button onClick={() => navigate("/")} className="px-6 py-3 bg-purple-600 text-white rounded-xl">Go Home</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary flex">
      {/* Sidebar overlay on mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-60 bg-theme-secondary flex flex-col z-40 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-5 border-b border-theme">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
              <FaShieldAlt className="text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">Admin Panel</p>
              <p className="text-xs text-theme-secondary">{user.username}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(n => {
            const Icon = n.icon;
            return (
              <button key={n.id} onClick={() => { setTab(n.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === n.id ? "bg-purple-600 text-white" : "text-theme-secondary hover:bg-theme-primary"}`}>
                <Icon className="text-base flex-shrink-0" />
                {n.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-theme space-y-1">
          <button onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-theme-secondary hover:bg-theme-primary transition-colors">
            <FaEye /> View Site
          </button>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-theme-secondary/80 backdrop-blur border-b border-theme px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-xl hover:bg-theme-primary">
            <FaBars />
          </button>
          <h1 className="font-bold capitalize">{tab}</h1>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-theme-secondary">Live</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {tab === "overview"  && <Overview stats={stats} />}
          {tab === "users"     && <UsersTab />}
          {tab === "posts"     && <PostsTab />}
          {tab === "orders"    && <OrdersTab />}
          {tab === "bookings"  && <BookingsTab />}
        </main>
      </div>
    </div>
  );
}
