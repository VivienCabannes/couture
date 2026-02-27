import { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, FlatList, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../hooks/useTheme";
import { ScreenWrapper, PageHeading } from "../../components";
import { PatternCard } from "./PatternCard";
import { PATTERNS } from "./patternData";

const FILTERS = ["filterAll", "filterTops", "filterDresses", "filterSkirts"];

export function ShopScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [activeFilter, setActiveFilter] = useState("filterAll");
  const [search, setSearch] = useState("");

  const filtered = PATTERNS.filter((p) =>
    t(p.nameKey).toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.header}>
        <PageHeading>{t("shop.title")}</PageHeading>

        <TextInput
          placeholder={t("shop.searchPlaceholder")}
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
          style={[
            styles.searchInput,
            {
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
        />

        <View style={styles.filters}>
          {FILTERS.map((key) => {
            const isActive = activeFilter === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setActiveFilter(key)}
                style={[
                  styles.filterChip,
                  isActive
                    ? { backgroundColor: colors.primary, borderColor: colors.primary }
                    : { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: isActive ? "#fff" : colors.text },
                  ]}
                >
                  {t(`shop.${key}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.nameKey}
        renderItem={({ item }) => <PatternCard pattern={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  filters: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
});
