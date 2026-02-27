import { View, TouchableOpacity, StyleSheet } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { useTheme } from "../hooks/useTheme";
import { LanguageSelector } from "./LanguageSelector";

/** Dark mode toggle + language selector for the navigation header. */
export function HeaderActions() {
  const { isDark, colors, toggleTheme } = useTheme();

  const stroke = colors.text;

  return (
    <View style={styles.row}>
      <TouchableOpacity
        onPress={toggleTheme}
        style={[styles.button, { borderColor: colors.border }]}
        accessibilityLabel="Toggle dark mode"
      >
        {isDark ? (
          <Svg viewBox="0 0 24 24" width={16} height={16}>
            <Circle
              cx={12}
              cy={12}
              r={5}
              stroke={stroke}
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Line x1={12} y1={1} x2={12} y2={3} stroke={stroke} strokeWidth={2} strokeLinecap="round" />
            <Line x1={12} y1={21} x2={12} y2={23} stroke={stroke} strokeWidth={2} strokeLinecap="round" />
            <Line x1={4.22} y1={4.22} x2={5.64} y2={5.64} stroke={stroke} strokeWidth={2} strokeLinecap="round" />
            <Line x1={18.36} y1={18.36} x2={19.78} y2={19.78} stroke={stroke} strokeWidth={2} strokeLinecap="round" />
            <Line x1={1} y1={12} x2={3} y2={12} stroke={stroke} strokeWidth={2} strokeLinecap="round" />
            <Line x1={21} y1={12} x2={23} y2={12} stroke={stroke} strokeWidth={2} strokeLinecap="round" />
            <Line x1={4.22} y1={19.78} x2={5.64} y2={18.36} stroke={stroke} strokeWidth={2} strokeLinecap="round" />
            <Line x1={18.36} y1={5.64} x2={19.78} y2={4.22} stroke={stroke} strokeWidth={2} strokeLinecap="round" />
          </Svg>
        ) : (
          <Svg viewBox="0 0 24 24" width={16} height={16}>
            <Path
              d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
              stroke={stroke}
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        )}
      </TouchableOpacity>
      <LanguageSelector />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    marginRight: 8,
  },
  button: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
});
