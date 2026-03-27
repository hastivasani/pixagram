import { useState, useEffect, useRef } from "react";
import { getServices, getAvailableSlots, createBooking, getMyBookings, getServiceCategories } from "../services/api";
import { FaCalendarAlt, FaClock, FaStar, FaSearch, FaPlus, FaCheck, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";

const TABS = ["Discover", "My Bookings", "My Services"];

export default function Booking() {
  const [tab, setTab]               = useState(0);
  const [services, setServices]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [bookings, setBookings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [category, setCategory]     = useState("");
  const [selected, setSelected]     = useState(null); // selected service for booking
  const [slots, setSlots]           = useState([]);
  const [bookDate, setBookDate]     = useState("");
  const [bookSlot, setBookSlot]     = useState("");
  const [bookNotes, setBookNotes]   = useState("");
  const [booking, setBooking]       = useState(false);
  const [booked, setBooked]         = useState(false);

  useEffect(() => {
    loadServices();
    getServiceCategories().then(r => setCategories(r.data || []));
  }, [category]);

  useEffect(() => {
    if (tab === 1) loadMyBookings();
  }, [tab]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (search) params.set("search", search);
      const res = await getServices(`?${params}`);
      setServices(res.data.services || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadMyBookings = async () => {
    setLoading(true);
    try {
      const res = await getMyBookings();
      setBookings(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const abortRef = useRef(null);

  const handleDateChange = async (date) => {
    setBookDate(date);
    setBookSlot("");
    if (!selected || !date) return;

    // Cancel previous request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    try {
      const res = await getAvailableSlots(selected._id, date);
      setSlots(res.data.slots || []);
    } catch (err) {
      if (err.name !== "CanceledError") setSlots([]);
    }
  };

  const handleBook = async () => {
    if (!bookDate || !bookSlot) return alert("Select date and time slot");
    setBooking(true);
    try {
      await createBooking({ serviceId: selected._id, date: bookDate, timeSlot: bookSlot, notes: bookNotes });
      setBooked(true);
      setTimeout(() => { setSelected(null); setBooked(false); setBookDate(""); setBookSlot(""); setBookNotes(""); }, 2000);
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed");
    } finally { setBooking(false); }
  };

  const statusColor = { pending: "text-yellow-400", confirmed: "text-green-400", cancelled: "text-red-400", completed: "text-blue-400" };

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Booking</h1>
          <p className="text-theme-secondary text-sm">Book services from creators</p>
        </div>
        <Link to="/booking/create-service" className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-white text-sm font-medium transition-colors">
          <FaPlus /> Offer Service
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-theme-secondary rounded-xl p-1 mb-6">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === i ? "bg-purple-600 text-white" : "text-theme-secondary"}`}>{t}</button>
        ))}
      </div>

      {tab === 0 && (
        <>
          {/* Search */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-secondary" />
              <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && loadServices()} placeholder="Search services..." className="w-full pl-10 pr-4 py-2.5 bg-theme-secondary rounded-xl text-sm outline-none" />
            </div>
          </div>
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {["", ...categories].map(cat => (
              <button key={cat || "all"} onClick={() => setCategory(cat)} className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${category === cat ? "bg-purple-600 text-white" : "bg-theme-secondary text-theme-secondary"}`}>
                {cat || "All"}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-theme-secondary rounded-2xl animate-pulse" />)}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-20 text-theme-secondary">
              <FaCalendarAlt className="text-5xl mx-auto mb-4 opacity-30" />
              <p>No services found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map(service => (
                <button key={service._id} onClick={() => setSelected(service)} className="bg-theme-secondary rounded-2xl p-4 text-left hover:ring-2 hover:ring-purple-500 transition-all">
                  <div className="flex gap-3">
                    <img src={service.images?.[0] || service.provider?.avatar} alt="" className="w-16 h-16 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold line-clamp-1">{service.title}</p>
                      <p className="text-sm text-theme-secondary line-clamp-1">by @{service.provider?.username}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <FaStar className="text-yellow-400 text-xs" />
                        <span className="text-xs text-theme-secondary">{service.rating?.toFixed(1) || "New"}</span>
                        <span className="text-xs text-theme-secondary ml-2">• {service.duration}min</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-400">${service.price}</p>
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">{service.category}</span>
                    </div>
                  </div>
                  <p className="text-sm text-theme-secondary mt-2 line-clamp-2">{service.description}</p>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 1 && (
        <div className="space-y-3">
          {loading ? (
            [...Array(3)].map((_, i) => <div key={i} className="h-24 bg-theme-secondary rounded-2xl animate-pulse" />)
          ) : bookings.length === 0 ? (
            <div className="text-center py-20 text-theme-secondary">
              <FaCalendarAlt className="text-5xl mx-auto mb-4 opacity-30" />
              <p>No bookings yet</p>
            </div>
          ) : bookings.map(b => (
            <div key={b._id} className="bg-theme-secondary rounded-2xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{b.service?.title}</p>
                  <p className="text-sm text-theme-secondary">by @{b.provider?.username}</p>
                  <div className="flex items-center gap-3 mt-2 text-sm text-theme-secondary">
                    <span className="flex items-center gap-1"><FaCalendarAlt /> {new Date(b.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><FaClock /> {b.timeSlot}</span>
                  </div>
                </div>
                <span className={`text-sm font-medium capitalize ${statusColor[b.status]}`}>{b.status}</span>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-theme">
                <span className="font-bold text-purple-400">${b.price}</span>
                {b.status === "pending" && (
                  <button className="text-sm text-red-400 hover:text-red-300">Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 2 && (
        <div className="text-center py-20 text-theme-secondary">
          <p className="mb-4">Manage your offered services</p>
          <Link to="/booking/create-service" className="px-6 py-3 bg-purple-600 rounded-xl text-white font-medium">Create Service</Link>
        </div>
      )}

      {/* Booking Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md bg-theme-primary rounded-2xl p-6 shadow-2xl">
            {booked ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaCheck className="text-2xl text-white" />
                </div>
                <p className="font-bold text-lg">Booking Confirmed!</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{selected.title}</h3>
                    <p className="text-theme-secondary text-sm">by @{selected.provider?.username} • {selected.duration}min • ${selected.price}</p>
                  </div>
                  <button onClick={() => setSelected(null)}><FaTimes className="text-theme-secondary" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-theme-secondary mb-1 block">Select Date</label>
                    <input type="date" value={bookDate} onChange={e => handleDateChange(e.target.value)} min={new Date().toISOString().split("T")[0]} className="w-full bg-theme-secondary rounded-xl px-4 py-3 outline-none text-sm" />
                  </div>
                  {bookDate && (
                    <div>
                      <label className="text-sm text-theme-secondary mb-2 block">Available Slots</label>
                      {slots.length === 0 ? (
                        <p className="text-sm text-theme-secondary">No slots available for this date</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {slots.map(slot => (
                            <button key={slot} onClick={() => setBookSlot(slot)} className={`py-2 rounded-lg text-sm transition-colors ${bookSlot === slot ? "bg-purple-600 text-white" : "bg-theme-secondary text-theme-secondary hover:bg-purple-500/20"}`}>
                              {slot}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-theme-secondary mb-1 block">Notes (optional)</label>
                    <textarea value={bookNotes} onChange={e => setBookNotes(e.target.value)} placeholder="Any special requests..." rows={2} className="w-full bg-theme-secondary rounded-xl px-4 py-3 outline-none text-sm resize-none" />
                  </div>
                  <button onClick={handleBook} disabled={booking || !bookDate || !bookSlot} className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl text-white font-medium transition-colors">
                    {booking ? "Booking..." : `Book for $${selected.price}`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
