import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import MemoryStore from "memorystore";
import { storage } from "./storage";

// Development authentication system
export function getDevSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  let sessionStore;
  
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL === '') {
    // Use memory store for SQLite development
    const MemStore = MemoryStore(session);
    sessionStore = new MemStore({
      checkPeriod: sessionTtl, // prune expired entries every 24h
    });
    console.log('Using memory store for sessions (SQLite development)');
  } else {
    // Use PostgreSQL store for production
    const pgStore = connectPg(session);
    sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      ttl: sessionTtl,
      tableName: "sessions",
    });
    console.log('Using PostgreSQL store for sessions');
  }
  
  return session({
    secret: process.env.SESSION_SECRET || "dev-secret-key-for-testing",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Allow HTTP in development
      maxAge: sessionTtl,
    },
  });
}

export async function setupDevAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getDevSession());

  // Development login route that creates test users (general patron)
  app.get("/api/login", async (req, res) => {
    // Create or get test user
    const testUser = await storage.upsertUser({
      id: "test-user-123",
      email: "test@stuartmainstreet.com",
      firstName: "Test",
      lastName: "User",
      profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      role: "general",
    });

    // Set up session
    (req.session as any).user = {
      id: testUser.id,
      email: testUser.email,
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      profileImageUrl: testUser.profileImageUrl,
      role: testUser.role,
    };

    res.redirect("/");
  });


  // Business owner login route
  app.get("/api/login-business", async (req, res) => {
    // Create or get test business owner
    const businessOwner = await storage.upsertUser({
      id: "business-owner-456",
      email: "owner@stuartmainstreet.com",
      firstName: "Business",
      lastName: "Owner",
      profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      role: "business",
    });

    // Set up session
    (req.session as any).user = {
      id: businessOwner.id,
      email: businessOwner.email,
      firstName: businessOwner.firstName,
      lastName: businessOwner.lastName,
      profileImageUrl: businessOwner.profileImageUrl,
      role: businessOwner.role,
    };

    res.redirect("/");
  });

  app.get("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.redirect("/");
    });
  });
}

export const isDevAuthenticated: RequestHandler = async (req, res, next) => {
  const user = (req.session as any)?.user;

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Add user to request for downstream middleware
  req.user = user;
  next();
};