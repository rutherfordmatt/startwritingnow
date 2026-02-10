# startwriting.now - Outstanding Issues & Feature Ideas

Ranked by priority based on value to users.

---

## High Priority

### 1. Search & Filter Journal Entries
Users with many entries have no way to search or filter them. As the journal grows, finding a specific entry becomes difficult. Adding search by keyword, filter by category, mood, or date range would make the journal much more useful over time.

### 2. Edit Existing Entries
There is currently no way to edit a saved journal entry. Typos or incomplete thoughts can't be corrected after saving. An edit button on expanded entries in the Journal page would be a high-value addition.

### 3. Forgot Password / Password Reset
There is no password reset flow. If a user forgets their password, they have no way to recover their account. This is a significant usability gap for an app with user accounts.

### 4. Pagination for Journal Entries
All entries are fetched at once. As users build a long history (100+ entries), this will cause slow loading and high memory usage. Server-side pagination would improve performance.

### 5. Mobile Responsiveness Polish
- Dashboard stat cards (3-column grid) can feel cramped on small phones
- The share button on stat cards uses opacity-0 hover state, which is inaccessible on mobile (no hover)
- Mood selector grid switches to 4 columns on mobile which works, but labels get very small

---

## Medium Priority

### 6. Mood Trends / Analytics
Users can log moods but there's no way to see mood patterns over time. A simple mood chart or breakdown on the Dashboard would make mood tracking more meaningful and encourage continued use.

### 7. Favourite / Bookmark Entries
No way to mark entries as favourites for easy access later. A star/bookmark feature on journal entries would help users revisit meaningful writing.

### 8. Unsubscribe Link in Emails
Reminder and weekly summary emails tell users to "update settings in the app" but don't include a direct unsubscribe link. Best practice (and legally required in many regions) is to include a one-click unsubscribe link in all marketing/reminder emails.

### 9. Entry Editing History / Timestamps
Entries only show creation date. If editing is added, showing "last edited" would provide useful context.

### 10. More Timezone Options
The timezone selector has 14 options covering major zones but misses several regions (e.g., Africa, South America, Southeast Asia). Users in those areas can't set accurate reminder times.

### 11. Writing Calendar Improvements
The calendar currently shows the last 30 days. Options to view by month or see longer history would help users appreciate their consistency over time.

---

## Lower Priority

### 12. Custom Prompts
Allow users to create and save their own prompts, or submit prompts to a community pool. Currently limited to 75 seeded prompts across 5 categories.

### 13. Rate Limiting on Public Endpoints
Feature voting and suggestion endpoints have no rate limiting. A determined user could spam suggestions or flood votes, though the visitor ID system provides some protection.

### 14. Offline / PWA Support
The app requires an internet connection. Progressive Web App support would let users write entries offline and sync when back online, supporting the daily habit even without connectivity.

### 15. Session Expiry Handling
No graceful handling when a user's session expires while they're writing. If the session expires mid-entry, the save will fail. The draft could be preserved and the user prompted to re-authenticate.

### 16. Accessibility Improvements
- Some interactive elements lack aria-labels
- The writing area uses a raw textarea without a visible label
- Color contrast on some muted-foreground text may not meet WCAG AA standards in all themes

### 17. Social Login Options
Currently only email/password auth. Adding Google, GitHub, or other social login options would reduce friction for new signups.

### 18. Data Import
Users can export but can't import entries. Someone migrating from another journaling tool has no way to bring their history in.

---

## Nice to Have

### 19. Streak Freeze / Grace Period
Missing one day breaks the streak entirely. A "streak freeze" (e.g., one free pass per week) would reduce anxiety and keep users engaged.

### 20. Word Cloud Visualisation
Generate a visual word cloud from journal entries to surface common themes and topics.

### 21. Writing Streaks Calendar Sharing
Allow users to share their writing calendar as an image for social media, showing their consistency visually.

### 22. Multiple Entries Per Day
Currently users can write multiple entries per day but the streak only counts once. Consider showing all daily entries more prominently or allowing "sessions" within a day.

### 23. Dark Mode Email Templates
Email templates (reminders, verification, weekly summary) use light-only styling. Users who prefer dark mode get a jarring light email.
