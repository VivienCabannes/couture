import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { fetchSizes } from "@shared/api/measurements";

interface Props {
  value: number | null;
  onChange: (size: number | null) => void;
}

export default function SizeSelector({ value, onChange }: Props) {
  const [sizes, setSizes] = useState<number[]>([]);

  useEffect(() => {
    fetchSizes().then(setSizes);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Standard Size</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={value ?? "custom"}
          onValueChange={(v) => onChange(v === "custom" ? null : Number(v))}
        >
          <Picker.Item label="Custom measurements" value="custom" />
          {sizes.map((s) => (
            <Picker.Item key={s} label={`T${s}`} value={s} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 4 },
  pickerWrapper: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 6 },
});
