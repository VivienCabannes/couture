import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useTranslation } from "react-i18next";
import Svg, {
  Path,
  Line,
  Polygon,
  Text as SvgText,
} from "react-native-svg";
import { useTheme } from "../../hooks/useTheme";
import { ScreenWrapper, PageHeading } from "../../components";

export function ModelistScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <ScreenWrapper>
      <PageHeading>{t("modelist.title")}</PageHeading>

      {/* SVG Viewport */}
      <View
        style={[
          styles.viewport,
          { backgroundColor: colors.surface, borderColor: colors.cardBorder },
        ]}
      >
        <Svg viewBox="0 0 300 400" width="100%" height="100%">
          <Path
            d="M50 20 Q80 10 100 15 L110 15 Q140 10 160 25 L170 80 Q165 120 175 160 L180 200 Q150 210 100 210 Q60 210 40 200 L50 160 Q45 120 50 80 Z"
            fill="none"
            stroke={colors.primary}
            strokeWidth={1.5}
          />
          <Path
            d="M100 210 L95 150 L105 150 Z"
            fill="none"
            stroke={colors.primary}
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          <Line
            x1={110}
            y1={40}
            x2={110}
            y2={190}
            stroke={colors.primary}
            strokeWidth={1.5}
            strokeDasharray="8 4"
          />
          <Polygon
            points="110,35 107,42 113,42"
            fill="none"
            stroke={colors.primary}
            strokeWidth={1.5}
          />
          <Polygon
            points="110,195 107,188 113,188"
            fill="none"
            stroke={colors.primary}
            strokeWidth={1.5}
          />
          <SvgText
            x={110}
            y={120}
            textAnchor="middle"
            fontSize={10}
            fill={colors.textSecondary}
          >
            {t("modelist.frontBodice")}
          </SvgText>
        </Svg>
      </View>

      {/* Control panels */}
      <CollapsiblePanel
        title={t("modelist.adjustments")}
        defaultOpen
        colors={colors}
      >
        <ControlRow
          label={t("modelist.ease")}
          defaultValue={4}
          colors={colors}
        />
        <ControlRow
          label={t("modelist.seamAllowance")}
          defaultValue={1}
          colors={colors}
        />
        <ControlRow
          label={t("modelist.hemAllowance")}
          defaultValue={2}
          colors={colors}
        />
      </CollapsiblePanel>

      <CollapsiblePanel
        title={t("modelist.dartControls")}
        colors={colors}
      >
        <ControlRow
          label={t("modelist.dartAngle")}
          defaultValue={12}
          colors={colors}
        />
        <ControlRow
          label={t("modelist.dartLength")}
          defaultValue={8}
          colors={colors}
        />
      </CollapsiblePanel>

      <CollapsiblePanel
        title={t("modelist.aiAssistant")}
        colors={colors}
      >
        <Text style={[styles.aiDesc, { color: colors.textSecondary }]}>
          {t("modelist.aiDescription")}
        </Text>
        <View style={styles.aiRow}>
          <TextInput
            placeholder={t("modelist.aiPlaceholder")}
            placeholderTextColor={colors.textTertiary}
            style={[
              styles.aiInput,
              { borderColor: colors.border, color: colors.text },
            ]}
          />
          <TouchableOpacity
            style={[styles.applyBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.applyText}>{t("modelist.apply")}</Text>
          </TouchableOpacity>
        </View>
      </CollapsiblePanel>
    </ScreenWrapper>
  );
}

function CollapsiblePanel({
  title,
  defaultOpen = false,
  colors,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  colors: import("../../theme/colors").ColorPalette;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: colors.surface, borderColor: colors.cardBorder },
      ]}
    >
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        style={styles.panelHeader}
      >
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
  defaultValue,
  colors,
}: {
  label: string;
  defaultValue: number;
  colors: import("../../theme/colors").ColorPalette;
}) {
  const [value, setValue] = useState(String(defaultValue));

  return (
    <View style={styles.controlRow}>
      <Text style={[styles.controlLabel, { color: colors.text }]}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={setValue}
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
  viewport: {
    aspectRatio: 300 / 400,
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
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
  aiDesc: {
    fontSize: 13,
    marginBottom: 12,
  },
  aiRow: {
    flexDirection: "row",
    gap: 8,
  },
  aiInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  applyBtn: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    justifyContent: "center",
  },
  applyText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});
