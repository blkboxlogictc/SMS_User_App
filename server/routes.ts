import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupSupabaseAuth, requireSupabaseAuth } from "./supabaseAuth";
import { insertBusinessSchema, insertEventSchema, insertCheckinSchema, insertEventRsvpSchema, rewardItems } from "@shared/schema";
import { insertRewardSchema, insertSurveySchema, insertSurveyResponseSchema, insertPromotionSchema } from "@shared/schema-postgres";
import { z } from "zod";
import { db } from "./db";
import { eq, and, or, isNull, gt } from "drizzle-orm";
import { supabase } from "./supabaseAuth";
import { uploadProfileImageHandler } from "./routes/uploadProfileImage";
import { uploadBusinessImageHandler } from "./routes/uploadBusinessImage";
import { removeBusinessImageHandler } from "./routes/removeBusinessImage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for deployment
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'stuart-main-street-api'
    });
  });

  // Auth middleware
  setupSupabaseAuth(app);

  // Auth routes
  app.get('/api/auth/user', requireSupabaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Image upload routes
  app.post('/api/upload-profile-image', uploadProfileImageHandler);
  app.post('/api/upload-business-image', uploadBusinessImageHandler);
  app.delete('/api/remove-business-image/:businessId', removeBusinessImageHandler);

  // Business routes
  app.get('/api/businesses', async (req, res) => {
    try {
      const businesses = await storage.getBusinesses();
      res.json(businesses);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      res.status(500).json({ message: "Failed to fetch businesses" });
    }
  });

  app.get('/api/businesses/owned', requireSupabaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      console.log("DEBUG: /api/businesses/owned called with userId:", userId);
      const businesses = await storage.getBusinessesByOwner(userId);
      console.log("DEBUG: businesses found:", businesses);
      res.json(businesses);
    } catch (error) {
      console.error("Error fetching owned businesses:", error);
      res.status(500).json({ message: "Failed to fetch owned businesses" });
    }
  });

  app.get('/api/businesses/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const business = await storage.getBusiness(id);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      res.json(business);
    } catch (error) {
      console.error("Error fetching business:", error);
      res.status(500).json({ message: "Failed to fetch business" });
    }
  });

  app.post('/api/businesses', requireSupabaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'business') {
        return res.status(403).json({ message: "Only business owners can create businesses" });
      }

      const businessData = insertBusinessSchema.parse({
        ...req.body,
        ownerId: userId,
      });
      
      const business = await storage.createBusiness(businessData);
      res.json(business);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid business data", errors: error.errors });
      }
      console.error("Error creating business:", error);
      res.status(500).json({ message: "Failed to create business" });
    }
  });

  app.patch('/api/businesses/:id', requireSupabaseAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      
      const business = await storage.getBusiness(id);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      if (business.ownerId !== userId) {
        return res.status(403).json({ message: "You can only edit your own businesses" });
      }

      const updateData = insertBusinessSchema.partial().parse(req.body);
      const updatedBusiness = await storage.updateBusiness(id, updateData);
      res.json(updatedBusiness);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid business data", errors: error.errors });
      }
      console.error("Error updating business:", error);
      res.status(500).json({ message: "Failed to update business" });
    }
  });

  // Event routes
  app.get('/api/events', async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get('/api/events/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.get('/api/events/:id/rsvps', async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const rsvps = await storage.getEventRsvpsByEvent(eventId);
      res.json(rsvps);
    } catch (error) {
      console.error("Error fetching event RSVPs:", error);
      res.status(500).json({ message: "Failed to fetch event RSVPs" });
    }
  });

  app.post('/api/events', requireSupabaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const eventData = insertEventSchema.parse({
        ...req.body,
        organizerId: userId,
      });
      
      const event = await storage.createEvent(eventData);
      res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  // Promotion routes
  app.get('/api/promotions', async (req, res) => {
    try {
      const promotions = await storage.getPromotions();
      res.json(promotions);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      res.status(500).json({ message: "Failed to fetch promotions" });
    }
  });

  app.get('/api/promotions/business/:businessId', async (req, res) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const promotions = await storage.getPromotionsByBusiness(businessId);
      res.json(promotions);
    } catch (error) {
      console.error("Error fetching business promotions:", error);
      res.status(500).json({ message: "Failed to fetch business promotions" });
    }
  });

  app.post('/api/promotions', requireSupabaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'business') {
        return res.status(403).json({ message: "Only business owners can create promotions" });
      }

      // Get the business owned by this user
      const businesses = await storage.getBusinessesByOwner(userId);
      if (businesses.length === 0) {
        return res.status(400).json({ message: "No business found for this user" });
      }

      // Use the first business (assuming one business per owner for now)
      const businessId = businesses[0].id;

      // Convert expiresAt string to Date object if present
      const processedBody = { ...req.body };
      if (processedBody.expiresAt && typeof processedBody.expiresAt === 'string') {
        console.log("DEBUG: Converting expiresAt from string to Date:", processedBody.expiresAt);
        processedBody.expiresAt = new Date(processedBody.expiresAt);
        console.log("DEBUG: Converted expiresAt to Date:", processedBody.expiresAt);
      }

      const finalData = {
        ...processedBody,
        businessId,
      };

      console.log("DEBUG: Promotion creation data:", {
        requestBody: req.body,
        businessId: businessId,
        processedBody: processedBody,
        finalData: finalData
      });

      const promotionData = insertPromotionSchema.parse(finalData);
      const promotion = await storage.createPromotion(promotionData);
      res.json(promotion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Zod validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid promotion data", errors: error.errors });
      }
      console.error("Error creating promotion:", error);
      res.status(500).json({ message: "Failed to create promotion" });
    }
  });

  app.patch('/api/promotions/:id', requireSupabaseAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Get the promotion to check ownership
      const promotion = await storage.getPromotion(id);
      if (!promotion) {
        return res.status(404).json({ message: "Promotion not found" });
      }
      
      // Get the business to verify ownership
      const business = await storage.getBusiness(promotion.businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "You can only edit promotions for your own businesses" });
      }

      // Convert expiresAt string to Date object if present
      const processedBody = { ...req.body };
      if (processedBody.expiresAt && typeof processedBody.expiresAt === 'string') {
        processedBody.expiresAt = new Date(processedBody.expiresAt);
      }

      const updateData = insertPromotionSchema.partial().parse(processedBody);
      const updatedPromotion = await storage.updatePromotion(id, updateData);
      res.json(updatedPromotion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid promotion data", errors: error.errors });
      }
      console.error("Error updating promotion:", error);
      res.status(500).json({ message: "Failed to update promotion" });
    }
  });

  // Check-in routes
  app.get('/api/checkins', requireSupabaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const checkins = await storage.getCheckinsByUser(userId);
      res.json(checkins);
    } catch (error) {
      console.error("Error fetching checkins:", error);
      res.status(500).json({ message: "Failed to fetch checkins" });
    }
  });

  app.post('/api/checkins', requireSupabaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { eventId } = req.body;
      
      if (!eventId) {
        return res.status(400).json({ message: "Event ID is required" });
      }

      // Check if user has RSVP'd to this event
      const userRsvps = await storage.getEventRsvpsByUser(userId);
      const hasRsvpd = userRsvps.some(rsvp => rsvp.eventId === eventId);
      
      if (!hasRsvpd) {
        return res.status(400).json({ message: "You must RSVP to this event before checking in" });
      }

      // Check if user has already checked in to this event
      const userCheckins = await storage.getCheckinsByUser(userId);
      const hasCheckedIn = userCheckins.some(checkin => checkin.eventId === eventId);
      
      if (hasCheckedIn) {
        return res.status(400).json({ message: "You have already checked in to this event" });
      }

      const checkinData = insertCheckinSchema.parse({
        userId,
        eventId,
        pointsEarned: 5,
      });
      
      // Create the check-in
      const checkin = await storage.createCheckin(checkinData);
      
      // Award reward points for checking in
      const rewardData = {
        userId,
        points: 5,
        source: 'checkin' as const,
        description: `Checked in to event`,
      };
      await storage.createReward(rewardData);
      
      res.json({ checkin, pointsEarned: 5 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid checkin data", errors: error.errors });
      }
      console.error("Error creating checkin:", error);
      res.status(500).json({ message: "Failed to create checkin" });
    }
  });

  // Event RSVP routes
  app.get('/api/event-rsvps', requireSupabaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const rsvps = await storage.getEventRsvpsByUser(userId);
      res.json(rsvps);
    } catch (error) {
      console.error("Error fetching event RSVPs:", error);
      res.status(500).json({ message: "Failed to fetch event RSVPs" });
    }
  });

  app.post('/api/event-rsvps', requireSupabaseAuth, async (req: any, res) => {
    try {
      console.log("DEBUG: RSVP endpoint called with userId:", req.user.id, "body:", req.body);
      const userId = req.user.id;
      
      // Check if user already RSVP'd to this event
      const existingRsvps = await storage.getEventRsvpsByUser(userId);
      const hasAlreadyRsvpd = existingRsvps.some(rsvp => rsvp.eventId === req.body.eventId);
      
      if (hasAlreadyRsvpd) {
        console.log("DEBUG: User already RSVP'd to this event");
        return res.status(400).json({ message: "You have already RSVP'd to this event" });
      }
      
      const rsvpData = insertEventRsvpSchema.parse({
        ...req.body,
        userId,
      });
      
      console.log("DEBUG: Creating RSVP with data:", rsvpData);
      const rsvp = await storage.createEventRsvp(rsvpData);
      console.log("DEBUG: RSVP created successfully:", rsvp);
      
      // Award reward points for RSVP
      const rewardData = {
        userId,
        points: 2,
        source: 'rsvp' as const,
        description: `RSVP'd to event`,
      };
      console.log("DEBUG: Creating reward with data:", rewardData);
      await storage.createReward(rewardData);
      console.log("DEBUG: Reward created successfully");
      
      res.json({ rsvp, pointsEarned: 2 });
    } catch (error) {
      console.error("ERROR in RSVP endpoint:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid RSVP data", errors: error.errors });
      }
      console.error("Error creating event RSVP:", error);
      res.status(500).json({ message: "Failed to create event RSVP" });
    }
  });

  // Stats route
  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await storage.getBusinessStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Rewards routes
  app.get('/api/rewards', requireSupabaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const rewards = await storage.getRewardsByUser(userId);
      res.json(rewards);
    } catch (error) {
      console.error("Error fetching rewards:", error);
      res.status(500).json({ message: "Failed to fetch rewards" });
    }
  });

  app.get('/api/rewards/total', requireSupabaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const totalPoints = await storage.getTotalRewardPoints(userId);
      res.json({ totalPoints });
    } catch (error) {
      console.error("Error fetching total reward points:", error);
      res.status(500).json({ message: "Failed to fetch total reward points" });
    }
  });

  app.post('/api/rewards', requireSupabaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const rewardData = insertRewardSchema.parse({
        ...req.body,
        userId,
      });
      
      const reward = await storage.createReward(rewardData);
      res.json(reward);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reward data", errors: error.errors });
      }
      console.error("Error creating reward:", error);
      res.status(500).json({ message: "Failed to create reward" });
    }
  });

  // Reward Items routes
  app.get('/api/reward-items', requireSupabaseAuth, async (req: any, res) => {
    try {
      const rewardItemsData = await db.select().from(rewardItems).where(
        and(
          eq(rewardItems.isActive, true),
          or(
            isNull(rewardItems.expirationDate),
            gt(rewardItems.expirationDate, new Date())
          )
        )
      );
      res.json(rewardItemsData);
    } catch (error) {
      console.error("Error fetching reward items:", error);
      res.status(500).json({ message: "Failed to fetch reward items" });
    }
  });

  // Redeem reward item
  app.post('/api/redeem-reward', requireSupabaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { rewardItemId, businessId } = req.body;
      
      if (!rewardItemId) {
        return res.status(400).json({ message: "Reward item ID is required" });
      }

      if (!businessId) {
        return res.status(400).json({ message: "Business ID is required" });
      }

      // Call the Supabase function to handle redemption
      const { data, error } = await supabase.rpc('redeem_reward_item_with_business', {
        reward_item_id: rewardItemId,
        user_uuid: userId,
        business_id: businessId
      });

      if (error) {
        console.error("Error redeeming reward:", error);
        return res.status(400).json({ message: error.message });
      }

      if (!data.success) {
        return res.status(400).json({ message: data.error });
      }

      res.json(data);
    } catch (error) {
      console.error("Error redeeming reward:", error);
      res.status(500).json({ message: "Failed to redeem reward" });
    }
  });

  // Get user's available points
  app.get('/api/user-points', requireSupabaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      const { data, error } = await supabase.rpc('get_user_available_points', {
        user_uuid: userId
      });

      if (error) {
        console.error("Error fetching user points:", error);
        return res.status(500).json({ message: "Failed to fetch user points" });
      }

      res.json({ points: data });
    } catch (error) {
      console.error("Error fetching user points:", error);
      res.status(500).json({ message: "Failed to fetch user points" });
    }
  });

  // Get user's redemption history
  app.get('/api/redemption-history', requireSupabaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      const { data, error } = await supabase.rpc('get_user_redemption_history', {
        user_uuid: userId
      });

      if (error) {
        console.error("Error fetching redemption history:", error);
        return res.status(500).json({ message: "Failed to fetch redemption history" });
      }

      res.json(data);
    } catch (error) {
      console.error("Error fetching redemption history:", error);
      res.status(500).json({ message: "Failed to fetch redemption history" });
    }
  });

  // Survey routes
  app.get('/api/surveys', async (req, res) => {
    try {
      const surveys = await storage.getActiveSurveys();
      res.json(surveys);
    } catch (error) {
      console.error("Error fetching surveys:", error);
      res.status(500).json({ message: "Failed to fetch surveys" });
    }
  });

  app.get('/api/surveys/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const survey = await storage.getSurvey(id);
      if (!survey) {
        return res.status(404).json({ message: "Survey not found" });
      }
      res.json(survey);
    } catch (error) {
      console.error("Error fetching survey:", error);
      res.status(500).json({ message: "Failed to fetch survey" });
    }
  });

  app.post('/api/surveys', requireSupabaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'business') {
        return res.status(403).json({ message: "Only business owners can create surveys" });
      }

      const surveyData = insertSurveySchema.parse(req.body);
      const survey = await storage.createSurvey(surveyData);
      res.json(survey);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid survey data", errors: error.errors });
      }
      console.error("Error creating survey:", error);
      res.status(500).json({ message: "Failed to create survey" });
    }
  });

  // Survey response routes
  app.get('/api/survey-responses', requireSupabaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const responses = await storage.getSurveyResponsesByUser(userId);
      res.json(responses);
    } catch (error) {
      console.error("Error fetching survey responses:", error);
      res.status(500).json({ message: "Failed to fetch survey responses" });
    }
  });

  app.post('/api/survey-responses', requireSupabaseAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const responseData = insertSurveyResponseSchema.parse({
        ...req.body,
        userId,
      });
      
      // Check if user already responded to this survey
      const existingResponse = await storage.getSurveyResponseByUserAndSurvey(userId, responseData.surveyId);
      if (existingResponse) {
        return res.status(400).json({ message: "You have already responded to this survey" });
      }
      
      // Get survey to determine reward points
      const survey = await storage.getSurvey(responseData.surveyId);
      if (!survey) {
        return res.status(404).json({ message: "Survey not found" });
      }
      
      // Create survey response
      const response = await storage.createSurveyResponse(responseData);
      
      // Award reward points
      const rewardData = {
        userId,
        points: survey.rewardPoints,
        source: 'survey' as const,
        description: `Completed survey: ${survey.title}`,
      };
      await storage.createReward(rewardData);
      
      res.json({ response, pointsEarned: survey.rewardPoints });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid survey response data", errors: error.errors });
      }
      console.error("Error creating survey response:", error);
      res.status(500).json({ message: "Failed to create survey response" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
