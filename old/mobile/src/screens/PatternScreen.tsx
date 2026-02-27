import React, { useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { downloadAndSharePdf } from "../api/patterns";
import { usePatternForm } from "@shared/hooks/usePatternForm";
import CollapsibleSection from "../components/CollapsibleSection";
import SizeSelector from "../components/SizeSelector";
import MeasurementForm from "../components/MeasurementForm";
import EaseForm from "../components/EaseForm";
import SeamAllowanceForm from "../components/SeamAllowanceForm";
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
  const form = usePatternForm({
    type,
    onError: (msg) => Alert.alert("Error", msg),
  });

  const handleDownloadPdf = useCallback(async () => {
    try {
      await downloadAndSharePdf(form.buildRequest("pdf"));
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Download failed");
    }
  }, [form.buildRequest]);

  if (!form.patternInfo) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Size */}
      <CollapsibleSection title="Size">
        <SizeSelector value={form.selectedSize} onChange={form.setSelectedSize} />
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Show custom measurements</Text>
          <Switch
            value={form.showAdvancedMeasurements}
            onValueChange={form.setShowAdvancedMeasurements}
          />
        </View>
        {form.showAdvancedMeasurements && (
          <MeasurementForm
            fields={form.patternInfo.required_measurements}
            values={form.measurements}
            onChange={form.updateMeasurement}
          />
        )}
      </CollapsibleSection>

      {/* Ease */}
      <CollapsibleSection title="Ease">
        <EaseForm value={form.ease} onChange={form.setEase} />
      </CollapsibleSection>

      {/* Seam Allowance */}
      <CollapsibleSection title="Seam Allowance">
        <SeamAllowanceForm value={form.seamAllowance} onChange={form.setSeamAllowance} />
      </CollapsibleSection>

      {/* Transformations */}
      {form.patternInfo.supports_stretch && (
        <CollapsibleSection title="Transformations">
          <StretchForm value={form.stretch} onChange={form.setStretch} />
        </CollapsibleSection>
      )}

      {/* Advanced Controls */}
      {form.patternInfo.control_parameters.length > 0 && (
        <CollapsibleSection title="Advanced Controls">
          <ControlParametersForm
            parameters={form.patternInfo.control_parameters}
            values={form.controlParams}
            onChange={form.updateControlParam}
          />
        </CollapsibleSection>
      )}

      {/* Generate */}
      <TouchableOpacity
        style={[styles.button, form.loading && styles.buttonDisabled]}
        onPress={form.handleGenerate}
        disabled={form.loading}
      >
        {form.loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Generate Pattern</Text>
        )}
      </TouchableOpacity>

      {form.result && (
        <>
          <PatternPreview
            constructionSvg={form.result.construction_svg}
            patternSvg={form.result.pattern_svg}
          />

          <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadPdf}>
            <Text style={styles.downloadButtonText}>Download & Share PDF</Text>
          </TouchableOpacity>

          {form.result.warnings.length > 0 && (
            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>Warnings</Text>
              {form.result.warnings.map((w: string, i: number) => (
                <Text key={i} style={styles.warningText}>
                  {"\u2022"} {w}
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
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  toggleLabel: { fontSize: 13, color: "#374151" },
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
