import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { ArrowRight, Zap, Star, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "../lib/api";
import { formatPrice } from "../lib/formatters";
import { useCart } from "../context/CartContext";
import CountdownTimer from "../components/CountdownTimer";
import { SkeletonGrid, SkeletonBlock } from "../components/LoadingSkeleton";
import toast from "react-hot-toast";

const flashSaleEnd = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();

const testimonials = [
  { name: "Rahim K.", text: "Fastest delivery in Dhaka! Got my order in 2 hours.", rating: 5 },
  { name: "Fatima A.", text: "Love the unique styles. Nothing like this in BD!", rating: 5 },
  { name: "Kamal H.", text: "bKash payment was super smooth. Will order again.", rating: 4 },
  { name: "Nusrat J.", text: "Best customer service ever. They even called me!", rating: 5 },
  { name: "Arif M.", text: "COD option made it easy. Great quality clothes.", rating: 4 },
];

function MiniReel({ product }) {
  const { addItem } = useCart();
  const gradient = `hsl(${(product.name.length * 37) % 360}, 25%, 22%)`;
  return (
    <div className="relative min-w-[200px] h-[320px] rounded-xl overflow-hidden snap-start shrink-0 group cursor-pointer" style={{ background: `linear-gradient(135deg, ${gradient}, #111)` }}>
      <Link to={`/products/${product.slug}`} className="absolute inset-0 z-10" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-7xl opacity-20">👕</span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent z-20">
        <p className="text-white text-sm font-semibold truncate">{product.name}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-white font-bold">{formatPrice(product.price)}</span>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); addItem(product); toast.success("Added!"); }}
            className="relative z-30 p-1.5 bg-white/20 rounded-full hover:bg-white/40 transition text-white text-xs"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

function HorizontalScroll({ children }) {
  const scrollRef = useRef(null);
  const scroll = (dir) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 300, behavior: "smooth" });
  };
  return (
    <div className="relative group">
      <button onClick={() => scroll(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition hidden sm:block">
        <ChevronLeft size={20} />
      </button>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -mx-1 px-1">
        {children}
      </div>
      <button onClick={() => scroll(1)} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition hidden sm:block">
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

function TestimonialCard({ testimonial }) {
  return (
    <div className="min-w-[280px] bg-white border border-gray-100 rounded-xl p-5 snap-start shrink-0 shadow-sm">
      <div className="flex gap-0.5 mb-2">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={14} className={i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
        ))}
      </div>
      <p className="text-gray-600 text-sm leading-relaxed">"{testimonial.text}"</p>
      <p className="text-gray-900 font-semibold text-sm mt-3">{testimonial.name}</p>
    </div>
  );
}

const collections = [
  { name: "Street Wear", emoji: "🧢", color: "from-purple-900 to-purple-700" },
  { name: "Summer Drop", emoji: "🌴", color: "from-orange-800 to-yellow-700" },
  { name: "Basics", emoji: "👕", color: "from-gray-800 to-gray-600" },
  { name: "Premium", emoji: "💎", color: "from-blue-900 to-blue-700" },
  { name: "Limited Ed.", emoji: "🔥", color: "from-red-900 to-red-700" },
  { name: "Accessories", emoji: "⌚", color: "from-emerald-900 to-emerald-700" },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/products?limit=12")
      .then((res) => setProducts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pb-16 sm:pb-0">
      {/* Hero */}
      <section className="relative overflow-hidden bg-black text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-32 text-center">
          <div className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm text-white/80 mb-6 backdrop-blur-sm">
            <Zap size={14} className="inline mr-1" /> New Collection Just Dropped
          </div>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter">
            UGLY<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">STORE</span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-400 max-w-xl mx-auto">
            Bold fashion for bold people. Swipe through our reels, find your style.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link to="/reels" className="px-8 py-3.5 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-colors flex items-center gap-2">
              Browse Reels <ArrowRight size={18} />
            </Link>
            <Link to="/products" className="px-8 py-3.5 border border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-colors">
              Shop All
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Reels */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
          </div>
          <Link to="/reels" className="text-sm text-gray-500 hover:text-black transition flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <SkeletonBlock height="h-80" />
        ) : (
          <HorizontalScroll>
            {products.slice(0, 8).map((p) => (
              <MiniReel key={p.id} product={p} />
            ))}
          </HorizontalScroll>
        )}
      </section>

      {/* Collections */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Collections</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {collections.map((c) => (
            <Link
              key={c.name}
              to={`/products?search=${encodeURIComponent(c.name)}`}
              className={`relative rounded-xl overflow-hidden aspect-square bg-gradient-to-br ${c.color} p-4 flex flex-col justify-end hover:scale-105 transition-transform`}
            >
              <span className="text-4xl mb-2">{c.emoji}</span>
              <span className="text-white font-bold text-sm">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash Sale */}
      <section className="bg-gradient-to-r from-red-600 to-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap size={20} className="text-yellow-300" />
                <h2 className="text-2xl font-bold">Flash Sale</h2>
              </div>
              <p className="text-white/80 text-sm">Limited time offers - grab them before they're gone!</p>
            </div>
            <CountdownTimer endTime={flashSaleEnd} />
          </div>
          {loading ? (
            <SkeletonGrid count={4} />
          ) : (
            <HorizontalScroll>
              {products.slice(0, 6).map((p) => (
                <div key={p.id} className="min-w-[220px] bg-white rounded-xl p-4 snap-start shrink-0">
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                    <span className="text-5xl opacity-40">👕</span>
                  </div>
                  <h3 className="text-gray-900 font-semibold text-sm truncate">{p.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-900 font-bold">{formatPrice(p.price)}</span>
                  </div>
                  <Link
                    to={`/products/${p.slug}`}
                    className="block mt-2 text-center py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition"
                  >
                    Buy Now
                  </Link>
                </div>
              ))}
            </HorizontalScroll>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">What Customers Say</h2>
        <HorizontalScroll>
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} testimonial={t} />
          ))}
        </HorizontalScroll>
      </section>

      {/* Latest Products Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Latest Products</h2>
          <Link to="/products" className="text-sm text-gray-500 hover:text-black transition flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <SkeletonGrid count={4} />
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.slice(0, 8).map((p) => (
              <Link
                key={p.id}
                to={`/products/${p.slug}`}
                className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square bg-gray-50 flex items-center justify-center">
                  <span className="text-5xl text-gray-300 group-hover:scale-110 transition-transform">👕</span>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 text-sm truncate">{p.name}</h3>
                  <span className="text-gray-900 font-bold">{formatPrice(p.price)}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-12">No products yet.</p>
        )}
      </section>

      {/* Minimal Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-3">UGLYSTORE</h3>
              <p className="text-sm text-gray-500">Bold fashion for bold people.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Shop</h4>
              <div className="flex flex-col gap-2 text-sm">
                <Link to="/products" className="hover:text-white transition">All Products</Link>
                <Link to="/reels" className="hover:text-white transition">Reels</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Account</h4>
              <div className="flex flex-col gap-2 text-sm">
                <Link to="/orders" className="hover:text-white transition">My Orders</Link>
                <Link to="/login" className="hover:text-white transition">Sign In</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Support</h4>
              <div className="flex flex-col gap-2 text-sm">
                <span>help@uglystore.com</span>
                <span>+880 1XXX-XXXXXX</span>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} UGLYSTORE. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
