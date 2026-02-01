# startwriting.now - Feature List

## Implemented Features

### Core Writing Experience
- **3-Minute Timed Sessions**: Countdown timer that encourages focused writing with bonus time after 3 minutes
- **Daily Writing Prompts**: 250 unique prompts across 5 categories
- **Category Selection**: Life, Career, Gratitude, Creativity, Mindfulness
- **Distraction-Free Editor**: Clean, minimal writing interface
- **Auto-Save Warning**: Prevents accidental loss of unsaved work
- **Word Count Tracking**: Real-time word count during writing
- **Daily Word Goal**: Configurable daily word target with progress tracking

### User Authentication
- **Email/Password Login**: Secure authentication with bcrypt password hashing
- **Email Verification**: Verification required before enabling email features
- **Session Management**: Persistent sessions stored in PostgreSQL

### Journal & Entries
- **Journal Page**: Dedicated page to view all past entries
- **Mood Tracking**: Select from 7 moods (happy, calm, grateful, neutral, anxious, sad, stressed) after each entry
- **Mood Icons**: Visual mood indicators on journal entries with tooltips
- **Entry Details**: View prompt, category, date, word count, and content for each entry

### Data Export
- **PDF Export**: Download all entries as a formatted PDF document
- **Text Export**: Download entries as plain text file

### Gamification & Motivation
- **Streak Tracking**: Current and longest streak displayed
- **15 Achievements**: Unlockable badges for milestones
  - Entry milestones (1, 10, 25, 50, 100 entries)
  - Streak badges (3, 7, 14, 30 days)
  - Word count goals (1k, 5k, 10k words)
  - Category exploration
- **Achievement Progress**: Visual progress bars for locked achievements
- **Celebration Overlay**: Confetti animation after completing entries
- **Streak Alerts**: Milestone celebrations at 7, 14, 21, 30, 50, 100, 365 days

### Email Notifications
- **Daily Reminders**: Configurable reminder emails with random prompt
- **Weekly Summary**: Sunday evening summary of writing stats
- **Welcome Email**: Sent after email verification
- **Timezone Support**: Reminders sent at user's preferred time

### User Onboarding
- **Welcome Modal**: 3-step introduction for new users
- **Welcome Back Pill**: Personalized context showing streak and entry count
- **Reminder Setup Prompt**: Encourages setting up reminders after first entry

### Navigation & UI
- **Shared Navbar**: Consistent navigation across all pages
- **Dark/Light Theme**: Toggle between themes
- **Mobile Responsive**: Category dropdown on mobile
- **Smooth Animations**: Framer Motion transitions throughout

### Community Features
- **Feature Voting Page**: Public page to vote on future features
- **Feature Suggestions**: Users can suggest new feature ideas
- **Vote Tracking**: Upvote/downvote system with net scores

### Dashboard
- **Writing Stats**: Total entries, words, streaks
- **Writing Calendar**: Visual calendar showing writing days
- **Achievement Display**: Polished badges with gradient styling
- **Settings**: Reminder configuration, email preferences

---

## Future Feature Ideas

### Enhanced Writing Experience
- **Custom Prompts**: Let users create and save their own prompts
- **Prompt Favoriting**: Save favorite prompts for reuse
- **Writing Templates**: Structured templates (gratitude list, goal setting, reflection)
- **Voice-to-Text**: Dictate entries instead of typing
- **Focus Mode**: Even more minimal UI with ambient sounds
- **Prompt Scheduling**: Schedule specific prompts for specific days

### Analytics & Insights
- **Mood Trends Dashboard**: Visualize mood patterns over time
- **Word Cloud**: Generate word clouds from entries
- **AI Writing Insights**: Analyze writing patterns and themes
- **Writing Time Analytics**: Track when you write best
- **Category Breakdown**: Stats on which categories you write in most
- **Monthly/Yearly Reviews**: Automated summaries of writing journey

### Social & Sharing
- **Anonymous Prompt Sharing**: Share prompts with community
- **Share Achievements**: Social sharing of milestone badges
- **Writing Groups**: Private groups for accountability
- **Public Profiles**: Optional public writing streaks

### Personalization
- **Custom Themes**: Additional color themes and fonts
- **Avatar/Profile Pictures**: User profile customization
- **Entry Tags**: Add custom tags to organize entries
- **Pinned Entries**: Mark important entries
- **Entry Search**: Full-text search across all entries

### Integrations & Extensions
- **Browser Extension**: Quick-write from any tab
- **Mobile App**: Native iOS/Android apps
- **Calendar Integration**: Sync with Google/Apple Calendar
- **Notion Export**: Export entries to Notion
- **API Access**: Developer API for custom integrations

### Gamification Expansion
- **Writing Challenges**: Weekly/monthly themed challenges
- **Leaderboards**: Optional community leaderboards
- **Seasonal Achievements**: Holiday and seasonal badges
- **Achievement Levels**: Bronze/Silver/Gold tiers for achievements
- **Writing Milestones**: Celebrate 1 year, 500 entries, etc.

### Premium Features (Future Monetization)
- **Unlimited Entry History**: Extended storage
- **Advanced Analytics**: Detailed insights and reports
- **Priority Support**: Faster response times
- **Custom Branding**: Remove branding for teams
- **Team/Family Plans**: Shared accounts for groups

### Accessibility
- **Screen Reader Optimization**: Enhanced accessibility
- **Keyboard Shortcuts**: Quick navigation and actions
- **High Contrast Mode**: Additional accessibility theme
- **Font Size Controls**: Adjustable text sizes

### Content & Prompts
- **Prompt Categories Expansion**: Add more categories
- **Themed Prompt Packs**: Seasonal, therapeutic, creative packs
- **Expert-Written Prompts**: Prompts from therapists, coaches
- **Prompt of the Day**: Daily featured prompt

---

*Last updated: February 2026*
