import { Link, useLocation } from "wouter";
import { Home, Calendar, User, Building2 } from "lucide-react";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/events", icon: Calendar, label: "Events" },
  { path: "/account", icon: User, label: "Account" },
  { path: "/directory", icon: Building2, label: "Directory" },
];

export default function BottomNavigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <div className="grid grid-cols-4 h-16">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location === path;
          return (
            <Link key={path} href={path}>
              <div
                className={`flex flex-col items-center justify-center h-full transition-all duration-200 ${
                  isActive
                    ? "text-green-400 bg-blue-600"
                    : "text-gray-500 hover:text-green-600 hover:bg-gray-50"
                }`}
              >
                <Icon size={20} className="mb-1" />
                <span className="text-xs font-medium">{label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
