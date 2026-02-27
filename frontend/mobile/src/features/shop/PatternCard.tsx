import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../hooks/useTheme";
import type { GarmentInfo } from "@shared/types/patterns";

interface Props {
  garment: GarmentInfo;
  onPress: () => void;
}

export function PatternCard({ garment, onPress }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.card }]}
      activeOpacity={0.7}
    >
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
          {garment.label}
        </Text>
        <Text style={[styles.desc, { color: colors.textSecondary }]}>
          {t("shop.pieces", { count: garment.pieces.length })}
        </Text>
      </View>
    </TouchableOpacity>
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
  },
});
