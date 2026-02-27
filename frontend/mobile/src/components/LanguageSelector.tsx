import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
} from "react-native";
import { useTranslation } from "react-i18next";
import { LANGUAGES } from "@shared/i18n";
import { useTheme } from "../hooks/useTheme";

const FLAGS: Record<string, string> = {
  en: "\uD83C\uDDEC\uD83C\uDDE7",
  fr: "\uD83C\uDDEB\uD83C\uDDF7",
  es: "\uD83C\uDDEA\uD83C\uDDF8",
};

/** Dropdown language selector mirroring the web's LanguageSelector. */
export function LanguageSelector() {
  const { i18n } = useTranslation();
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [buttonLayout, setButtonLayout] = useState({ x: 0, y: 0, w: 0, h: 0 });

  const currentLang = i18n.language;

  const measureButton = useCallback(
    (e: { nativeEvent: { layout: { x: number; y: number; width: number; height: number } } }) => {
      const { x, y, width, height } = e.nativeEvent.layout;
      setButtonLayout({ x, y, w: width, h: height });
    },
    [],
  );

  const handleSelect = useCallback(
    (lang: string) => {
      i18n.changeLanguage(lang);
      setOpen(false);
    },
    [i18n],
  );

  return (
    <View onLayout={measureButton}>
      <TouchableOpacity
        onPress={() => setOpen((prev) => !prev)}
        style={[styles.button, { borderColor: colors.border }]}
        accessibilityLabel="Select language"
      >
        <Text style={styles.flag}>{FLAGS[currentLang] ?? FLAGS.en}</Text>
        <Text style={[styles.langText, { color: colors.text }]}>
          {currentLang.toUpperCase()}
        </Text>
        <Text style={[styles.arrow, { color: colors.textSecondary }]}>▾</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View
            style={[
              styles.dropdown,
              {
                backgroundColor: colors.surface,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang}
                style={styles.option}
                onPress={() => handleSelect(lang)}
              >
                <Text style={styles.optionFlag}>{FLAGS[lang]}</Text>
                <Text style={[styles.optionText, { color: colors.text }]}>
                  {lang.toUpperCase()}
                </Text>
                {lang === currentLang && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  flag: {
    fontSize: 14,
  },
  langText: {
    fontSize: 13,
    fontWeight: "600",
  },
  arrow: {
    fontSize: 10,
  },
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  dropdown: {
    minWidth: 130,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  optionFlag: {
    fontSize: 16,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  checkmark: {
    marginLeft: "auto",
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "600",
  },
});
