import { Link, useLocation } from "react-router-dom";
import { Home, Grid3X3, ShoppingCart, Package, User } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/products", icon: Grid3X3, label: "Shop" },
  { path: "/cart", icon: ShoppingCart, label: "Cart", badge: true },
  { path: "/orders", icon: Package, label: "Orders", auth: true },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function MobileNav() {
  const location = useLocation();
  const { totalItems } = useCart();
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 sm:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {navItems.map(({ path, icon: Icon, label, badge, auth }) => {
          const href = auth && !user ? "/login" : path === "/profile" ? (user ? "/orders" : "/login") : path;
          const isActive = location.pathname === path || (path !== "/" && location.pathname.startsWith(path));
          return (
            <Link
              key={path}
              to={href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-colors ${isActive ? "text-black" : "text-gray-400"}`}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                {badge && totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
