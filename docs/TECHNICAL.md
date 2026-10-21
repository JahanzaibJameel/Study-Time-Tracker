# StudyBuddy Technical Documentation

## System Architecture

### Overview
StudyBuddy is a React Native / Expo mobile application for tracking study time. It follows a client-side-first architecture with local data persistence via AsyncStorage. The project includes an Express.js backend server primarily for static asset serving and deployment infrastructure.

### Technology Stack

#### Frontend (Client)
- **Framework**: Expo 54 / React Native 0.81.5 / React 19.1.0
- **Navigation**: React Navigation 7 (Native Stack + Bottom Tabs)
- **Animations**: React Native Reanimated 4.1.1
- **State Management**: 
  - Local component state (useState, useReducer)
  - React Query / TanStack Query 5 (configured but minimally used)
  - Custom hooks for theme and screen options
- **Storage**: @react-native-async-storage/async-storage 2.2.0
- **UI Components**: Custom component library with theming
- **Icons**: @expo/vector-icons (Feather icons)
- **Haptics**: expo-haptics
- **SVG**: react-native-svg 15.15.1
- **Fonts**: @expo-google-fonts/nunito
- **Blur/Glass Effects**: expo-blur, expo-glass-effect
- **Notifications**: expo-notifications (local notifications)
- **File Operations**: expo-sharing, expo-document-picker
- **Device Info**: expo-device

#### Backend (Server)
- **Runtime**: Node.js with Express 5
- **Build**: esbuild for production bundling
- **Database ORM**: Drizzle ORM with PostgreSQL dialect (configured)
- **Development**: tsx for TypeScript execution

#### Build & Deployment
- **Static Build**: Custom script (scripts/build.js) using Metro bundler
- **CI/CD**: Configured for Replit deployment
- **Platform Targets**: iOS, Android, Web

### Project Structure

```
Study-Time-Tracker/
??? client/                      # React Native Application
?   ??? App.tsx                  # Root component with providers
?   ??? index.js                 # Expo entry point
?   ??? screens/                 # Screen Components (7)
?   ?   ??? HomeScreen.tsx       # Today's progress dashboard
?   ?   ??? SubjectsScreen.tsx   # Subject list & management
?   ?   ??? AddSubjectScreen.tsx # Add subject form (modal)
?   ?   ??? TimerScreen.tsx      # Study timer (full-screen modal)
?   ?   ??? PomodoroScreen.tsx   # Pomodoro timer (full-screen modal)
?   ?   ??? StatsScreen.tsx      # Statistics & charts
?   ?   ??? SettingsScreen.tsx   # App settings (modal)
?   ??? navigation/              # Navigation Layer (5 files)
?   ?   ??? RootStackNavigator.tsx
?   ?   ??? MainTabNavigator.tsx
?   ?   ??? HomeStackNavigator.tsx
?   ?   ??? SubjectsStackNavigator.tsx
?   ?   ??? StatsStackNavigator.tsx
?   ??? components/              # UI Components (15)
?   ?   ??? ThemedText.tsx       # Text with theme-aware colors
?   ?   ??? ThemedView.tsx       # View with theme-aware background
?   ?   ??? Button.tsx           # Animated pressable button
?   ?   ??? Card.tsx             # Elevation-based card
?   ?   ??? SubjectCard.tsx      # Subject display with progress
?   ?   ??? SessionCard.tsx      # Study session display
?   ?   ??? StatCard.tsx         # Statistics display card
?   ?   ??? ProgressBar.tsx      # Animated horizontal progress
?   ?   ??? CircularProgress.tsx # SVG circular progress indicator
?   ?   ??? EmptyState.tsx       # Empty state illustration
?   ?   ??? ErrorBoundary.tsx    # Class-based error boundary
?   ?   ??? ErrorFallback.tsx    # Error UI with dev details
?   ?   ??? HeaderTitle.tsx      # Navigation header with icon
?   ?   ??? StreakBadge.tsx      # Streak display component
?   ?   ??? WeeklyChart.tsx      # 7-day bar chart
?   ?   ??? Spacer.tsx           # Layout spacer
?   ??? hooks/                   # Custom React Hooks (4)
?   ?   ??? useTheme.ts          # Theme + dark mode access
?   ?   ??? useScreenOptions.ts  # Navigation screen options
?   ?   ??? useColorScheme.ts    # Platform color scheme
?   ?   ??? useColorScheme.web.ts # Web-specific hydration
?   ??? constants/
?   ?   ??? theme.ts             # Design tokens (colors, spacing, typography)
?   ??? lib/
?       ??? storage.ts           # AsyncStorage data layer (600+ lines)
?       ??? query-client.ts      # React Query setup + API helpers
?       ??? notifications.ts     # Local notifications system (350+ lines)
??? server/                      # Express Backend
?   ??? index.ts                 # Server entry + middleware + static serving
?   ??? routes.ts                # Route registration (health check)
?   ??? storage.ts               # In-memory user storage (IStorage interface)
?   ??? templates/
?       ??? landing-page.html    # Deployment landing page
??? shared/                      # Shared Types
?   ??? schema.ts                # Drizzle schema (User table)
??? scripts/
?   ??? build.js                 # Production static build (562 lines)
??? Config Files
```

