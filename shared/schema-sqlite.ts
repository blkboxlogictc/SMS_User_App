import {
  sqliteTable,
  text,
  integer,
  real,
  blob,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = sqliteTable("sessions", {
  sid: text("sid").primaryKey(),
  sess: text("sess").notNull(), // JSON as text in SQLite
  expire: integer("expire", { mode: "timestamp" }).notNull(),
});

// User storage table (mandatory for Replit Auth)
export const users = sqliteTable("users", {
  id: text("id").primaryKey().notNull(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  role: text("role").notNull().default("general"), // "general" or "business"
  businessId: integer("business_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(new Date()),
});

// Businesses table
export const businesses = sqliteTable("businesses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  website: text("website"),
  phone: text("phone"),
  address: text("address"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  hours: text("hours"), // JSON as text in SQLite
  imageUrl: text("image_url"),
  isOpen: integer("is_open", { mode: "boolean" }).default(true),
  waitTime: integer("wait_time"), // in minutes
  ownerId: text("owner_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(new Date()),
});

// Events table
export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  date: integer("date", { mode: "timestamp" }).notNull(),
  location: text("location").notNull(),
  imageUrl: text("image_url"),
  organizerId: text("organizer_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(new Date()),
});

// Promotions table
export const promotions = sqliteTable("promotions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  businessId: integer("business_id").notNull(),
  code: text("code"),
  discount: text("discount"), // e.g., "20%", "$10 off"
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(new Date()),
});

// Check-ins table
export const checkins = sqliteTable("checkins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  businessId: integer("business_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(new Date()),
});

// Event RSVPs table
export const eventRsvps = sqliteTable("event_rsvps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  eventId: integer("event_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(new Date()),
});

// Rewards table
export const rewards = sqliteTable("rewards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  points: integer("points").notNull().default(0),
  source: text("source").notNull(), // "checkin", "survey", "purchase", "event"
  description: text("description"),
  businessId: integer("business_id"), // optional, for business-specific rewards
  createdAt: integer("created_at", { mode: "timestamp" }).default(new Date()),
});

// Surveys table
export const surveys = sqliteTable("surveys", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  questions: text("questions"), // JSON as text in SQLite
  rewardPoints: integer("reward_points").notNull().default(10),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(new Date()),
});

// Survey responses table
export const surveyResponses = sqliteTable("survey_responses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  surveyId: integer("survey_id").notNull(),
  responses: text("responses"), // JSON as text in SQLite
  createdAt: integer("created_at", { mode: "timestamp" }).default(new Date()),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  business: one(businesses, {
    fields: [users.businessId],
    references: [businesses.id],
  }),
  checkins: many(checkins),
  eventRsvps: many(eventRsvps),
  rewards: many(rewards),
  surveyResponses: many(surveyResponses),
}));

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  owner: one(users, {
    fields: [businesses.ownerId],
    references: [users.id],
  }),
  promotions: many(promotions),
  checkins: many(checkins),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(users, {
    fields: [events.organizerId],
    references: [users.id],
  }),
  rsvps: many(eventRsvps),
}));

export const promotionsRelations = relations(promotions, ({ one }) => ({
  business: one(businesses, {
    fields: [promotions.businessId],
    references: [businesses.id],
  }),
}));

export const checkinsRelations = relations(checkins, ({ one }) => ({
  user: one(users, {
    fields: [checkins.userId],
    references: [users.id],
  }),
  business: one(businesses, {
    fields: [checkins.businessId],
    references: [businesses.id],
  }),
}));

export const eventRsvpsRelations = relations(eventRsvps, ({ one }) => ({
  user: one(users, {
    fields: [eventRsvps.userId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [eventRsvps.eventId],
    references: [events.id],
  }),
}));

export const rewardsRelations = relations(rewards, ({ one }) => ({
  user: one(users, {
    fields: [rewards.userId],
    references: [users.id],
  }),
  business: one(businesses, {
    fields: [rewards.businessId],
    references: [businesses.id],
  }),
}));

export const surveysRelations = relations(surveys, ({ many }) => ({
  responses: many(surveyResponses),
}));

export const surveyResponsesRelations = relations(surveyResponses, ({ one }) => ({
  user: one(users, {
    fields: [surveyResponses.userId],
    references: [users.id],
  }),
  survey: one(surveys, {
    fields: [surveyResponses.surveyId],
    references: [surveys.id],
  }),
}));

// Insert schemas
export const insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPromotionSchema = createInsertSchema(promotions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCheckinSchema = createInsertSchema(checkins).omit({
  id: true,
  createdAt: true,
});

export const insertEventRsvpSchema = createInsertSchema(eventRsvps).omit({
  id: true,
  createdAt: true,
});

export const insertRewardSchema = createInsertSchema(rewards).omit({
  id: true,
  createdAt: true,
});

export const insertSurveySchema = createInsertSchema(surveys).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSurveyResponseSchema = createInsertSchema(surveyResponses).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type Checkin = typeof checkins.$inferSelect;
export type InsertCheckin = z.infer<typeof insertCheckinSchema>;
export type EventRsvp = typeof eventRsvps.$inferSelect;
export type InsertEventRsvp = z.infer<typeof insertEventRsvpSchema>;
export type Reward = typeof rewards.$inferSelect;
export type InsertReward = z.infer<typeof insertRewardSchema>;
export type Survey = typeof surveys.$inferSelect;
export type InsertSurvey = z.infer<typeof insertSurveySchema>;
export type SurveyResponse = typeof surveyResponses.$inferSelect;
export type InsertSurveyResponse = z.infer<typeof insertSurveyResponseSchema>;