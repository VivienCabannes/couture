import { useWindowDimensions } from "react-native";

const TABLET_BREAKPOINT = 768;

/**
 * Returns responsive layout info based on screen width.
 * `isWide` is true when width >= 768 (tablet/landscape).
 */
export function useResponsiveLayout() {
  const { width } = useWindowDimensions();
  return { isWide: width >= TABLET_BREAKPOINT, screenWidth: width };
}
