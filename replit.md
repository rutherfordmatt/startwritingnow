# startwriting.now - Micro-Journaling App

## Overview

A frictionless 3-minute micro-journaling web application that helps users develop a daily writing habit. Users receive daily prompts in two categories (Life and Career), write timed entries, and track their writing streaks. The app emphasizes a distraction-free writing experience with a clean, minimal interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Animations**: Framer Motion for smooth transitions and timer animations
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Design**: RESTful JSON API with Zod schema validation
- **Authentication**: Username/password with Passport.js (passport-local strategy)
- **Session Management**: PostgreSQL-backed sessions via connect-pg-simple
- **Password Hashing**: bcryptjs with 12 salt rounds

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: `shared/schema.ts` (shared between frontend and backend)

### Key Design Patterns
- **Monorepo Structure**: Client code in `client/`, server in `server/`, shared types in `shared/`
- **Type Safety**: Shared schema definitions ensure frontend-backend type consistency
- **API Route Definitions**: Centralized in `shared/routes.ts` with Zod schemas for request/response validation
- **Protected Routes**: Authentication check via `isAuthenticated` middleware and client-side route guards

### Database Schema
- **users**: User accounts with username, hashed password, reminder preferences, and email verification fields (isEmailVerified, emailVerificationToken, emailVerificationExpires, welcomeEmailSentAt)
- **sessions**: Authentication sessions
- **prompts**: Writing prompts with categories (Life/Career)
- **entries**: User journal entries with word count tracking

### Email Verification System
- **Flow**: Users receive verification email on signup, must verify before enabling reminders
- **Security**: Tokens use crypto.randomBytes(32), expire in 24 hours, cleared after verification
- **Welcome Email**: Sent automatically after successful email verification
- **UI**: Verification banner displayed on Dashboard until user verifies email

### Email Reminders
- **Service**: Resend API for transactional emails
- **Scheduler**: node-cron runs every minute to check for users who should receive reminders
- **Requirements**: Users must have verified email to receive reminders
- **Features**: 
  - Users can enable/disable daily reminders in Dashboard
  - Configurable reminder time and timezone
  - Emails include a random writing prompt and link to the app
  - Test reminder functionality to verify email delivery

### User Retention Features
- **Welcome Modal**: 3-step onboarding modal for first-time authenticated users explaining the 3-minute journaling concept
- **Reminder Setup Prompt**: After closing the welcome modal, users are prompted to set up daily email reminders
- **Welcome Back Pill**: Subtle inline pill above the prompt showing personalized context (streak status, last entry, total entries)
- **Streak Alerts**: 
  - "At risk" alert when users have a streak but haven't written today
  - Milestone celebrations at 7, 14, 21, 30, 50, 100, and 365 days
- **LocalStorage Keys**:
  - `snw_welcome_shown`: Tracks if user has seen welcome modal
  - `snw_reminder_setup_skipped`: Tracks if user skipped reminder setup
  - `snw_streak_alert_dismissed`: Tracks daily streak alert dismissal
  - `snw_last_milestone`: Tracks last celebrated milestone

## External Dependencies

### Authentication
- Username/password authentication with passport-local
- Password hashing with bcryptjs
- Sessions stored in PostgreSQL for persistence

### Database
- PostgreSQL via `DATABASE_URL` environment variable
- Drizzle Kit for schema migrations (`npm run db:push`)

### Required Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secret for session encryption (required, no default)
- `RESEND_API_KEY` - Resend API key for sending reminder emails

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit` - Database ORM and migrations
- `express-session` / `connect-pg-simple` - Session management
- `passport` / `passport-local` - Local authentication strategy
- `bcryptjs` - Password hashing
- `@tanstack/react-query` - Data fetching and caching
- `framer-motion` - Animations
- `date-fns` - Date formatting
