import type { Express, RequestHandler, Request } from "express";
import { createClient } from '@supabase/supabase-js';
import { storage } from "./storage";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        profileImageUrl: string;
        role: string;
      };
    }
  }
}

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;

// Create Supabase client for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function setupSupabaseAuth(app: Express) {
  // Middleware to verify Supabase JWT tokens
  const verifySupabaseToken: RequestHandler = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('AUTH DEBUG: No authorization header found');
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.substring(7);
    console.log('AUTH DEBUG: Verifying token for origin:', origin);

    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        console.error('Token verification failed:', error);
        return res.status(401).json({ message: "Invalid token" });
      }

      // Try to get user profile from our database, but don't require it
      let userProfile;
      try {
        userProfile = await storage.getUser(user.id);
      } catch (dbError) {
        console.warn('Failed to fetch user profile from database:', dbError);
        userProfile = null;
      }
      
      // Use Supabase Auth user data as primary source, with database profile as fallback
      req.user = {
        id: user.id,
        email: user.email || '',
        firstName: userProfile?.firstName || user.user_metadata?.first_name || '',
        lastName: userProfile?.lastName || user.user_metadata?.last_name || '',
        profileImageUrl: user.user_metadata?.profile_image_url || userProfile?.profileImageUrl || user.user_metadata?.avatar_url || '',
        role: userProfile?.role || user.user_metadata?.role || 'patron',
      };

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: "Token verification failed" });
    }
  };

  // Route to sync Supabase user with our database
  app.post("/api/auth/sync", async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.substring(7);

    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        console.error('User verification failed during sync:', error);
        return res.status(401).json({ message: "Invalid token" });
      }

      const userData = req.body;
      console.log('Syncing user with data:', { userId: user.id, userData });
      
      // Create or update user in our database
      try {
        const dbUser = await storage.upsertUser({
          id: user.id,
          email: userData.email || user.email,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          profileImageUrl: userData.profileImageUrl || '',
          role: userData.role || 'patron',
        });

        console.log('User synced successfully:', dbUser);
        res.json({ success: true, user: dbUser });
      } catch (dbError) {
        console.error('Database error during user sync:', dbError);
        res.status(500).json({
          message: "Database error saving new user",
          error: dbError instanceof Error ? dbError.message : "Unknown database error"
        });
      }
    } catch (error) {
      console.error('Sync error:', error);
      res.status(500).json({
        message: "Database error saving new user",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get current user route (protected)
  app.get("/api/auth/user", verifySupabaseToken, (req, res) => {
    res.json(req.user);
  });

  // Logout route (client-side handles Supabase signOut)
  app.post("/api/auth/logout", (req, res) => {
    res.json({ success: true });
  });

  // Export the middleware for use in other routes
  app.use('/api/protected', verifySupabaseToken);
  
  return verifySupabaseToken;
}

// Middleware function that can be used to protect individual routes
export const requireSupabaseAuth: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('REQUIRE AUTH DEBUG: No authorization header found for origin:', origin);
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.substring(7);
  console.log('REQUIRE AUTH DEBUG: Verifying token for origin:', origin);

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ message: "Invalid token" });
    }

    // Try to get user profile from our database, but don't require it
    let userProfile;
    try {
      userProfile = await storage.getUser(user.id);
    } catch (dbError) {
      console.warn('Failed to fetch user profile from database:', dbError);
      userProfile = null;
    }
    
    // Use Supabase Auth user data as primary source, with database profile as fallback
    req.user = {
      id: user.id,
      email: user.email || '',
      firstName: userProfile?.firstName || user.user_metadata?.first_name || '',
      lastName: userProfile?.lastName || user.user_metadata?.last_name || '',
      profileImageUrl: user.user_metadata?.profile_image_url || userProfile?.profileImageUrl || user.user_metadata?.avatar_url || '',
      role: userProfile?.role || user.user_metadata?.role || 'patron',
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: "Token verification failed" });
  }
};