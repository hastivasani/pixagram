import { useState, useEffect } from "react";
import { getProducts, addToCart, getCart, getProductCategories, updateCartItem, removeFromCart } from "../services/api";
import { FaShoppingCart, FaStar, FaSearch, FaPlus, FaMinus, FaCheck } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Shop() {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart]             = useState({ items: [] });
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [category, setCategory]     = useState("");
  const [sort, setSort]             = useState("newest");
  const [addedIds, setAddedIds]     = useState(new Set());
  const [cartOpen, setCartOpen]     = useState(false);

  useEffect(() => {
    loadData();
  }, [category, sort]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (sort) params.set("sort", sort);
      const [prodRes, catRes] = await Promise.all([
        getProducts(`?${params}`),
        getProductCategories(),
      ]);
      setProducts(prodRes.data.products || []);
      setCategories(catRes.data || []);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
    // Load cart separately so it doesn't block products
    try {
      const cartRes = await getCart();
      setCart(cartRes.data || { items: [] });
    } catch (err) {
      // Cart load failed (e.g. not logged in), ignore
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort });
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      const res = await getProducts(`?${params}`);
      setProducts(res.data.products || []);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      const res = await addToCart(productId, 1);
      setCart(res.data);
      setAddedIds(prev => new Set([...prev, productId]));
      setTimeout(() => setAddedIds(prev => { const s = new Set(prev); s.delete(productId); return s; }), 2000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add to cart");
    }
  };

  const cartCount = cart.items?.reduce((s, i) => s + i.quantity, 0) || 0;

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Shop</h1>
          <p className="text-theme-secondary text-sm">Discover products from creators</p>
        </div>
        <div className="flex gap-3">
          <Link to="/shop/sell" className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-white text-sm font-medium transition-colors">
            <FaPlus /> Sell
          </Link>
          <button onClick={() => setCartOpen(true)} className="relative p-3 bg-theme-secondary rounded-xl">
            <FaShoppingCart />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-secondary" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 bg-theme-secondary rounded-xl text-sm outline-none"
          />
        </div>
        <button type="submit" className="px-4 py-2.5 bg-purple-600 rounded-xl text-white text-sm">Search</button>
      </form>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setCategory("")}
          className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${!category ? "bg-purple-600 text-white" : "bg-theme-secondary text-theme-secondary"}`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${category === cat ? "bg-purple-600 text-white" : "bg-theme-secondary text-theme-secondary"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex justify-end mb-4">
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="bg-theme-secondary rounded-xl px-3 py-2 text-sm outline-none"
        >
          <option value="newest">Newest</option>
          <option value="popular">Most Popular</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-theme-secondary rounded-2xl overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-700" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-theme-secondary">
          <FaShoppingCart className="text-5xl mx-auto mb-4 opacity-30" />
          <p>No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(product => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={handleAddToCart}
              added={addedIds.has(product._id)}
            />
          ))}
        </div>
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <CartDrawer cart={cart} onClose={() => setCartOpen(false)} onUpdate={setCart} />
      )}
    </div>
  );
}

function ProductCard({ product, onAddToCart, added }) {
  const discount = product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  return (
    <Link to={`/shop/product/${product._id}`} className="bg-theme-secondary rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform block">
      <div className="relative">
        <img
          src={product.images?.[0] || "https://via.placeholder.com/300x200?text=No+Image"}
          alt={product.name}
          className="w-full h-44 object-cover"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
            -{discount}%
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-sm">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="font-medium text-sm line-clamp-2 mb-1">{product.name}</p>
        <div className="flex items-center gap-1 mb-2">
          <FaStar className="text-yellow-400 text-xs" />
          <span className="text-xs text-theme-secondary">{product.rating?.toFixed(1) || "0.0"} ({product.reviewCount})</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-purple-400">${product.price?.toFixed(2)}</span>
            {discount > 0 && (
              <span className="text-xs text-theme-secondary line-through ml-1">${product.comparePrice?.toFixed(2)}</span>
            )}
          </div>
          <button
            onClick={e => { e.preventDefault(); onAddToCart(product._id); }}
            disabled={product.stock === 0}
            className={`p-2 rounded-lg text-sm transition-colors ${added ? "bg-green-600 text-white" : "bg-purple-600 hover:bg-purple-700 text-white"} disabled:opacity-50`}
          >
            {added ? <FaCheck /> : <FaPlus />}
          </button>
        </div>
      </div>
    </Link>
  );
}

function CartDrawer({ cart, onClose, onUpdate }) {
  const total = cart.items?.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0) || 0;

  const handleQty = async (productId, qty) => {
    try {
      const res = await updateCartItem(productId, qty);
      onUpdate(res.data);
    } catch (err) { console.error(err); }
  };

  const handleRemove = async (productId) => {
    try {
      const res = await removeFromCart(productId);
      onUpdate(res.data);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-theme-primary h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-theme">
          <h2 className="font-bold text-lg">Cart ({cart.items?.length || 0})</h2>
          <button onClick={onClose} className="text-theme-secondary hover:text-white">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!cart.items?.length ? (
            <p className="text-center text-theme-secondary py-10">Your cart is empty</p>
          ) : cart.items.map(item => (
            <div key={item.product?._id} className="flex gap-3 bg-theme-secondary rounded-xl p-3">
              <img src={item.product?.images?.[0]} alt="" className="w-16 h-16 object-cover rounded-lg" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">{item.product?.name}</p>
                <p className="text-purple-400 font-bold">${item.product?.price?.toFixed(2)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <button onClick={() => handleQty(item.product._id, item.quantity - 1)} className="w-6 h-6 bg-theme-primary rounded-full flex items-center justify-center text-xs">
                    <FaMinus />
                  </button>
                  <span className="text-sm">{item.quantity}</span>
                  <button onClick={() => handleQty(item.product._id, item.quantity + 1)} className="w-6 h-6 bg-theme-primary rounded-full flex items-center justify-center text-xs">
                    <FaPlus />
                  </button>
                  <button onClick={() => handleRemove(item.product._id)} className="ml-auto text-red-400 hover:text-red-300 text-xs">Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {cart.items?.length > 0 && (
          <div className="p-4 border-t border-theme">
            <div className="flex justify-between mb-3">
              <span className="text-theme-secondary">Total</span>
              <span className="font-bold text-lg">${total.toFixed(2)}</span>
            </div>
            <Link to="/shop/checkout" onClick={onClose} className="block w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-center rounded-xl font-medium transition-colors">
              Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
