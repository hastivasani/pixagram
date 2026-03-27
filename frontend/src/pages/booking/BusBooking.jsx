import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBus, FaArrowLeft, FaSearch, FaExchangeAlt, FaStar, FaSnowflake, FaPlug, FaWifi } from "react-icons/fa";

const CITIES = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Pune", "Hyderabad", "Ahmedabad", "Jaipur", "Kolkata", "Surat", "Nagpur", "Goa"];

const BUSES = [
  { id: 1, operator: "RedBus Express", type: "AC Sleeper", dep: "21:00", arr: "06:00", duration: "9h", price: 850, seats: 18, rating: 4.4, amenities: ["ac", "wifi", "charging"], boarding: "Dadar Bus Stand" },
  { id: 2, operator: "VRL Travels", type: "Non-AC Seater", dep: "22:30", arr: "08:30", duration: "10h", price: 450, seats: 32, rating: 4.1, amenities: ["charging"], boarding: "Borivali" },
  { id: 3, operator: "SRS Travels", type: "AC Semi-Sleeper", dep: "20:00", arr: "05:30", duration: "9.5h", price: 650, seats: 5, rating: 4.6, amenities: ["ac", "charging"], boarding: "Andheri" },
  { id: 4, operator: "Neeta Tours", type: "Volvo AC Sleeper", dep: "23:00", arr: "07:00", duration: "8h", price: 1100, seats: 12, rating: 4.8, amenities: ["ac", "wifi", "charging"], boarding: "Dadar" },
  { id: 5, operator: "Orange Travels", type: "AC Seater", dep: "07:00", arr: "15:30", duration: "8.5h", price: 550, seats: 24, rating: 4.2, amenities: ["ac"], boarding: "Kurla" },
];

export default function BusBooking() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("Mumbai");
  const [to, setTo] = useState("Pune");
  const [date, setDate] = useState("");
  const [searched, setSearched] = useState(false);
  const [passengers, setPassengers] = useState(1);
  const [sortBy, setSortBy] = useState("price");

  const swap = () => { const t = from; setFrom(to); setTo(t); };

  const sorted = [...BUSES].sort((a, b) => {
    if (sortBy === "price") return a.price - b.price;
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "dep") return a.dep.localeCompare(b.dep);
    return 0;
  });

  const handleBook = (bus) => {
    navigate("/booking/checkout", {
      state: {
        type: "bus",
        title: `${bus.operator} - ${bus.type}`,
        subtitle: `${from} → ${to} • ${date} • ${bus.dep} - ${bus.arr} • ${passengers} Seat${passengers > 1 ? "s" : ""}`,
        price: bus.price * passengers,
        details: { ...bus, from, to, date, passengers },
      }
    });
  };

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary pb-24 md:pb-8">
      <div className="sticky top-0 z-20 bg-gradient-to-r from-orange-500 to-yellow-500 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/booking")} className="p-2 rounded-xl bg-white/20 text-white"><FaArrowLeft /></button>
        <div>
          <h1 className="font-bold text-white text-lg">Bus Booking</h1>
          <p className="text-white/80 text-xs">Intercity bus travel</p>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="bg-theme-secondary rounded-2xl p-4 space-y-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-xs text-theme-secondary mb-1 block">From</label>
              <select value={from} onChange={e => setFrom(e.target.value)} className="w-full bg-theme-primary rounded-xl px-3 py-2.5 text-sm outline-none">
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <button onClick={swap} className="mt-5 p-2 bg-orange-500 rounded-full text-white"><FaExchangeAlt /></button>
            <div className="flex-1">
              <label className="text-xs text-theme-secondary mb-1 block">To</label>
              <select value={to} onChange={e => setTo(e.target.value)} className="w-full bg-theme-primary rounded-xl px-3 py-2.5 text-sm outline-none">
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-theme-secondary mb-1 block">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]}
                className="w-full bg-theme-primary rounded-xl px-3 py-2.5 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs text-theme-secondary mb-1 block">Passengers</label>
              <select value={passengers} onChange={e => setPassengers(Number(e.target.value))} className="w-full bg-theme-primary rounded-xl px-3 py-2.5 text-sm outline-none">
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Seat{n > 1 ? "s" : ""}</option>)}
              </select>
            </div>
          </div>
          <button onClick={() => { if (!date) return alert("Select date"); setSearched(true); }}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
            <FaSearch /> Search Buses
          </button>
        </div>

        {searched && (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-theme-secondary">{sorted.length} buses found</p>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-theme-secondary rounded-xl px-3 py-1.5 text-sm outline-none">
                <option value="price">Cheapest</option>
                <option value="rating">Top Rated</option>
                <option value="dep">Earliest</option>
              </select>
            </div>
            <div className="space-y-3">
              {sorted.map(bus => (
                <div key={bus.id} className="bg-theme-secondary rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold">{bus.operator}</p>
                      <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">{bus.type}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-400 text-lg">₹{(bus.price * passengers).toLocaleString()}</p>
                      <p className="text-xs text-theme-secondary">{passengers > 1 ? `${passengers} seats` : "per seat"}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-center">
                      <p className="font-bold text-xl">{bus.dep}</p>
                      <p className="text-xs text-theme-secondary">{from}</p>
                    </div>
                    <div className="flex-1 flex flex-col items-center px-3">
                      <p className="text-xs text-theme-secondary">{bus.duration}</p>
                      <div className="w-full flex items-center gap-1 my-1">
                        <div className="flex-1 h-px bg-theme-primary" />
                        <FaBus className="text-orange-400 text-xs" />
                        <div className="flex-1 h-px bg-theme-primary" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-xl">{bus.arr}</p>
                      <p className="text-xs text-theme-secondary">{to}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <FaStar className="text-yellow-400 text-xs" />
                        <span className="text-xs">{bus.rating}</span>
                      </div>
                      <div className="flex gap-2">
                        {bus.amenities.includes("ac") && <FaSnowflake className="text-blue-400 text-xs" title="AC" />}
                        {bus.amenities.includes("wifi") && <FaWifi className="text-green-400 text-xs" title="WiFi" />}
                        {bus.amenities.includes("charging") && <FaPlug className="text-yellow-400 text-xs" title="Charging" />}
                      </div>
                      <span className={`text-xs ${bus.seats <= 5 ? "text-red-400 font-medium" : "text-theme-secondary"}`}>{bus.seats} seats left</span>
                    </div>
                    <button onClick={() => handleBook(bus)} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors">
                      Book
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