---

## Data Layer Architecture

### AsyncStorage Keys
| Key | Purpose | Data Type |
|-----|---------|-----------|
| @studybuddy_subjects | Subject list | Subject[] |
| @studybuddy_sessions | Study sessions | StudySession[] |
| @studybuddy_streak | Streak tracking | StreakData |
| @studybuddy_settings | User preferences | Settings |

### Type Definitions (client/lib/storage.ts)

```typescript
interface Subject {
  id: string;
  name: string;
  totalMinutes: number;
  createdAt: string; // ISO 8601
}

interface StudySession {
  id: string;
  subjectId: string;
  duration: number; // seconds
  date: string; // ISO 8601
}

interface StreakData {
  currentStreak: number;
  lastStudyDate: string | null; // YYYY-MM-DD
}

interface Settings {
  dailyGoalMinutes: number;
  darkMode: boolean;
  accentColor: string;
  avatar: number;
  displayName: string;
  // Notification settings
  dailyReminderEnabled: boolean;
  dailyReminderTime: string; // HH:MM format
  streakAlertEnabled: boolean;
  breakReminderEnabled: boolean;
  breakReminderInterval: number; // minutes
}
```

### Data Flow
1. **Screens** call functions from `client/lib/storage.ts`
2. **Storage functions** read/write to AsyncStorage
3. **React Query** is configured but screens use direct storage calls
4. **Streak updates** happen automatically on session creation
5. **Notifications** scheduled/updated via `client/lib/notifications.ts`

---

## Navigation Architecture

### Route Hierarchy

```
RootStackNavigator (NativeStack)
??? Main (MainTabNavigator - BottomTabs)
?   ??? HomeTab (HomeStackNavigator - NativeStack)
?   ?   ??? Home (HomeScreen)
?   ??? SubjectsTab (SubjectsStackNavigator - NativeStack)
?   ?   ??? Subjects (SubjectsScreen)
?   ??? StatsTab (StatsStackNavigator - NativeStack)
?       ??? Stats (StatsScreen)
??? Timer (TimerScreen) - fullScreenModal
??? Pomodoro (PomodoroScreen) - fullScreenModal
??? AddSubject (AddSubjectScreen) - modal
??? Settings (SettingsScreen) - modal
```

### Navigation Parameters

```typescript
// RootStackParamList
{
  Main: undefined;
  Timer: { subjectId: string; subjectName: string };
  Pomodoro: { subjectId: string; subjectName: string };
  AddSubject: undefined;
  Settings: undefined;
}

// MainTabParamList
{
  HomeTab: undefined;
  SubjectsTab: undefined;
  StatsTab: undefined;
}
```

---

## Component Architecture

### Base Components

| Component | Props | Purpose |
|-----------|-------|---------|
| ThemedText | type?: h1\|h2\|h3\|h4\|body\|small\|link, lightColor?, darkColor? | Typography with theme-aware colors |
| ThemedView | lightColor?, darkColor? | View with theme-aware background |
| Button | onPress?, children, style?, disabled?, variant? | Animated button with spring press effect (primary/secondary/outline/danger) |

### Compound Components

