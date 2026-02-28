import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import Svg, { Circle, Path } from "react-native-svg";
import { useTheme } from "../../hooks/useTheme";
import { ScreenWrapper } from "../../components";

export function SewingScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const iconColor = colors.textTertiary;

  return (
    <ScreenWrapper>
      <View
        style={[styles.placeholder, { borderColor: colors.border }]}
      >
        <Svg
          viewBox="0 0 24 24"
          width={48}
          height={48}
        >
          <Circle
            cx={6}
            cy={6}
            r={3}
            stroke={iconColor}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <Path
            d="M8.12 8.12L12 12"
            stroke={iconColor}
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M20 4L8.12 15.88"
            stroke={iconColor}
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
          />
          <Circle
            cx={6}
            cy={18}
            r={3}
            stroke={iconColor}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <Path
            d="M14.8 14.8L20 20"
            stroke={iconColor}
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>

        <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
          {t("sewing.placeholder")}
        </Text>

        <View style={[styles.badge, { backgroundColor: colors.warningBg }]}>
          <Text style={[styles.badgeText, { color: colors.warningText }]}>
            {t("sewing.underDevelopment")}
          </Text>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    minHeight: 250,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 40,
  },
  placeholderText: {
    fontSize: 14,
    textAlign: "center",
  },
  badge: {
    marginTop: 16,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
