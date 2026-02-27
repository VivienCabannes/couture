import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  Modal,
  Pressable,
} from "react-native";
import { useTranslation } from "react-i18next";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "../../hooks/useTheme";
import { ScreenWrapper, PageHeading } from "../../components";

type Tool = "pen" | "eraser";
type DrawPath = { d: string; color: string };

export function DesignerScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [tool, setTool] = useState<Tool>("pen");
  const [paths, setPaths] = useState<DrawPath[]>([]);
  const [notes, setNotes] = useState("");
  const [showNotice, setShowNotice] = useState(true);
  const currentPath = useRef<string>("");

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        if (tool === "eraser") {
          // Remove paths near touch point
          setPaths((prev) =>
            prev.filter((p) => {
              // Simple proximity check: parse first move point
              const match = p.d.match(/^M ([\d.]+) ([\d.]+)/);
              if (!match) return true;
              const px = parseFloat(match[1]);
              const py = parseFloat(match[2]);
              return Math.abs(px - locationX) > 20 || Math.abs(py - locationY) > 20;
            }),
          );
        } else {
          currentPath.current = `M ${locationX} ${locationY}`;
        }
      },
      onPanResponderMove: (e) => {
        if (tool === "eraser") return;
        const { locationX, locationY } = e.nativeEvent;
        currentPath.current += ` L ${locationX} ${locationY}`;
        // Force re-render with the current path
        setPaths((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].d.startsWith(currentPath.current.slice(0, 10))) {
            updated[lastIdx] = { d: currentPath.current, color: colors.text };
          } else {
            updated.push({ d: currentPath.current, color: colors.text });
          }
          return updated;
        });
      },
      onPanResponderRelease: () => {
        if (tool !== "eraser" && currentPath.current) {
          setPaths((prev) => {
            const filtered = prev.filter(
              (p) => !p.d.startsWith(currentPath.current.slice(0, 10)),
            );
            return [...filtered, { d: currentPath.current, color: colors.text }];
          });
          currentPath.current = "";
        }
      },
    }),
  ).current;

  const clearAll = useCallback(() => {
    setPaths([]);
  }, []);

  return (
    <ScreenWrapper>
      <Modal
        visible={showNotice}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotice(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowNotice(false)}
        >
          <View
            style={[styles.modalCard, { backgroundColor: colors.surface }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={[styles.modalIcon, { backgroundColor: colors.warningBg }]}>
              <Text style={{ fontSize: 24 }}>⚠️</Text>
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t("designer.underDevelopment")}
            </Text>
            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
              {t("designer.underDevelopmentMessage")}
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowNotice(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <PageHeading>{t("designer.title")}</PageHeading>

      {/* Tool buttons */}
      <View style={styles.toolRow}>
        <ToolBtn
          label={t("designer.pen")}
          active={tool === "pen"}
          onPress={() => setTool("pen")}
          colors={colors}
        />
        <ToolBtn
          label={t("designer.eraser")}
          active={tool === "eraser"}
          onPress={() => setTool("eraser")}
          colors={colors}
        />
        <ToolBtn
          label={t("designer.clear")}
          onPress={clearAll}
          colors={colors}
        />
      </View>

      {/* Drawing area */}
      <View
        style={[
          styles.canvas,
          { borderColor: colors.border, backgroundColor: colors.surface },
        ]}
        {...panResponder.panHandlers}
      >
        <Svg style={StyleSheet.absoluteFill}>
          {paths.map((p, i) => (
            <Path
              key={i}
              d={p.d}
              stroke={p.color}
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </Svg>
      </View>

      {/* Notes */}
      <Text style={[styles.notesLabel, { color: colors.text }]}>
        {t("designer.notes")}
      </Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder={t("designer.notesPlaceholder")}
        placeholderTextColor={colors.textTertiary}
        multiline
        style={[
          styles.notesInput,
          {
            borderColor: colors.cardBorder,
            backgroundColor: colors.surface,
            color: colors.text,
          },
        ]}
      />
    </ScreenWrapper>
  );
}

function ToolBtn({
  label,
  active,
  onPress,
  colors,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  colors: import("../../theme/colors").ColorPalette;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.toolBtn,
        {
          borderColor: active ? colors.primary : colors.border,
          backgroundColor: active ? colors.primary + "15" : colors.surface,
        },
      ]}
    >
      <Text
        style={[
          styles.toolText,
          { color: active ? colors.primary : colors.text },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  toolRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  toolBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  toolText: {
    fontSize: 13,
    fontWeight: "600",
  },
  canvas: {
    height: 300,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    minHeight: 120,
    textAlignVertical: "top",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    marginHorizontal: 32,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 24,
  },
  modalButton: {
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
