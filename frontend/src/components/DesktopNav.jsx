import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, LogOut, LayoutDashboard, Search, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function DesktopNav() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (searchOpen && inputRef.current) inputRef.current.focus();
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setSearchOpen(false);
    }
  };

  return (
    <nav className="hidden sm:block bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-black tracking-tighter text-gray-900">
              UGLYSTORE
            </Link>
            <div className="flex items-center gap-6">
              <Link to="/products" className="text-sm text-gray-600 hover:text-black transition-colors font-medium">
                Shop
              </Link>
              <Link to="/reels" className="text-sm text-gray-600 hover:text-black transition-colors font-medium">
                Reels
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black w-48"
                />
                <button type="button" onClick={() => { setSearchOpen(false); setSearch(""); }} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="text-gray-600 hover:text-black transition-colors">
                <Search size={20} />
              </button>
            )}

            <Link to="/cart" className="relative text-gray-600 hover:text-black transition-colors">
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                {user.role === "ADMIN" && (
                  <Link to="/admin" className="text-gray-600 hover:text-black transition-colors" title="Admin">
                    <LayoutDashboard size={20} />
                  </Link>
                )}
                <Link to="/orders" className="text-sm text-gray-600 hover:text-black transition-colors font-medium">
                  Orders
                </Link>
                <span className="text-sm text-gray-500">{user.fullName}</span>
                <button onClick={() => { logout(); navigate("/"); }} className="text-gray-600 hover:text-black transition-colors" title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-black transition-colors font-medium">
                <User size={18} />
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
