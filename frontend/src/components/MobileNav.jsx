import { NavLink } from "react-router-dom";
import { Home, Grid3X3, ShoppingCart, Package, User } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/products", icon: Grid3X3, label: "Shop" },
  { to: "/cart", icon: ShoppingCart, label: "Cart", badge: true },
  { to: "/orders", icon: Package, label: "Orders", auth: true },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function MobileNav() {
  const { totalItems } = useCart();
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 sm:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {navItems.map(({ to, icon: Icon, label, badge, auth }) => {
          const href = auth && !user ? "/login" : to;
          return (
            <NavLink
              key={to}
              to={href}
              end={to === "/"}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center gap-0.5 px-3 py-1 ${
                  isActive ? "text-black" : "text-gray-400"
                }`
              }
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {badge && totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
