# StudyBuddy

StudyBuddy is a mobile app for students to plan and track their study time. Built with React Native and Expo, it features local data persistence using AsyncStorage.

## Features

- **Today's Progress**: View daily study time with a circular progress indicator
- **Study Subjects**: Add and manage study subjects
- **Study Timer**: Track study sessions with start/pause/stop controls
- **Pomodoro Mode**: Focus sessions with configurable work/break cycles
- **Daily Streak**: Track consecutive study days
- **Statistics**: View weekly charts and all-time study stats
- **Settings**: Dark mode, daily goals, accent colors, avatar, data export/import
- **Local Notifications**: Daily reminders, streak alerts, break reminders
- **Dark Mode**: Automatic dark mode support based on system settings
- **Motivational Messages**: Receive encouragement after completing sessions

## Navigation Structure

- **Tab Navigator**: 3 tabs (Today, Subjects, Stats)
- **Timer Screen**: Full-screen modal for study sessions
- **Pomodoro Screen**: Full-screen modal for Pomodoro sessions
- **Add Subject Screen**: Modal for adding new subjects
- **Settings Screen**: Modal for app settings

## Data Storage

All data is stored locally using AsyncStorage:

- Subjects: `@studybuddy_subjects`
- Sessions: `@studybuddy_sessions`
- Streak: `@studybuddy_streak`
- Settings: `@studybuddy_settings`

## Color Palette

- Primary: `#A8DADC` (Soft Cyan)
- Secondary: `#F1FAEE` (Cream)
- Text Primary: `#1D3557` (Deep Blue)
- Text Secondary: `#457B9D` (Medium Blue)
- Success: `#90D5A5` (Soft Green)
- Warning: `#FFC857` (Warm Yellow)

## Installation

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go mobile app (for testing on device)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/studybuddy.git
cd studybuddy
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment configuration (if applicable):
```bash
cp .env.example .env
```

## Running the App

### Development Mode

```bash
npm run expo:dev
```

This starts the Metro bundler and opens the web preview at `http://localhost:8081`. You can scan the QR code with the Expo Go app to run on your mobile device.

### Web Preview

```bash
npm run expo:dev
# Then open http://localhost:8081 in your browser
```

### Production Build

```bash
npm run server:build
npm run server:prod
```

This builds the server bundle and runs the production server.

## Usage

### Adding a Subject

1. Navigate to the **Subjects** tab
2. Tap the **+** button in the top right
3. Enter the subject name
4. Tap **Add Subject**

### Starting a Study Session

1. Go to the **Subjects** tab
2. Tap **Start Study** on any subject
3. The timer screen opens as a full-screen modal
4. Tap the **Play** button to start
5. Tap **Pause** to pause
6. Tap **Stop** to end the session and save it

### Starting a Pomodoro Session

1. Go to the **Subjects** tab
2. Tap **Pomodoro** on any subject
3. The Pomodoro screen opens as a full-screen modal
4. Configure work/break durations in settings (gear icon)
5. Tap **Play** to start the focus session
6. Auto-advances to short/long breaks
7. Tap **Stop** to end and save the work session

### Viewing Statistics

1. Navigate to the **Stats** tab
2. View your weekly chart, all-time stats, and top subjects

### Today's Progress

1. Go to the **Today** tab
2. See your daily progress as a circular progress indicator
3. View your current streak and today's sessions

### Settings

1. Tap the **gear icon** in the Today screen header
2. Configure:
   - **Profile**: Avatar, display name
   - **Study Goals**: Daily goal minutes
   - **Appearance**: Dark mode, accent color (Cyan/Green/Pink)
   - **Notifications**: Daily reminder time, streak alerts, break reminders
   - **Data**: Export/Import JSON backup
   - **Danger Zone**: Reset all data

## Key Dependencies

