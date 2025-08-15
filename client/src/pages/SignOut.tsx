import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowLeft, Loader2 } from "lucide-react";

export default function SignOut() {
  const [, setLocation] = useLocation();
  const { signOut, user } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(true);
  const [signOutComplete, setSignOutComplete] = useState(false);

  // Perform sign out when component mounts
  useEffect(() => {
    const performSignOut = async () => {
      if (user) {
        try {
          console.log("SignOut page: Starting sign out process...");
          const { error } = await signOut();
          if (error) {
            console.error("SignOut page: Sign out error:", error);
          } else {
            console.log("SignOut page: Sign out completed successfully");
          }
        } catch (error) {
          console.error(
            "SignOut page: Unexpected error during sign out:",
            error
          );
        }
      }
      setIsSigningOut(false);
      setSignOutComplete(true);
    };

    performSignOut();
  }, [signOut, user]);

  // Auto-redirect to welcome page after 5 seconds (only after sign out is complete)
  useEffect(() => {
    if (signOutComplete) {
      const timer = setTimeout(() => {
        setLocation("/");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [setLocation, signOutComplete]);

  const handleReturnHome = () => {
    setLocation("/");
  };

  // Show loading state while signing out
  if (isSigningOut) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <Loader2
                size={64}
                className="mx-auto text-blue-500 mb-4 animate-spin"
              />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Signing Out...
              </h1>
              <p className="text-gray-600">
                Please wait while we sign you out securely.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Come Back Soon!
            </h1>
            <p className="text-gray-600">
              You have been successfully signed out of your account.
            </p>
          </div>

          <div className="space-y-4">
            <Button onClick={handleReturnHome} className="w-full" size="lg">
              <ArrowLeft size={16} className="mr-2" />
              Return to Home
            </Button>

            <p className="text-sm text-gray-500">
              You'll be automatically redirected in 5 seconds...
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              Thank you for visiting Stuart Main Street!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
