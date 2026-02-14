import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import type { StretchInput } from "../types";

interface Props {
  value: StretchInput;
  onChange: (stretch: StretchInput) => void;
}

export default function StretchForm({ value, onChange }: Props) {
  const update = (field: keyof StretchInput, v: number) => {
    onChange({ ...value, [field]: v });
  };

  const items: { key: keyof StretchInput; label: string; max: number }[] = [
    { key: "horizontal", label: "Horizontal stretch", max: 0.5 },
    { key: "vertical", label: "Vertical stretch", max: 0.5 },
    { key: "usage", label: "Usage", max: 1.0 },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stretch Settings</Text>
      {items.map((item) => (
        <View key={item.key} style={styles.row}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.value}>
              {(value[item.key] * 100).toFixed(0)}%
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={item.max}
            step={0.01}
            value={value[item.key]}
            onValueChange={(v) => update(item.key, v)}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  title: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 },
  row: { marginBottom: 12 },
  labelRow: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 12, color: "#6b7280" },
  value: { fontSize: 12, fontFamily: "Courier", color: "#374151" },
  slider: { width: "100%", height: 30 },
});
