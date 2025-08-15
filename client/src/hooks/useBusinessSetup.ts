import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export function useBusinessSetup() {
  const { user } = useAuth();
  const [needsSetup, setNeedsSetup] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkBusinessSetup();
  }, [user]);

  const checkBusinessSetup = async () => {
    if (!user || user.user_metadata?.role !== "business") {
      setNeedsSetup(false);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/businesses/owned", {
        headers: {
          Authorization: `Bearer ${
            (await supabase.auth.getSession()).data.session?.access_token
          }`,
        },
      });

      if (response.ok) {
        const businesses = await response.json();
        setNeedsSetup(businesses.length === 0);
      } else {
        // If we get an error, assume they need setup
        setNeedsSetup(true);
      }
    } catch (error) {
      console.error("Error checking business setup:", error);
      setNeedsSetup(true);
    } finally {
      setLoading(false);
    }
  };

  const markSetupComplete = () => {
    setNeedsSetup(false);
  };

  return { needsSetup, loading, markSetupComplete, refetch: checkBusinessSetup };
}