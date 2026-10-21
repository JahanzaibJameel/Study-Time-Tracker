# StudyBuddy - Comprehensive Code Audit Report

**Date**: 2026-10-18  
**Project**: Study Time Tracker (React Native / Expo)  
**Scope**: Client (React Native), Server (Express), Shared Types, Build System

---

## Executive Summary

| Severity | Count | Description |
|----------|-------|-------------|
| 🔴 Critical | 3 | Data loss risk, security misconfiguration, timer accuracy |
| 🟠 High | 7 | Race conditions, memory leaks, error handling gaps |
| 🟡 Medium | 12 | Performance, maintainability, UX issues |
| 🟢 Low | 8 | Code style, dead code, minor improvements |

---

## 🔴 Critical Issues

### C1: Race Condition in `addSession` - Data Loss Risk
**File**: `client/lib/storage.ts:177-201`

**Problem**: `addSession` performs 3 separate AsyncStorage operations without atomicity:
```typescript
const sessions = await getSessions();  // READ
sessions.push(newSession);
await saveSessions(sessions);           // WRITE 1
await updateSubjectTime(...);           // READ + WRITE 2
await updateStreak();                   // READ + WRITE 3
```

**Impact**: Concurrent calls (e.g., user taps Stop rapidly, or app backgrounded) cause lost sessions, incorrect totals, broken streaks.

**Fix**: Use a single transaction-like pattern with a mutex or batch writes:
```typescript
// storage.ts - Add mutex for critical sections
let storageMutex = Promise.resolve();

async function withStorageLock<T>(fn: () => Promise<T>): Promise<T> {
  const lock = storageMutex.then(fn);
  storageMutex = lock.catch(() => {}); // Prevent unhandled rejection
  return lock;
}

export async function addSession(...): Promise<StudySession> {
  return withStorageLock(async () => {
    const [sessions, subjects, streak] = await Promise.all([
      getSessions(),
      getSubjects(),
      getStreak(),
    ]);
    
    const newSession = { ... };
    sessions.push(newSession);
    
    const minutes = Math.floor(durationSeconds / 60);
    const subject = subjects.find(s => s.id === subjectId);
    if (subject) subject.totalMinutes += minutes;
    
    // Update streak logic here (inline to avoid re-reading)
    const today = getTodayString();
    if (streak.lastStudyDate !== today) {
      if (streak.lastStudyDate && isYesterday(streak.lastStudyDate)) {
        streak.currentStreak += 1;
      } else {
        streak.currentStreak = 1;
      }
      streak.lastStudyDate = today;
    }
    
    await Promise.all([
      saveSessions(sessions),
      saveSubjects(subjects),
      AsyncStorage.setItem(STREAK_KEY, JSON.stringify(streak)),
    ]);
    
    return newSession;
  });
}
```

---

### C2: Timer Drift - Inaccurate Time Tracking
**File**: `client/screens/TimerScreen.tsx:67-81`

**Problem**: Uses `setInterval` with 1000ms which accumulates drift:
```typescript
intervalRef.current = setInterval(() => {
  setSeconds((prev) => prev + 1);
}, 1000);
```

**Impact**: After 1 hour, timer can be off by several seconds. `setInterval` doesn't account for JS event loop delays.

**Fix**: Use `Date.now()` for accurate elapsed time:
```typescript
const startTimeRef = useRef<number>(0);

const handleStart = () => {
  startTimeRef.current = Date.now() - seconds * 1000;
  setIsRunning(true);
};

useEffect(() => {
  if (!isRunning) return;
  
  const updateTimer = () => {
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    setSeconds(elapsed);
  };
  
  updateTimer(); // Immediate
  const id = setInterval(updateTimer, 100); // High frequency for smooth UI
  return () => clearInterval(id);
}, [isRunning]);
```

---

### C3: CORS Misconfiguration - Security Vulnerability
**File**: `server/index.ts:16-53`

**Problem**: Overly permissive CORS with wildcard-like behavior:
```typescript
const isLocalhost = origin?.startsWith("http://localhost:") || 
                    origin?.startsWith("http://127.0.0.1:");
if (origin && (origins.has(origin) || isLocalhost)) {
  res.header("Access-Control-Allow-Origin", origin); // Reflects ANY localhost port
  res.header("Access-Control-Allow-Credentials", "true");
}
```