| Component | Props | Purpose |
|-----------|-------|---------|
| Card | variant?, title?, description?, children?, onPress?, style? | Elevation-based card with press animation |
| SubjectCard | subject: Subject, dailyGoal: number, onStartStudy: () => void, onStartPomodoro?: () => void | Subject row with progress bar, start study & Pomodoro buttons |
| SessionCard | session: StudySession & { subjectName: string } | Study session row with duration & time ago |
| StatCard | icon, value, label, color? | Statistics display with icon |
| ProgressBar | progress: 0-1, height?, style? | Animated horizontal progress bar |
| CircularProgress | current: number, goal: number, size?, strokeWidth? | SVG circular progress with percentage |
| EmptyState | image, title, subtitle? | Empty state with illustration |
| StreakBadge | streak: number | Streak display with zap icon |
| WeeklyChart | data: {day, minutes}[] | 7-day vertical bar chart |
| HeaderTitle | title: string | Navigation header with app icon |

### Error Handling Components

| Component | Purpose |
|-----------|---------|
| ErrorBoundary | Class component catching render errors |
| ErrorFallback | UI for errors with restart button & dev modal |

---

## Hooks API

### useTheme() ? { theme, isDark }
Returns current theme object and dark mode boolean.

### useScreenOptions({ transparent? }) ? NativeStackNavigationOptions
Returns navigation screen options with theme-aware styling.

### useColorScheme() ? 'light' \| 'dark' \| null
Platform color scheme (web version uses `useSyncExternalStore` for hydration).

---

## Theme System (client/constants/theme.ts)

### Colors
```typescript
Colors = {
  light: {
    text: #1D3557,        // Deep Blue
    textSecondary: #457B9D,
    buttonText: #FFFFFF,
    tabIconDefault: #457B9D,
    tabIconSelected: #1D3557,
    link: #A8DADC,
    primary: #A8DADC,     // Soft Cyan
    secondary: #F1FAEE,   // Cream
    success: #90D5A5,
    warning: #FFC857,
    backgroundRoot: #FFFFFF,
    backgroundDefault: #F1FAEE,
    backgroundSecondary: #E8F4F8,
    backgroundTertiary: #A8DADC,
    cardBackground: #F1FAEE,
    progressBackground: #E0E0E0,
    progressFill: #A8DADC,
    border: #D0D0D0,
  },
  dark: {
    text: #F1FAEE,
    textSecondary: #9BB5C4,
    buttonText: #FFFFFF,
    tabIconDefault: #9BB5C4,
    tabIconSelected: #A8DADC,
    link: #A8DADC,
    primary: #A8DADC,
    secondary: #2D4564,
    success: #90D5A5,
    warning: #FFC857,
    backgroundRoot: #1D3557,
    backgroundDefault: #2D4564,
    backgroundSecondary: #3D5574,
    backgroundTertiary: #4D6584,
    cardBackground: #2D4564,
    progressBackground: #3D5574,
    progressFill: #A8DADC,
    border: #3D5574,
  }
}
```

### Spacing Scale
```typescript
Spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20,
  2xl: 24, 3xl: 32, 4xl: 40, 5xl: 48,
  inputHeight: 48, buttonHeight: 52
}
```

### Border Radius
```typescript
BorderRadius = {
  xs: 8, sm: 12, md: 16, lg: 24, xl: 30,
  2xl: 40, 3xl: 50, full: 9999
}
```

### Typography
```typescript
Typography = {
  h1: { fontSize: 32, lineHeight: 40, fontWeight: 700 },
  h2: { fontSize: 28, lineHeight: 36, fontWeight: 700 },
  h3: { fontSize: 24, lineHeight: 32, fontWeight: 600 },
  h4: { fontSize: 20, lineHeight: 28, fontWeight: 600 },
  body: { fontSize: 16, lineHeight: 24, fontWeight: 400 },
  small: { fontSize: 14, lineHeight: 20, fontWeight: 400 },
  link: { fontSize: 16, lineHeight: 24, fontWeight: 400 }
}
```

### Timer Sizes
```typescript
TimerSizes = {
  container: 220,
  fontSize: 48,
}
```

---

## Storage API (client/lib/storage.ts)

### Motivational Messages
```typescript
export const motivationalMessages: string[]; // 11 messages
export function getRandomMotivationalMessage(): string;
```

### ID & Formatting
```typescript
export function generateId(): string; // crypto.randomUUID() with fallback
export function formatTime(seconds: number): string; // MM:SS or H:MM:SS
export function formatMinutes(minutes: number): string; // 2h 34m or 45m
export function formatDuration(seconds: number): string; // 25m 30s
```

