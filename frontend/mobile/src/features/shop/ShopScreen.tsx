import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "../../hooks/useTheme";
import { ScreenWrapper, PageHeading } from "../../components";
import { PatternCard } from "./PatternCard";
import { fetchGarments } from "@shared/api";
import type { GarmentInfo } from "@shared/types/patterns";
import type { RootStackParamList } from "../../../App";

export function ShopScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [garments, setGarments] = useState<GarmentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGarments()
      .then(setGarments)
      .catch(() => setError(t("shop.error")))
      .finally(() => setLoading(false));
  }, [t]);

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
          data={garments}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <PatternCard
              garment={item}
              onPress={() => navigation.navigate("Modelist", { garmentType: item.name })}
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