- **expo** (React Native framework)
- **react-navigation** (navigation)
- **async-storage** (data persistence)
- **react-native-reanimated** (animations)
- **expo-haptics** (haptic feedback)
- **expo-notifications** (local notifications)
- **expo-sharing** (file sharing for export)
- **expo-document-picker** (file picker for import)
- **expo-device** (device detection)
- **react-native-svg** (circular progress)
- **@tanstack/react-query** (server state management)
- **drizzle-orm** / **drizzle-kit** (database ORM - configured for future backend)

## Project Structure

```
Study-Time-Tracker/
├── app.json                    # Expo config
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript config with path aliases
├── babel.config.js              # Babel config with module alias
├── eslint.config.js             # ESLint flat config
├── drizzle.config.ts            # Drizzle ORM config
├── .gitignore
├── client/                      # React Native app
│   ├── index.js                 # Entry point
│   ├── App.tsx                  # Root App component
│   ├── screens/                 # Screen components (7)
│   │   ├── HomeScreen.tsx       # Today's progress dashboard
│   │   ├── SubjectsScreen.tsx   # Subject list & management
│   │   ├── AddSubjectScreen.tsx # Add subject form (modal)
│   │   ├── TimerScreen.tsx      # Study timer (full-screen modal)
│   │   ├── PomodoroScreen.tsx   # Pomodoro timer (full-screen modal)
│   │   ├── StatsScreen.tsx      # Statistics & charts
│   │   └── SettingsScreen.tsx   # App settings (modal)
│   ├── navigation/              # Navigation Layer (5 files)
│   │   ├── RootStackNavigator.tsx
│   │   ├── MainTabNavigator.tsx
│   │   ├── HomeStackNavigator.tsx
│   │   ├── SubjectsStackNavigator.tsx
│   │   └── StatsStackNavigator.tsx
│   ├── components/              # UI Components (15)
│   │   ├── ThemedText.tsx       # Text with theme-aware colors
│   │   ├── ThemedView.tsx       # View with theme-aware background
│   │   ├── Button.tsx           # Animated pressable button
│   │   ├── Card.tsx             # Elevation-based card
│   │   ├── SubjectCard.tsx      # Subject display with progress
│   │   ├── SessionCard.tsx      # Study session display
│   │   ├── StatCard.tsx         # Statistics display card
│   │   ├── ProgressBar.tsx      # Animated horizontal progress
│   │   ├── CircularProgress.tsx # SVG circular progress indicator
│   │   ├── EmptyState.tsx       # Empty state illustration
│   │   ├── ErrorBoundary.tsx    # Class-based error boundary
│   │   ├── ErrorFallback.tsx    # Error UI with dev details
│   │   ├── HeaderTitle.tsx      # Navigation header with icon
│   │   ├── StreakBadge.tsx      # Streak display component
│   │   ├── WeeklyChart.tsx      # 7-day bar chart
│   │   └── Spacer.tsx           # Layout spacer
│   ├── hooks/                   # Custom React Hooks (4)
│   │   ├── useTheme.ts          # Theme + dark mode access
│   │   ├── useScreenOptions.ts  # Navigation screen options
│   │   ├── useColorScheme.ts    # Platform color scheme
│   │   └── useColorScheme.web.ts # Web-specific hydration
│   ├── constants/
│   │   └── theme.ts             # Design tokens (colors, spacing, typography)
│   └── lib/                     # Utilities and data layer
│       ├── storage.ts           # AsyncStorage data layer
│       ├── query-client.ts      # React Query setup + API helpers
│       └── notifications.ts     # Local notifications system
├── server/                      # Express backend
│   ├── index.ts                 # Server entry point
│   ├── routes.ts                # Route registration
│   ├── storage.ts               # In-memory storage
│   └── templates/               # HTML templates
├── shared/                      # Shared types and schemas
│   └── schema.ts                 # Drizzle schema
├── scripts/                     # Build scripts
│   └── build.js                 # Production build
├── design_guidelines.md           # Design specs
└── replit.md                     # Replit deployment doc
```

## License

MIT