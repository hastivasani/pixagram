import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlane, FaHotel, FaCar, FaBus, FaTrain, FaGlobe, FaUtensils, FaUmbrellaBeach, FaBolt, FaTicketAlt, FaSearch } from "react-icons/fa";

const TYPE_ICONS = {
  flight: { icon: FaPlane, color: "text-blue-400", bg: "bg-blue-500/20" },
  hotel: { icon: FaHotel, color: "text-purple-400", bg: "bg-purple-500/20" },
  car: { icon: FaCar, color: "text-green-400", bg: "bg-green-500/20" },
  bus: { icon: FaBus, color: "text-orange-400", bg: "bg-orange-500/20" },
  train: { icon: FaTrain, color: "text-red-400", bg: "bg-red-500/20" },
  tour: { icon: FaGlobe, color: "text-indigo-400", bg: "bg-indigo-500/20" },
  restaurant: { icon: FaUtensils, color: "text-pink-400", bg: "bg-pink-500/20" },
  holiday: { icon: FaUmbrellaBeach, color: "text-yellow-400", bg: "bg-yellow-500/20" },
  activity: { icon: FaBolt, color: "text-teal-400", bg: "bg-teal-500/20" },
};

// Demo bookings
const DEMO_BOOKINGS = [
  { id: "BK7X2K9A", type: "flight", title: "IndiGo - Mumbai → Delhi", subtitle: "2026-04-15 • 06:00 - 08:10 • 2 Passengers", amount: 6998, status: "confirmed", date: "2026-03-25" },
  { id: "BK3M5P1Q", type: "hotel", title: "The Grand Palace Hotel", subtitle: "Mumbai • 3 Nights • 1 Room • 2 Guests", amount: 25500, status: "confirmed", date: "2026-03-20" },
  { id: "BKRN8W4T", type: "holiday", title: "Goa Family Package", subtitle: "Goa, India • 3N/4D • 4 Persons", amount: 37998, status: "upcoming", date: "2026-03-18" },
  { id: "BK2L6Y7V", type: "activity", title: "White Water Rafting", subtitle: "Rishikesh • 4 hours • 2 Persons", amount: 3600, status: "completed", date: "2026-03-10" },
  { id: "BK9K3X5M", type: "restaurant", title: "Barbeque Nation", subtitle: "Andheri, Mumbai • 2026-03-08 at 20:30 • 4 Guests", amount: 0, status: "completed", date: "2026-03-08" },
];

const STATUS_STYLES = {
  confirmed: "bg-green-500/20 text-green-400",
  upcoming: "bg-blue-500/20 text-blue-400",
  completed: "bg-gray-500/20 text-gray-400",
  cancelled: "bg-red-500/20 text-red-400",
};

const TABS = ["All", "Upcoming", "Completed", "Cancelled"];

export default function MyBookings() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = DEMO_BOOKINGS.filter(b => {
    const matchTab = tab === "All" || b.status === tab.toLowerCase();
    const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary pb-24 md:pb-8">
      <div className="sticky top-0 z-20 bg-theme-primary/90 backdrop-blur border-b border-theme px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/booking")} className="p-2 rounded-xl hover:bg-theme-secondary"><FaArrowLeft /></button>
        <div className="flex-1">
          <h1 className="font-bold text-lg">My Bookings</h1>
          <p className="text-xs text-theme-secondary">All your travel bookings</p>
        </div>
        <FaTicketAlt className="text-purple-400 text-xl" />
      </div>

      <div className="px-4 py-4">
        {/* Search */}
        <div className="relative mb-4">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-secondary" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bookings, ID..."
            className="w-full pl-10 pr-4 py-3 bg-theme-secondary rounded-xl text-sm outline-none" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-theme-secondary rounded-xl p-1 mb-4">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${tab === t ? "bg-purple-600 text-white" : "text-theme-secondary"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-theme-secondary">
            <FaTicketAlt className="text-5xl mx-auto mb-4 opacity-30" />
            <p>No bookings found</p>
            <button onClick={() => navigate("/booking")} className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-xl text-sm font-medium">
              Explore & Book
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(booking => {
              const typeInfo = TYPE_ICONS[booking.type] || TYPE_ICONS.flight;
              const Icon = typeInfo.icon;
              return (
                <div key={booking.id} className="bg-theme-secondary rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl ${typeInfo.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`${typeInfo.color} text-xl`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold line-clamp-1">{booking.title}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${STATUS_STYLES[booking.status]}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-xs text-theme-secondary mt-0.5 line-clamp-2">{booking.subtitle}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <p className="text-xs text-theme-secondary">Booking ID: <span className="text-purple-400 font-medium">{booking.id}</span></p>
                          <p className="text-xs text-theme-secondary">Booked on {new Date(booking.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                        </div>
                        <p className="font-bold text-purple-400">{booking.amount > 0 ? `₹${booking.amount.toLocaleString()}` : "Free"}</p>
                      </div>
                    </div>
                  </div>
                  {booking.status === "confirmed" || booking.status === "upcoming" ? (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-theme">
                      <button className="flex-1 py-2 bg-theme-primary rounded-xl text-xs font-medium text-theme-secondary hover:text-white transition-colors">
                        View Details
                      </button>
                      <button className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-xl text-xs font-medium hover:bg-red-500/30 transition-colors">
                        Cancel
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
