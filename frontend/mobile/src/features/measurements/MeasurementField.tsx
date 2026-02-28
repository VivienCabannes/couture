import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import type { MeasurementField } from "@shared/types";
import { FIELD_LABELS, FIELD_STEPS } from "@shared/data";
import { useTheme } from "../../hooks/useTheme";

interface Props {
  field: MeasurementField;
  value: number;
  isIdk: boolean;
  isActive?: boolean;
  onValueChange: (field: MeasurementField, value: number) => void;
  onIdkToggle: (field: MeasurementField) => void;
  onFocus: (field: MeasurementField) => void;
}

/**
 * Compact single-row measurement field matching the web design:
 * [label] [dashed separator] [input] cm [?]
 */
export function MeasurementFieldRow({
  field,
  value,
  isIdk,
  isActive,
  onValueChange,
  onIdkToggle,
  onFocus,
}: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.row,
        isActive && { backgroundColor: colors.primary + "12" },
      ]}
    >
      <Text
        style={[styles.label, { color: colors.text }]}
        numberOfLines={1}
      >
        {t(FIELD_LABELS[field])}
      </Text>
      <View style={[styles.separator, { borderBottomColor: colors.border }]} />
      <TextInput
        value={isIdk ? "" : String(value)}
        editable={!isIdk}
        onChangeText={(text) => {
          const num = parseFloat(text);
          if (!isNaN(num)) onValueChange(field, num);
        }}
        onFocus={() => onFocus(field)}
        keyboardType="decimal-pad"
        style={[
          styles.input,
          {
            borderColor: colors.border,
            color: isIdk ? colors.textTertiary : colors.text,
            backgroundColor: isIdk ? colors.background : "transparent",
          },
        ]}
      />
      <Text style={[styles.unit, { color: colors.textSecondary }]}>cm</Text>
      <TouchableOpacity
        onPress={() => onIdkToggle(field)}
        style={styles.idkButton}
        accessibilityLabel="I don't know this measurement"
      >
        <View
          style={[
            styles.checkbox,
            {
              borderColor: colors.border,
              backgroundColor: isIdk ? colors.primary : "transparent",
            },
          ]}
        >
          {isIdk && <Text style={styles.checkmark}>{"\u2713"}</Text>}
        </View>
        <Text style={[styles.idkLabel, { color: colors.textSecondary }]}>
          ?
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: 36,
    paddingHorizontal: 8,
    borderRadius: 4,
    gap: 6,
  },
  label: {
    fontSize: 13,
    flexShrink: 0,
  },
  separator: {
    flex: 1,
    minWidth: 12,
    borderBottomWidth: 1,
    borderStyle: "dashed",
    marginBottom: 4,
  },
  input: {
    width: 72,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 13,
    textAlign: "center",
  },
  unit: {
    fontSize: 11,
  },
  idkButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  idkLabel: {
    fontSize: 11,
  },
});
