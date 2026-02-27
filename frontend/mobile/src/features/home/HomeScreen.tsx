import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { ScreenWrapper, PageHeading } from "../../components";
import { useTheme } from "../../hooks/useTheme";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { NavigationCard } from "./NavigationCard";
import { CARDS, MAIN_CARDS, SIDE_CARDS } from "./cardData";

export function HomeScreen() {
  const { t } = useTranslation();
  const { isWide } = useResponsiveLayout();
  const { colors } = useTheme();

  return (
    <ScreenWrapper>
      <PageHeading>{t("home.welcome")}</PageHeading>
      {isWide ? (
        <View style={styles.wideContainer}>
          <View style={styles.mainColumn}>
            <View style={styles.mainRow}>
              <NavigationCard style={styles.mainCard} {...MAIN_CARDS[0]!} />
              <NavigationCard style={styles.mainCard} {...MAIN_CARDS[1]!} />
            </View>
            <View style={styles.mainRow}>
              <NavigationCard style={styles.mainCard} {...MAIN_CARDS[2]!} />
              <NavigationCard style={styles.mainCard} {...MAIN_CARDS[3]!} />
            </View>
          </View>
          <View
            style={[
              styles.divider,
              { backgroundColor: colors.cardBorder },
            ]}
          />
          <View style={styles.sideColumn}>
            <NavigationCard style={styles.sideCard} {...SIDE_CARDS[0]!} />
            <NavigationCard style={styles.sideCard} {...SIDE_CARDS[1]!} />
          </View>
        </View>
      ) : (
        CARDS.map((card) => (
          <NavigationCard
            key={card.screen}
            style={styles.narrowCard}
            {...card}
          />
        ))
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  narrowCard: {
    marginBottom: 12,
  },
  wideContainer: {
    flexDirection: "row",
    gap: 24,
  },
  mainColumn: {
    flex: 2,
    gap: 16,
  },
  mainRow: {
    flexDirection: "row",
    gap: 16,
  },
  mainCard: {
    flex: 1,
  },
  divider: {
    width: 2,
    borderRadius: 999,
  },
  sideColumn: {
    flex: 1,
    gap: 16,
  },
  sideCard: {
    flex: 1,
  },
});
