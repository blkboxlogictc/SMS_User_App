import { db } from "./db";
import * as schema from "@shared/schema-sqlite";

// Sample businesses in downtown Stuart, FL
const sampleBusinesses = [
  {
    name: "Stuart Coffee Company",
    category: "Coffee & Cafe",
    description: "Locally roasted coffee and fresh pastries in the heart of downtown Stuart",
    website: "https://stuartcoffeecompany.com",
    phone: "(772) 555-0101",
    address: "47 SW Flagler Ave, Stuart, FL 34994",
    latitude: 27.1973,
    longitude: -80.2528,
    hours: JSON.stringify({
      monday: "6:00 AM - 6:00 PM",
      tuesday: "6:00 AM - 6:00 PM",
      wednesday: "6:00 AM - 6:00 PM",
      thursday: "6:00 AM - 6:00 PM",
      friday: "6:00 AM - 8:00 PM",
      saturday: "7:00 AM - 8:00 PM",
      sunday: "7:00 AM - 5:00 PM"
    }),
    imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop",
    isOpen: true,
    waitTime: 5,
    ownerId: "business-owner-456"
  },
  {
    name: "The Gafford",
    category: "Restaurant",
    description: "Fine dining restaurant featuring fresh seafood and steaks with waterfront views",
    website: "https://thegafford.com",
    phone: "(772) 555-0102",
    address: "47 SW Flagler Ave, Stuart, FL 34994",
    latitude: 27.1975,
    longitude: -80.2530,
    hours: JSON.stringify({
      monday: "Closed",
      tuesday: "5:00 PM - 10:00 PM",
      wednesday: "5:00 PM - 10:00 PM",
      thursday: "5:00 PM - 10:00 PM",
      friday: "5:00 PM - 11:00 PM",
      saturday: "5:00 PM - 11:00 PM",
      sunday: "5:00 PM - 9:00 PM"
    }),
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
    isOpen: true,
    waitTime: 25,
    ownerId: "business-owner-456"
  },
  {
    name: "Stuart Heritage Museum",
    category: "Museum",
    description: "Discover the rich history of Stuart and Martin County through exhibits and artifacts",
    website: "https://stuartheritage.org",
    phone: "(772) 555-0103",
    address: "161 SW Flagler Ave, Stuart, FL 34994",
    latitude: 27.1968,
    longitude: -80.2545,
    hours: JSON.stringify({
      monday: "10:00 AM - 3:00 PM",
      tuesday: "10:00 AM - 3:00 PM",
      wednesday: "10:00 AM - 3:00 PM",
      thursday: "10:00 AM - 3:00 PM",
      friday: "10:00 AM - 3:00 PM",
      saturday: "10:00 AM - 2:00 PM",
      sunday: "Closed"
    }),
    imageUrl: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=400&h=300&fit=crop",
    isOpen: true,
    waitTime: 0,
    ownerId: "business-owner-456"
  },
  {
    name: "Riverwalk Cafe & Oyster Bar",
    category: "Restaurant",
    description: "Casual waterfront dining with fresh oysters and local seafood",
    website: "https://riverwalkcafe.com",
    phone: "(772) 555-0104",
    address: "201 SW St Lucie Ave, Stuart, FL 34994",
    latitude: 27.1965,
    longitude: -80.2535,
    hours: JSON.stringify({
      monday: "11:00 AM - 9:00 PM",
      tuesday: "11:00 AM - 9:00 PM",
      wednesday: "11:00 AM - 9:00 PM",
      thursday: "11:00 AM - 9:00 PM",
      friday: "11:00 AM - 10:00 PM",
      saturday: "11:00 AM - 10:00 PM",
      sunday: "11:00 AM - 9:00 PM"
    }),
    imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop",
    isOpen: true,
    waitTime: 15,
    ownerId: "business-owner-456"
  },
  {
    name: "Downtown Books",
    category: "Bookstore",
    description: "Independent bookstore featuring local authors and unique gifts",
    website: "https://downtownbooksstuart.com",
    phone: "(772) 555-0105",
    address: "112 SW Flagler Ave, Stuart, FL 34994",
    latitude: 27.1970,
    longitude: -80.2540,
    hours: JSON.stringify({
      monday: "10:00 AM - 6:00 PM",
      tuesday: "10:00 AM - 6:00 PM",
      wednesday: "10:00 AM - 6:00 PM",
      thursday: "10:00 AM - 6:00 PM",
      friday: "10:00 AM - 7:00 PM",
      saturday: "10:00 AM - 7:00 PM",
      sunday: "12:00 PM - 5:00 PM"
    }),
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
    isOpen: true,
    waitTime: 0,
    ownerId: "business-owner-456"
  },
  {
    name: "Stuart Main Street Gallery",
    category: "Art Gallery",
    description: "Local art gallery showcasing works by regional artists and craftspeople",
    website: "https://stuartgallery.com",
    phone: "(772) 555-0106",
    address: "80 SW Flagler Ave, Stuart, FL 34994",
    latitude: 27.1972,
    longitude: -80.2535,
    hours: JSON.stringify({
      monday: "Closed",
      tuesday: "10:00 AM - 5:00 PM",
      wednesday: "10:00 AM - 5:00 PM",
      thursday: "10:00 AM - 5:00 PM",
      friday: "10:00 AM - 6:00 PM",
      saturday: "10:00 AM - 6:00 PM",
      sunday: "12:00 PM - 4:00 PM"
    }),
    imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
    isOpen: true,
    waitTime: 0,
    ownerId: "business-owner-456"
  }
];