### Date Utilities
```typescript
export function isToday(dateString: string): boolean;
export function isYesterday(dateString: string): boolean;
export function getTodayString(): string; // YYYY-MM-DD (UTC)
```

### Result Type (Consistent Error Handling)
```typescript
type Result<T, E = StorageError> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

### Subjects CRUD
```typescript
export async function getSubjects(): Promise<Result<Subject[]>>;
export async function saveSubjects(subjects: Subject[]): Promise<Result<void>>;
export async function addSubject(name: string): Promise<Result<Subject>>;
export async function updateSubjectTime(subjectId: string, additionalMinutes: number): Promise<Result<void>>;
export async function deleteSubject(subjectId: string): Promise<Result<void>>;
```

### Sessions CRUD
```typescript
export async function getSessions(): Promise<Result<StudySession[]>>;
export async function saveSessions(sessions: StudySession[]): Promise<Result<void>>;
export async function addSession(subjectId: string, subjectName: string, durationSeconds: number): Promise<Result<StudySession>>;
// Atomic: saves session + updates subject total + updates streak in single mutex lock
export async function getTodaySessions(): Promise<Result<(StudySession & { subjectName: string })[]>>;
// Returns sessions with subjectName joined (denormalized removed)
export async function getTodayTotalMinutes(): Promise<Result<number>>;
```

### Streak Operations
```typescript
export async function getStreak(): Promise<Result<StreakData>>;
export async function updateStreak(): Promise<Result<StreakData>>;
// Logic: same day = no change, yesterday = increment, else = reset to 1
// Uses UTC date strings for timezone consistency
```

### Settings
```typescript
export async function getSettings(): Promise<Result<Settings>>;
// defaults: 120min, darkMode: false, accentColor: #A8DADC, avatar: 1, displayName: ""
// notifications: dailyReminderEnabled: false, dailyReminderTime: 19:00, streakAlertEnabled: true, breakReminderEnabled: false, breakReminderInterval: 60
export async function saveSettings(settings: Settings): Promise<Result<void>>;
```

### Compound Queries
```typescript
export async function getHomeData(): Promise<Result<HomeData>>;
// Single call: todayMinutes, streak, todaySessions (with subjectName), settings
export async function getWeeklyStats(): Promise<Result<WeeklyStats[]>>;
export async function getAllTimeStats(): Promise<Result<AllTimeStats>>;
```

### Data Export/Import
```typescript
export async function exportData(): Promise<Result<string>>;
// Returns JSON string with version, timestamp, subjects, sessions, streak, settings
export async function importData(jsonString: string): Promise<Result<void>>;
// Validates format, replaces all data atomically
```

---

## Notifications API (client/lib/notifications.ts)

### Configuration
```typescript
interface NotificationSettings {
  dailyReminderEnabled: boolean;
  dailyReminderTime: string; // HH:MM
  streakAlertEnabled: boolean;
  breakReminderEnabled: boolean;
  breakReminderInterval: number; // minutes
}
```

### Permission & Setup
```typescript
export async function requestNotificationPermissions(): Promise<boolean>;
// Requests iOS/Android permissions, configures Android channels
export async function initializeNotifications(): Promise<void>;
// Called on app startup, schedules enabled notifications
```

### Scheduling
```typescript
export async function scheduleDailyReminder(time: string): Promise<string | null>;
// Daily at specified time (repeats)
export async function scheduleStreakAlert(): Promise<string | null>;
// Daily at 8 PM if no study session (repeats)
export async function scheduleBreakReminder(intervalMinutes: number): Promise<string | null>;
// Repeating interval timer during sessions
export async function cancelAllNotifications(): Promise<void>;
export async function updateAllNotifications(settings: NotificationSettings): Promise<void>;
// Cancels all, re-schedules based on current settings
```

### Immediate Alerts
```typescript
export async function checkAndShowStreakAlert(): Promise<void>;
// Checks if no study today & evening (after 6 PM), shows immediate notification
```

### Listeners
```typescript
export function addNotificationResponseListener(
  listener: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription;
// Handle notification taps (navigate to relevant screen)
```

---

## React Query API (client/lib/query-client.ts)

### Configuration
```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: { retry: false }
  }
});
```

### API Helpers
```typescript
export function getApiUrl(): string; // From EXPO_PUBLIC_DOMAIN, fallback localhost:5000 in dev
export async function apiRequest(method, route, data?): Promise<Response>;
export const getQueryFn: <T>(options: {on401: "returnNull"|"throw"}) => QueryFunction<T>;
```

> **Note**: The client currently uses AsyncStorage directly instead of these API helpers. The React Query setup appears to be for future backend integration.

---

## Server API (server/)

### Express App (server/index.ts)

#### Middleware Stack
1. **CORS** - Explicit allowlist (Replit domains + localhost:8081, :19006)
2. **Body Parsing** - JSON + urlencoded with rawBody capture
3. **Request Logging** - API request/response logging
4. **Expo Routing** - Static file serving + manifest handling
5. **Error Handler** - JSON error responses

#### Static File Serving
- `/assets` ? `./assets`
- `/` ? Landing page (server/templates/landing-page.html)
- `/manifest` ? Expo manifest (platform-specific)
- `/static-build` ? Production builds

#### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | / | Landing page with QR code for Expo Go |
| GET | /manifest | Expo manifest (requires expo-platform header) |
| GET | /assets/* | Static asset files |
| GET | /static-build/* | Production bundle files |
| GET | /api/health | Health check endpoint |

### Routes (server/routes.ts)
```typescript
export async function registerRoutes(app: Express): Promise<Server>;
// Registers /api/health endpoint
```

### Storage Interface (server/storage.ts)
```typescript
interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

