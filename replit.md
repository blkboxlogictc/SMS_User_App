# Stuart Main Street App

## Overview

This is a full-stack web application for the Stuart Main Street community in downtown Stuart, FL. The app helps users discover local businesses, events, and exclusive promotions while providing business owners with tools to manage their presence and engage with customers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built as a React single-page application using:
- **React 18** with TypeScript for type safety
- **Wouter** for lightweight client-side routing
- **TanStack React Query** for server state management and caching
- **Tailwind CSS** with **shadcn/ui** components for styling
- **React Hook Form** with **Zod** validation for form handling
- **Vite** as the build tool and development server

### Backend Architecture
The backend follows a traditional Express.js REST API pattern:
- **Express.js** server with TypeScript
- **Drizzle ORM** for database operations and schema management
- **Neon Serverless PostgreSQL** as the database provider
- **Replit Authentication** using OpenID Connect for user management
- **Express sessions** with PostgreSQL storage for session persistence

### Project Structure
- `/client` - React frontend application
- `/server` - Express.js backend API
- `/shared` - Shared TypeScript types and database schema
- `/migrations` - Database migration files

## Key Components

### Authentication System
- Uses Replit's OpenID Connect authentication
- Session-based authentication with PostgreSQL session storage
- Role-based access control (general users vs business owners)
- Automatic session management and user state persistence

### Database Schema
The application uses a PostgreSQL database with the following main entities:
- **Users** - Authentication and profile information
- **Businesses** - Local business listings with location data
- **Events** - Community events with RSVP functionality
- **Promotions** - Business promotions and deals
- **Check-ins** - User check-ins at businesses
- **Event RSVPs** - User event registrations

### Business Management
- Business owners can create and manage their business profiles
- Location-based business discovery with interactive map
- Category-based business filtering and search
- Check-in system for customer engagement tracking

### Event System
- Community event creation and management
- RSVP functionality for event attendance tracking
- Date-based event filtering and display

### Promotion System
- Business promotion creation with expiration dates
- Promotion code generation and validation
- Category-based promotion organization

## Data Flow

1. **Authentication Flow**: Users authenticate via Replit OAuth, sessions stored in PostgreSQL
2. **API Communication**: Frontend communicates with backend via REST API calls
3. **State Management**: TanStack Query manages server state with automatic caching and refetching
4. **Database Operations**: Drizzle ORM handles all database interactions with type-safe queries
5. **Real-time Updates**: Query invalidation ensures fresh data after mutations

## External Dependencies

### Core Technologies
- **Neon Database** - Serverless PostgreSQL hosting
- **Replit Authentication** - OAuth provider for user authentication
- **Radix UI** - Accessible component primitives for the design system

### Development Tools
- **Drizzle Kit** - Database schema migrations and management
- **ESBuild** - Fast JavaScript bundling for production builds
- **TSX** - TypeScript execution for development server

### UI Framework
- **shadcn/ui** - Pre-built accessible components
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

## Deployment Strategy

### Development
- Uses Vite dev server with HMR for fast development
- TSX runs the Express server with auto-reload
- Development and production environments use the same PostgreSQL database

### Production Build
- Frontend built with Vite to static assets
- Backend bundled with ESBuild as a single Node.js file
- Static assets served by Express in production
- Session management handled via PostgreSQL connection

### Database Management
- Drizzle migrations for schema changes
- Environment variable configuration for database connection
- Shared schema definitions between frontend and backend for type safety

The application is designed to be deployed on Replit's platform, taking advantage of their authentication system and PostgreSQL addon for a seamless deployment experience.