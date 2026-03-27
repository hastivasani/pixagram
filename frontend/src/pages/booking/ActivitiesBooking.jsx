import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBolt, FaArrowLeft, FaStar, FaClock, FaUsers, FaMapMarkerAlt, FaSearch } from "react-icons/fa";

const ACTIVITIES = [
  { id: 1, title: "Scuba Diving", location: "Andaman Islands", duration: "3 hours", groupSize: "2-8", price: 3500, img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=250&fit=crop", rating: 4.9, reviews: 678, category: "Water Sports", tag: "Thrilling", includes: ["Equipment", "Instructor", "Photos"] },
  { id: 2, title: "Paragliding", location: "Bir Billing, HP", duration: "30 mins", groupSize: "1-4", price: 2500, img: "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=400&h=250&fit=crop", rating: 4.8, reviews: 445, category: "Air Sports", tag: "Popular", includes: ["Equipment", "Instructor", "Video"] },
  { id: 3, title: "White Water Rafting", location: "Rishikesh", duration: "4 hours", groupSize: "6-12", price: 1800, img: "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=400&h=250&fit=crop", rating: 4.7, reviews: 1230, category: "Water Sports", tag: "Bestseller", includes: ["Equipment", "Guide", "Lunch"] },
  { id: 4, title: "Bungee Jumping", location: "Rishikesh", duration: "1 hour", groupSize: "1-10", price: 3000, img: "https://images.unsplash.com/photo-1601024445121-e5b82f020549?w=400&h=250&fit=crop", rating: 4.6, reviews: 892, category: "Extreme", tag: "Adrenaline", includes: ["Safety Gear", "Certificate", "Video"] },
  { id: 5, title: "Camel Safari", location: "Jaisalmer, Rajasthan", duration: "2 hours", groupSize: "2-20", price: 1200, img: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=250&fit=crop", rating: 4.5, reviews: 567, category: "Cultural", tag: "Unique", includes: ["Camel", "Guide", "Sunset View"] },
  { id: 6, title: "Yoga & Meditation Retreat", location: "Rishikesh", duration: "Full Day", groupSize: "5-20", price: 2200, img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=250&fit=crop", rating: 4.9, reviews: 334, category: "Wellness", tag: "Relaxing", includes: ["Yoga Session", "Meditation", "Meals", "Certificate"] },
  { id: 7, title: "Trekking - Valley of Flowers", location: "Uttarakhand", duration: "2 Days", groupSize: "4-15", price: 4500, img: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=250&fit=crop", rating: 4.8, reviews: 289, category: "Trekking", tag: "Scenic", includes: ["Guide", "Camping", "Meals", "Equipment"] },
  { id: 8, title: "Cooking Class - Indian Cuisine", location: "Jaipur", duration: "3 hours", groupSize: "2-10", price: 1500, img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=250&fit=crop", rating: 4.7, reviews: 445, category: "Cultural", tag: "Fun", includes: ["Ingredients", "Recipe Book", "Meal"] },
];

const CATEGORIES = ["All", "Water Sports", "Air Sports", "Extreme", "Cultural", "Wellness", "Trekking"];

export default function ActivitiesBooking() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [persons, setPersons] = useState(2);
  const [date, setDate] = useState("");

  const filtered = ACTIVITIES.filter(a =>
    (category === "All" || a.category === category) &&
    (!search || a.title.toLowerCase().includes(search.toLowerCase()) || a.location.toLowerCase().includes(search.toLowerCase()))
  );

  const handleBook = (activity) => {
    navigate("/booking/checkout", {
      state: {
        type: "activity",
        title: activity.title,
        subtitle: `${activity.location} • ${activity.duration} • ${persons} Person${persons > 1 ? "s" : ""}${date ? ` • ${date}` : ""}`,
        price: activity.price * persons,
        details: { ...activity, persons, date },
      }
    });
  };

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary pb-24 md:pb-8">
      <div className="sticky top-0 z-20 bg-gradient-to-r from-teal-600 to-green-500 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/booking")} className="p-2 rounded-xl bg-white/20 text-white"><FaArrowLeft /></button>
        <div>
          <h1 className="font-bold text-white text-lg">Activities</h1>
          <p className="text-white/80 text-xs">Experiences & adventures</p>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="relative mb-3">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-secondary" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search activities..."
            className="w-full pl-10 pr-4 py-3 bg-theme-secondary rounded-xl text-sm outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs text-theme-secondary mb-1 block">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]}
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
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${category === c ? "bg-teal-600 text-white" : "bg-theme-secondary text-theme-secondary"}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(a => (
            <div key={a.id} className="bg-theme-secondary rounded-2xl overflow-hidden">
              <div className="relative">
                <img src={a.img} alt={a.title} className="w-full h-40 object-cover" />
                {a.tag && <span className="absolute top-2 left-2 bg-teal-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">{a.tag}</span>}
                <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">{a.category}</span>
              </div>
              <div className="p-4">
                <p className="font-bold mb-1">{a.title}</p>
                <p className="text-xs text-theme-secondary flex items-center gap-1 mb-2"><FaMapMarkerAlt />{a.location}</p>
                <div className="flex items-center gap-3 text-xs text-theme-secondary mb-2">
                  <span className="flex items-center gap-1"><FaClock />{a.duration}</span>
                  <span className="flex items-center gap-1"><FaUsers />{a.groupSize}</span>
                  <span className="flex items-center gap-1"><FaStar className="text-yellow-400" />{a.rating}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {a.includes.map(inc => <span key={inc} className="text-xs bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full">✓ {inc}</span>)}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-teal-400">₹{(a.price * persons).toLocaleString()}</p>
                    <p className="text-xs text-theme-secondary">₹{a.price.toLocaleString()} × {persons}</p>
                  </div>
                  <button onClick={() => handleBook(a)} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium transition-colors">
                    Book
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
