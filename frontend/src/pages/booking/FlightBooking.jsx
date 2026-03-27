import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlane, FaExchangeAlt, FaArrowLeft, FaSearch, FaClock, FaSuitcase } from "react-icons/fa";

const AIRPORTS = ["Mumbai (BOM)", "Delhi (DEL)", "Bangalore (BLR)", "Chennai (MAA)", "Kolkata (CCU)", "Hyderabad (HYD)", "Goa (GOI)", "Dubai (DXB)", "Singapore (SIN)", "London (LHR)", "New York (JFK)", "Bangkok (BKK)"];

const MOCK_FLIGHTS = [
  { id: 1, airline: "IndiGo", logo: "🔵", from: "Mumbai", to: "Delhi", dep: "06:00", arr: "08:10", duration: "2h 10m", stops: "Non-stop", price: 3499, class: "Economy", seats: 12 },
  { id: 2, airline: "Air India", logo: "🔴", from: "Mumbai", to: "Delhi", dep: "08:30", arr: "10:45", duration: "2h 15m", stops: "Non-stop", price: 4299, class: "Economy", seats: 5 },
  { id: 3, airline: "SpiceJet", logo: "🟠", from: "Mumbai", to: "Delhi", dep: "11:00", arr: "13:30", duration: "2h 30m", stops: "1 Stop", price: 2899, class: "Economy", seats: 20 },
  { id: 4, airline: "Vistara", logo: "🟣", from: "Mumbai", to: "Delhi", dep: "14:15", arr: "16:20", duration: "2h 05m", stops: "Non-stop", price: 5499, class: "Business", seats: 3 },
  { id: 5, airline: "GoAir", logo: "🟢", from: "Mumbai", to: "Delhi", dep: "17:45", arr: "20:00", duration: "2h 15m", stops: "Non-stop", price: 3199, class: "Economy", seats: 8 },
  { id: 6, airline: "IndiGo", logo: "🔵", from: "Mumbai", to: "Delhi", dep: "20:30", arr: "22:40", duration: "2h 10m", stops: "Non-stop", price: 2699, class: "Economy", seats: 15 },
];

