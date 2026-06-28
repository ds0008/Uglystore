import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, Package, LogOut, Shield } from "lucide-react";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    { icon: Package, label: "My Orders", to: "/orders" },
    ...(user.role === "ADMIN" ? [{ icon: Shield, label: "Admin Panel", to: "/admin" }] : []),
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-24 sm:pb-8">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center mb-6">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <User className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">{user.fullName}</h1>
        <p className="text-sm text-gray-500">{user.email}</p>
        <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
          {user.role}
        </span>
      </div>

      <div className="space-y-2">
        {menuItems.map(({ icon: Icon, label, to }) => (
          <button
            key={label}
            onClick={() => navigate(to)}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-left"
          >
            <Icon className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-900">{label}</span>
          </button>
        ))}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-colors text-left"
        >
          <LogOut className="w-5 h-5 text-red-500" />
          <span className="font-medium text-red-600">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
