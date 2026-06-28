import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Play, ChevronRight, Timer, Flame, Star, TrendingUp } from "lucide-react";
import { api } from "../lib/api";
import { formatPrice } from "../lib/formatters";
import { trackViewContent, trackViewCategory, trackAddToCart } from "../lib/pixel";
import { useCart } from "../context/CartContext";
import ProductVideoGrid from "../components/ProductVideoGrid";
import toast from "react-hot-toast";

function HeroBanner() {
  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm mb-6">
          <Flame className="w-4 h-4 text-orange-400" />
          <span>New arrivals dropping weekly</span>
        </div>
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter">
          UGLY<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">STORE</span>
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
          Fashion that speaks louder than words. Bold, unapologetic, uniquely you.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Link
            to="/products"
            className="px-8 py-3.5 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-black" /> Shop Now
          </Link>
          <Link
            to="/reels"
            className="px-8 py-3.5 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
          >
            Browse Reels
          </Link>
        </div>
      </div>
    </section>
  );
}

function TrendingReels({ products }) {
  const scrollRef = useRef(null);
  const { addItem } = useCart();

  useEffect(() => { trackViewCategory("Trending"); }, []);

  if (!products.length) return null;

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
          </div>
          <Link to="/products" className="text-sm text-gray-600 hover:text-black flex items-center gap-1 transition-colors">
            See all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory -mx-4 px-4">
          {products.map((p) => {
            const bgHue = (p.name?.charCodeAt(0) || 0) * 5 % 360;
            return (
              <Link
                key={p.id}
                to={`/products/${p.slug}`}
                className="flex-shrink-0 w-44 sm:w-52 snap-start"
                onClick={() => trackViewContent(p)}
              >
                <div
                  className="aspect-[3/4] rounded-2xl overflow-hidden relative group"
                  style={{ background: `linear-gradient(135deg, hsl(${bgHue}, 40%, 25%), hsl(${bgHue + 40}, 50%, 15%))` }}
                >
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-white text-sm font-semibold truncate">{p.name}</p>
                    <p className="text-white/80 text-sm font-bold">{formatPrice(p.price)}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      addItem(p);
                      trackAddToCart(p);
                      toast.success(`${p.name} added to cart`);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full transition-opacity"
                  >
                    +
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FlashSale({ products }) {
  const [timeLeft, setTimeLeft] = useState({ h: 5, m: 30, s: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        let { h, m, s } = prev;
        if (s > 0) s--;
        else if (m > 0) { m--; s = 59; }
        else if (h > 0) { h--; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!products.length) return null;

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-r from-red-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-900">Flash Sale</h2>
          </div>
          <div className="flex items-center gap-1 text-sm font-mono">
            <span className="bg-black text-white px-2 py-1 rounded">{String(timeLeft.h).padStart(2, "0")}</span>
            <span>:</span>
            <span className="bg-black text-white px-2 py-1 rounded">{String(timeLeft.m).padStart(2, "0")}</span>
            <span>:</span>
            <span className="bg-black text-white px-2 py-1 rounded">{String(timeLeft.s).padStart(2, "0")}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.slice(0, 4).map((p) => (
            <Link key={p.id} to={`/products/${p.slug}`} className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
              <div
                className="aspect-square flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, hsl(${(p.name?.charCodeAt(0) || 0) * 5 % 360}, 30%, 90%), hsl(${(p.name?.charCodeAt(0) || 0) * 5 % 360}, 40%, 80%))` }}
              >
                <span className="text-6xl opacity-30" />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-base font-bold text-red-600">{formatPrice(p.price)}</span>
                  <span className="text-xs text-gray-400 line-through">{formatPrice(Number(p.price) * 1.4)}</span>
                </div>
                <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">-30%</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const reviews = [
    { name: "Rahim K.", text: "Lightning fast delivery in Dhaka! Got my order next day.", rating: 5 },
    { name: "Tasnim A.", text: "Best quality street fashion in Bangladesh. Love the Reels-style shopping!", rating: 5 },
    { name: "Farhan S.", text: "COD option makes it super easy. The bKash integration is seamless.", rating: 4 },
    { name: "Nusrat J.", text: "Amazing collection and the prices are unbeatable. My go-to store!", rating: 5 },
  ];

  const scrollRef = useRef(null);

  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">What Our Customers Say</h2>
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x -mx-4 px-4">
          {reviews.map((r, idx) => (
            <div key={idx} className="flex-shrink-0 w-72 sm:w-80 snap-start bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                ))}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">"{r.text}"</p>
              <p className="text-sm font-semibold text-gray-900 mt-4">{r.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CollectionsGrid() {
  const collections = [
    { name: "Streetwear", color: "from-purple-600 to-blue-600" },
    { name: "Essentials", color: "from-green-600 to-teal-600" },
    { name: "Limited Edition", color: "from-red-600 to-pink-600" },
    { name: "Accessories", color: "from-orange-600 to-yellow-600" },
  ];

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Collections</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {collections.map((c) => (
            <Link
              key={c.name}
              to={`/products?search=${c.name}`}
              className={`aspect-[4/3] rounded-2xl bg-gradient-to-br ${c.color} flex items-end p-5 hover:scale-[1.02] transition-transform`}
              onClick={() => trackViewCategory(c.name)}
            >
              <span className="text-white text-lg font-bold">{c.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/products?limit=12")
      .then((res) => setProducts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pb-16 sm:pb-0">
      <HeroBanner />
      <TrendingReels products={products.slice(0, 8)} />
      <CollectionsGrid />

      <section className="py-12 sm:py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Featured</h2>
            <Link to="/reels" className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
              View Reels <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <ProductVideoGrid products={products.slice(0, 6)} onQuickView={() => {}} />
          )}
        </div>
      </section>

      <FlashSale products={products.slice(0, 4)} />
      <Testimonials />

      <section className="py-16 bg-gradient-to-br from-gray-900 to-black text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to get ugly?</h2>
          <p className="text-gray-400 mb-6">Join thousands of fashion rebels.</p>
          <Link to="/products" className="inline-block px-8 py-3.5 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-colors">
            Start Shopping
          </Link>
        </div>
      </section>
    </div>
  );
}
