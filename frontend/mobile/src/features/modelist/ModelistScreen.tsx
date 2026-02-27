import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import { SvgXml } from "react-native-svg";
import { useTheme } from "../../hooks/useTheme";
import { ScreenWrapper, PageHeading } from "../../components";
import { fetchGarments } from "@shared/api";
import { usePatternForm } from "@shared/hooks/usePatternForm";
import type { GarmentInfo, PieceInfo } from "@shared/types/patterns";
import type { RootStackParamList } from "../../../App";

export function ModelistScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const route = useRoute<RouteProp<RootStackParamList, "Modelist">>();
  const garmentType = route.params.garmentType;
  const [garment, setGarment] = useState<GarmentInfo | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    fetchGarments().then((garments) => {
      const found = garments.find((g) => g.name === garmentType);
      if (found) setGarment(found);
    });
  }, [garmentType]);

  const activePiece: PieceInfo | null = garment?.pieces[activeIdx] ?? null;

  if (!garment) {
    return (
      <ScreenWrapper>
        <PageHeading>{t("modelist.title")}</PageHeading>
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {t("shop.loading")}
        </Text>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <PageHeading>{t("modelist.title")}</PageHeading>

      {/* Tab bar */}
      <View style={[styles.tabBar, { backgroundColor: colors.background }]}>
        {garment.pieces.map((piece, idx) => (
          <TouchableOpacity
            key={piece.pattern_type}
            onPress={() => setActiveIdx(idx)}
            style={[
              styles.tab,
              {
                backgroundColor:
                  activeIdx === idx ? colors.surface : "transparent",
              },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeIdx === idx ? colors.text : colors.textSecondary,
                },
              ]}
            >
              {piece.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activePiece && <PieceEditor key={activePiece.pattern_type} piece={activePiece} colors={colors} />}
    </ScreenWrapper>
  );
}

function PieceEditor({
  piece,
  colors,
}: {
  piece: PieceInfo;
  colors: import("../../theme/colors").ColorPalette;
}) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const form = usePatternForm({ type: piece.pattern_type });
  const [view, setView] = useState<"construction" | "pattern">("construction");

  const svgContent = form.result
    ? view === "construction"
      ? form.result.construction_svg
      : form.result.pattern_svg
    : null;

  return (
    <>
      {/* SVG Viewport */}
      <View
        style={[
          styles.viewport,
          { backgroundColor: colors.surface, borderColor: colors.cardBorder },
        ]}
      >
        {svgContent ? (
          <SvgXml xml={svgContent} width="100%" height="100%" />
        ) : (
          <Text style={{ color: colors.textTertiary, fontSize: 14 }}>
            {t("modelist.noPreview")}
          </Text>
        )}
      </View>

      {/* View toggle */}
      {form.result && (
        <View style={styles.viewToggle}>
          <TouchableOpacity
            onPress={() => setView("construction")}
            style={[
              styles.toggleBtn,
              {
                backgroundColor:
                  view === "construction" ? colors.primary : colors.background,
              },
            ]}
          >
            <Text
              style={{
                color: view === "construction" ? "#fff" : colors.text,
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              {t("modelist.construction")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setView("pattern")}
            style={[
              styles.toggleBtn,
              {
                backgroundColor:
                  view === "pattern" ? colors.primary : colors.background,
              },
            ]}
          >
            <Text
              style={{
                color: view === "pattern" ? "#fff" : colors.text,
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              {t("modelist.pattern")}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Controls */}
      <PieceControls form={form} colors={colors} />
    </>
  );
}

function PieceControls({
  form,
  colors,
}: {
  form: ReturnType<typeof usePatternForm>;
  colors: import("../../theme/colors").ColorPalette;
}) {
  const { t } = useTranslation();
  const [sizeOpen, setSizeOpen] = useState(true);
  const [stretchOpen, setStretchOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <>
      {/* Size */}
      <CollapsiblePanel
        title={t("modelist.size")}
        open={sizeOpen}
        onToggle={() => setSizeOpen(!sizeOpen)}
        colors={colors}
      >
        <View style={styles.sizeRow}>
          {[34, 36, 38, 40, 42, 44, 46, 48].map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => form.setSelectedSize(s)}
              style={[
                styles.sizeChip,
                {
                  backgroundColor:
                    form.selectedSize === s ? colors.primary : colors.background,
                  borderColor:
                    form.selectedSize === s ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={{
                  color: form.selectedSize === s ? "#fff" : colors.text,
                  fontSize: 13,
                  fontWeight: "600",
                }}
              >
                T{s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </CollapsiblePanel>

      {/* Stretch */}
      {form.patternInfo?.supports_stretch && (
        <CollapsiblePanel
          title={t("modelist.stretch")}
          open={stretchOpen}
          onToggle={() => setStretchOpen(!stretchOpen)}
          colors={colors}
        >
          <ControlRow
            label="Horizontal (%)"
            value={String(form.stretch.horizontal * 100)}
            onChangeText={(v) =>
              form.setStretch({
                ...form.stretch,
                horizontal: (Number(v) || 0) / 100,
              })
            }
            colors={colors}
          />
          <ControlRow
            label="Vertical (%)"
            value={String(form.stretch.vertical * 100)}
            onChangeText={(v) =>
              form.setStretch({
                ...form.stretch,
                vertical: (Number(v) || 0) / 100,
              })
            }
            colors={colors}
          />
        </CollapsiblePanel>
      )}

      {/* Advanced */}
      {form.patternInfo && form.patternInfo.control_parameters.length > 0 && (
        <CollapsiblePanel
          title={t("modelist.advancedControls")}
          open={advancedOpen}
          onToggle={() => setAdvancedOpen(!advancedOpen)}
          colors={colors}
        >
          {form.patternInfo.control_parameters.map((cp) => (
            <ControlRow
              key={cp.name}
              label={cp.name}
              value={String(form.controlParams[cp.name] ?? cp.default)}
              onChangeText={(v) =>
                form.updateControlParam(cp.name, Number(v) || 0)
              }
              colors={colors}
            />
          ))}
        </CollapsiblePanel>
      )}

      {/* Generate button */}
      <TouchableOpacity
        onPress={form.handleGenerate}
        disabled={form.loading}
        style={[
          styles.generateBtn,
          {
            backgroundColor: colors.primary,
            opacity: form.loading ? 0.6 : 1,
          },
        ]}
      >
        <Text style={styles.generateText}>
          {form.loading ? t("modelist.generating") : t("modelist.generate")}
        </Text>
      </TouchableOpacity>

      {form.error && (
        <Text style={{ color: "red", fontSize: 13, marginTop: 8 }}>
          {form.error}
        </Text>
      )}
    </>
  );
}

function CollapsiblePanel({
  title,
  open,
  onToggle,
  colors,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  colors: import("../../theme/colors").ColorPalette;
  children: React.ReactNode;
}) {
  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: colors.surface, borderColor: colors.cardBorder },
      ]}
    >
      <TouchableOpacity onPress={onToggle} style={styles.panelHeader}>
        <Text style={[styles.panelArrow, { color: colors.text }]}>
          {open ? "\u25BE" : "\u25B8"}
        </Text>
        <Text style={[styles.panelTitle, { color: colors.text }]}>
          {title}
        </Text>
      </TouchableOpacity>
      {open && <View style={styles.panelBody}>{children}</View>}
    </View>
  );
}

function ControlRow({
  label,
  value,
  onChangeText,
  colors,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  colors: import("../../theme/colors").ColorPalette;
}) {
  return (
    <View style={styles.controlRow}>
      <Text style={[styles.controlLabel, { color: colors.text }]}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="decimal-pad"
        style={[
          styles.controlInput,
          { borderColor: colors.border, color: colors.text },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  message: {
    textAlign: "center",
    paddingVertical: 48,
    fontSize: 14,
  },
  tabBar: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 4,
    gap: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  viewport: {
    aspectRatio: 4 / 3,
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    overflow: "hidden",
  },
  viewToggle: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  toggleBtn: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  panel: {
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 8,
    overflow: "hidden",
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    paddingHorizontal: 16,
  },
  panelArrow: {
    fontSize: 14,
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  panelBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sizeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sizeChip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  controlLabel: {
    flex: 1,
    fontSize: 13,
  },
  controlInput: {
    width: 72,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    textAlign: "right",
    fontSize: 13,
  },
  generateBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  generateText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
