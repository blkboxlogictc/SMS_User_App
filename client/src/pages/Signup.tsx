import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, User, Building, ArrowLeft } from "lucide-react";
import { AuthModal } from "@/components/auth/AuthModal";
import { useLocation } from "wouter";

export default function Signup() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  const [userType, setUserType] = useState<"patron" | "business">("patron");
  const [, setLocation] = useLocation();

  const handlePatronSignup = () => {
    setAuthMode("signup");
    setUserType("patron");
    setShowAuthModal(true);
  };

  const handleBusinessSignup = () => {
    setAuthMode("signup");
    setUserType("business");
    setShowAuthModal(true);
  };

  const handleSignIn = () => {
    setAuthMode("signin");
    setShowAuthModal(true);
  };

  const handleBackToWelcome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          {/* Back Button */}
          <div className="flex justify-start mb-4">
            <Button
              variant="ghost"
              onClick={handleBackToWelcome}
              className="text-gray-600 hover:text-gray-800 p-2"
            >
              <ArrowLeft size={20} className="mr-1" />
              Back
            </Button>
          </div>

          <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--sms-green))] to-[hsl(var(--sms-blue))] rounded-full mx-auto mb-4 flex items-center justify-center">
            <MapPin className="text-white" size={32} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Join Stuart Main Street
          </h1>

          <p className="text-gray-600 mb-6">
            Create your account to start discovering local businesses, events,
            and exclusive promotions in downtown Stuart, FL
          </p>

          <div className="space-y-3 mb-4">
            <Button
              onClick={handlePatronSignup}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
            >
              <User size={20} className="mr-2" />
              Sign Up as Patron
            </Button>

            <Button
              onClick={handleBusinessSignup}
              variant="outline"
              className="w-full border-green-600 text-green-600 hover:bg-green-600 hover:text-white flex items-center justify-center"
            >
              <Building size={20} className="mr-2" />
              Business Owner Sign Up
            </Button>
          </div>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={handleSignIn}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Already have an account? Sign In
            </Button>
          </div>
        </CardContent>
      </Card>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authMode}
        defaultUserType={userType}
      />
    </div>
  );
}
