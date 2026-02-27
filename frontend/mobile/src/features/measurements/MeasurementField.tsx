import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import type { MeasurementField } from "@shared/types";
import { useTheme } from "../../hooks/useTheme";
import { FIELD_LABELS, FIELD_STEPS } from "./useMeasurements";

interface Props {
  field: MeasurementField;
  value: number;
  isIdk: boolean;
  onValueChange: (field: MeasurementField, value: number) => void;
  onIdkToggle: (field: MeasurementField) => void;
  onFocus: (field: MeasurementField) => void;
}

/**
 * A single measurement row matching the web design:
 * label on top, then input + "cm" suffix + "?" toggle on a second row.
 */
export function MeasurementFieldRow({
  field,
  value,
  isIdk,
  onValueChange,
  onIdkToggle,
  onFocus,
}: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {t(FIELD_LABELS[field])}
      </Text>
      <View style={styles.inputRow}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
  },
  unit: {
    fontSize: 13,
  },
  idkButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
