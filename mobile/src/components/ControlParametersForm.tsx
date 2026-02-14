import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import type { ControlParameterDefinition } from "../types";

interface Props {
  parameters: ControlParameterDefinition[];
  values: Record<string, number>;
  onChange: (name: string, value: number) => void;
}

export default function ControlParametersForm({ parameters, values, onChange }: Props) {
  if (parameters.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Control Parameters</Text>
      {parameters.map((param) => {
        const val = values[param.name] ?? param.default;
        return (
          <View key={param.name} style={styles.row}>
            <View style={styles.labelRow}>
              <Text style={styles.label} numberOfLines={1}>
                {param.description}
              </Text>
              <Text style={styles.value}>{val.toFixed(2)}</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              value={val}
              onValueChange={(v) => onChange(param.name, v)}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  title: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 },
  row: { marginBottom: 12 },
  labelRow: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 12, color: "#6b7280", flex: 1 },
  value: { fontSize: 12, fontFamily: "Courier", color: "#374151" },
  slider: { width: "100%", height: 30 },
});