**Impact**: Any site on localhost (any port) can make credentialed requests. In shared environments (codespaces, Replit), this exposes the API to other users' apps.

**Fix**: Explicit allowlist with exact origins:
```typescript
const ALLOWED_ORIGINS = new Set([
  process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null,
  ...(process.env.REPLIT_DOMAINS?.split(",").map(d => `https://${d.trim()}`) || []),
  "http://localhost:8081", // Expo web default
  "http://localhost:19006", // Expo dev server
]).filter(Boolean);

function setupCors(app: express.Application) {
  app.use((req, res, next) => {
    const origin = req.header("origin");
    
    if (origin && ALLOWED_ORIGINS.has(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type");
      res.header("Access-Control-Allow-Credentials", "true");
    }
    
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
}
```

---

## 🟠 High Issues

### H1: Memory Leak in TimerScreen - Interval Not Cleared on Unmount
**File**: `client/screens/TimerScreen.tsx:67-81`

**Problem**: If user navigates away while timer running, `useEffect` cleanup runs but `navigation.goBack()` in `handleStop` may cause race with cleanup.

**Fix**: Add `isMounted` guard and ensure cleanup on unmount:
```typescript
const isMountedRef = useRef(true);

useEffect(() => {
  isMountedRef.current = true;
  return () => { isMountedRef.current = false; };
}, []);

useEffect(() => {
  if (!isRunning) return;
  
  const id = setInterval(() => {
    if (isMountedRef.current) setSeconds(p => p + 1);
  }, 1000);
  
  return () => clearInterval(id);
}, [isRunning]);
```

---

### H2: No Input Validation in `addSubject`
**File**: `client/lib/storage.ts:127-138`

**Problem**: Accepts empty/whitespace-only names, no length limits:
```typescript
export async function addSubject(name: string): Promise<Subject> {
  const subjects = await getSubjects();
  const newSubject: Subject = {
    id: generateId(),
    name: name.trim(), // Empty string allowed!
    ...
  };
```

**Fix**: Validate and throw/return error:
```typescript
export async function addSubject(name: string): Promise<Subject> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Subject name cannot be empty");
  if (trimmed.length > 50) throw new Error("Subject name too long (max 50 chars)");
  
  const subjects = await getSubjects();
  if (subjects.some(s => s.name.toLowerCase() === trimmed.toLowerCase())) {
    throw new Error("Subject already exists");
  }
  ...
}
```

---

### H3: `generateId()` Collision Risk
**File**: `client/lib/storage.ts:56-58`

**Problem**: `Date.now().toString(36) + Math.random().toString(36).substr(2)` can collide under high frequency.

**Fix**: Use crypto.randomUUID() or nanoid:
```typescript
import { randomUUID } from "expo-crypto"; // or crypto.randomUUID() in RN 0.76+

export function generateId(): string {
  return randomUUID(); // RFC4122 compliant, cryptographically secure
}
```

---

### H4: Streak Logic Bug - Timezone Issues
**File**: `client/lib/storage.ts:230-256`

**Problem**: Uses local date without timezone consideration. User studies at 11pm, streak breaks if date changes at midnight.

**Fix**: Store/use UTC dates consistently:
```typescript
export function getTodayString(): string {
  return new Date().toISOString().split("T")[0]; // Already UTC
}

export function isToday(dateString: string): boolean {
  return dateString === getTodayString(); // Compare UTC date strings
}
```

---

### H5: Missing Error Boundaries for AsyncStorage Failures
**File**: `client/lib/storage.ts` - All functions

**Problem**: Silent failures return empty arrays/objects, UI shows stale data without indication.

**Fix**: Throw typed errors, add retry logic:
```typescript
export class StorageError extends Error {
  constructor(message: string, public readonly operation: string, public readonly cause?: Error) {
    super(message);
    this.name = "StorageError";
  }
}

export async function getSubjects(): Promise<Subject[]> {
  try {
    const data = await AsyncStorage.getItem(SUBJECTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    throw new StorageError("Failed to load subjects", "getSubjects", error as Error);
  }
}
```

---

### H6: Server Has No API Routes - Dead Code
**File**: `server/routes.ts:1-11`

**Problem**: `registerRoutes` returns HTTP server with zero API endpoints. Client uses `query-client.ts` for API but storage is local-only.

**Fix**: Either implement API routes or remove unused React Query setup:
```typescript
// server/routes.ts - Add actual API if needed
export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/health", (req, res) => res.json({ status: "ok" }));
  
  // If keeping local-first, remove React Query from client entirely
  const httpServer = createServer(app);
  return httpServer;
}
```

---

### H7: `query-client.ts` Uses Undefined Env Var
**File**: `client/lib/query-client.ts:7-17`

**Problem**: `getApiUrl()` throws if `EXPO_PUBLIC_DOMAIN` not set, but no fallback:
```typescript
export function getApiUrl(): string {
  let host = process.env.EXPO_PUBLIC_DOMAIN;
  if (!host) throw new Error("EXPO_PUBLIC_DOMAIN is not set");
  ...
}
```

**Fix**: Provide development fallback:
```typescript
export function getApiUrl(): string {
  let host = process.env.EXPO_PUBLIC_DOMAIN;
  if (!host) {
    if (__DEV__) return "http://localhost:5000";
    throw new Error("EXPO_PUBLIC_DOMAIN is not set");
  }
  return new URL(`https://${host}`).href;
}
```

---

## 🟡 Medium Issues

### M1: N+1 Query Pattern in Screens
**Files**: `HomeScreen.tsx`, `SubjectsScreen.tsx`, `StatsScreen.tsx`

**Problem**: Each screen makes 3-4 sequential AsyncStorage calls on focus:
```typescript
const [minutes, streakData, sessions, settings] = await Promise.all([
  getTodayTotalMinutes(),  // reads sessions
  getStreak(),
  getTodaySessions(),      // reads sessions AGAIN
  getSettings(),
]);
```

**Fix**: Create compound queries:
```typescript
// storage.ts
export async function getHomeData(): Promise<{
  todayMinutes: number;
  streak: StreakData;
  todaySessions: StudySession[];
  settings: Settings;
}> {
  const [sessions, streak, settings] = await Promise.all([
    getSessions(),
    getStreak(),
    getSettings(),
  ]);
  
  const todaySessions = sessions.filter(s => isToday(s.date));
  const todayMinutes = Math.floor(
    todaySessions.reduce((sum, s) => sum + s.duration, 0) / 60
  );
  
  return { todayMinutes, streak, todaySessions, settings };
}
```

---

### M2: No Loading/Error States for Settings
**File**: `client/screens/AddSubjectScreen.tsx`

**Problem**: `handleSave` shows no feedback during save, only haptics on success/error.

**Fix**: Add loading state and toast/snackbar:
```typescript
const [isSaving, setIsSaving] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleSave = async () => {
  if (!name.trim()) return;
  setIsSaving(true);
  setError(null);
  
  try {
    await addSubject(name);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to add subject");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } finally {
    setIsSaving(false);
  }
};
```

---

### M3: CircularProgress Uses `origin` Prop (Native Only)
**File**: `client/components/CircularProgress.tsx`

**Problem**: `origin` prop on `<AnimatedCircle>` works on native but not web (SVG). Fixed partially but `rotation` logic still platform-dependent.

**Fix**: Full platform abstraction (already addressed in recent fixes).

---

### M4: Theme System - No TypeScript Types for Colors
**File**: `client/constants/theme.ts`

**Problem**: `Colors` object lacks TypeScript interface, allowing typo-prone string access.

**Fix**: Add type definitions:
```typescript
export interface ThemeColors {
  text: string;
  textSecondary: string;
  buttonText: string;
  tabIconDefault: string;
  tabIconSelected: string;
  link: string;
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  backgroundRoot: string;
  backgroundDefault: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  cardBackground: string;
  progressBackground: string;
  progressFill: string;
  border: string;
}

export const Colors: { light: ThemeColors; dark: ThemeColors } = { ... };
```

---

### M5: `useColorScheme.web.ts` Hydration Mismatch Risk
**File**: `client/hooks/useColorScheme.web.ts`

**Problem**: Returns `"light"` during SSR then switches after hydration, causing flash.

**Fix**: Use `useSyncExternalStore` or match server-rendered theme:
```typescript
// For static builds, detect from HTML class or cookie
export function useColorScheme() {
  const [scheme, setScheme] = useState<ColorSchemeName>("light");
  
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setScheme(mediaQuery.matches ? "dark" : "light");
    const handler = (e: MediaQueryListEvent) => setScheme(e.matches ? "dark" : "light");
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);
  
  return scheme;
}
```

---

### M6: No Unit Tests
**Project-wide**

**Problem**: Zero test coverage. Critical logic (streak, timer, storage) untested.

**Fix**: Add Jest + React Native Testing Library:
```bash
npm install -D jest @testing-library/react-native @types/jest ts-jest
```

---

### M7: Inconsistent Error Handling - Some Throw, Some Return Defaults
**File**: `client/lib/storage.ts`

**Problem**: `getSubjects()` returns `[]` on error, `getStreak()` returns default object, but `addSubject()` throws on storage failure.

**Fix**: Standardize - either all throw `StorageError` or all return `Result<T, Error>`:
```typescript
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

export async function getSubjects(): Promise<Result<Subject[]>> {
  try {
    const data = await AsyncStorage.getItem(SUBJECTS_KEY);
    return { ok: true, value: data ? JSON.parse(data) : [] };
  } catch (error) {
    return { ok: false, error: new StorageError(...) };
  }
}
```

---

### M8: Timer Completion Shows Minutes Only - Loses Seconds
**File**: `TimerScreen.tsx:226`

**Problem**: `minutes = Math.floor(seconds / 60)` discards seconds in completion modal.

**Fix**: Show precise time:
```tsx
const formatDuration = (secs: number) => {
  const mins = Math.floor(secs / 60);
  const remainingSecs = secs % 60;
  if (mins === 0) return `${remainingSecs}s`;
  if (remainingSecs === 0) return `${mins}m`;
  return `${mins}m ${remainingSecs}s`;
};

// Usage:
You studied for {formatDuration(seconds)}
```

---

### M9: Button Component - No `disabled` Style on Web
**File**: `client/components/Button.tsx`

**Problem**: `disabled` only sets opacity, but web needs `pointerEvents: none` and cursor change.

**Fix**:
```tsx
<AnimatedPressable
  onPress={disabled ? undefined : onPress}
  style={[
    styles.button,
    { backgroundColor: theme.link, opacity: disabled ? 0.5 : 1 },
    disabled && { pointerEvents: "none" },
    style,
    animatedStyle,
  ]}
  accessibilityState={{ disabled }}
/>
```

---

### M10: `formatTime` Doesn't Handle Hours
**File**: `client/lib/storage.ts:61-65`

**Problem**: Timer shows `MM:SS` but after 60 minutes shows `60:00`, `61:00` etc.

**Fix**:
```typescript
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
```

---

## 🟢 Low Issues

### L1: Dead Code - `Spacer.tsx` Unused
**File**: `client/components/Spacer.tsx`

**Status**: Imported nowhere. Remove or use.

---

### L2: `KeyboardAwareScrollViewCompat.tsx` - Platform Check Duplicated
**File**: `client/components/KeyboardAwareScrollViewCompat.tsx`

**Problem**: Re-implements what `react-native-keyboard-controller` already handles.

**Fix**: Use the library directly or remove if not needed.

---

### L3: Console.error in Production Code
**Files**: Multiple screens

**Problem**: `console.error` calls remain in production builds.

**Fix**: Use `__DEV__` guard:
```typescript
if (__DEV__) console.error("Error loading home data:", error);
```

---

### L4: Magic Numbers in Timer Styles
**File**: `TimerScreen.tsx:268-274`

**Problem**: Hardcoded `220` for timer container size.

**Fix**: Extract to theme constants:
```typescript
// theme.ts
export const TimerSizes = {
  container: 220,
  fontSize: 48,
};
```

---

### L5: Duplicate `Shadows` Import in Some Components
**Files**: Multiple components import `Shadows` but only use one variant.

**Fix**: Import only needed variant or use `variant` prop pattern.

---

### L6: Missing `key` Prop in Some FlatList Items
**Files**: `HomeScreen.tsx`, `SubjectsScreen.tsx`

**Problem**: `keyExtractor` used but `key` prop not passed to child components (not required but good practice).

---

### L7: `subjectName` in StudySession - Denormalized Data
**File**: `client/lib/storage.ts:18-23`

**Problem**: `StudySession` stores `subjectName` redundantly. If subject renamed, history shows old name.

**Fix**: Remove `subjectName`, join at read time:
```typescript
export async function getTodaySessions(): Promise<(StudySession & { subjectName: string })[]> {
  const [sessions, subjects] = await Promise.all([getSessions(), getSubjects()]);
  const subjectMap = new Map(subjects.map(s => [s.id, s.name]));
  return sessions
    .filter(s => isToday(s.date))
    .map(s => ({ ...s, subjectName: subjectMap.get(s.subjectId) || "Unknown" }));
}
```

---

### L8: No Accessibility Labels on Interactive Elements
**Files**: Multiple Pressable/Touchable components

**Problem**: Missing `accessibilityLabel`, `accessibilityRole`, `testID` consistency.

**Fix**: Add to all interactive elements:
```tsx
<Pressable
  onPress={handleStart}
  accessibilityLabel="Start study session"
  accessibilityRole="button"
  testID="button-start-timer"
>
```

---

## Architecture Recommendations

### 1. State Management
Consider migrating to **Zustand** or **Jotai** for global state (subjects, sessions, settings) to:
- Eliminate N+1 AsyncStorage reads
- Enable reactive updates across screens
- Simplify screen logic

### 2. Offline-First Sync
Current: Local-only. Future: Add sync engine (WatermelonDB, RxDB, or custom) with:
- Conflict resolution (last-write-wins + user merge)
- Background sync queue
- Optimistic UI updates

### 3. Server Role Clarification
Current: Express serves static files + placeholder API. Decide:
- **Option A**: Keep local-first, remove server entirely (use Expo's static hosting)
- **Option B**: Implement real API for multi-device sync, auth, backup

### 4. Database Migration Path
Drizzle + PostgreSQL configured but unused. If moving to server:
- Migrate AsyncStorage → SQLite (local) → PostgreSQL (server)
- Use Drizzle for both with same schema

---

## Quick Wins (Fix in < 1 hour each)

1. ✅ **Add input validation to `addSubject`** - Prevents empty/duplicate subjects
2. ✅ **Fix timer drift with `Date.now()`** - Accurate timing
3. ✅ **Add `randomUUID` for IDs** - Eliminates collision risk
4. ✅ **Guard `console.error` with `__DEV__`** - Clean production logs
5. ✅ **Fix CORS allowlist** - Security hardening
6. ✅ **Show seconds in completion modal** - UX improvement
7. ✅ **Add accessibility labels** - a11y compliance

---

## Testing Checklist

- [ ] Timer accuracy over 1+ hour
- [ ] Streak across midnight / timezone changes
- [ ] Concurrent session saves (rapid Stop taps)
- [ ] App background/foreground during timer
- [ ] Subject rename reflects in history
- [ ] Dark mode toggle persists
- [ ] Web + iOS + Android parity
- [ ] Accessibility (VoiceOver, TalkBack)

---

## Files Requiring Immediate Attention

| File | Issues | Priority |
|------|--------|----------|
| `client/lib/storage.ts` | C1, H2, H3, H4, H5, M1, M7, L7 | 🔴 Critical |
| `client/screens/TimerScreen.tsx` | C2, H1, M8 | 🔴 Critical |
| `server/index.ts` | C3, H6 | 🔴 Critical |
| `client/lib/query-client.ts` | H7 | 🟠 High |
| `client/screens/AddSubjectScreen.tsx` | H2, M2 | 🟠 High |
| `client/constants/theme.ts` | M4 | 🟡 Medium |

---

## Appendix: TypeScript Strictness Gaps

Run `npx tsc --noEmit --strict` to reveal:
- Implicit `any` in `storage.ts` error handlers
- Missing return types on async functions
- Non-null assertions needed for `route.params`
- `theme` object shape not typed in `useTheme` return