export default function FlightBooking() {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState("oneway");
  const [from, setFrom] = useState("Mumbai (BOM)");
  const [to, setTo] = useState("Delhi (DEL)");
  const [depDate, setDepDate] = useState("");
  const [retDate, setRetDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState("Economy");
  const [searched, setSearched] = useState(false);
  const [flights, setFlights] = useState([]);
  const [sortBy, setSortBy] = useState("price");

  const swap = () => { const t = from; setFrom(to); setTo(t); };

  const handleSearch = () => {
    if (!depDate) return alert("Please select departure date");
    setFlights(MOCK_FLIGHTS);
    setSearched(true);
  };

  const sorted = [...flights].sort((a, b) => {
    if (sortBy === "price") return a.price - b.price;
    if (sortBy === "duration") return a.duration.localeCompare(b.duration);
    if (sortBy === "dep") return a.dep.localeCompare(b.dep);
    return 0;
  });

  const handleBook = (flight) => {
    navigate("/booking/checkout", {
      state: {
        type: "flight",
        title: `${flight.airline} - ${flight.from} → ${flight.to}`,
        subtitle: `${depDate} • ${flight.dep} - ${flight.arr} • ${passengers} Passenger(s)`,
        price: flight.price * passengers,
        details: { ...flight, depDate, passengers, cabinClass },
      }
    });
  };

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary pb-24 md:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/booking")} className="p-2 rounded-xl bg-white/20 text-white"><FaArrowLeft /></button>
        <div>
          <h1 className="font-bold text-white text-lg">Flight Search</h1>
          <p className="text-white/80 text-xs">Find cheapest flights</p>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Trip Type */}
        <div className="flex gap-2 mb-4">
          {["oneway", "roundtrip", "multicity"].map(t => (
            <button key={t} onClick={() => setTripType(t)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${tripType === t ? "bg-blue-600 text-white" : "bg-theme-secondary text-theme-secondary"}`}>
              {t === "oneway" ? "One Way" : t === "roundtrip" ? "Round Trip" : "Multi City"}
            </button>
          ))}
        </div>

        {/* Search Form */}
        <div className="bg-theme-secondary rounded-2xl p-4 space-y-3 mb-4">
          {/* From / To */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-xs text-theme-secondary mb-1 block">From</label>
              <select value={from} onChange={e => setFrom(e.target.value)} className="w-full bg-theme-primary rounded-xl px-3 py-2.5 text-sm outline-none">
                {AIRPORTS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <button onClick={swap} className="mt-5 p-2 bg-blue-600 rounded-full text-white"><FaExchangeAlt /></button>
            <div className="flex-1">
              <label className="text-xs text-theme-secondary mb-1 block">To</label>
              <select value={to} onChange={e => setTo(e.target.value)} className="w-full bg-theme-primary rounded-xl px-3 py-2.5 text-sm outline-none">
                {AIRPORTS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-theme-secondary mb-1 block">Departure</label>
              <input type="date" value={depDate} onChange={e => setDepDate(e.target.value)} min={new Date().toISOString().split("T")[0]}
                className="w-full bg-theme-primary rounded-xl px-3 py-2.5 text-sm outline-none" />
            </div>
            {tripType === "roundtrip" && (
              <div>
                <label className="text-xs text-theme-secondary mb-1 block">Return</label>
                <input type="date" value={retDate} onChange={e => setRetDate(e.target.value)} min={depDate || new Date().toISOString().split("T")[0]}
                  className="w-full bg-theme-primary rounded-xl px-3 py-2.5 text-sm outline-none" />
              </div>
            )}
          </div>

          {/* Passengers & Class */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-theme-secondary mb-1 block">Passengers</label>
              <select value={passengers} onChange={e => setPassengers(Number(e.target.value))} className="w-full bg-theme-primary rounded-xl px-3 py-2.5 text-sm outline-none">
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Passenger{n > 1 ? "s" : ""}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-theme-secondary mb-1 block">Cabin Class</label>
              <select value={cabinClass} onChange={e => setCabinClass(e.target.value)} className="w-full bg-theme-primary rounded-xl px-3 py-2.5 text-sm outline-none">
                {["Economy", "Premium Economy", "Business", "First Class"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <button onClick={handleSearch} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
            <FaSearch /> Search Flights
          </button>
        </div>

        {/* Results */}
        {searched && (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-theme-secondary">{sorted.length} flights found</p>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-theme-secondary rounded-xl px-3 py-1.5 text-sm outline-none">
                <option value="price">Cheapest</option>
                <option value="duration">Fastest</option>
                <option value="dep">Earliest</option>
              </select>
            </div>
            <div className="space-y-3">
              {sorted.map(flight => (
                <div key={flight.id} className="bg-theme-secondary rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{flight.logo}</span>
                      <div>
                        <p className="font-semibold text-sm">{flight.airline}</p>
                        <p className="text-xs text-theme-secondary">{flight.class}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-400 text-lg">₹{(flight.price * passengers).toLocaleString()}</p>
                      <p className="text-xs text-theme-secondary">per {passengers > 1 ? `${passengers} pax` : "person"}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="font-bold text-lg">{flight.dep}</p>
                      <p className="text-xs text-theme-secondary">{flight.from}</p>
                    </div>
                    <div className="flex-1 flex flex-col items-center px-3">
                      <p className="text-xs text-theme-secondary mb-1">{flight.duration}</p>
                      <div className="w-full flex items-center gap-1">
                        <div className="flex-1 h-px bg-theme-primary" />
                        <FaPlane className="text-blue-400 text-xs" />
                        <div className="flex-1 h-px bg-theme-primary" />
                      </div>
                      <p className="text-xs text-theme-secondary mt-1">{flight.stops}</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg">{flight.arr}</p>
                      <p className="text-xs text-theme-secondary">{flight.to}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-theme">
                    <div className="flex items-center gap-3 text-xs text-theme-secondary">
                      <span className="flex items-center gap-1"><FaSuitcase /> Cabin bag</span>
                      <span className="flex items-center gap-1"><FaClock /> {flight.duration}</span>
                      <span className={flight.seats <= 5 ? "text-red-400 font-medium" : ""}>{flight.seats} seats left</span>
                    </div>
                    <button onClick={() => handleBook(flight)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">
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
