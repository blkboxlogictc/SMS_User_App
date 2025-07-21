import {
  users,
  businesses,
  events,
  promotions,
  checkins,
  eventRsvps,
  type User,
  type UpsertUser,
  type Business,
  type InsertBusiness,
  type Event,
  type InsertEvent,
  type Promotion,
  type InsertPromotion,
  type Checkin,
  type InsertCheckin,
  type EventRsvp,
  type InsertEventRsvp,
} from "@shared/schema";
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
  getPromotionsByBusiness(businessId: number): Promise<Promotion[]>;
  createPromotion(promotion: InsertPromotion): Promise<Promotion>;
  updatePromotion(id: number, promotion: Partial<InsertPromotion>): Promise<Promotion>;
  
  // Check-in operations
  getCheckinsByUser(userId: string): Promise<Checkin[]>;
  createCheckin(checkin: InsertCheckin): Promise<Checkin>;
  
  // Event RSVP operations
  getEventRsvpsByUser(userId: string): Promise<EventRsvp[]>;
  createEventRsvp(rsvp: InsertEventRsvp): Promise<EventRsvp>;
  
  // Stats operations
  getBusinessStats(): Promise<{
    totalBusinesses: number;
    openBusinesses: number;
    upcomingEvents: number;
  }>;
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
}

export const storage = new DatabaseStorage();
