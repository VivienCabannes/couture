import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BackLink } from "../../components/BackLink";
import { PageHeading } from "../../components/PageHeading";
import { PatternCard } from "./PatternCard";
import { PATTERNS } from "./patternData";

const FILTERS = ["filterAll", "filterTops", "filterDresses", "filterSkirts"];

export function ShopPage() {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState("filterAll");

  return (
    <>
      <BackLink />
      <PageHeading>{t("shop.title")}</PageHeading>

      <div className="mb-5 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder={t("shop.searchPlaceholder")}
          className="min-w-[200px] flex-1 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 font-sans text-sm outline-none transition-colors focus:border-blue-600 dark:border-gray-600 dark:text-gray-50 dark:focus:border-blue-400"
        />
        {FILTERS.map((key) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={`cursor-pointer rounded-lg border px-4 py-2 font-sans text-[0.8125rem] font-semibold transition-colors ${
              activeFilter === key
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-700"
            }`}
          >
            {t(`shop.${key}`)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PATTERNS.map((p) => (
          <PatternCard key={p.nameKey} pattern={p} />
        ))}
      </div>
    </>
  );
}
