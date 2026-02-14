import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { fetchPatternTypes, generatePattern, downloadAndSharePdf } from "../api/patterns";
import { fetchDefaultMeasurements } from "../api/measurements";
import type { PatternTypeInfo, PatternResponse, StretchInput } from "../types";
import MeasurementForm from "../components/MeasurementForm";
import ControlParametersForm from "../components/ControlParametersForm";
import StretchForm from "../components/StretchForm";
import PatternPreview from "../components/PatternPreview";

type RootStackParamList = {
  Home: undefined;
  Pattern: { type: string };
};

type Props = NativeStackScreenProps<RootStackParamList, "Pattern">;

export default function PatternScreen({ route }: Props) {
  const { type } = route.params;
  const [patternInfo, setPatternInfo] = useState<PatternTypeInfo | null>(null);
  const [measurements, setMeasurements] = useState<Record<string, number>>({});
  const [controlParams, setControlParams] = useState<Record<string, number>>({});
  const [stretch, setStretch] = useState<StretchInput>({ horizontal: 0, vertical: 0, usage: 1 });
  const [result, setResult] = useState<PatternResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPatternTypes().then((types) => {
      const info = types.find((t) => t.name === type);
      if (info) {
        setPatternInfo(info);
        const defaults: Record<string, number> = {};
        info.control_parameters.forEach((p) => {
          defaults[p.name] = p.default;
        });
        setControlParams(defaults);
      }
    });
  }, [type]);

  // Load defaults for corset
  useEffect(() => {
    if (patternInfo?.name === "corset") {
      fetchDefaultMeasurements(38).then((m) => {
        setMeasurements(m as unknown as Record<string, number>);
      });
    }
  }, [patternInfo]);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await generatePattern({
        pattern_type: type,
        measurements,
        control_parameters: Object.keys(controlParams).length > 0 ? controlParams : undefined,
        stretch: stretch.horizontal > 0 || stretch.vertical > 0 ? stretch : undefined,
        output_format: "all",
      });
      setResult(resp);
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }, [type, measurements, controlParams, stretch]);

  const handleDownloadPdf = useCallback(async () => {
    try {
      await downloadAndSharePdf({
        pattern_type: type,
        measurements,
        control_parameters: Object.keys(controlParams).length > 0 ? controlParams : undefined,
        stretch: stretch.horizontal > 0 || stretch.vertical > 0 ? stretch : undefined,
        output_format: "pdf",
      });
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Download failed");
    }
  }, [type, measurements, controlParams, stretch]);

  if (!patternInfo) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <MeasurementForm
        fields={patternInfo.required_measurements}
        values={measurements}
        onChange={(name, value) =>
          setMeasurements((prev) => ({ ...prev, [name]: value }))
        }
      />

      <ControlParametersForm
        parameters={patternInfo.control_parameters}
        values={controlParams}
        onChange={(name, value) =>
          setControlParams((prev) => ({ ...prev, [name]: value }))
        }
      />

      {patternInfo.supports_stretch && (
        <StretchForm value={stretch} onChange={setStretch} />
      )}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleGenerate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Generate Pattern</Text>
        )}
      </TouchableOpacity>

      {result && (
        <>
          <PatternPreview
            constructionSvg={result.construction_svg}
            patternSvg={result.pattern_svg}
          />

          <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadPdf}>
            <Text style={styles.downloadButtonText}>Download & Share PDF</Text>
          </TouchableOpacity>

          {result.warnings.length > 0 && (
            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>Warnings</Text>
              {result.warnings.map((w, i) => (
                <Text key={i} style={styles.warningText}>
                  • {w}
                </Text>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  content: { padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#ffffff", fontWeight: "600", fontSize: 16 },
  downloadButton: {
    backgroundColor: "#1f2937",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  downloadButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "600" },
  warningBox: {
    backgroundColor: "#fefce8",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  warningTitle: { fontSize: 14, fontWeight: "600", color: "#92400e", marginBottom: 4 },
  warningText: { fontSize: 13, color: "#a16207" },
});