// Sample events
const sampleEvents = [
  {
    name: "Stuart Main Street Market",
    description: "Weekly farmers market featuring local vendors, fresh produce, and artisan goods",
    date: new Date("2025-01-25T09:00:00"),
    location: "Flagler Avenue, Downtown Stuart",
    imageUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop",
    organizerId: "business-owner-456"
  },
  {
    name: "Art Walk Stuart",
    description: "Monthly art walk featuring local galleries, live music, and street performances",
    date: new Date("2025-02-01T18:00:00"),
    location: "Downtown Stuart Historic District",
    imageUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=300&fit=crop",
    organizerId: "business-owner-456"
  },
  {
    name: "Stuart Seafood Festival",
    description: "Annual celebration of local seafood with live music, vendors, and family activities",
    date: new Date("2025-03-15T11:00:00"),
    location: "Stuart Riverwalk",
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    organizerId: "business-owner-456"
  },
  {
    name: "Downtown Stuart Wine Walk",
    description: "Evening wine tasting event featuring local restaurants and wine selections",
    date: new Date("2025-02-14T19:00:00"),
    location: "Various Downtown Stuart Locations",
    imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop",
    organizerId: "business-owner-456"
  }
];

// Sample promotions
const samplePromotions = [
  {
    title: "Happy Hour Special",
    description: "50% off appetizers and $5 cocktails every weekday 4-6 PM",
    businessId: 2, // The Gafford
    code: "HAPPYHOUR",
    discount: "50% off appetizers",
    expiresAt: new Date("2025-12-31T23:59:59"),
    isActive: true
  },
  {
    title: "Coffee Loyalty Program",
    description: "Buy 9 coffees, get the 10th free! Ask for your loyalty card.",
    businessId: 1, // Stuart Coffee Company
    code: "LOYALTY10",
    discount: "Free 10th coffee",
    expiresAt: new Date("2025-12-31T23:59:59"),
    isActive: true
  },
  {
    title: "Book Club Discount",
    description: "15% off all books for book club members",
    businessId: 5, // Downtown Books
    code: "BOOKCLUB15",
    discount: "15% off",
    expiresAt: new Date("2025-06-30T23:59:59"),
    isActive: true
  }
];

