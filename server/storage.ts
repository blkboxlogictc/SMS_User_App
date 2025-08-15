// Import schema based on database type
import * as schemaPostgres from "@shared/schema";
import * as schemaSqlite from "@shared/schema-sqlite";

// Choose schema based on database type
const schema = (!process.env.DATABASE_URL || process.env.DATABASE_URL === '')
  ? schemaSqlite
  : schemaPostgres;

const {
  users,
  businesses,
  events,
  promotions,
  checkins,
  eventRsvps,
} = schema;

// Import rewards, surveys, and surveyResponses from PostgreSQL schema specifically
import {
  rewards,
  surveys,
  surveyResponses,
} from "@shared/schema-postgres";

// Import types from the main schema
import type {
  User,
  UpsertUser,
  Business,
  InsertBusiness,
  Event,
  InsertEvent,
  Promotion,
  InsertPromotion,
  Checkin,
  InsertCheckin,
  EventRsvp,
  InsertEventRsvp,
} from "@shared/schema";

// Import reward and survey types from PostgreSQL schema
import type {
  Reward,
  InsertReward,
  Survey,
  InsertSurvey,
  SurveyResponse,
  InsertSurveyResponse,
} from "@shared/schema-postgres";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Business operations
  getBusinesses(): Promise<Business[]>;
  getBusiness(id: number): Promise<Business | undefined>;
  getBusinessesByOwner(ownerId: string): Promise<Business[]>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  updateBusiness(id: number, business: Partial<InsertBusiness>): Promise<Business>;
  
  // Event operations
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event>;
  
  // Promotion operations
  getPromotions(): Promise<Promotion[]>;
  getPromotion(id: number): Promise<Promotion | undefined>;
  getPromotionsByBusiness(businessId: number): Promise<Promotion[]>;
  createPromotion(promotion: InsertPromotion): Promise<Promotion>;
  updatePromotion(id: number, promotion: Partial<InsertPromotion>): Promise<Promotion>;
  
  // Check-in operations
  getCheckinsByUser(userId: string): Promise<Checkin[]>;
  createCheckin(checkin: InsertCheckin): Promise<Checkin>;
  
  // Event RSVP operations
  getEventRsvpsByUser(userId: string): Promise<EventRsvp[]>;
  getEventRsvpsByEvent(eventId: number): Promise<EventRsvp[]>;
  createEventRsvp(rsvp: InsertEventRsvp): Promise<EventRsvp>;
  
  // Stats operations
  getBusinessStats(): Promise<{
    totalBusinesses: number;
    openBusinesses: number;
    upcomingEvents: number;
  }>;
  
  // Reward operations
  getRewardsByUser(userId: string): Promise<Reward[]>;
  getTotalRewardPoints(userId: string): Promise<number>;
  createReward(reward: InsertReward): Promise<Reward>;
  
  // Survey operations
  getActiveSurveys(): Promise<Survey[]>;
  getSurvey(id: number): Promise<Survey | undefined>;
  createSurvey(survey: InsertSurvey): Promise<Survey>;
  
  // Survey response operations
  getSurveyResponsesByUser(userId: string): Promise<SurveyResponse[]>;
  getSurveyResponseByUserAndSurvey(userId: string, surveyId: number): Promise<SurveyResponse | undefined>;
  createSurveyResponse(response: InsertSurveyResponse): Promise<SurveyResponse>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Business operations
  async getBusinesses(): Promise<Business[]> {
    return await db.select().from(businesses).orderBy(businesses.name);
  }

  async getBusiness(id: number): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.id, id));
    return business;
  }

  async getBusinessesByOwner(ownerId: string): Promise<Business[]> {
    return await db.select().from(businesses).where(eq(businesses.ownerId, ownerId));
  }

  async createBusiness(business: InsertBusiness): Promise<Business> {
    const [newBusiness] = await db.insert(businesses).values(business).returning();
    return newBusiness;
  }

  async updateBusiness(id: number, business: Partial<InsertBusiness>): Promise<Business> {
    const [updatedBusiness] = await db
      .update(businesses)
      .set({ ...business, updatedAt: new Date() })
      .where(eq(businesses.id, id))
      .returning();
    return updatedBusiness;
  }

  // Event operations
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(events.date);
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event> {
    const [updatedEvent] = await db
      .update(events)
      .set({ ...event, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return updatedEvent;
  }

  // Promotion operations
  async getPromotions(): Promise<Promotion[]> {
    return await db.select().from(promotions).where(eq(promotions.isActive, true)).orderBy(desc(promotions.createdAt));
  }

  async getPromotion(id: number): Promise<Promotion | undefined> {
    const [promotion] = await db.select().from(promotions).where(eq(promotions.id, id));
    return promotion;
  }

  async getPromotionsByBusiness(businessId: number): Promise<Promotion[]> {
    return await db
      .select()
      .from(promotions)
      .where(and(eq(promotions.businessId, businessId), eq(promotions.isActive, true)))
      .orderBy(desc(promotions.createdAt));
  }

  async createPromotion(promotion: InsertPromotion): Promise<Promotion> {
    const [newPromotion] = await db.insert(promotions).values(promotion).returning();
    return newPromotion;
  }

  async updatePromotion(id: number, promotion: Partial<InsertPromotion>): Promise<Promotion> {
    const [updatedPromotion] = await db
      .update(promotions)
      .set({ ...promotion, updatedAt: new Date() })
      .where(eq(promotions.id, id))
      .returning();
    return updatedPromotion;
  }

  // Check-in operations
  async getCheckinsByUser(userId: string): Promise<Checkin[]> {
    return await db.select().from(checkins).where(eq(checkins.userId, userId)).orderBy(desc(checkins.createdAt));
  }

  async createCheckin(checkin: InsertCheckin): Promise<Checkin> {
    const [newCheckin] = await db.insert(checkins).values(checkin).returning();
    return newCheckin;
  }

  // Event RSVP operations
  async getEventRsvpsByUser(userId: string): Promise<EventRsvp[]> {
    return await db.select().from(eventRsvps).where(eq(eventRsvps.userId, userId)).orderBy(desc(eventRsvps.createdAt));
  }

  async getEventRsvpsByEvent(eventId: number): Promise<EventRsvp[]> {
    return await db.select().from(eventRsvps).where(eq(eventRsvps.eventId, eventId)).orderBy(desc(eventRsvps.createdAt));
  }

  async createEventRsvp(rsvp: InsertEventRsvp): Promise<EventRsvp> {
    const [newRsvp] = await db.insert(eventRsvps).values(rsvp).returning();
    return newRsvp;
  }

  // Stats operations
  async getBusinessStats(): Promise<{
    totalBusinesses: number;
    openBusinesses: number;
    upcomingEvents: number;
  }> {
    const totalBusinesses = await db.select().from(businesses);
    const openBusinesses = await db.select().from(businesses).where(eq(businesses.isOpen, true));
    const upcomingEvents = await db.select().from(events).where(eq(events.date, new Date()));

    return {
      totalBusinesses: totalBusinesses.length,
      openBusinesses: openBusinesses.length,
      upcomingEvents: upcomingEvents.length,
    };
  }

  // Reward operations
  async getRewardsByUser(userId: string): Promise<Reward[]> {
    return await db.select().from(rewards).where(eq(rewards.userId, userId)).orderBy(desc(rewards.createdAt));
  }

  async getTotalRewardPoints(userId: string): Promise<number> {
    const userRewards = await db.select().from(rewards).where(eq(rewards.userId, userId));
    return userRewards.reduce((total: number, reward: Reward) => total + reward.points, 0);
  }

  async createReward(reward: InsertReward): Promise<Reward> {
    const [newReward] = await db.insert(rewards).values(reward).returning();
    return newReward;
  }

  // Survey operations
  async getActiveSurveys(): Promise<Survey[]> {
    return await db.select().from(surveys).where(eq(surveys.isActive, true)).orderBy(desc(surveys.createdAt));
  }

  async getSurvey(id: number): Promise<Survey | undefined> {
    const [survey] = await db.select().from(surveys).where(eq(surveys.id, id));
    return survey;
  }

  async createSurvey(survey: InsertSurvey): Promise<Survey> {
    const [newSurvey] = await db.insert(surveys).values(survey).returning();
    return newSurvey;
  }

  // Survey response operations
  async getSurveyResponsesByUser(userId: string): Promise<SurveyResponse[]> {
    return await db.select().from(surveyResponses).where(eq(surveyResponses.userId, userId)).orderBy(desc(surveyResponses.createdAt));
  }

  async getSurveyResponseByUserAndSurvey(userId: string, surveyId: number): Promise<SurveyResponse | undefined> {
    const [response] = await db.select().from(surveyResponses).where(and(eq(surveyResponses.userId, userId), eq(surveyResponses.surveyId, surveyId)));
    return response;
  }

  async createSurveyResponse(response: InsertSurveyResponse): Promise<SurveyResponse> {
    const [newResponse] = await db.insert(surveyResponses).values(response).returning();
    return newResponse;
  }
}

export const storage = new DatabaseStorage();
