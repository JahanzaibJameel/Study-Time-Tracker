import { Platform } from "react-native";

// StudyBuddy color palette based on design guidelines
const primaryCyan = "#A8DADC";
const secondaryCream = "#F1FAEE";
const deepBlue = "#1D3557";
const mediumBlue = "#457B9D";
const softGreen = "#90D5A5";
const warmYellow = "#FFC857";

export const Colors = {
  light: {
    text: deepBlue,
    textSecondary: mediumBlue,
    buttonText: "#FFFFFF",
    tabIconDefault: mediumBlue,
    tabIconSelected: deepBlue,
    link: primaryCyan,
    primary: primaryCyan,
    secondary: secondaryCream,
    success: softGreen,
    warning: warmYellow,
    backgroundRoot: "#FFFFFF",
    backgroundDefault: secondaryCream,
    backgroundSecondary: "#E8F4F8",
    backgroundTertiary: primaryCyan,
    cardBackground: secondaryCream,
    progressBackground: "#E0E0E0",
    progressFill: primaryCyan,
    border: "#D0D0D0",
  },
  dark: {
    text: secondaryCream,
    textSecondary: "#9BB5C4",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BB5C4",
    tabIconSelected: primaryCyan,
    link: primaryCyan,
    primary: primaryCyan,
    secondary: "#2D4564",
    success: softGreen,
    warning: warmYellow,
    backgroundRoot: deepBlue,
    backgroundDefault: "#2D4564",
    backgroundSecondary: "#3D5574",
    backgroundTertiary: "#4D6584",
    cardBackground: "#2D4564",
    progressBackground: "#3D5574",
    progressFill: primaryCyan,
    border: "#3D5574",
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
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
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
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
};
