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
  Platform,
} from "react-native";
import type { GestureResponderEvent } from "react-native";
import { useTranslation } from "react-i18next";
import Svg, { Path, Line } from "react-native-svg";
import { useTheme } from "../../hooks/useTheme";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { ScreenWrapper } from "../../components";

type Tool = "pen" | "eraser";
type DrawPath = { d: string; color: string };

const PALETTE = [
  "#000000", "#FFFFFF", "#EF4444", "#F97316", "#EAB308",
  "#22C55E", "#3B82F6", "#8B5CF6", "#EC4899", "#92400E",
];

export function DesignerScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isWide } = useResponsiveLayout();
  const [tool, setTool] = useState<Tool>("pen");
  const [paths, setPaths] = useState<DrawPath[]>([]);
  const [notes, setNotes] = useState("");
  const [showNotice, setShowNotice] = useState(true);
  const [color, setColor] = useState("#000000");
  const currentPath = useRef<string>("");
  const canvasRef = useRef<View>(null);

  // Refs so PanResponder always reads current values (avoids stale closure)
  const toolRef = useRef<Tool>(tool);
  toolRef.current = tool;
  const colorsRef = useRef(colors);
  colorsRef.current = colors;
  const colorRef = useRef(color);
  colorRef.current = color;

  /** Get touch position relative to the canvas View. */
  const getPos = (e: GestureResponderEvent) => {
    const ne = e.nativeEvent;
    // On web, locationX/locationY can be undefined or wrong.
    // Compute from pageX/pageY using the canvas DOM rect instead.
    if (Platform.OS === "web" && canvasRef.current) {
      const node = canvasRef.current as unknown as HTMLElement;
      if (typeof node.getBoundingClientRect === "function") {
        const rect = node.getBoundingClientRect();
        const scrollX = window.scrollX ?? 0;
        const scrollY = window.scrollY ?? 0;
        return {
          x: (ne.pageX ?? 0) - scrollX - rect.left,
          y: (ne.pageY ?? 0) - scrollY - rect.top,
        };
      }
    }
    // Native: locationX/locationY are reliable
    return { x: ne.locationX, y: ne.locationY };
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const { x, y } = getPos(e);
        if (toolRef.current === "eraser") {
          setPaths((prev) =>
            prev.filter((p) => {
              const match = p.d.match(/^M ([\d.]+) ([\d.]+)/);
              if (!match) return true;
              const px = parseFloat(match[1]);
              const py = parseFloat(match[2]);
              return Math.abs(px - x) > 20 || Math.abs(py - y) > 20;
            }),
          );
        } else {
          currentPath.current = `M ${x} ${y}`;
        }
      },
      onPanResponderMove: (e) => {
        if (toolRef.current === "eraser") return;
        const { x, y } = getPos(e);
        currentPath.current += ` L ${x} ${y}`;
        setPaths((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].d.startsWith(currentPath.current.slice(0, 10))) {
            updated[lastIdx] = { d: currentPath.current, color: colorRef.current };
          } else {
            updated.push({ d: currentPath.current, color: colorRef.current });
          }
          return updated;
        });
      },
      onPanResponderRelease: () => {
        if (toolRef.current !== "eraser" && currentPath.current) {
          setPaths((prev) => {
            const filtered = prev.filter(
              (p) => !p.d.startsWith(currentPath.current.slice(0, 10)),
            );
            return [...filtered, { d: currentPath.current, color: colorRef.current }];
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

      <View style={isWide ? styles.wideRow : undefined}>
        {/* Left column: tools + palette + canvas */}
        <View style={isWide ? styles.wideCol : undefined}>
          {/* Tool buttons */}
          <View style={styles.toolRow}>
            <ToolBtn
              active={tool === "pen"}
              onPress={() => setTool("pen")}
              colors={colors}
            >
              <Path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5z" />
            </ToolBtn>
            <ToolBtn
              active={tool === "eraser"}
              onPress={() => setTool("eraser")}
              colors={colors}
            >
              <Path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.9-9.9c1-1 2.5-1 3.4 0l5.7 5.7c1 1 1 2.5 0 3.4L12 21" />
              <Path d="M22 21H7" />
              <Path d="m5 11 9 9" />
            </ToolBtn>
            <ToolBtn
              onPress={clearAll}
              colors={colors}
            >
              <Line x1={18} y1={6} x2={6} y2={18} />
              <Line x1={6} y1={6} x2={18} y2={18} />
            </ToolBtn>
          </View>

          {/* Color palette */}
          <View style={styles.colorRow}>
            {PALETTE.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setColor(c)}
                style={[
                  styles.colorCircle,
                  { backgroundColor: c },
                  c === "#FFFFFF" && { borderColor: colors.border, borderWidth: 1 },
                  color === c && { borderColor: colors.primary, borderWidth: 2.5 },
                ]}
              />
            ))}
            <TextInput
              value={color}
              onChangeText={(text) => {
                const hex = text.startsWith("#") ? text : `#${text}`;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(hex)) setColor(hex);
              }}
              placeholder={t("designer.color")}
              placeholderTextColor={colors.textTertiary}
              maxLength={7}
              autoCapitalize="none"
              autoCorrect={false}
              style={[
                styles.colorInput,
                { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text },
              ]}
            />
          </View>

          {/* Drawing area */}
          <View
            ref={canvasRef}
            style={[
              isWide ? styles.canvasWide : styles.canvas,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}
            {...panResponder.panHandlers}
          >
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
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
          </View>
        </View>

        {/* Right column: notes */}
        <View style={isWide ? styles.wideCol : undefined}>
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
              isWide ? styles.notesInputWide : styles.notesInput,
              {
                borderColor: colors.cardBorder,
                backgroundColor: colors.surface,
                color: colors.text,
              },
            ]}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}

function ToolBtn({
  active,
  onPress,
  colors,
  children,
}: {
  active?: boolean;
  onPress: () => void;
  colors: import("../../theme/colors").ColorPalette;
  children: React.ReactNode;
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
      <Svg
        viewBox="0 0 24 24"
        width={20}
        height={20}
        stroke={active ? colors.primary : colors.text}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {children}
      </Svg>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wideRow: {
    flexDirection: "row",
    gap: 24,
  },
  wideCol: {
    flex: 1,
  },
  toolRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  toolBtn: {
    borderWidth: 1,
    borderRadius: 8,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  colorInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 13,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    width: 80,
  },
  canvas: {
    height: 300,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  canvasWide: {
    aspectRatio: 4 / 3,
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
  notesInputWide: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    flex: 1,
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
