import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { BusinessOnboardingModal } from "@/components/BusinessOnboardingModal";
import NotFound from "@/pages/not-found";
import Welcome from "@/pages/Welcome";
import Signup from "@/pages/Signup";
import Home from "@/pages/Home";
import Events from "@/pages/Events";
import EventDetail from "@/pages/EventDetail";
import Account from "@/pages/Account";
import BusinessDirectory from "@/pages/BusinessDirectory";
import SignOut from "@/pages/SignOut";

// Get the API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Router() {
  const { user, loading } = useAuth();
  const [showBusinessOnboarding, setShowBusinessOnboarding] = useState(false);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);

  // Check if business user needs onboarding
  useEffect(() => {
    if (user && !hasCheckedOnboarding) {
      setHasCheckedOnboarding(true);

      // Check if user is a business owner without a business
      if (user.role === "business") {
        // Check if they have a business_id or business record
        fetch(`${API_BASE_URL}/api/businesses/owned`)
          .then((res) => res.json())
          .then((businesses) => {
            if (!businesses || businesses.length === 0) {
              // No business found, show onboarding
              setShowBusinessOnboarding(true);
            }
          })
          .catch((err) => {
            console.warn("Could not check business status:", err);
            // If we can't check, show onboarding to be safe
            setShowBusinessOnboarding(true);
          });
      }
    }
  }, [user, hasCheckedOnboarding]);

  const handleBusinessOnboardingComplete = () => {
    setShowBusinessOnboarding(false);
    // Optionally refresh user data or redirect
    window.location.reload();
  };

  return (
    <>
      <Switch>
        {/* SignOut route should be accessible regardless of auth state */}
        <Route path="/signout" component={SignOut} />

        {loading || !user ? (
          <>
            <Route path="/" component={Welcome} />
            <Route path="/signup" component={Signup} />
            <Route component={NotFound} />
          </>
        ) : (
          <>
            <Route path="/" component={Home} />
            <Route path="/signup" component={Home} />
            <Route path="/events" component={Events} />
            <Route path="/events/:id" component={EventDetail} />
            <Route path="/account" component={Account} />
            <Route path="/directory" component={BusinessDirectory} />
            <Route component={NotFound} />
          </>
        )}
      </Switch>

      {/* Business Onboarding Modal */}
      {user && showBusinessOnboarding && (
        <BusinessOnboardingModal
          open={showBusinessOnboarding}
          onOpenChange={setShowBusinessOnboarding}
          onSuccess={handleBusinessOnboardingComplete}
        />
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
