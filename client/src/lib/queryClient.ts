import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { supabase } from "./supabase";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    console.log("DEBUG: apiRequest called with:", { method, url, data });
    
    let session = null;
    
    try {
      // Try to get session with a shorter timeout
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Session timeout')), 2000)
      );
      
      const result = await Promise.race([sessionPromise, timeoutPromise]) as any;
      session = result.data?.session;
      console.log("DEBUG: Session retrieved successfully:", !!session, !!session?.access_token);
    } catch (sessionError) {
      console.warn("DEBUG: Session retrieval failed:", sessionError);
      // Try to get session from localStorage directly as fallback
      try {
        const authKey = `sb-jjcjmuxjbrubdwuxvovy-auth-token`;
        const authData = localStorage.getItem(authKey);
        if (authData) {
          const parsedAuth = JSON.parse(authData);
          session = parsedAuth;
          console.log("DEBUG: Session retrieved from localStorage fallback:", !!session?.access_token);
        }
      } catch (fallbackError) {
        console.warn("DEBUG: localStorage fallback also failed:", fallbackError);
      }
    }
    
    const headers: Record<string, string> = {};
    
    if (data) {
      headers["Content-Type"] = "application/json";
    }
    
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
      console.log("DEBUG: Authorization header added");
    } else {
      console.warn("DEBUG: No access token found - proceeding without auth");
    }

    console.log("DEBUG: Making fetch request to:", url);
    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    console.log("DEBUG: Fetch response received:", res.status);
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error("DEBUG: apiRequest error:", error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    console.log("DEBUG: getQueryFn called for:", queryKey.join("/"));
    
    // Get session for authentication
    let session = null;
    try {
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Session timeout')), 2000)
      );
      
      const result = await Promise.race([sessionPromise, timeoutPromise]) as any;
      session = result.data?.session;
      console.log("DEBUG: getQueryFn session retrieved:", !!session?.access_token);
    } catch (sessionError) {
      console.warn("DEBUG: getQueryFn session retrieval failed:", sessionError);
      // Try localStorage fallback
      try {
        const authKey = `sb-jjcjmuxjbrubdwuxvovy-auth-token`;
        const authData = localStorage.getItem(authKey);
        if (authData) {
          const parsedAuth = JSON.parse(authData);
          session = parsedAuth;
          console.log("DEBUG: getQueryFn session from localStorage:", !!session?.access_token);
        }
      } catch (fallbackError) {
        console.warn("DEBUG: getQueryFn localStorage fallback failed:", fallbackError);
      }
    }
    
    // Prepare headers
    const headers: Record<string, string> = {};
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
      console.log("DEBUG: getQueryFn Authorization header added");
    }
    
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
      headers,
    });

    console.log("DEBUG: getQueryFn response status:", res.status);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
