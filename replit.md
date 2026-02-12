# startwriting.now - Micro-Journaling App

## Overview

A frictionless 3-minute micro-journaling web application that helps users develop a daily writing habit. Users receive daily prompts in five categories (Life, Career, Gratitude, Creativity, Mindfulness), write timed entries, and track their writing streaks. The app emphasizes a distraction-free writing experience with a clean, minimal interface.

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
- **Authentication**: Magic link email sign-in (passwordless) with Passport.js session management
- **Session Management**: PostgreSQL-backed sessions via connect-pg-simple

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
- **users**: User accounts with email, optional password (legacy), reminder preferences, email verification fields, and weekly summary settings
- **sessions**: Authentication sessions
- **magic_link_tokens**: Passwordless login tokens (email, token, expiresAt, usedAt)
- **prompts**: 250 writing prompts with categories (Life/Career/Gratitude/Creativity/Mindfulness, 50 each)
- **entries**: User journal entries with word count tracking and mood field

### Mood Tracking
- **Flow**: After saving a journal entry, users see a mood selector overlay with 7 emotions (happy, calm, grateful, neutral, anxious, sad, stressed)
- **Optional**: Users can skip mood selection
- **API**: PATCH `/api/entries/:id/mood` to update entry mood
- **Schema**: `mood` field in entries table (varchar, nullable)
- **UI**: MoodSelector component appears between entry save and celebration overlay

### Navigation Structure
- **Navbar Component**: Shared across all pages (`client/src/components/Navbar.tsx`)
- **Authenticated Users**: Write (PenLine icon), Journal (BookOpen icon), Dashboard (LayoutDashboard icon), Theme toggle, Logout
- **Non-authenticated Users**: Theme toggle, Log In button
- **Pages**:
  - `/` - Home/Write page with writing interface
  - `/journal` - Journal entries list with mood icons and export (protected)
  - `/dashboard` - Stats, achievements, calendar, settings (protected)
  - `/about` - About page (public)
  - `/features` - Feature voting page (public)
  - `/auth` - Login/signup page

### Data Export
- **Formats**: PDF and Text (no JSON)
- **Endpoints**: GET `/api/export/pdf` and GET `/api/export/text`
- **Content**: Includes date, prompt, category, mood, content, and word count
- **Server-side**: Uses PDFKit for PDF generation
- **UI**: Export dropdown on Journal page with Text and PDF options

### Achievements System
- **Location**: Displayed on Dashboard only (no dedicated page)
- **Categories**: Entries (1, 10, 25, 50, 100), Streaks (3, 7, 14, 30 days), Words (1k, 5k, 10k), Category exploration, Community (Idea Maker)
- **Total**: 16 achievements
- **API**: GET `/api/stats` returns user stats for achievement calculation
- **Files**: `shared/achievements.ts` defines all achievements, `client/src/components/Achievements.tsx` displays them
- **Display**: Shows unlocked badges with icons, progress bars for next achievements

### Magic Link Authentication
- **Flow**: Users enter email on /auth page. If new user, they're asked for their first name. A magic link email is sent. Clicking the link at /auth/verify logs them in.
- **Security**: Tokens use crypto.randomBytes(32), expire in 15 minutes, single-use (marked as used after verification)
- **New Users**: Account created automatically when magic link is requested, marked as email-verified
- **Welcome Email**: Sent to new users alongside the magic link email

### Email Verification System (Legacy)
- **Flow**: Legacy email verification system still present for existing users
- **Security**: Tokens use crypto.randomBytes(32), expire in 24 hours, cleared after verification
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

### Weekly Summary Emails
- **Schedule**: Sent on Sunday evenings at 6 PM in each user's timezone
- **Content**: Stats including entries this week, words written, current streak, and total entries
- **Encouragement**: Dynamic messaging based on user activity level
- **Database Fields**: `weeklySummaryEnabled` (default true), `lastWeeklySummaryAt`
- **Requirements**: Users must have verified email to receive summaries

### User Retention Features
- **Welcome Modal**: 3-step onboarding modal for first-time authenticated users explaining the 3-minute journaling concept
- **Reminder Setup Prompt**: Appears AFTER user saves their first journal entry (not after welcome modal), prompting them to set up daily email reminders once they've experienced value
- **Welcome Back Pill**: Subtle inline pill above the prompt showing personalized context (streak status, last entry, total entries)
- **Streak Alerts**: 
  - Positive reinforcement language ("You're on a X-day streak!")
  - Milestone celebrations at 7, 14, 21, 30, 50, 100, and 365 days
- **LocalStorage Keys** (user-specific with userId suffix):
  - `snw_welcome_shown_[userId]`: Tracks if user has seen welcome modal
  - `snw_reminder_setup_skipped_[userId]`: Tracks if user skipped reminder setup
  - `snw_streak_alert_dismissed_[userId]`: Tracks daily streak alert dismissal
  - `snw_last_milestone_[userId]`: Tracks last celebrated milestone

### Feature Voting System
- **Location**: Public page at /features, linked from footer on all pages
- **Purpose**: Allow users to vote on future features and suggest new ideas
- **Database Tables**: `features` (id, title, description, upvotes, downvotes, isUserSuggested, createdAt), `feature_votes` (id, featureId, visitorId, voteType)
- **API Endpoints**:
  - GET `/api/features?visitorId={id}` - Get all features with visitor's votes
  - POST `/api/features/:id/vote` - Vote on feature (body: { visitorId, voteType })
  - POST `/api/features` - Suggest new feature (body: { title, description })
- **Voting Logic**:
  - Anonymous voting using visitor ID stored in localStorage
  - Click same vote to toggle off, click opposite to change vote
  - Net score displayed as upvotes minus downvotes
  - Features sorted by net score (descending)
- **Initial Features**: 8 pre-seeded features (Mood Trends Dashboard, Word Cloud, AI Writing Insights, Favorite Entries, Anonymous Prompt Sharing, Share Achievements, Browser Extension, Custom Themes)
- **User Suggestions**: Marked with "Community Idea" badge

### UX Improvements (Anxiety Reduction Philosophy)
- **Unsaved Work Warning**: beforeunload handler warns users before leaving with unsaved content (uses isDirty flag)
- **Timer Count-Up**: After 3:00, timer continues counting up as "Bonus time" rather than stopping, reducing pressure
- **Always-Visible Done Button**: Done button visible but disabled until 5+ words, with tooltip explaining requirement
- **Success Celebration**: Confetti animation and celebration overlay shown for 2.5s after saving entry
- **Value Proposition**: Non-authenticated users see banner encouraging sign-in to save and track streaks
- **Empty State**: New users with 0 entries see encouraging message to start their writing journey
- **Mobile Categories**: Dropdown selector on mobile instead of tabs for better mobile UX
- **Dashboard Write CTA**: Prominent "Ready to write?" card on dashboard when user hasn't written today
- **Celebration-First Reminder Modal**: Reminder setup modal leads with celebration of completing first entry

## External Dependencies

### Authentication
- Magic link (passwordless) authentication via email
- Tokens generated with crypto.randomBytes(32), expire in 15 minutes, single-use
- Sessions stored in PostgreSQL for persistence
- Magic link emails sent via Resend

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
- `passport` - Authentication session management
- `@tanstack/react-query` - Data fetching and caching
- `framer-motion` - Animations
- `date-fns` - Date formatting
