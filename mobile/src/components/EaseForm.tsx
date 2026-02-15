import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import type { EaseInput } from "@shared/types";

interface Props {
  value: EaseInput;
  onChange: (ease: EaseInput) => void;
}

const fields: { key: keyof EaseInput; label: string }[] = [
  { key: "bustEase", label: "Bust ease" },
  { key: "waistEase", label: "Waist ease" },
  { key: "hipEase", label: "Hip ease" },
];

export default function EaseForm({ value, onChange }: Props) {
  return (
    <View>
      {fields.map((field) => (
        <View key={field.key} style={styles.row}>
          <Text style={styles.label}>{field.label}</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={value[field.key]?.toString() ?? "0"}
            onChangeText={(text) =>
              onChange({ ...value, [field.key]: parseFloat(text) || 0 })
            }
          />
          <Text style={styles.unit}>cm</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  label: { flex: 1, fontSize: 12, color: "#6b7280", marginRight: 8 },
  input: {
    width: 80,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    textAlign: "right",
  },
  unit: { fontSize: 12, color: "#6b7280", marginLeft: 6, width: 20 },
});
