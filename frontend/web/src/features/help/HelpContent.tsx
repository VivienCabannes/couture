import { useTranslation } from "react-i18next";

export function HelpContent() {
  const { t } = useTranslation();

  return (
    <div className="min-w-0 flex-1">
      {/* How it Works */}
      <section id="how-it-works" className="mb-12">
        <h2 className="mb-4 border-b border-gray-200 pb-2 text-xl font-semibold text-gray-900 transition-colors dark:border-gray-700 dark:text-gray-50">
          {t("help.tocHowItWorks")}
        </h2>
        <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {t("help.howItWorksContent")}
        </p>
        <ol className="mb-3 list-decimal space-y-1.5 pl-6 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <li>{t("help.howItWorksStep1")}</li>
          <li>{t("help.howItWorksStep2")}</li>
          <li>{t("help.howItWorksStep3")}</li>
          <li>{t("help.howItWorksStep4")}</li>
          <li>{t("help.howItWorksStep5")}</li>
        </ol>
      </section>

      {/* Getting Started */}
      <section id="getting-started" className="mb-12">
        <h2 className="mb-4 border-b border-gray-200 pb-2 text-xl font-semibold text-gray-900 transition-colors dark:border-gray-700 dark:text-gray-50">
          {t("help.tocGettingStarted")}
        </h2>
        <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {t("help.gettingStartedIntro")}
        </p>
        <ol className="mb-3 list-decimal space-y-1.5 pl-6 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <li>{t("help.gettingStartedStep1")}</li>
          <li>{t("help.gettingStartedStep2")}</li>
          <li>{t("help.gettingStartedStep3")}</li>
          <li>{t("help.gettingStartedStep4")}</li>
        </ol>
      </section>

      {/* Glossary */}
      <section id="glossary" className="mb-12">
        <h2 className="mb-4 border-b border-gray-200 pb-2 text-xl font-semibold text-gray-900 transition-colors dark:border-gray-700 dark:text-gray-50">
          {t("help.tocGlossary")}
        </h2>
        <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {t("help.glossaryIntro")}
        </p>
        <dl>
          <GlossaryItem term={t("help.sloper")} def={t("help.sloperDef")} />
          <GlossaryItem term={t("help.dart")} def={t("help.dartDef")} />
          <GlossaryItem term={t("help.ease")} def={t("help.easeDef")} />
          <GlossaryItem term={t("help.grainLine")} def={t("help.grainLineDef")} />
          <GlossaryItem term={t("help.moulage")} def={t("help.moulageDef")} />
        </dl>
      </section>

      {/* FAQ */}
      <section id="faq" className="mb-12">
        <h2 className="mb-4 border-b border-gray-200 pb-2 text-xl font-semibold text-gray-900 transition-colors dark:border-gray-700 dark:text-gray-50">
          {t("help.tocFaq")}
        </h2>
        <FaqItem q={t("help.faqFormats")} a={t("help.faqFormatsAnswer")} />
        <FaqItem q={t("help.faqSizes")} a={t("help.faqSizesAnswer")} />
        <FaqItem q={t("help.faqSewing")} a={t("help.faqSewingAnswer")} />
      </section>
    </div>
  );
}

function GlossaryItem({ term, def }: { term: string; def: string }) {
  return (
    <>
      <dt className="mt-4 text-[0.9375rem] font-semibold text-gray-900 dark:text-gray-50">
        {term}
      </dt>
      <dd className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
        {def}
      </dd>
    </>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="mb-2 rounded-lg border border-gray-200 transition-colors dark:border-gray-700">
      <summary className="cursor-pointer list-none p-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-50">
        <span className="mr-1">&#9656;</span>
        {q}
      </summary>
      <div className="px-4 pb-3 text-[0.8125rem] leading-relaxed text-gray-600 dark:text-gray-400">
        {a}
      </div>
    </details>
  );
}
