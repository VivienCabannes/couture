import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../hooks/useTheme";

/** Expandable FAQ item. */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const { colors } = useTheme();

  return (
    <View style={[styles.faqItem, { borderColor: colors.cardBorder }]}>
      <TouchableOpacity onPress={() => setOpen(!open)} style={styles.faqHeader}>
        <Text style={[styles.faqArrow, { color: colors.text }]}>
          {open ? "\u25BE" : "\u25B8"}
        </Text>
        <Text style={[styles.faqQuestion, { color: colors.text }]}>{q}</Text>
      </TouchableOpacity>
      {open && (
        <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
          {a}
        </Text>
      )}
    </View>
  );
}

/** Glossary term + definition. */
function GlossaryItem({ term, def }: { term: string; def: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.glossaryItem}>
      <Text style={[styles.glossaryTerm, { color: colors.text }]}>{term}</Text>
      <Text style={[styles.glossaryDef, { color: colors.textSecondary }]}>
        {def}
      </Text>
    </View>
  );
}

/** All help content sections: How it Works, Getting Started, Glossary, FAQ. */
export function HelpContent() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View>
      {/* How it Works */}
      <Text style={[styles.sectionTitle, { color: colors.text, borderBottomColor: colors.cardBorder }]}>
        {t("help.tocHowItWorks")}
      </Text>
      <Text style={[styles.body, { color: colors.textSecondary }]}>
        {t("help.howItWorksContent")}
      </Text>
      {[1, 2, 3, 4, 5].map((n) => (
        <Text key={n} style={[styles.listItem, { color: colors.textSecondary }]}>
          {n}. {t(`help.howItWorksStep${n}` as const)}
        </Text>
      ))}

      {/* Getting Started */}
      <Text
        style={[styles.sectionTitle, { color: colors.text, borderBottomColor: colors.cardBorder, marginTop: 32 }]}
      >
        {t("help.tocGettingStarted")}
      </Text>
      <Text style={[styles.body, { color: colors.textSecondary }]}>
        {t("help.gettingStartedIntro")}
      </Text>
      {[1, 2, 3, 4].map((n) => (
        <Text key={n} style={[styles.listItem, { color: colors.textSecondary }]}>
          {n}. {t(`help.gettingStartedStep${n}` as const)}
        </Text>
      ))}

      {/* Glossary */}
      <Text
        style={[styles.sectionTitle, { color: colors.text, borderBottomColor: colors.cardBorder, marginTop: 32 }]}
      >
        {t("help.tocGlossary")}
      </Text>
      <Text style={[styles.body, { color: colors.textSecondary }]}>
        {t("help.glossaryIntro")}
      </Text>
      <GlossaryItem term={t("help.sloper")} def={t("help.sloperDef")} />
      <GlossaryItem term={t("help.dart")} def={t("help.dartDef")} />
      <GlossaryItem term={t("help.ease")} def={t("help.easeDef")} />
      <GlossaryItem term={t("help.grainLine")} def={t("help.grainLineDef")} />
      <GlossaryItem term={t("help.moulage")} def={t("help.moulageDef")} />

      {/* FAQ */}
      <Text
        style={[styles.sectionTitle, { color: colors.text, borderBottomColor: colors.cardBorder, marginTop: 32 }]}
      >
        {t("help.tocFaq")}
      </Text>
      <FaqItem q={t("help.faqFormats")} a={t("help.faqFormatsAnswer")} />
      <FaqItem q={t("help.faqSizes")} a={t("help.faqSizesAnswer")} />
      <FaqItem q={t("help.faqSewing")} a={t("help.faqSewingAnswer")} />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    paddingBottom: 8,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  listItem: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 6,
    paddingLeft: 8,
  },
  glossaryItem: {
    marginTop: 12,
  },
  glossaryTerm: {
    fontSize: 15,
    fontWeight: "600",
  },
  glossaryDef: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 4,
  },
  faqItem: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
    overflow: "hidden",
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 12,
    paddingHorizontal: 16,
  },
  faqArrow: {
    fontSize: 14,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  faqAnswer: {
    fontSize: 13,
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
});
