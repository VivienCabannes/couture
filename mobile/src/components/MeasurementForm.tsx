import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import type { MeasurementFieldDefinition } from "../types";

interface Props {
  fields: MeasurementFieldDefinition[];
  values: Record<string, number>;
  onChange: (name: string, value: number) => void;
}

export default function MeasurementForm({ fields, values, onChange }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Measurements (cm)</Text>
      {fields.map((field) => (
        <View key={field.name} style={styles.row}>
          <Text style={styles.label} numberOfLines={1}>
            {field.description}
          </Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={values[field.name]?.toString() ?? ""}
            onChangeText={(text) => onChange(field.name, parseFloat(text) || 0)}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  title: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 },
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
});
