import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

interface Props {
  value: number;
  onChange: (value: number) => void;
}

export default function SeamAllowanceForm({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>Seam allowance</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={value.toString()}
        onChangeText={(text) => onChange(parseFloat(text) || 0)}
      />
      <Text style={styles.unit}>cm</Text>
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