class MemStorage implements IStorage {
  private users: Map<string, User>;
  // In-memory implementation for User model
}

export const storage = new MemStorage();
```

### Shared Schema (shared/schema.ts)
```typescript
export const users = pgTable('users', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({username: true, password: true});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
```

---

## Build System

### Development Scripts
```json
{
  "expo:dev": "EXPO_PACKAGER_PROXY_URL=... npx expo start --localhost",
  "server:dev": "NODE_ENV=development tsx server/index.ts",
  "db:push": "drizzle-kit push",
  "lint": "npx expo lint",
  "check:types": "tsc --noEmit"
}
```

### Production Build
```json
{
  "server:build": "esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=server_dist",
  "server:prod": "NODE_ENV=production node server_dist/index.js",
  "expo:static:build": "npx expo start --no-dev --minify --localhost",
  "expo:start:static:build": "node scripts/build.js"
}
```

### Static Build Process (scripts/build.js)
1. Prepare timestamped build directories
2. Clear Metro cache
3. Start Metro bundler with production settings
4. Download iOS/Android JS bundles from Metro
5. Download platform manifests
6. Extract asset references from bundles
7. Download all assets
8. Rewrite bundle URLs to production CDN paths
9. Update manifests with production URLs
10. Output to `static-build/{timestamp}/`

---

## Configuration Files

### TypeScript (tsconfig.json)
```json
{
  "extends": "expo/tsconfig.base.json",
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "paths": {
      "@/*": ["./client/*"],
      "@shared/*": ["./shared/*"]
    },
    "types": ["node"]
  }
}
```

### Babel (babel.config.js)
```javascript
{
  presets: ["babel-preset-expo"],
  plugins: [
    ["module-resolver", {root: ["./"], alias: {"@": "./client", "@shared": "./shared"}}],
    "react-native-reanimated/plugin"
  ]
}
```

### Expo (app.json)
```json
{
  "expo": {
    "name": "StudyBuddy",
    "slug": "studybuddy",
    "version": "1.0.0",
    "scheme": "studybuddy",
    "newArchEnabled": true,
    "ios": {"bundleIdentifier": "com.studybuddy.app"},
    "android": {"package": "com.studybuddy.app", "edgeToEdgeEnabled": true},
    "web": {"output": "single"},
    "plugins": [["expo-splash-screen", {...}], "expo-web-browser"],
    "experiments": {"reactCompiler": true}
  }
}
```

### Drizzle (drizzle.config.ts)
```typescript
{
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {url: process.env.DATABASE_URL}
}
```

---

## Development Workflow

### Adding a New Screen
1. Create component in `client/screens/`
2. Add to appropriate Stack Navigator
3. Update `RootStackParamList` if modal/fullscreen
4. Add navigation call from source screen

### Adding a New Component
1. Create in `client/components/`
2. Export from component file
3. Import using `@/components/ComponentName` alias

### Modifying Theme
1. Edit `client/constants/theme.ts`
2. Changes propagate via `useTheme()` hook

### Data Layer Changes
1. Update types in `client/lib/storage.ts`
2. Add/modify storage functions (return `Result<T>`)
3. Screens automatically get new functionality

### Adding Notifications
1. Add settings to `Settings` interface in storage.ts
2. Add toggle/input in SettingsScreen
3. Call `updateAllNotifications()` on settings save
4. Use `scheduleDailyReminder()`, `scheduleStreakAlert()`, `scheduleBreakReminder()` in notifications.ts

---

## Testing & Quality

### Linting
```bash
npm run lint          # Check
npm run lint:fix      # Auto-fix
```

### Type Checking
```bash
npm run check:types   # tsc --noEmit
```

### Formatting
```bash
npm run check:format  # Prettier check
npm run format        # Prettier write
```

---

## Deployment

### Replit Deployment
- Configured via `replit.md` and environment variables
- Static build outputs to `static-build/`
- Server serves static files + landing page
- Database provisioned via `DATABASE_URL`

### Environment Variables
| Variable | Purpose |
|----------|---------|
| PORT | Server port (default 5000) |
| DATABASE_URL | PostgreSQL connection string |
| REPLIT_DEV_DOMAIN | Development domain for CORS |
| REPLIT_DOMAINS | Production domains for CORS |
| EXPO_PUBLIC_DOMAIN | Public domain for Metro bundler |

---

## Known Limitations / Future Work

1. **Backend Integration**: React Query configured but client uses AsyncStorage directly
2. **User Auth**: Only User schema defined, no authentication flow implemented
3. **Data Sync**: No cloud sync - data is device-local only
4. **Testing**: No test files or test configuration present
5. **TypeScript Strict**: Enabled but some `any` types remain in server code

---

## File Reference Quick Index

### Core App Files
- `client/App.tsx` - App root with providers
- `client/index.js` - Expo entry point

### Screens (7)
- `client/screens/HomeScreen.tsx`
- `client/screens/SubjectsScreen.tsx`
- `client/screens/AddSubjectScreen.tsx`
- `client/screens/TimerScreen.tsx`
- `client/screens/PomodoroScreen.tsx`
- `client/screens/StatsScreen.tsx`
- `client/screens/SettingsScreen.tsx`

### Navigation (5)
- `client/navigation/RootStackNavigator.tsx`
- `client/navigation/MainTabNavigator.tsx`
- `client/navigation/HomeStackNavigator.tsx`
- `client/navigation/SubjectsStackNavigator.tsx`
- `client/navigation/StatsStackNavigator.tsx`

### Components (15)
- `client/components/ThemedText.tsx`
- `client/components/ThemedView.tsx`
- `client/components/Button.tsx`
- `client/components/Card.tsx`
- `client/components/SubjectCard.tsx`
- `client/components/SessionCard.tsx`
- `client/components/StatCard.tsx`
- `client/components/ProgressBar.tsx`
- `client/components/CircularProgress.tsx`
- `client/components/EmptyState.tsx`
- `client/components/ErrorBoundary.tsx`
- `client/components/ErrorFallback.tsx`
- `client/components/HeaderTitle.tsx`
- `client/components/StreakBadge.tsx`
- `client/components/WeeklyChart.tsx`
- `client/components/Spacer.tsx`

### Hooks (4)
- `client/hooks/useTheme.ts`
- `client/hooks/useScreenOptions.ts`
- `client/hooks/useColorScheme.ts`
- `client/hooks/useColorScheme.web.ts`

### Libraries (3)
- `client/lib/storage.ts` - **Primary data layer** (600+ lines)
- `client/lib/query-client.ts` - React Query + API helpers
- `client/lib/notifications.ts` - Local notifications system (350+ lines)

### Server (4)
- `server/index.ts` - Express app + middleware + static serving
- `server/routes.ts` - Route registration (health check)
- `server/storage.ts` - In-memory User storage
- `server/templates/landing-page.html` - Deployment landing page

### Shared (1)
- `shared/schema.ts` - Drizzle User schema

### Scripts (1)
- `scripts/build.js` - Production static build (562 lines)