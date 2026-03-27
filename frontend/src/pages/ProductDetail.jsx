import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProduct, addToCart, addProductReview } from "../services/api";
import { useAuth } from "../Context/AuthContext";
import {
  FaStar, FaStarHalfAlt, FaRegStar,
  FaShoppingCart, FaArrowLeft, FaHeart,
  FaShare, FaCheck, FaTruck, FaShieldAlt, FaUndo, FaPlus, FaMinus,
} from "react-icons/fa";

function StarRating({ rating, size = 14 }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map(s => {
        const Icon = s <= Math.floor(rating) ? FaStar
          : s - 0.5 <= rating ? FaStarHalfAlt : FaRegStar;
        return <Icon key={s} size={size} className={s <= rating ? "text-yellow-400" : "text-theme-secondary"} />;
      })}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [imgIdx, setImgIdx]         = useState(0);
  const [qty, setQty]               = useState(1);
  const [adding, setAdding]         = useState(false);
  const [added, setAdded]           = useState(false);
  const [wishlist, setWishlist]     = useState(false);
  const [tab, setTab]               = useState("desc"); // desc | reviews
  const [review, setReview]         = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);
  const [copied, setCopied]         = useState(false);

  useEffect(() => {
    getProduct(id)
      .then(r => setProduct(r.data))
      .catch(() => navigate("/shop"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addToCart(product._id, qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add to cart");
    } finally { setAdding(false); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!review.comment.trim()) return;
    setSubmitting(true);
    try {
      await addProductReview(product._id, review);
      setReviewDone(true);
      const r = await getProduct(id);
      setProduct(r.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit review");
    } finally { setSubmitting(false); }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const discount = product?.comparePrice > product?.price
    ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;

  if (loading) return (
    <div className="min-h-screen bg-theme-primary flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return null;

  const images = product.images?.length
    ? product.images
    : ["https://via.placeholder.com/600x600?text=No+Image"];

  const alreadyReviewed = product.reviews?.some(
    r => String(r.user?._id || r.user) === String(user?._id)
  );

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary pb-24 md:pb-8">

      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-theme-primary/90 backdrop-blur border-b border-theme px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/shop")} className="p-2 rounded-xl hover:bg-theme-secondary transition">
          <FaArrowLeft />
        </button>
        <h1 className="font-bold text-theme-primary flex-1 truncate">{product.name}</h1>
        <button onClick={() => setWishlist(w => !w)}
          className={`p-2 rounded-xl transition ${wishlist ? "text-red-500" : "text-theme-secondary hover:text-red-400"}`}>
          <FaHeart />
        </button>
        <button onClick={handleShare} className="p-2 rounded-xl text-theme-secondary hover:text-purple-400 transition" title="Copy link">
          {copied ? <FaCheck className="text-green-400" /> : <FaShare />}
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* ── Images ─────────────────────────────────────── */}
          <div>
            <div className="relative rounded-2xl overflow-hidden bg-theme-secondary aspect-square mb-3">
              <img src={images[imgIdx]} alt={product.name} className="w-full h-full object-cover" />
              {discount > 0 && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-sm px-3 py-1 rounded-full font-bold">
                  -{discount}%
                </span>
              )}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Out of Stock</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition ${imgIdx === i ? "border-purple-500" : "border-transparent opacity-60 hover:opacity-100"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ────────────────────────────────── */}
          <div className="space-y-4">
            {/* Category + Title */}
            <div>
              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">{product.category}</span>
              <h2 className="text-2xl font-bold mt-2">{product.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={product.rating || 0} />
                <span className="text-sm text-theme-secondary">
                  {product.rating?.toFixed(1) || "0.0"} ({product.reviewCount || 0} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-purple-400">${product.price?.toFixed(2)}</span>
              {discount > 0 && (
                <>
                  <span className="text-lg text-theme-secondary line-through">${product.comparePrice?.toFixed(2)}</span>
                  <span className="text-sm text-green-400 font-bold">Save {discount}%</span>
                </>
              )}
            </div>

            {/* Seller */}
            <Link to={`/profile/${product.seller?.username}`}
              className="flex items-center gap-2 p-3 bg-theme-secondary rounded-xl hover:bg-theme-hover transition">
              <img
                src={product.seller?.avatar || `https://ui-avatars.com/api/?name=${product.seller?.username}&background=random`}
                className="w-8 h-8 rounded-full object-cover" alt="" />
              <div>
                <p className="text-sm font-medium">{product.seller?.name || product.seller?.username}</p>
                <p className="text-xs text-theme-secondary">@{product.seller?.username}</p>
              </div>
              {product.seller?.isVerified && <span className="ml-auto text-blue-400 text-xs">✓ Verified</span>}
            </Link>

            {/* Stock + Sold */}
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? "bg-green-400" : "bg-red-400"}`} />
              <span className="text-sm text-theme-secondary">
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </span>
              {product.sold > 0 && (
                <span className="text-sm text-theme-secondary">· {product.sold} sold</span>
              )}
            </div>

            {/* Quantity selector */}
            {product.stock > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-theme-secondary">Quantity:</span>
                <div className="flex items-center gap-2 bg-theme-secondary rounded-xl px-3 py-2">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-theme-hover transition">
                    <FaMinus size={10} />
                  </button>
                  <span className="w-8 text-center font-bold">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-theme-hover transition">
                    <FaPlus size={10} />
                  </button>
                </div>
              </div>
            )}

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className={`w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
                added ? "bg-green-600" : product.stock === 0 ? "bg-theme-secondary text-theme-secondary cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700 active:scale-95"
              } disabled:opacity-60`}
            >
              {added ? <><FaCheck /> Added to Cart!</> : adding ? "Adding..." : <><FaShoppingCart /> Add to Cart — ${(product.price * qty).toFixed(2)}</>}
            </button>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: FaTruck,     label: product.shippingInfo?.freeShipping ? "Free Shipping" : `~${product.shippingInfo?.estimatedDays || 5} days` },
                { icon: FaShieldAlt, label: "Secure Payment" },
                { icon: FaUndo,      label: "Easy Returns" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 p-2 bg-theme-secondary rounded-xl text-center">
                  <Icon className="text-purple-400" size={16} />
                  <span className="text-[10px] text-theme-secondary leading-tight">{label}</span>
                </div>
              ))}
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map(tag => (
                  <span key={tag} className="text-xs bg-theme-secondary text-theme-secondary px-2 py-1 rounded-full">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Tabs: Description / Reviews ─────────────────── */}
        <div className="mt-8">
          <div className="flex gap-1 bg-theme-secondary rounded-xl p-1 mb-6 w-fit">
            {[{ id: "desc", label: "Description" }, { id: "reviews", label: `Reviews (${product.reviewCount || 0})` }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? "bg-purple-600 text-white" : "text-theme-secondary hover:text-theme-primary"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === "desc" ? (
            <div className="bg-theme-secondary rounded-2xl p-5">
              <p className="text-theme-primary leading-relaxed whitespace-pre-wrap">
                {product.description || "No description provided."}
              </p>
              {product.shippingInfo && (
                <div className="mt-4 pt-4 border-t border-theme space-y-1">
                  <p className="text-sm font-semibold text-theme-primary mb-2">Shipping Info</p>
                  <p className="text-sm text-theme-secondary">
                    {product.shippingInfo.freeShipping ? "✅ Free shipping" : "📦 Standard shipping"}
                  </p>
                  <p className="text-sm text-theme-secondary">
                    🕐 Estimated delivery: {product.shippingInfo.estimatedDays || 5} days
                  </p>
                  {product.shippingInfo.weight > 0 && (
                    <p className="text-sm text-theme-secondary">⚖️ Weight: {product.shippingInfo.weight}kg</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Write a review */}
              {user && !alreadyReviewed && !reviewDone && (
                <form onSubmit={handleReview} className="bg-theme-secondary rounded-2xl p-5 space-y-3">
                  <h3 className="font-semibold">Write a Review</h3>
                  {/* Star picker */}
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} type="button" onClick={() => setReview(r => ({ ...r, rating: s }))}>
                        <FaStar size={24} className={s <= review.rating ? "text-yellow-400" : "text-theme-secondary"} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={review.comment}
                    onChange={e => setReview(r => ({ ...r, comment: e.target.value }))}
                    placeholder="Share your experience with this product..."
                    rows={3}
                    className="w-full bg-theme-primary rounded-xl px-4 py-3 text-sm outline-none resize-none border border-theme focus:border-purple-500 transition"
                  />
                  <button type="submit" disabled={submitting || !review.comment.trim()}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
                    {submitting ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              )}

              {reviewDone && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 text-green-400 text-sm flex items-center gap-2">
                  <FaCheck /> Review submitted successfully!
                </div>
              )}

              {/* Reviews list */}
              {product.reviews?.length === 0 ? (
                <div className="text-center py-12 text-theme-secondary">
                  <FaStar className="text-4xl mx-auto mb-3 opacity-20" />
                  <p>No reviews yet. Be the first!</p>
                </div>
              ) : (
                product.reviews?.map((r, i) => (
                  <div key={i} className="bg-theme-secondary rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={r.user?.avatar || `https://ui-avatars.com/api/?name=${r.user?.username || "U"}&background=random`}
                        className="w-9 h-9 rounded-full object-cover" alt="" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{r.user?.username || "User"}</p>
                        <StarRating rating={r.rating} size={12} />
                      </div>
                      <span className="text-xs text-theme-secondary">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {r.comment && <p className="text-sm text-theme-primary">{r.comment}</p>}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
