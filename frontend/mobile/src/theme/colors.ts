/** Color palette for light and dark themes, derived from the web's Tailwind classes. */
export interface ColorPalette {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  primary: string;
  primaryLight: string;
  primaryBg: string;
  card: string;
  cardBorder: string;
  headerBg: string;
  /** Gray placeholder area for pattern illustrations */
  illustrationBg: string;
  illustrationText: string;
  /** Difficulty badge colors */
  badgeBeginner: string;
  badgeBeginnerText: string;
  badgeIntermediate: string;
  badgeIntermediateText: string;
  badgeAdvanced: string;
  badgeAdvancedText: string;
  /** Under-development badge */
  warningBg: string;
  warningText: string;
}

export const lightColors: ColorPalette = {
  background: "#f9fafb",    // gray-50
  surface: "#ffffff",
  text: "#111827",           // gray-900
  textSecondary: "#6b7280",  // gray-500
  textTertiary: "#9ca3af",   // gray-400
  border: "#d1d5db",         // gray-300
  primary: "#2563eb",        // blue-600
  primaryLight: "#60a5fa",   // blue-400
  primaryBg: "#eff6ff",      // blue-50
  card: "#ffffff",
  cardBorder: "#e5e7eb",     // gray-200
  headerBg: "#ffffff",
  illustrationBg: "#e5e7eb",     // gray-200
  illustrationText: "#9ca3af",   // gray-400
  badgeBeginner: "#d1fae5",      // emerald-100
  badgeBeginnerText: "#065f46",   // emerald-800
  badgeIntermediate: "#fef3c7",   // amber-100
  badgeIntermediateText: "#92400e", // amber-800
  badgeAdvanced: "#fee2e2",       // red-100
  badgeAdvancedText: "#991b1b",   // red-800
  warningBg: "#fef3c7",
  warningText: "#92400e",
};

export const darkColors: ColorPalette = {
  background: "#111827",     // gray-900
  surface: "#1f2937",        // gray-800
  text: "#f9fafb",           // gray-50
  textSecondary: "#9ca3af",  // gray-400
  textTertiary: "#6b7280",   // gray-500
  border: "#4b5563",         // gray-600
  primary: "#2563eb",        // blue-600
  primaryLight: "#60a5fa",   // blue-400
  primaryBg: "#1e3a5f",
  card: "#1f2937",           // gray-800
  cardBorder: "#374151",     // gray-700
  headerBg: "#1f2937",       // gray-800
  illustrationBg: "#374151",  // gray-700
  illustrationText: "#6b7280", // gray-500
  badgeBeginner: "#064e3b",      // emerald-900
  badgeBeginnerText: "#6ee7b7",   // emerald-300
  badgeIntermediate: "#78350f",   // amber-900
  badgeIntermediateText: "#fcd34d", // amber-300
  badgeAdvanced: "#7f1d1d",       // red-900
  badgeAdvancedText: "#fca5a5",   // red-300
  warningBg: "#78350f",
  warningText: "#fcd34d",
};
