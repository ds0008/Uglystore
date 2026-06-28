import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Share2, Bookmark, Eye, ChevronUp, ChevronDown } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/formatters";
import useSwipe from "../hooks/useSwipe";
import toast from "react-hot-toast";

function ReelCard({ product, onQuickView }) {
  const { addItem } = useCart();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  const handleBuy = (e) => {
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleDoubleTap = () => {
    setLiked(true);
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: `/products/${product.slug}` });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/products/${product.slug}`);
      toast.success("Link copied!");
    }
  };

  const swipeHandlers = useSwipe({
    onDoubleTap: handleDoubleTap,
    onLongPress: () => onQuickView(product),
    onSwipeRight: handleShare,
    onSwipeLeft: () => setSaved((s) => !s),
  });

  const gradient = `hsl(${(product.name.length * 37) % 360}, 25%, 20%)`;

  return (
    <div
      className="relative w-full h-full flex items-center justify-center select-none"
      style={{ background: `linear-gradient(135deg, ${gradient}, #111)` }}
      {...swipeHandlers}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[12rem] opacity-20 select-none">👕</span>
      </div>

      {showHeart && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <Heart size={80} className="text-red-500 fill-red-500 animate-ping" />
        </div>
      )}

      <div className="absolute top-4 left-4 z-20">
        <span className="text-white/90 font-bold text-lg tracking-wider">UGLYSTORE</span>
      </div>

      <div className="absolute bottom-0 left-0 right-16 p-4 z-20 bg-gradient-to-t from-black/70 to-transparent pt-16">
        <h3 className="text-white text-xl font-bold leading-tight">{product.name}</h3>
        <p className="text-white/70 text-sm mt-1 line-clamp-2">{product.description || "Premium quality product"}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-white text-2xl font-bold">{formatPrice(product.price)}</span>
          {product.discountPrice && (
            <span className="text-white/50 line-through text-sm">{formatPrice(product.discountPrice)}</span>
          )}
        </div>
        {product.stock === 0 && (
          <span className="inline-block mt-1 px-2 py-0.5 bg-red-500/80 text-white text-xs rounded">Out of Stock</span>
        )}
      </div>

      <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-5">
        <button onClick={() => { setLiked(!liked); }} className="flex flex-col items-center gap-1">
          <Heart size={28} className={liked ? "text-red-500 fill-red-500" : "text-white"} />
          <span className="text-white text-xs">Like</span>
        </button>
        <button onClick={handleShare} className="flex flex-col items-center gap-1">
          <Share2 size={26} className="text-white" />
          <span className="text-white text-xs">Share</span>
        </button>
        <button onClick={() => setSaved(!saved)} className="flex flex-col items-center gap-1">
          <Bookmark size={26} className={saved ? "text-yellow-400 fill-yellow-400" : "text-white"} />
          <span className="text-white text-xs">Save</span>
        </button>
        <button onClick={() => onQuickView(product)} className="flex flex-col items-center gap-1">
          <Eye size={26} className="text-white" />
          <span className="text-white text-xs">View</span>
        </button>
      </div>

      <button
        onClick={handleBuy}
        disabled={product.stock === 0}
        className="absolute right-3 bottom-6 z-20 bg-white text-black px-4 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 shadow-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ShoppingCart size={16} />
        Buy Now
      </button>
    </div>
  );
}

function QuickViewModal({ product, onClose }) {
  const { addItem } = useCart();
  const navigate = useNavigate();

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] overflow-y-auto p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center mb-4">
          <span className="text-8xl">👕</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</p>
        <p className="text-gray-600 mt-2">{product.description || "Premium quality product from UGLYSTORE."}</p>
        <p className={`text-sm mt-2 ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </p>
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => {
              addItem(product);
              toast.success(`${product.name} added to cart`);
              onClose();
            }}
            disabled={product.stock === 0}
            className="flex-1 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition disabled:bg-gray-300"
          >
            Add to Cart
          </button>
          <button
            onClick={() => { onClose(); navigate(`/products/${product.slug}`); }}
            className="px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductReel({ products }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const containerRef = useRef(null);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, products.length - 1));
  }, [products.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleWheel = (e) => {
      e.preventDefault();
      if (e.deltaY > 30) goNext();
      else if (e.deltaY < -30) goPrev();
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [goNext, goPrev]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowDown" || e.key === "j") goNext();
      else if (e.key === "ArrowUp" || e.key === "k") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  if (!products || products.length === 0) return null;

  return (
    <div ref={containerRef} className="relative w-full h-[calc(100vh-4rem)] overflow-hidden bg-black">
      <div
        className="flex flex-col transition-transform duration-500 ease-out"
        style={{ transform: `translateY(-${currentIndex * 100}%)`, height: `${products.length * 100}%` }}
      >
        {products.map((product) => (
          <div key={product.id} className="w-full" style={{ height: `${100 / products.length}%` }}>
            <ReelCard
              product={product}
              onQuickView={setQuickViewProduct}
            />
          </div>
        ))}
      </div>

      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2 hidden sm:flex">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="p-2 bg-white/20 rounded-full text-white hover:bg-white/40 transition disabled:opacity-30"
        >
          <ChevronUp size={20} />
        </button>
        <button
          onClick={goNext}
          disabled={currentIndex === products.length - 1}
          className="p-2 bg-white/20 rounded-full text-white hover:bg-white/40 transition disabled:opacity-30"
        >
          <ChevronDown size={20} />
        </button>
      </div>

      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex-col gap-1 hidden sm:flex">
        {products.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-1.5 rounded-full transition-all ${i === currentIndex ? "h-6 bg-white" : "h-2 bg-white/40"}`}
          />
        ))}
      </div>

      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
}
