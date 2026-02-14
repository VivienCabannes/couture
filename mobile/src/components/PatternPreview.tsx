import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from "react-native";
import { SvgXml } from "react-native-svg";

interface Props {
  constructionSvg: string;
  patternSvg: string;
}

export default function PatternPreview({ constructionSvg, patternSvg }: Props) {
  const [tab, setTab] = useState<"construction" | "pattern">("construction");
  const svg = tab === "construction" ? constructionSvg : patternSvg;
  const screenWidth = Dimensions.get("window").width - 32;

  return (
    <View>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === "construction" && styles.activeTab]}
          onPress={() => setTab("construction")}
        >
          <Text style={[styles.tabText, tab === "construction" && styles.activeTabText]}>
            Construction
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === "pattern" && styles.activeTab]}
          onPress={() => setTab("pattern")}
        >
          <Text style={[styles.tabText, tab === "pattern" && styles.activeTabText]}>
            Pattern
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.preview}
        contentContainerStyle={styles.previewContent}
        maximumZoomScale={5}
        minimumZoomScale={0.5}
        bouncesZoom
      >
        <SvgXml xml={svg} width={screenWidth} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: "row", gap: 8, marginBottom: 12 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#e5e7eb",
  },
  activeTab: { backgroundColor: "#2563eb" },
  tabText: { fontSize: 14, color: "#374151" },
  activeTabText: { color: "#ffffff" },
  preview: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    maxHeight: 500,
  },
  previewContent: { padding: 8 },
});
