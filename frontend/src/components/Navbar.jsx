import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ShoppingCart, User, LogOut, LayoutDashboard, Search, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { trackSearch } from "../lib/pixel";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      trackSearch(query.trim());
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-black tracking-tighter text-gray-900">
            UGLY<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">STORE</span>
          </Link>

          <div className="hidden sm:flex items-center gap-6">
            <Link to="/products" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
              Shop
            </Link>
            <Link to="/reels" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
              Reels
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-gray-600 hover:text-gray-900 transition-colors hidden sm:block"
            >
              <Search size={20} />
            </button>

            <Link to="/cart" className="relative text-gray-600 hover:text-gray-900 transition-colors">
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                {user.role === "ADMIN" && (
                  <Link to="/admin" className="text-gray-600 hover:text-gray-900 transition-colors" title="Admin">
                    <LayoutDashboard size={22} />
                  </Link>
                )}
                <Link to="/orders" className="text-gray-600 hover:text-gray-900 transition-colors hidden sm:inline text-sm font-medium">
                  Orders
                </Link>
                <span className="text-sm text-gray-500 hidden lg:inline">{user.fullName}</span>
                <button onClick={handleLogout} className="text-gray-600 hover:text-gray-900 transition-colors" title="Logout">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors">
                <User size={20} />
                <span className="text-sm hidden sm:inline font-medium">Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-3">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
              />
            </div>
            <button type="submit" className="px-5 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
              Search
            </button>
            <button type="button" onClick={() => setSearchOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </form>
        </div>
      )}
    </nav>
  );
}
