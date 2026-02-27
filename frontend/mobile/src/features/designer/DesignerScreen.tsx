import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import Svg, { Path, Line } from "react-native-svg";
import { useTheme } from "../../hooks/useTheme";
import { ScreenWrapper, PageHeading } from "../../components";

export function DesignerScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <ScreenWrapper>
      <PageHeading>{t("designer.title")}</PageHeading>

      {/* Tool buttons */}
      <View style={styles.toolRow}>
        <ToolBtn title="Pencil" colors={colors}>
          <Path
            d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5z"
            stroke={colors.text}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </ToolBtn>
        <ToolBtn title="Line" colors={colors}>
          <Line
            x1={5}
            y1={19}
            x2={19}
            y2={5}
            stroke={colors.text}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </ToolBtn>
        <ToolBtn title="Curve" colors={colors}>
          <Path
            d="M3 20Q12 4 21 20"
            stroke={colors.text}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
        </ToolBtn>
        <ToolBtn title="Eraser" colors={colors}>
          <Path
            d="M20 20H7L3 16l9-9 8 8-4 4"
            stroke={colors.text}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <Line
            x1={6}
            y1={20}
            x2={20}
            y2={20}
            stroke={colors.text}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </ToolBtn>
      </View>

      {/* Canvas placeholder */}
      <View
        style={[
          styles.canvas,
          { borderColor: colors.border },
        ]}
      >
        <Text style={{ color: colors.textTertiary, fontSize: 14 }}>
          {t("designer.drawingCanvas")}
        </Text>
      </View>

      {/* Chat area */}
      <View
        style={[
          styles.chatBox,
          { backgroundColor: colors.surface, borderColor: colors.cardBorder },
        ]}
      >
        <View style={styles.bubbles}>
          <View style={[styles.bubbleUser, { backgroundColor: colors.primary }]}>
            <Text style={styles.bubbleUserText}>
              {t("designer.chatBubble1")}
            </Text>
          </View>
          <View
            style={[
              styles.bubbleAssistant,
              { backgroundColor: colors.background },
            ]}
          >
            <Text style={[styles.bubbleAssistantText, { color: colors.text }]}>
              {t("designer.chatBubble2")}
            </Text>
          </View>
          <View style={[styles.bubbleUser, { backgroundColor: colors.primary }]}>
            <Text style={styles.bubbleUserText}>
              {t("designer.chatBubble3")}
            </Text>
          </View>
        </View>

        <View
          style={[styles.chatInput, { borderTopColor: colors.cardBorder }]}
        >
          <TextInput
            placeholder={t("designer.chatPlaceholder")}
            placeholderTextColor={colors.textTertiary}
            style={[
              styles.input,
              { borderColor: colors.border, color: colors.text },
            ]}
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.sendText}>{t("common.send")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}

function ToolBtn({
  title,
  colors,
  children,
}: {
  title: string;
  colors: import("../../theme/colors").ColorPalette;
  children: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      style={[styles.toolBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
      accessibilityLabel={title}
    >
      <Svg viewBox="0 0 24 24" width={18} height={18}>
        {children}
      </Svg>
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
    width: 36,
    height: 36,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  canvas: {
    minHeight: 250,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  chatBox: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  bubbles: {
    padding: 16,
    gap: 10,
  },
  bubbleUser: {
    alignSelf: "flex-end",
    maxWidth: "80%",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUserText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleAssistant: {
    alignSelf: "flex-start",
    maxWidth: "80%",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleAssistantText: {
    fontSize: 14,
    lineHeight: 20,
  },
  chatInput: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  sendBtn: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: "center",
  },
  sendText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
