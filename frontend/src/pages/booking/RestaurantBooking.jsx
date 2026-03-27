import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUtensils, FaArrowLeft, FaStar, FaMapMarkerAlt, FaClock, FaSearch, FaUsers } from "react-icons/fa";

const RESTAURANTS = [
  { id: 1, name: "Taj Mahal Palace Restaurant", cuisine: "Indian, Mughlai", location: "Colaba, Mumbai", rating: 4.9, reviews: 2340, price: "₹₹₹₹", img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=250&fit=crop", openTime: "12:00 PM - 11:00 PM", tags: ["Fine Dining", "Rooftop"], slots: ["12:00", "13:00", "14:00", "19:00", "20:00", "21:00"] },
  { id: 2, name: "Barbeque Nation", cuisine: "BBQ, Multi-Cuisine", location: "Andheri, Mumbai", rating: 4.5, reviews: 1890, price: "₹₹₹", img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=250&fit=crop", openTime: "12:00 PM - 11:30 PM", tags: ["Buffet", "Family"], slots: ["12:30", "13:30", "19:30", "20:30", "21:30"] },
  { id: 3, name: "The Bombay Canteen", cuisine: "Modern Indian", location: "Lower Parel, Mumbai", rating: 4.7, reviews: 1120, price: "₹₹₹", img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop", openTime: "12:00 PM - 12:00 AM", tags: ["Trendy", "Cocktails"], slots: ["12:00", "13:00", "19:00", "20:00", "21:00", "22:00"] },
  { id: 4, name: "Peshwari - ITC Maratha", cuisine: "North-West Frontier", location: "Sahar, Mumbai", rating: 4.8, reviews: 876, price: "₹₹₹₹", img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=250&fit=crop", openTime: "7:00 PM - 11:30 PM", tags: ["Fine Dining", "Tandoor"], slots: ["19:00", "19:30", "20:00", "20:30", "21:00"] },
  { id: 5, name: "Social", cuisine: "Continental, Cafe", location: "Bandra, Mumbai", rating: 4.4, reviews: 2100, price: "₹₹", img: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=400&h=250&fit=crop", openTime: "11:00 AM - 1:00 AM", tags: ["Casual", "Workspace"], slots: ["11:00", "12:00", "13:00", "14:00", "19:00", "20:00", "21:00"] },
  { id: 6, name: "Trishna", cuisine: "Seafood, Coastal", location: "Fort, Mumbai", rating: 4.6, reviews: 1450, price: "₹₹₹", img: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=250&fit=crop", openTime: "12:00 PM - 3:30 PM, 7:00 PM - 11:30 PM", tags: ["Seafood", "Heritage"], slots: ["12:00", "13:00", "19:00", "20:00", "21:00"] },
];

const CUISINES = ["All", "Indian", "BBQ", "Seafood", "Continental", "Cafe", "Fine Dining"];

export default function RestaurantBooking() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState("All");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(2);
  const [selected, setSelected] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");

  const filtered = RESTAURANTS.filter(r =>
    (cuisine === "All" || r.cuisine.toLowerCase().includes(cuisine.toLowerCase()) || r.tags.some(t => t.toLowerCase().includes(cuisine.toLowerCase()))) &&
    (!search || r.name.toLowerCase().includes(search.toLowerCase()) || r.location.toLowerCase().includes(search.toLowerCase()))
  );

  const handleBook = () => {
    if (!date || !selectedSlot) return alert("Please select date and time slot");
    navigate("/booking/checkout", {
      state: {
        type: "restaurant",
        title: selected.name,
        subtitle: `${selected.location} • ${date} at ${selectedSlot} • ${guests} Guest${guests > 1 ? "s" : ""}`,
        price: 0,
        details: { ...selected, date, slot: selectedSlot, guests },
      }
    });
  };

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary pb-24 md:pb-8">
      <div className="sticky top-0 z-20 bg-gradient-to-r from-pink-600 to-red-500 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/booking")} className="p-2 rounded-xl bg-white/20 text-white"><FaArrowLeft /></button>
        <div>
          <h1 className="font-bold text-white text-lg">Restaurant Booking</h1>
          <p className="text-white/80 text-xs">Reserve your table</p>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Search & Filters */}
        <div className="relative mb-3">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-secondary" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search restaurants..."
            className="w-full pl-10 pr-4 py-3 bg-theme-secondary rounded-xl text-sm outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs text-theme-secondary mb-1 block">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]}
              className="w-full bg-theme-secondary rounded-xl px-3 py-2.5 text-sm outline-none" />
          </div>
          <div>
            <label className="text-xs text-theme-secondary mb-1 block">Guests</label>
            <select value={guests} onChange={e => setGuests(Number(e.target.value))} className="w-full bg-theme-secondary rounded-xl px-3 py-2.5 text-sm outline-none">
              {[1,2,3,4,5,6,7,8,10,12].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? "s" : ""}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
          {CUISINES.map(c => (
            <button key={c} onClick={() => setCuisine(c)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${cuisine === c ? "bg-pink-600 text-white" : "bg-theme-secondary text-theme-secondary"}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Restaurant List */}
        <div className="space-y-4">
          {filtered.map(r => (
            <div key={r.id} className="bg-theme-secondary rounded-2xl overflow-hidden">
              <img src={r.img} alt={r.name} className="w-full h-40 object-cover" />
              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-bold">{r.name}</p>
                  <span className="text-sm font-medium text-theme-secondary">{r.price}</span>
                </div>
                <p className="text-xs text-theme-secondary mb-1">{r.cuisine}</p>
                <p className="text-xs text-theme-secondary flex items-center gap-1 mb-2"><FaMapMarkerAlt />{r.location}</p>
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex items-center gap-1 text-xs"><FaStar className="text-yellow-400" />{r.rating} ({r.reviews})</span>
                  <span className="flex items-center gap-1 text-xs text-theme-secondary"><FaClock />{r.openTime}</span>
                </div>
                <div className="flex gap-1 flex-wrap mb-3">
                  {r.tags.map(tag => <span key={tag} className="text-xs bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded-full">{tag}</span>)}
                </div>
                <button onClick={() => { setSelected(r); setSelectedSlot(""); }}
                  className="w-full py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-sm font-medium transition-colors">
                  Reserve Table
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md bg-theme-primary rounded-2xl p-6 shadow-2xl">
            <h3 className="font-bold text-lg mb-1">{selected.name}</h3>
            <p className="text-sm text-theme-secondary mb-4">{selected.location} • {guests} Guest{guests > 1 ? "s" : ""}</p>
            <div className="mb-4">
              <label className="text-sm text-theme-secondary mb-2 block">Select Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]}
                className="w-full bg-theme-secondary rounded-xl px-4 py-3 text-sm outline-none" />
            </div>
            <div className="mb-4">
              <label className="text-sm text-theme-secondary mb-2 block">Available Time Slots</label>
              <div className="grid grid-cols-3 gap-2">
                {selected.slots.map(slot => (
                  <button key={slot} onClick={() => setSelectedSlot(slot)}
                    className={`py-2 rounded-xl text-sm transition-colors ${selectedSlot === slot ? "bg-pink-600 text-white" : "bg-theme-secondary text-theme-secondary hover:bg-pink-500/20"}`}>
                    {slot}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className="flex-1 py-3 bg-theme-secondary rounded-xl text-sm">Cancel</button>
              <button onClick={handleBook} className="flex-1 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-sm font-medium transition-colors">
                Confirm Reservation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
