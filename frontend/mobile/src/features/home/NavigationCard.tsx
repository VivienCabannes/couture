import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import type { ViewStyle } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import Svg, { Path, Line, Circle } from "react-native-svg";
import { useTheme } from "../../hooks/useTheme";
import type { RootStackParamList } from "../../../App";

interface Props {
  screen: string;
  labelKey: string;
  subtitleKey: string;
  style?: ViewStyle;
}

/** Card icon SVG elements, mirroring the web's cardData icon strings. */
function CardIcon({ screen, color }: { screen: string; color: string }) {
  const props = {
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };

  return (
    <Svg viewBox="0 0 24 24" width={28} height={28}>
      {screen === "Designer" && (
        <>
          <Path d="M12 19l7-7 3 3-7 7-3-3z" {...props} />
          <Path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" {...props} />
          <Path d="M2 2l7.586 7.586" {...props} />
          <Circle cx={11} cy={11} r={2} {...props} />
        </>
      )}
      {screen === "Shop" && (
        <>
          <Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" {...props} />
          <Line x1={3} y1={6} x2={21} y2={6} {...props} />
          <Path d="M16 10a4 4 0 01-8 0" {...props} />
        </>
      )}
      {screen === "Modelist" && (
        <>
          <Path d="M4 20L20 20L4 4Z" {...props} />
          <Line x1={4} y1={12} x2={12} y2={20} {...props} />
          <Line x1={4} y1={16} x2={8} y2={20} {...props} />
          <Line x1={4} y1={8} x2={16} y2={20} {...props} />
        </>
      )}
      {screen === "Sewing" && (
        <>
          <Circle cx={6} cy={6} r={3} {...props} />
          <Path d="M8.12 8.12L12 12" {...props} />
          <Path d="M20 4L8.12 15.88" {...props} />
          <Circle cx={6} cy={18} r={3} {...props} />
          <Path d="M14.8 14.8L20 20" {...props} />
        </>
      )}
      {screen === "Measurements" && (
        <>
          <Path
            d="M21.3 15.3a2.4 2.4 0 010 3.4l-2.6 2.6a2.4 2.4 0 01-3.4 0L2.7 8.7a2.4 2.4 0 010-3.4l2.6-2.6a2.4 2.4 0 013.4 0z"
            {...props}
          />
          <Line x1={7} y1={7} x2={10} y2={7} {...props} />
          <Line x1={9} y1={9} x2={12} y2={9} {...props} />
          <Line x1={11} y1={11} x2={14} y2={11} {...props} />
          <Line x1={13} y1={13} x2={16} y2={13} {...props} />
          <Line x1={15} y1={15} x2={18} y2={15} {...props} />
        </>
      )}
      {screen === "Help" && (
        <>
          <Circle cx={12} cy={12} r={10} {...props} />
          <Path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" {...props} />
          <Line x1={12} y1={17} x2={12.01} y2={17} {...props} />
        </>
      )}
    </Svg>
  );
}

export function NavigationCard({ screen, labelKey, subtitleKey, style }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }, style]}
      activeOpacity={0.7}
      onPress={() => {
        // Modelist requires garmentType param; route through Shop instead
        const target = screen === "Modelist" ? "Shop" : screen;
        (navigation.navigate as (screen: string) => void)(target);
      }}
    >
      <View style={[styles.iconBox, { backgroundColor: colors.primaryBg }]}>
        <CardIcon screen={screen} color={colors.primary} />
      </View>
      <Text style={[styles.label, { color: colors.text }]}>
        {t(`home.${labelKey}`)}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {t(`home.${subtitleKey}`)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
});
