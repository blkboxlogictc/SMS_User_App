import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Settings,
  LogOut,
  UserCircle,
  Shield,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { user, signOut, clearInvalidSession } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    // Close menu first
    setIsOpen(false);

    // Use window.location.assign for more reliable navigation
    // This forces a complete page navigation that can't be interfered with by router state
    window.location.assign(window.location.origin + "/signout");

    // The signout will happen on the SignOut page component
  };

  const handleClearSession = async () => {
    // Close menu first
    setIsOpen(false);

    // Use window.location.assign for more reliable navigation
    // This forces a complete page navigation that can't be interfered with by router state
    window.location.assign(window.location.origin + "/signout");

    // The session clearing will happen on the SignOut page component
  };

  const handleAccountSettings = () => {
    setLocation("/account");
    setIsOpen(false);
  };

  const handlePrivacySettings = () => {
    // Future implementation for privacy settings
    toast({
      title: "Coming Soon",
      description: "Privacy settings will be available in a future update",
    });
    setIsOpen(false);
  };

  const handleHelp = () => {
    // Future implementation for help/support
    toast({
      title: "Coming Soon",
      description: "Help & Support will be available in a future update",
    });
    setIsOpen(false);
  };

  const userRole = user?.user_metadata?.role || "patron";
  const userName = user?.user_metadata?.first_name || "User";

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm">
          <User size={20} className="text-gray-600" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-3">
            <UserCircle size={24} className="text-[hsl(var(--sms-blue))]" />
            <div className="text-left">
              <div className="font-semibold">Hello, {userName}!</div>
              <div className="text-sm text-gray-500 capitalize">
                {userRole} Account
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Account Management Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Account</h3>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleAccountSettings}
              >
                <Settings size={16} className="mr-3" />
                Account Settings
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handlePrivacySettings}
              >
                <Shield size={16} className="mr-3" />
                Privacy & Security
              </Button>
            </div>
          </div>

          <Separator />

          {/* Support Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Support</h3>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleHelp}
              >
                <HelpCircle size={16} className="mr-3" />
                Help & Support
              </Button>
            </div>
          </div>

          <Separator />

          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">
              <div className="font-medium">{user?.email}</div>
              <div className="text-xs text-gray-500 mt-1">
                Member since{" "}
                {new Date(user?.created_at || "").toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Debug: Clear Invalid Session Button */}
          <Button
            variant="outline"
            className="w-full justify-start text-orange-600 border-orange-200 hover:bg-orange-50 mb-2"
            onClick={handleClearSession}
          >
            <LogOut size={16} className="mr-3" />
            Clear Session (Debug)
          </Button>

          {/* Logout Button */}
          <Button
            variant="outline"
            className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut size={16} className="mr-3" />
            Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
