import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../hooks/useTheme";
import type { PieceInfo } from "@shared/types/patterns";

interface Props {
  piece: PieceInfo;
  selected: boolean;
  onToggle: () => void;
  style?: StyleProp<ViewStyle>;
}

export function PatternCard({ piece, selected, onToggle, style }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.7}
      style={[
        styles.card,
        { backgroundColor: colors.card },
        selected && { borderColor: colors.primary, borderWidth: 2 },
        style,
      ]}
    >
      <View style={[
        styles.checkBadge,
        selected
          ? { backgroundColor: colors.primary }
          : { backgroundColor: "transparent", borderWidth: 2, borderColor: colors.primary },
      ]}>
        {selected && <Text style={styles.checkMark}>✓</Text>}
      </View>

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
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    aspectRatio: 3 / 2,
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
});