// Sample surveys
const sampleSurveys = [
  {
    title: "Downtown Stuart Experience Survey",
    description: "Help us improve your downtown Stuart experience! Share your thoughts and earn 25 reward points.",
    questions: JSON.stringify([
      {
        id: 1,
        type: "rating",
        question: "How would you rate your overall experience in downtown Stuart?",
        options: ["1 - Poor", "2 - Fair", "3 - Good", "4 - Very Good", "5 - Excellent"]
      },
      {
        id: 2,
        type: "multiple_choice",
        question: "What brings you to downtown Stuart most often?",
        options: ["Dining", "Shopping", "Events", "Work", "Tourism", "Other"]
      },
      {
        id: 3,
        type: "text",
        question: "What would you like to see more of in downtown Stuart?"
      },
      {
        id: 4,
        type: "multiple_choice",
        question: "How did you hear about downtown Stuart businesses?",
        options: ["Word of mouth", "Social media", "This app", "Local advertising", "Walking by", "Other"]
      }
    ]),
    rewardPoints: 25,
    isActive: true
  },
  {
    title: "Coffee Preferences Survey",
    description: "Tell us about your coffee preferences and earn 15 reward points!",
    questions: JSON.stringify([
      {
        id: 1,
        type: "multiple_choice",
        question: "What's your favorite type of coffee?",
        options: ["Espresso", "Americano", "Latte", "Cappuccino", "Cold Brew", "Drip Coffee"]
      },
      {
        id: 2,
        type: "rating",
        question: "How important is locally roasted coffee to you?",
        options: ["1 - Not important", "2 - Slightly important", "3 - Moderately important", "4 - Very important", "5 - Extremely important"]
      },
      {
        id: 3,
        type: "text",
        question: "What would make your coffee experience even better?"
      }
    ]),
    rewardPoints: 15,
    isActive: true
  }
];

// Sample initial rewards for the test user
const sampleRewards = [
  {
    userId: "test-user-123",
    points: 50,
    source: "signup",
    description: "Welcome bonus for joining Stuart Main Street!"
  },
  {
    userId: "test-user-123",
    points: 10,
    source: "checkin",
    description: "Check-in bonus at Stuart Coffee Company"
  },
  {
    userId: "test-user-123",
    points: 5,
    source: "checkin",
    description: "Check-in bonus at Downtown Books"
  }
];

export async function seedDatabase() {
  try {
    console.log("Seeding database with sample data...");
    
    // Check if data already exists to prevent duplication
    const existingBusinesses = await db.select().from(schema.businesses);
    const existingEvents = await db.select().from(schema.events);
    const existingPromotions = await db.select().from(schema.promotions);
    const existingSurveys = await db.select().from(schema.surveys);
    const existingRewards = await db.select().from(schema.rewards);
    
    // Insert businesses only if none exist
    if (existingBusinesses.length === 0) {
      console.log("Inserting sample businesses...");
      for (const business of sampleBusinesses) {
        await db.insert(schema.businesses).values(business);
      }
    } else {
      console.log("Businesses already exist, skipping...");
    }
    
    // Insert events only if none exist
    if (existingEvents.length === 0) {
      console.log("Inserting sample events...");
      for (const event of sampleEvents) {
        await db.insert(schema.events).values(event);
      }
    } else {
      console.log("Events already exist, skipping...");
    }
    
    // Insert promotions only if none exist
    if (existingPromotions.length === 0) {
      console.log("Inserting sample promotions...");
      for (const promotion of samplePromotions) {
        await db.insert(schema.promotions).values(promotion);
      }
    } else {
      console.log("Promotions already exist, skipping...");
    }
    
    // Insert surveys only if none exist
    if (existingSurveys.length === 0) {
      console.log("Inserting sample surveys...");
      for (const survey of sampleSurveys) {
        await db.insert(schema.surveys).values(survey);
      }
    } else {
      console.log("Surveys already exist, skipping...");
    }
    
    // Insert sample rewards only if none exist
    if (existingRewards.length === 0) {
      console.log("Inserting sample rewards...");
      for (const reward of sampleRewards) {
        await db.insert(schema.rewards).values(reward);
      }
    } else {
      console.log("Rewards already exist, skipping...");
    }
    
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run the seed function
seedDatabase();