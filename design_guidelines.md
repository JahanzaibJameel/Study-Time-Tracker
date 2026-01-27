# StudyBuddy Design Guidelines

## Brand Identity

**Purpose**: Help students build consistent study habits through effortless time tracking and positive reinforcement.

**Aesthetic Direction**: Soft & Encouraging - A calming, pastel-based design that reduces study anxiety while celebrating progress. The app should feel like a supportive study companion, not a strict taskmaster.

**Memorable Element**: Delightful celebration moments when completing study sessions - gentle animations and warm encouragement that make students want to return.

## Navigation Architecture

**Root Navigation**: Tab Bar (3 tabs)
- Home (Today's progress summary)
- Subjects (Subject management - CENTER TAB with "+" icon)
- Stats (Statistics and streak)

**Modal Screens**:
- Timer Screen (full-screen modal when "Start Study" pressed)
- Add Subject Form (modal)

## Screen-by-Screen Specifications

### 1. Home Screen (Tab 1)
**Purpose**: Show today's total study time and motivate daily engagement.

**Layout**:
- Header: Transparent, title "Today", right button (Settings icon)
- Content: Scrollable
- Safe area insets: top = headerHeight + Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Components**:
- Hero section: Large circular progress indicator showing today's total minutes with goal (e.g., "47 min / 120 min goal")
- Daily streak card: "🔥 5 Day Streak" with subtle background
- Recent sessions: List of today's study sessions (Subject name, duration, time ago)
- Empty state: Illustration with "Start your first study session today"

### 2. Subjects Screen (Tab 2)
**Purpose**: Manage study subjects and start study sessions.

**Layout**:
- Header: Transparent, title "Subjects", right button (+ Add Subject)
- Content: List (FlatList)
- Safe area insets: top = headerHeight + Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Components**:
- Subject cards (each):
  - Subject name (bold)
  - Total time studied (e.g., "2h 34m total")
  - Horizontal progress bar (subtle, shows progress toward daily/weekly goal)
  - "Start Study" button (primary, rounded, full width within card)
- Card styling: Rounded corners, soft drop shadow, pastel background tint
- Empty state: Illustration with "Add your first subject to get started"

### 3. Stats Screen (Tab 3)
**Purpose**: Display study statistics and progress over time.

**Layout**:
- Header: Transparent, title "Statistics"
- Content: Scrollable
- Safe area insets: top = headerHeight + Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Components**:
- Week summary: Bar chart showing daily minutes for last 7 days
- Top subjects: List of subjects sorted by total time
- All-time stats: Total hours, sessions completed, current streak
- Empty state: Illustration with "Your stats will appear here after studying"

### 4. Timer Screen (Modal)
**Purpose**: Track active study session.

**Layout**:
- Full-screen modal with close button (X) in top-left
- Content: Centered vertically
- Safe area insets: top = insets.top + Spacing.xl, bottom = insets.bottom + Spacing.xl

**Components**:
- Subject name (large, centered)
- Large circular timer display (MM:SS format)
- Control buttons (horizontally centered):
  - Start/Pause (large, primary)
  - Stop (secondary, smaller)
- Visual feedback: Timer pulses gently when active

### 5. Add Subject Modal
**Purpose**: Create new subject.

**Layout**:
- Modal sheet (slides up from bottom)
- Header: "Add Subject" title, left (Cancel), right (Save)
- Content: Form (not scrollable)

**Components**:
- Text input: Subject name
- Submit button location: Header (right button)

### 6. Settings Screen (Stack from Home)
**Purpose**: App preferences and user customization.

**Layout**:
- Header: Default with back button, title "Settings"
- Content: Scrollable form
- Safe area insets: top = Spacing.xl, bottom = insets.bottom + Spacing.xl

**Components**:
- Avatar picker (3 preset pastel-colored avatars)
- Display name input
- Daily goal input (minutes)
- Dark mode toggle
- Theme accent color picker (3 pastel options)

## Color Palette

**Primary**: #A8DADC (Soft Cyan) - Main accent, buttons, progress
**Secondary**: #F1FAEE (Cream) - Card backgrounds, surfaces
**Background**: #FFFFFF (White) - Main background
**Surface**: #F8F9FA (Light Gray) - Subtle surface variation
**Text Primary**: #1D3557 (Deep Blue) - Headings, important text
**Text Secondary**: #457B9D (Medium Blue) - Body text, descriptions
**Success**: #90D5A5 (Soft Green) - Completion states
**Warning**: #FFC857 (Warm Yellow) - Streak indicators

**Dark Mode** (if enabled):
- Background: #1D3557, Surface: #2D4564, Text: #F1FAEE

## Typography

**Font**: Nunito (friendly, approachable, excellent readability)
- Display: Nunito Bold, 32px
- Heading: Nunito Bold, 24px
- Title: Nunito SemiBold, 18px
- Body: Nunito Regular, 16px
- Caption: Nunito Regular, 14px

## Visual Design

- **Cards**: 16px border radius, 4px elevation with soft shadow (shadowOpacity: 0.08)
- **Buttons**: 12px border radius, 48px minimum height
- **Icons**: Feather icons from @expo/vector-icons
- **Touchable Feedback**: Reduce opacity to 0.7 on press
- **Progress Bars**: 8px height, rounded ends, subtle animation on change

## Assets to Generate

1. **icon.png** - App icon featuring a study timer/clock with soft colors
2. **splash-icon.png** - Simplified version of app icon for launch screen
3. **empty-subjects.png** - Illustration of a student with books, WHERE USED: Subjects screen empty state
4. **empty-today.png** - Illustration of a calendar/clock, WHERE USED: Home screen empty state
5. **empty-stats.png** - Illustration of blank chart/graph, WHERE USED: Stats screen empty state
6. **avatar-1.png** - Pastel blue themed avatar, WHERE USED: Settings screen
7. **avatar-2.png** - Pastel pink themed avatar, WHERE USED: Settings screen
8. **avatar-3.png** - Pastel yellow themed avatar, WHERE USED: Settings screen
9. **celebration.png** - Confetti/celebration graphic, WHERE USED: Timer completion modal