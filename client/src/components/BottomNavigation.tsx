import { Link, useLocation } from "wouter";
import { Home, Calendar, User, Tag } from "lucide-react";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/events", icon: Calendar, label: "Events" },
  { path: "/account", icon: User, label: "Account" },
  { path: "/promotions", icon: Tag, label: "Deals" },
];

export default function BottomNavigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="grid grid-cols-4 h-16">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location === path;
          return (
            <Link key={path} href={path}>
              <div className={`flex flex-col items-center justify-center h-full ${
                isActive ? 'text-[hsl(var(--sms-blue))]' : 'text-gray-400 hover:text-[hsl(var(--sms-blue))]'
              }`}>
                <Icon size={20} className="mb-1" />
                <span className="text-xs">{label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
