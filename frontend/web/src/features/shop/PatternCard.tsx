import { useTranslation } from "react-i18next";
import type { PatternDef } from "./patternData";

const BADGE_CLASSES: Record<PatternDef["difficulty"], string> = {
  beginner:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  intermediate:
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export function PatternCard({ pattern }: { pattern: PatternDef }) {
  const { t } = useTranslation();

  return (
    <div className="cursor-pointer overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-800 dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
      <div className="flex h-[180px] w-full items-center justify-center bg-gray-200 text-[0.8125rem] text-gray-400 dark:bg-gray-700 dark:text-gray-500">
        {t("shop.patternIllustration")}
      </div>
      <div className="p-4">
        <div className="mb-1 text-base font-semibold text-gray-900 transition-colors dark:text-gray-50">
          {t(pattern.nameKey)}
        </div>
        <div className="mb-2 text-[0.8125rem] leading-snug text-gray-500 transition-colors dark:text-gray-400">
          {t(pattern.descKey)}
        </div>
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE_CLASSES[pattern.difficulty]}`}
        >
          {t(pattern.difficultyKey)}
        </span>
      </div>
    </div>
  );
}
