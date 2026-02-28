import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../hooks/useTheme";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import type { ColorPalette } from "../../theme/colors";
import { ScreenWrapper } from "../../components";
import { BodySilhouette } from "./BodySilhouette";
import { MeasurementFieldRow } from "./MeasurementField";
import { MEASUREMENT_SECTIONS } from "@shared/data";
import { useMeasurementsStore } from "../../stores";
import type { MeasurementField } from "@shared/types";

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
  const { isWide } = useResponsiveLayout();
  const {
    values,
    idk,
    size,
    preset,
    loaded,
    updateField,
    toggleIdk,
    applySize,
    applyPreset,
    fetch,
  } = useMeasurementsStore();
  const [activeField, setActiveField] = useState<MeasurementField | null>(null);

  useEffect(() => {
    if (!loaded) fetch();
  }, [loaded, fetch]);

  const allFields = MEASUREMENT_SECTIONS.flatMap((s) => s.fields);

  const countryChips = (
    <View style={styles.chipRow}>
      <SizeChip
        label={t("measurements.france")}
        isActive={true}
        onPress={() => {}}
        colors={colors}
      />
      <SizeChip
        label={t("measurements.unitedStates")}
        isActive={false}
        onPress={() => {}}
        colors={colors}
      />
      <SizeChip
        label={t("measurements.unitedKingdom")}
        isActive={false}
        onPress={() => {}}
        colors={colors}
      />
    </View>
  );

  const sizeChips = (
    <View style={styles.chipRow}>
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
  );

  const presetChips = (
    <View style={styles.chipRow}>
      <SizeChip
        label={t("measurements.presetNone")}
        isActive={preset === null}
        onPress={() => applySize(size)}
        colors={colors}
      />
      <SizeChip
        label={t("measurements.presetKwama")}
        isActive={preset === "kwama"}
        onPress={() => applyPreset("kwama")}
        colors={colors}
      />
      <SizeChip
        label={t("measurements.presetVivien")}
        isActive={preset === "vivien"}
        onPress={() => applyPreset("vivien")}
        colors={colors}
      />
    </View>
  );

  const fieldList = allFields.map((field) => (
    <MeasurementFieldRow
      key={field}
      field={field}
      value={values[field]}
      isIdk={!!idk[field]}
      isActive={activeField === field}
      onValueChange={updateField}
      onIdkToggle={toggleIdk}
      onFocus={setActiveField}
    />
  ));

  if (isWide) {
    return (
      <ScreenWrapper>
        {countryChips}
        {sizeChips}
        {presetChips}
        <View style={styles.wideRow}>
          <View style={styles.wideLeft}>
            <BodySilhouette
              values={values}
              activeField={activeField}
              onFieldSelect={setActiveField}
              style={styles.silhouetteWide}
            />
          </View>
          <View style={styles.wideRight}>
            {fieldList}
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {countryChips}
      {sizeChips}
      {presetChips}
      <BodySilhouette
        values={values}
        activeField={activeField}
        onFieldSelect={setActiveField}
      />
      {fieldList}
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
  wideRow: {
    flexDirection: "row",
    gap: 32,
  },
  wideLeft: {
    flex: 45,
  },
  wideRight: {
    flex: 55,
  },
  silhouetteWide: {
    maxWidth: 400,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
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
});
