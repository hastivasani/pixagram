import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrain, FaArrowLeft, FaSearch, FaExchangeAlt } from "react-icons/fa";

const STATIONS = ["Mumbai CST", "Delhi", "Bangalore", "Chennai Central", "Kolkata Howrah", "Hyderabad", "Ahmedabad", "Jaipur", "Pune", "Surat", "Nagpur", "Lucknow"];

const TRAINS = [
  { id: 1, name: "Rajdhani Express", number: "12951", dep: "16:35", arr: "08:35", duration: "16h", classes: [{ cls: "1A", price: 4500 }, { cls: "2A", price: 2800 }, { cls: "3A", price: 1900 }], days: "Daily", type: "Superfast" },
  { id: 2, name: "Shatabdi Express", number: "12009", dep: "06:00", arr: "13:40", duration: "7h 40m", classes: [{ cls: "CC", price: 1200 }, { cls: "EC", price: 2100 }], days: "Mon-Sat", type: "Superfast" },
  { id: 3, name: "Duronto Express", number: "12221", dep: "23:00", arr: "14:30", duration: "15h 30m", classes: [{ cls: "2A", price: 2400 }, { cls: "3A", price: 1600 }, { cls: "SL", price: 650 }], days: "Tue, Thu, Sat", type: "Express" },
  { id: 4, name: "Garib Rath", number: "12909", dep: "21:30", arr: "12:00", duration: "14h 30m", classes: [{ cls: "3A", price: 1100 }, { cls: "SL", price: 450 }], days: "Daily", type: "Express" },
  { id: 5, name: "Vande Bharat", number: "22439", dep: "06:00", arr: "14:00", duration: "8h", classes: [{ cls: "CC", price: 1500 }, { cls: "EC", price: 2800 }], days: "Daily", type: "Superfast" },
];

const CLASS_LABELS = { "1A": "First AC", "2A": "Second AC", "3A": "Third AC", "SL": "Sleeper", "CC": "Chair Car", "EC": "Executive" };

export default function TrainBooking() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("Mumbai CST");
  const [to, setTo] = useState("Delhi");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [searched, setSearched] = useState(false);
  const [selectedClass, setSelectedClass] = useState({});

  const swap = () => { const t = from; setFrom(to); setTo(t); };

  const handleBook = (train) => {
    const cls = selectedClass[train.id] || train.classes[0];
    navigate("/booking/checkout", {
      state: {
        type: "train",
        title: `${train.name} (${train.number})`,
        subtitle: `${from} → ${to} • ${date} • ${cls.cls} (${CLASS_LABELS[cls.cls]}) • ${passengers} Passenger${passengers > 1 ? "s" : ""}`,
        price: cls.price * passengers,
        details: { ...train, from, to, date, passengers, selectedClass: cls },
      }
    });
  };

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary pb-24 md:pb-8">
      <div className="sticky top-0 z-20 bg-gradient-to-r from-red-600 to-rose-500 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/booking")} className="p-2 rounded-xl bg-white/20 text-white"><FaArrowLeft /></button>
        <div>
          <h1 className="font-bold text-white text-lg">Train Booking</h1>
          <p className="text-white/80 text-xs">Rail journeys across India</p>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="bg-theme-secondary rounded-2xl p-4 space-y-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-xs text-theme-secondary mb-1 block">From Station</label>
              <select value={from} onChange={e => setFrom(e.target.value)} className="w-full bg-theme-primary rounded-xl px-3 py-2.5 text-sm outline-none">
                {STATIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <button onClick={swap} className="mt-5 p-2 bg-red-600 rounded-full text-white"><FaExchangeAlt /></button>
            <div className="flex-1">
              <label className="text-xs text-theme-secondary mb-1 block">To Station</label>
              <select value={to} onChange={e => setTo(e.target.value)} className="w-full bg-theme-primary rounded-xl px-3 py-2.5 text-sm outline-none">
                {STATIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-theme-secondary mb-1 block">Date of Journey</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]}
                className="w-full bg-theme-primary rounded-xl px-3 py-2.5 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs text-theme-secondary mb-1 block">Passengers</label>
              <select value={passengers} onChange={e => setPassengers(Number(e.target.value))} className="w-full bg-theme-primary rounded-xl px-3 py-2.5 text-sm outline-none">
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Passenger{n > 1 ? "s" : ""}</option>)}
              </select>
            </div>
          </div>
          <button onClick={() => { if (!date) return alert("Select date"); setSearched(true); }}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
            <FaSearch /> Search Trains
          </button>
        </div>

        {searched && (
          <div className="space-y-4">
            {TRAINS.map(train => {
              const cls = selectedClass[train.id] || train.classes[0];
              return (
                <div key={train.id} className="bg-theme-secondary rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold">{train.name}</p>
                      <p className="text-xs text-theme-secondary">#{train.number} • {train.type} • Runs: {train.days}</p>
                    </div>
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">{train.type}</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <p className="font-bold text-xl">{train.dep}</p>
                      <p className="text-xs text-theme-secondary">{from.split(" ")[0]}</p>
                    </div>
                    <div className="flex-1 flex flex-col items-center px-3">
                      <p className="text-xs text-theme-secondary">{train.duration}</p>
                      <div className="w-full flex items-center gap-1 my-1">
                        <div className="flex-1 h-px bg-theme-primary" />
                        <FaTrain className="text-red-400 text-xs" />
                        <div className="flex-1 h-px bg-theme-primary" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-xl">{train.arr}</p>
                      <p className="text-xs text-theme-secondary">{to.split(" ")[0]}</p>
                    </div>
                  </div>
                  {/* Class Selection */}
                  <div className="flex gap-2 flex-wrap mb-3">
                    {train.classes.map(c => (
                      <button key={c.cls} onClick={() => setSelectedClass(prev => ({ ...prev, [train.id]: c }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${(selectedClass[train.id]?.cls || train.classes[0].cls) === c.cls ? "bg-red-600 text-white" : "bg-theme-primary text-theme-secondary"}`}>
                        {c.cls} - ₹{c.price}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-red-400 text-lg">₹{(cls.price * passengers).toLocaleString()}</p>
                      <p className="text-xs text-theme-secondary">{CLASS_LABELS[cls.cls]} • {passengers} pax</p>
                    </div>
                    <button onClick={() => handleBook(train)} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors">
                      Book Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
