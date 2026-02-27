import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../hooks/useTheme";
import type { PatternDef } from "./patternData";

interface Props {
  pattern: PatternDef;
}

/** Renders a single pattern card matching the web's design: gray image area + badge. */
export function PatternCard({ pattern }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const badgeColors = {
    beginner: { bg: colors.badgeBeginner, text: colors.badgeBeginnerText },
    intermediate: {
      bg: colors.badgeIntermediate,
      text: colors.badgeIntermediateText,
    },
    advanced: { bg: colors.badgeAdvanced, text: colors.badgeAdvancedText },
  };
  const badge = badgeColors[pattern.difficulty];

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      {/* Gray placeholder image area — matches web's 180px gray block */}
      <View
        style={[
          styles.illustration,
          { backgroundColor: colors.illustrationBg },
        ]}
      >
        <Text style={{ color: colors.illustrationText, fontSize: 13 }}>
          {t("shop.patternIllustration")}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.name, { color: colors.text }]}>
          {t(pattern.nameKey)}
        </Text>
        <Text style={[styles.desc, { color: colors.textSecondary }]}>
          {t(pattern.descKey)}
        </Text>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.text }]}>
            {t(pattern.difficultyKey)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  illustration: {
    height: 140,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
