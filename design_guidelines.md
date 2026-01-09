# Design Guidelines: startwriting.now

## Design Approach
**Reference-Based**: Drawing from Notion's writing focus + Day One's journaling warmth + Linear's modern minimalism. Creating a distraction-free sanctuary for writing that feels inviting rather than intimidating.

## Layout System
**Spacing Foundation**: Tailwind units of 2, 4, 6, 8, 12, 16, 24 for consistent rhythm.

**Grid Structure**:
- Main container: `max-w-4xl mx-auto` (centered, readable width)
- Writing area: `max-w-3xl` (optimal prose width)
- Sidebar prompts: `w-80` fixed width on desktop, full-width drawer on mobile

## Typography

**Font Stack**:
- Primary: Inter (UI elements, prompts, navigation)
- Editor: iA Writer Quattro or Merriweather (warm, readable serif for writing)

**Scale**:
- Headlines: text-4xl to text-5xl, font-medium
- Prompts: text-xl, font-normal
- Body/Editor: text-lg, leading-relaxed (generous line-height 1.75)
- UI labels: text-sm, font-medium
- Timer/metadata: text-xs, uppercase, tracking-wide

## Core Components

**Navigation Bar** (top):
- Logo "startwriting.now" (left, text-xl)
- Timer badge (center when active)
- User menu + theme toggle (right)
- Height: h-16, backdrop-blur-md, border-b

**Hero Section** (landing page):
- Full-width, h-[70vh]
- Large background image with gradient overlay
- Centered content: Headline (text-6xl), subtext (text-xl), CTA button with blurred background
- Scroll indicator at bottom

**Writing Interface**:
- Three-column layout (desktop): Prompt sidebar | Editor (main) | Timer/Stats (right)
- Mobile: Stacked, prompt as collapsible drawer from bottom
- Editor: Full-bleed textarea, no visible borders, generous padding (p-12)
- Auto-save indicator: Small, non-intrusive (top-right of editor)

**Prompt Cards**:
- Rounded-2xl cards with subtle borders
- Hover: gentle lift (translate-y-1)
- Structure: Question (bold) + optional context (muted)
- "Start Writing" CTA within each card

**Timer Component**:
- Circular progress ring (large, 120px diameter)
- Time remaining (center, bold)
- Pause/Stop controls below
- Session stats below timer

**Writing Stats Dashboard**:
- Card grid (2 columns on tablet+)
- Metrics: Streak days, Total entries, Words written, Avg. session time
- Each stat: Large number + small label
- Sparkline charts for trends

**Entry Cards** (journal archive):
- Timeline layout with date headers
- Cards: Entry preview (3 lines max) + metadata (date, word count, time)
- Subtle left border accent
- Hover: slight scale + shadow increase

## Animations
**Minimal & Purposeful**:
- Page transitions: Fade in content (200ms)
- Editor focus: Gentle sidebar fade (300ms)
- Timer: Smooth countdown ring animation
- NO scroll-triggered effects

## Images

**Hero Section Image**:
- Subject: Overhead shot of minimal desk setup - open journal, coffee cup, soft natural light from window
- Style: Warm, slightly desaturated, inviting workspace aesthetic
- Treatment: Apply gradient overlay (top to center) for text readability
- Dimensions: Full-width, 70vh height, object-cover

**Empty State Illustrations**:
- First journal entry: Simple line illustration of person at desk with thought bubble
- No prompts available: Notebook with sprouting plant illustration
- Style: Minimal, warm line art

**Onboarding Screens**:
- Feature showcase: Screenshots of writing interface with soft glow effects
- Welcome screen: Abstract pattern suggesting pages/writing (geometric, subtle)

## Responsive Behavior

**Breakpoints**:
- Mobile (<768px): Single column, prompt drawer, collapsible timer
- Tablet (768-1024px): Two-column (editor + sidebar toggle)
- Desktop (1024px+): Three-column full layout

**Mobile Optimizations**:
- Bottom navigation bar (Home, New Entry, Archive, Profile)
- Prompt selector: Full-screen modal
- Editor: Full viewport height, minimal chrome
- Timer: Floating button (bottom-right) expanding to overlay

## Special Interactions

**Writing Focus Mode**:
- Keyboard shortcut activates (Cmd+K)
- Fades sidebar/chrome to 20% opacity
- Editor expands to full available space
- Exit on Esc or click outside

**Prompt Selection**:
- Shuffle button for random prompt
- Category filters (reflection, gratitude, creativity, etc.)
- Recent prompts quick access

**Session Complete**:
- Celebration modal: Word count + encouraging message
- Share/save options
- "Continue writing" or "New prompt" CTAs

This design creates a sanctuary for writing—spacious, warm, and focused—where the interface disappears and words flow naturally.