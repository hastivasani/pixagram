import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../services/api";
import { FaArrowLeft, FaPlus, FaTimes, FaImage } from "react-icons/fa";

const CATEGORIES = [
  "General", "Electronics", "Fashion", "Beauty", "Home & Garden",
  "Sports", "Books", "Toys", "Food", "Art", "Music", "Gaming", "Other",
];

export default function SellProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", description: "", price: "", comparePrice: "",
    category: "General", stock: "1", tags: "",
  });
  const [images, setImages]     = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const removeImage = (i) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Product name is required");
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) return setError("Valid price is required");

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name",         form.name.trim());
      fd.append("description",  form.description.trim());
      fd.append("price",        form.price);
      fd.append("comparePrice", form.comparePrice || "0");
      fd.append("category",     form.category);
      fd.append("stock",        form.stock || "1");
      fd.append("tags",         form.tags);
      images.forEach(img => fd.append("images", img));

      await createProduct(fd);
      navigate("/shop");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary pb-24 md:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-theme-primary/90 backdrop-blur border-b border-theme px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/shop")} className="p-2 rounded-xl hover:bg-theme-secondary transition">
          <FaArrowLeft />
        </button>
        <h1 className="font-bold text-lg">List a Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto px-4 py-6 space-y-5">

        {/* Images */}
        <div>
          <label className="text-sm font-medium text-theme-secondary mb-2 block">Product Images (up to 5)</label>
          <div className="flex gap-2 flex-wrap">
            {previews.map((src, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/70 text-white rounded-full flex items-center justify-center">
                  <FaTimes size={8} />
                </button>
              </div>
            ))}
            {previews.length < 5 && (
              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-theme flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition text-theme-secondary hover:text-purple-400">
                <FaImage size={18} />
                <span className="text-[10px] mt-1">Add</span>
                <input type="file" hidden accept="image/*" multiple onChange={handleImages} />
              </label>
            )}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="text-sm font-medium text-theme-secondary mb-1 block">Product Name *</label>
          <input value={form.name} onChange={e => set("name", e.target.value)}
            placeholder="e.g. Wireless Headphones"
            className="w-full bg-theme-secondary rounded-xl px-4 py-3 outline-none text-sm focus:ring-2 focus:ring-purple-500 transition" />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-theme-secondary mb-1 block">Description</label>
          <textarea value={form.description} onChange={e => set("description", e.target.value)}
            placeholder="Describe your product..."
            rows={4}
            className="w-full bg-theme-secondary rounded-xl px-4 py-3 outline-none text-sm resize-none focus:ring-2 focus:ring-purple-500 transition" />
        </div>

        {/* Price + Compare Price */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-theme-secondary mb-1 block">Price ($) *</label>
            <input type="number" min="0" step="0.01" value={form.price} onChange={e => set("price", e.target.value)}
              placeholder="0.00"
              className="w-full bg-theme-secondary rounded-xl px-4 py-3 outline-none text-sm focus:ring-2 focus:ring-purple-500 transition" />
          </div>
          <div>
            <label className="text-sm font-medium text-theme-secondary mb-1 block">Original Price ($)</label>
            <input type="number" min="0" step="0.01" value={form.comparePrice} onChange={e => set("comparePrice", e.target.value)}
              placeholder="0.00 (optional)"
              className="w-full bg-theme-secondary rounded-xl px-4 py-3 outline-none text-sm focus:ring-2 focus:ring-purple-500 transition" />
          </div>
        </div>

        {/* Category + Stock */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-theme-secondary mb-1 block">Category</label>
            <select value={form.category} onChange={e => set("category", e.target.value)}
              className="w-full bg-theme-secondary rounded-xl px-4 py-3 outline-none text-sm focus:ring-2 focus:ring-purple-500 transition">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-theme-secondary mb-1 block">Stock Quantity</label>
            <input type="number" min="0" value={form.stock} onChange={e => set("stock", e.target.value)}
              placeholder="1"
              className="w-full bg-theme-secondary rounded-xl px-4 py-3 outline-none text-sm focus:ring-2 focus:ring-purple-500 transition" />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="text-sm font-medium text-theme-secondary mb-1 block">Tags (comma separated)</label>
          <input value={form.tags} onChange={e => set("tags", e.target.value)}
            placeholder="e.g. wireless, audio, music"
            className="w-full bg-theme-secondary rounded-xl px-4 py-3 outline-none text-sm focus:ring-2 focus:ring-purple-500 transition" />
        </div>

        {error && <p className="text-red-400 text-sm bg-red-400/10 px-4 py-3 rounded-xl">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors">
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Listing...</>
          ) : (
            <><FaPlus /> List Product</>
          )}
        </button>
      </form>
    </div>
  );
}
