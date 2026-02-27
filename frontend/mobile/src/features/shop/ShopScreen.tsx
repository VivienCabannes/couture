import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "../../hooks/useTheme";
import { ScreenWrapper, PageHeading } from "../../components";
import { PatternCard } from "./PatternCard";
import { fetchPieces } from "@shared/api";
import { useSelectionsStore } from "../../stores";
import type { PieceInfo } from "@shared/types/patterns";
import type { RootStackParamList } from "../../../App";

export function ShopScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [pieces, setPieces] = useState<PieceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selections, loaded: selectionsLoaded, fetch: fetchSelections, addGarment, removeGarment } =
    useSelectionsStore();

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

  const handleToggle = async (piece: PieceInfo) => {
    if (isSelected(piece.pattern_type)) {
      await removeGarment(piece.pattern_type);
    } else {
      await addGarment(piece.pattern_type);
      navigation.navigate("Modelist");
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
        <FlatList
          data={pieces}
          keyExtractor={(item) => item.pattern_type}
          renderItem={({ item }) => (
            <PatternCard
              piece={item}
              selected={isSelected(item.pattern_type)}
              onToggle={() => handleToggle(item)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingBottom: 32,
  },
});
