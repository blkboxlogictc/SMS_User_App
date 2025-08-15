import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";

// Debug environment variables
console.log("=== Production Server Environment Debug ===");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set");
console.log("SUPABASE_URL:", process.env.SUPABASE_URL ? "Set" : "Not set");
console.log("PORT:", process.env.PORT);
console.log("===============================================");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    const server = await registerRoutes(app);

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      
      console.error("Server error:", err);
      res.status(status).json({ message });
    });

    // Health check endpoint
    app.get("/health", (_req, res) => {
      res.status(200).json({ 
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: "Stuart Main Street API"
      });
    });

    // Catch-all route for production
    app.use("*", (_req, res) => {
      res.status(200).json({ 
        message: "Stuart Main Street API is running",
        status: "healthy",
        timestamp: new Date().toISOString(),
        endpoints: [
          "GET /api/health - Health check",
          "POST /api/auth/* - Authentication endpoints",
          "GET /api/businesses - Business listings",
          "POST /api/businesses - Create business",
          "GET /api/promotions - Promotions",
          "POST /api/upload/* - File upload endpoints"
        ]
      });
    });

    // Start server
    const port = parseInt(process.env.PORT || '10000', 10);
    server.listen({
      port,
      host: "0.0.0.0",
    }, () => {
      console.log(`🚀 Stuart Main Street API serving on port ${port}`);
      console.log(`📍 Health check: http://localhost:${port}/health`);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();