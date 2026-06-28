import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Share2, Bookmark, Eye } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/formatters";
import { trackViewContent, trackAddToCart } from "../lib/pixel";
import toast from "react-hot-toast";

const SWIPE_THRESHOLD = 50;

function ReelCard({ product, isActive, onQuickView }) {
  const { addItem } = useCart();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDoubleTap, setShowDoubleTap] = useState(false);
  const lastTapRef = useRef(0);

  useEffect(() => {
    if (isActive) {
      trackViewContent(product);
    }
  }, [isActive, product]);

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      setLiked(true);
      setShowDoubleTap(true);
      setTimeout(() => setShowDoubleTap(false), 800);
    }
    lastTapRef.current = now;
  };

  const handleBuy = (e) => {
    e.stopPropagation();
    addItem(product);
    trackAddToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url: `/products/${product.slug}` });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(`${window.location.origin}/products/${product.slug}`);
      toast.success("Link copied!");
    }
  };

  const gradientBg = `linear-gradient(135deg, hsl(${(product.name?.charCodeAt(0) || 0) * 5 % 360}, 40%, 25%), hsl(${(product.name?.charCodeAt(1) || 0) * 7 % 360}, 50%, 15%))`;

  return (
    <div
      className="relative w-full h-full select-none overflow-hidden"
      style={{ background: gradientBg }}
      onClick={handleDoubleTap}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[12rem] opacity-20 select-none">
          {product.images?.[0] ? "" : ""}
        </span>
      </div>

      {showDoubleTap && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <Heart className="w-24 h-24 text-red-500 fill-red-500 animate-ping" />
        </div>
      )}

      <div className="absolute top-4 left-4 z-20">
        <span className="text-white/80 text-sm font-bold tracking-widest">UGLYSTORE</span>
      </div>

      <div className="absolute bottom-0 left-0 right-16 p-4 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-20">
        <h3 className="text-white text-lg font-bold leading-tight">{product.name}</h3>
        <p className="text-white/70 text-sm mt-1 line-clamp-2">{product.description || "Premium quality product"}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-white text-xl font-bold">{formatPrice(product.price)}</span>
          {product.discountPrice && (
            <span className="text-white/50 text-sm line-through">{formatPrice(product.discountPrice)}</span>
          )}
        </div>
        {product.stock === 0 && (
          <span className="inline-block mt-1 px-2 py-0.5 bg-red-500/80 text-white text-xs rounded">Out of Stock</span>
        )}
      </div>

      <div className="absolute right-3 bottom-20 z-20 flex flex-col items-center gap-5">
        <button
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
          className="flex flex-col items-center"
        >
          <Heart className={`w-7 h-7 ${liked ? "text-red-500 fill-red-500" : "text-white"}`} />
          <span className="text-white text-xs mt-1">{liked ? "Liked" : "Like"}</span>
        </button>

        <button onClick={handleBuy} className="flex flex-col items-center" disabled={product.stock === 0}>
          <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-black" />
          </div>
          <span className="text-white text-xs mt-1">Buy</span>
        </button>

        <button onClick={handleShare} className="flex flex-col items-center">
          <Share2 className="w-6 h-6 text-white" />
          <span className="text-white text-xs mt-1">Share</span>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); setSaved(!saved); toast.success(saved ? "Removed" : "Saved!"); }}
          className="flex flex-col items-center"
        >
          <Bookmark className={`w-6 h-6 ${saved ? "text-yellow-400 fill-yellow-400" : "text-white"}`} />
          <span className="text-white text-xs mt-1">Save</span>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
          className="flex flex-col items-center"
        >
          <Eye className="w-6 h-6 text-white" />
          <span className="text-white text-xs mt-1">View</span>
        </button>
      </div>
    </div>
  );
}

function QuickViewModal({ product, onClose }) {
  const navigate = useNavigate();
  const { addItem } = useCart();

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</p>
          <p className="text-gray-600 mt-3">{product.description || "No description available."}</p>
          <p className={`text-sm mt-2 ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                addItem(product);
                trackAddToCart(product);
                toast.success(`${product.name} added to cart`);
                onClose();
              }}
              disabled={product.stock === 0}
              className="flex-1 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-300"
            >
              Add to Cart
            </button>
            <button
              onClick={() => { onClose(); navigate(`/products/${product.slug}`); }}
              className="px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductReels({ products }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const containerRef = useRef(null);
  const touchStartRef = useRef({ y: 0, time: 0 });
  const isTransitioning = useRef(false);

  const goTo = useCallback((index) => {
    if (isTransitioning.current) return;
    const clamped = Math.max(0, Math.min(products.length - 1, index));
    if (clamped === currentIndex) return;
    isTransitioning.current = true;
    setCurrentIndex(clamped);
    setTimeout(() => { isTransitioning.current = false; }, 400);
  }, [currentIndex, products.length]);

  const handleTouchStart = (e) => {
    touchStartRef.current = { y: e.touches[0].clientY, time: Date.now() };
  };

  const handleTouchEnd = (e) => {
    const deltaY = touchStartRef.current.y - e.changedTouches[0].clientY;
    const deltaTime = Date.now() - touchStartRef.current.time;
    const velocity = Math.abs(deltaY) / deltaTime;

    if (Math.abs(deltaY) > SWIPE_THRESHOLD || velocity > 0.5) {
      if (deltaY > 0) goTo(currentIndex + 1);
      else goTo(currentIndex - 1);
    }
  };

  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      if (e.deltaY > 30) goTo(currentIndex + 1);
      else if (e.deltaY < -30) goTo(currentIndex - 1);
    };
    const el = containerRef.current;
    if (el) el.addEventListener("wheel", handleWheel, { passive: false });
    return () => { if (el) el.removeEventListener("wheel", handleWheel); };
  }, [currentIndex, goTo]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowDown" || e.key === "j") goTo(currentIndex + 1);
      else if (e.key === "ArrowUp" || e.key === "k") goTo(currentIndex - 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentIndex, goTo]);

  if (!products?.length) return null;

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex flex-col transition-transform duration-400 ease-out"
          style={{
            transform: `translateY(-${currentIndex * 100}%)`,
            height: `${products.length * 100}%`,
          }}
        >
          {products.map((product, idx) => (
            <div key={product.id} className="w-full" style={{ height: `${100 / products.length}%` }}>
              <ReelCard
                product={product}
                isActive={idx === currentIndex}
                onQuickView={setQuickViewProduct}
              />
            </div>
          ))}
        </div>

        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1.5">
          {products.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`w-1.5 rounded-full transition-all ${
                idx === currentIndex ? "h-6 bg-white" : "h-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>

      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  );
}
