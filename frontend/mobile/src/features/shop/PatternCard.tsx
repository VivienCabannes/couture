import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../hooks/useTheme";
import type { PieceInfo } from "@shared/types/patterns";

interface Props {
  piece: PieceInfo;
  selected: boolean;
  onToggle: () => void;
}

export function PatternCard({ piece, selected, onToggle }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card },
        selected && { borderColor: colors.primary, borderWidth: 2 },
      ]}
    >
      {selected && (
        <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
      )}

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
          {t(`patterns.${piece.pattern_type}`)}
        </Text>
        <TouchableOpacity
          onPress={onToggle}
          style={[
            styles.toggleBtn,
            {
              backgroundColor: selected ? "#FEF2F2" : colors.primary,
            },
          ]}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.toggleText,
              { color: selected ? "#DC2626" : "#fff" },
            ]}
          >
            {selected ? t("shop.remove") : t("shop.add")}
          </Text>
        </TouchableOpacity>
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
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkMark: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
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
    marginBottom: 12,
  },
  toggleBtn: {
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  toggleText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
