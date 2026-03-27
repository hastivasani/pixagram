import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUmbrellaBeach, FaArrowLeft, FaStar, FaClock, FaUsers, FaMapMarkerAlt, FaSearch } from "react-icons/fa";

const HOLIDAYS = [
  { id: 1, title: "Maldives Luxury Escape", location: "Maldives", duration: "5N/6D", price: 89999, oldPrice: 120000, img: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&h=250&fit=crop", rating: 4.9, reviews: 456, includes: ["Flight", "5★ Resort", "All Meals", "Snorkeling", "Transfers"], category: "International", tag: "Luxury" },
  { id: 2, title: "Bali Honeymoon Package", location: "Bali, Indonesia", duration: "6N/7D", price: 65000, oldPrice: 85000, img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=250&fit=crop", rating: 4.8, reviews: 892, includes: ["Flight", "4★ Hotel", "Breakfast", "Spa", "Transfers"], category: "International", tag: "Honeymoon" },
  { id: 3, title: "Dubai Shopping Festival", location: "Dubai, UAE", duration: "4N/5D", price: 45000, oldPrice: 60000, img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=250&fit=crop", rating: 4.7, reviews: 1230, includes: ["Flight", "4★ Hotel", "Breakfast", "City Tour", "Transfers"], category: "International", tag: "Popular" },
  { id: 4, title: "Goa Family Package", location: "Goa, India", duration: "3N/4D", price: 18999, oldPrice: 28000, img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=250&fit=crop", rating: 4.5, reviews: 2100, includes: ["Hotel", "Breakfast", "Water Sports", "Transfers"], category: "Domestic", tag: "Family" },
  { id: 5, title: "Singapore & Malaysia", location: "Singapore + KL", duration: "7N/8D", price: 72000, oldPrice: 95000, img: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&h=250&fit=crop", rating: 4.8, reviews: 678, includes: ["Flight", "4★ Hotel", "Breakfast", "City Tours", "Transfers"], category: "International", tag: "Trending" },
  { id: 6, title: "Manali Snow Adventure", location: "Manali, India", duration: "4N/5D", price: 14999, oldPrice: 22000, img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&h=250&fit=crop", rating: 4.6, reviews: 445, includes: ["Hotel", "Breakfast", "Skiing", "Transfers"], category: "Domestic", tag: "Adventure" },
];

const CATEGORIES = ["All", "International", "Domestic", "Honeymoon", "Family", "Adventure"];

export default function HolidayBooking() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [persons, setPersons] = useState(2);
  const [travelDate, setTravelDate] = useState("");

  const filtered = HOLIDAYS.filter(h =>
    (category === "All" || h.category === category || h.tag === category) &&
    (!search || h.title.toLowerCase().includes(search.toLowerCase()) || h.location.toLowerCase().includes(search.toLowerCase()))
  );

  const handleBook = (holiday) => {
    navigate("/booking/checkout", {
      state: {
        type: "holiday",
        title: holiday.title,
        subtitle: `${holiday.location} • ${holiday.duration} • ${persons} Person${persons > 1 ? "s" : ""}${travelDate ? ` • ${travelDate}` : ""}`,
        price: Math.round(holiday.price * (persons / 2)),
        details: { ...holiday, persons, travelDate },
      }
    });
  };

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary pb-24 md:pb-8">
      <div className="sticky top-0 z-20 bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/booking")} className="p-2 rounded-xl bg-white/20 text-white"><FaArrowLeft /></button>
        <div>
          <h1 className="font-bold text-white text-lg">Holiday Packages</h1>
          <p className="text-white/80 text-xs">All-inclusive holiday deals</p>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="relative mb-3">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-secondary" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search holidays, destinations..."
            className="w-full pl-10 pr-4 py-3 bg-theme-secondary rounded-xl text-sm outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs text-theme-secondary mb-1 block">Travel Date</label>
            <input type="date" value={travelDate} onChange={e => setTravelDate(e.target.value)} min={new Date().toISOString().split("T")[0]}
              className="w-full bg-theme-secondary rounded-xl px-3 py-2.5 text-sm outline-none" />
          </div>
          <div>
            <label className="text-xs text-theme-secondary mb-1 block">Persons</label>
            <select value={persons} onChange={e => setPersons(Number(e.target.value))} className="w-full bg-theme-secondary rounded-xl px-3 py-2.5 text-sm outline-none">
              {[1,2,3,4,5,6,8,10].map(n => <option key={n} value={n}>{n} Person{n > 1 ? "s" : ""}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${category === c ? "bg-yellow-500 text-white" : "bg-theme-secondary text-theme-secondary"}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.map(h => {
            const discount = Math.round((1 - h.price / h.oldPrice) * 100);
            return (
              <div key={h.id} className="bg-theme-secondary rounded-2xl overflow-hidden">
                <div className="relative">
                  <img src={h.img} alt={h.title} className="w-full h-44 object-cover" />
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">-{discount}%</span>
                  {h.tag && <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{h.tag}</span>}
                </div>
                <div className="p-4">
                  <p className="font-bold text-lg mb-1">{h.title}</p>
                  <p className="text-xs text-theme-secondary flex items-center gap-1 mb-2"><FaMapMarkerAlt />{h.location}</p>
                  <div className="flex items-center gap-4 text-xs text-theme-secondary mb-3">
                    <span className="flex items-center gap-1"><FaClock />{h.duration}</span>
                    <span className="flex items-center gap-1"><FaStar className="text-yellow-400" />{h.rating} ({h.reviews})</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {h.includes.map(inc => <span key={inc} className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">✓ {inc}</span>)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-yellow-400 text-lg">₹{Math.round(h.price * (persons / 2)).toLocaleString()}</p>
                      <p className="text-xs text-theme-secondary line-through">₹{Math.round(h.oldPrice * (persons / 2)).toLocaleString()}</p>
                    </div>
                    <button onClick={() => handleBook(h)} className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-sm font-medium transition-colors">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
