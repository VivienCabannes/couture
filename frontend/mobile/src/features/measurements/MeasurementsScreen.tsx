import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../hooks/useTheme";
import type { ColorPalette } from "../../theme/colors";
import { ScreenWrapper, PageHeading } from "../../components";
import { BodySilhouette } from "./BodySilhouette";
import { MeasurementFieldRow } from "./MeasurementField";
import { useMeasurements, MEASUREMENT_SECTIONS } from "./useMeasurements";

const SIZES = [
  { value: 34, label: "T34 (XS)" },
  { value: 36, label: "T36 (S)" },
  { value: 38, label: "T38 (M)" },
  { value: 40, label: "T40 (M/L)" },
  { value: 42, label: "T42 (L)" },
  { value: 44, label: "T44 (XL)" },
  { value: 46, label: "T46 (XXL)" },
  { value: 48, label: "T48 (XXXL)" },
];

export function MeasurementsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const {
    values,
    idk,
    activeField,
    size,
    updateField,
    toggleIdk,
    setActiveField,
    applySize,
  } = useMeasurements();

  return (
    <ScreenWrapper>
      <PageHeading>{t("measurements.title")}</PageHeading>

      <BodySilhouette activeField={activeField} />

      {/* Size selector */}
      <View style={styles.sizeRow}>
        {SIZES.map((s) => (
          <SizeChip
            key={s.value}
            label={s.label}
            isActive={size === s.value}
            onPress={() => applySize(s.value)}
            colors={colors}
          />
        ))}
      </View>

      {/* Measurement fields — matching web's 2-column grid with section headers */}
      {MEASUREMENT_SECTIONS.map((section) => (
        <View key={section.sectionKey}>
          <Text
            style={[
              styles.sectionHeader,
              { color: colors.primary, borderBottomColor: colors.cardBorder },
            ]}
          >
            {t(section.sectionKey)}
          </Text>
          {section.fields.map((field) => (
            <MeasurementFieldRow
              key={field}
              field={field}
              value={values[field]}
              isIdk={!!idk[field]}
              onValueChange={updateField}
              onIdkToggle={toggleIdk}
              onFocus={setActiveField}
            />
          ))}
        </View>
      ))}
    </ScreenWrapper>
  );
}

function SizeChip({
  label,
  isActive,
  onPress,
  colors,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
  colors: ColorPalette;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.sizeChip,
        isActive
          ? { backgroundColor: colors.primary, borderColor: colors.primary }
          : { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text
        style={[styles.sizeText, { color: isActive ? "#fff" : colors.text }]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  sizeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  sizeChip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sizeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 16,
    paddingBottom: 4,
    borderBottomWidth: 1,
    marginBottom: 4,
  },
});
