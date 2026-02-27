import { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "../../hooks/useTheme";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { ScreenWrapper, PageHeading } from "../../components";
import { PatternCard } from "./PatternCard";
import { fetchPieces } from "@shared/api";
import { useSelectionsStore } from "../../stores";
import type { PieceInfo } from "@shared/types/patterns";
import type { RootStackParamList } from "../../../App";

export function ShopScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isWide, screenWidth } = useResponsiveLayout();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [pieces, setPieces] = useState<PieceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selections, loaded: selectionsLoaded, fetch: fetchSelections, addGarment, removeGarment } =
    useSelectionsStore();
  const [showWarning, setShowWarning] = useState(false);
  const warningTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    fetchPieces()
      .then(setPieces)
      .catch(() => setError(t("shop.error")))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    if (!selectionsLoaded) fetchSelections();
  }, [selectionsLoaded, fetchSelections]);

  const isSelected = (patternType: string) =>
    selections.some((s) => s.garment_name === patternType);

  const activeCount = pieces.filter((p) => isSelected(p.pattern_type)).length;

  const handleGoPress = () => {
    if (activeCount > 0) {
      navigation.navigate("Modelist");
    } else {
      setShowWarning(true);
      clearTimeout(warningTimer.current);
      warningTimer.current = setTimeout(() => setShowWarning(false), 2000);
    }
  };

  const handleToggle = async (piece: PieceInfo) => {
    if (isSelected(piece.pattern_type)) {
      await removeGarment(piece.pattern_type);
    } else {
      await addGarment(piece.pattern_type);
    }
  };

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.header}>
        <PageHeading>{t("shop.title")}</PageHeading>
      </View>

      {loading && (
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {t("shop.loading")}
        </Text>
      )}

      {error && <Text style={[styles.message, { color: "red" }]}>{error}</Text>}

      {!loading && !error && (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {pieces.map((item) => (
              <PatternCard
                key={item.pattern_type}
                piece={item}
                selected={isSelected(item.pattern_type)}
                onToggle={() => handleToggle(item)}
                style={{ width: screenWidth >= 1024 ? "31%" : "48%" }}
              />
            ))}
          </View>
        </ScrollView>
      )}

      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        {showWarning && (
          <Text style={[styles.warningText, { color: colors.textSecondary }]}>
            {t("shop.selectFirst")}
          </Text>
        )}
        <View style={isWide ? styles.bottomBarWide : undefined}>
          <TouchableOpacity
            onPress={handleGoPress}
            style={[
              styles.goButton,
              { backgroundColor: activeCount > 0 ? colors.primary : colors.border },
            ]}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.goButtonText,
              activeCount === 0 && { color: colors.textSecondary },
            ]}>
              {t("shop.goToModelist")}{activeCount > 0 && ` (${activeCount})`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  message: {
    textAlign: "center",
    paddingVertical: 48,
    fontSize: 14,
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 20,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  warningText: {
    textAlign: "center",
    fontSize: 13,
    marginBottom: 8,
  },
  bottomBarWide: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  goButton: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  goButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
