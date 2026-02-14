import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { fetchPatternTypes } from "../api/patterns";
import type { PatternTypeInfo } from "../types";

type RootStackParamList = {
  Home: undefined;
  Pattern: { type: string };
};

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const [types, setTypes] = useState<PatternTypeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTypes = () => {
    setLoading(true);
    setError(null);
    fetchPatternTypes()
      .then(setTypes)
      .catch((err) => setError(err.message || "Failed to load patterns"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTypes();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadTypes}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={types}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("Pattern", { type: item.name })}
          >
            <Text style={styles.cardTitle}>{item.label}</Text>
            <Text style={styles.cardSub}>
              {item.required_measurements.length} measurements
              {item.supports_stretch ? " · stretch support" : ""}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 16 },
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#111827", marginBottom: 4 },
  cardSub: { fontSize: 14, color: "#6b7280" },
  errorText: { fontSize: 16, color: "#dc2626", marginBottom: 16, textAlign: "center", paddingHorizontal: 24 },
  retryButton: { backgroundColor: "#111827", borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24 },
  retryText: { color: "#ffffff", fontSize: 16, fontWeight: "600" },
});
