import { Platform } from "react-native";

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
  error: string;
  backgroundRoot: string;
  backgroundDefault: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  cardBackground: string;
  progressBackground: string;
  progressFill: string;
  border: string;
}

// Modern aesthetic color palette inspired by contemporary UI design
const primaryBlue = "#3B82F6";           // Modern blue
const secondaryTeal = "#14B8A6";        // Vibrant teal
const tertiaryCoral = "#F97316";         // Warm coral
const quaternaryIndigo = "#6366F1";      // Indigo
const successGreen = "#10B981";          // Clean green
const warningAmber = "#F59E0B";          // Warm amber
const deepNavy = "#1E293B";              // Dark navy for text
const slateGray = "#64748B";             // Medium gray for secondary text
const veryLightGray = "#F8FAFC";         // Near-white for backgrounds
const lightGray = "#E2E8F0";             // Light gray for borders
const white = "#FFFFFF";                  // Pure white
const black = "#000000";                  // Pure black
const surfaceLight = "#FAFBFC";           // Light surface
const surfaceDark = "#0F172A";            // Dark surface

export const Colors: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    text: deepNavy,
    textSecondary: slateGray,
    buttonText: white,
    tabIconDefault: slateGray,
    tabIconSelected: primaryBlue,
    link: secondaryTeal,
    primary: primaryBlue,
    secondary: secondaryTeal,
  success: successGreen,
  warning: warningAmber,
  error: "#EF4444",
  backgroundRoot: veryLightGray,
  backgroundDefault: white,
  backgroundSecondary: surfaceLight,
  backgroundTertiary: "#E0F2FE", // Light blue background
  cardBackground: white,
  progressBackground: lightGray,
  progressFill: primaryBlue,
  border: lightGray,
},
dark: {
  text: surfaceLight,
  textSecondary: "#94A3B8",
  buttonText: white,
  tabIconDefault: "#94A3B8",
  tabIconSelected: secondaryTeal,
  link: secondaryTeal,
  primary: primaryBlue,
  secondary: quaternaryIndigo,
  success: successGreen,
  warning: warningAmber,
  error: "#F87171",
  backgroundRoot: deepNavy,
  backgroundDefault: "#1E293B",
  backgroundSecondary: "#334155",
  backgroundTertiary: "#475569",
  cardBackground: "#1E293B",
  progressBackground: "#334155",
  progressFill: secondaryTeal,
  border: "#475569",
},
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  "6xl": 64,
  inputHeight: 48,
  buttonHeight: 52,
  section: 24,
  card: 20,
};

export const BorderRadius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: "600" as const,
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "SF Pro Text",
    serif: "Georgia",
    rounded: "SF Pro Rounded",
    mono: "Courier New",
  },
  default: {
    sans: "Inter, system-ui, -apple-system, sans-serif",
    serif: "Merriweather, Georgia, serif",
    rounded: "Inter, system-ui, -apple-system, sans-serif",
    mono: "Fira Code, Monaco, monospace",
  },
  web: {
    sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Merriweather, Georgia, 'Times New Roman', serif",
    rounded: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const TimerSizes = {
  container: 240,
  fontSize: 56,
  handThickness: 3,
};

export const Shadows = {
  none: {},
  small: Platform.select({
    web: {
      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.05)",
    },
    default: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
  }),
  card: Platform.select({
    web: {
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.12)",
    },
    default: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
  }),
  medium: Platform.select({
    web: {
      boxShadow: "0 3px 6px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.14)",
    },
    default: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
    },
  }),
  large: Platform.select({
    web: {
      boxShadow: "0 6px 12px rgba(0, 0, 0, 0.10), 0 4px 8px rgba(0, 0, 0, 0.18)",
    },
    default: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 10,
    },
  }),
  button: Platform.select({
    web: {
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
    },
    default: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    },
  }),
};