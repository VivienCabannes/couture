import { useTranslation } from "react-i18next";
import type { PieceInfo } from "@shared/types/patterns";

interface Props {
  piece: PieceInfo;
  selected: boolean;
  onToggle: () => void;
}

export function PatternCard({ piece, selected, onToggle }: Props) {
  const { t } = useTranslation();

  return (
    <div
      onClick={onToggle}
      className={`relative cursor-pointer overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-800 dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)] ${
        selected ? "ring-2 ring-blue-500 dark:ring-blue-400" : ""
      }`}
    >
      <div className={`absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
        selected
          ? "border-blue-500 bg-blue-500 text-white"
          : "border-blue-400 bg-transparent dark:border-blue-500"
      }`}>
        {selected && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>

      <div className="flex h-[180px] w-full items-center justify-center bg-gray-200 text-[0.8125rem] text-gray-400 dark:bg-gray-700 dark:text-gray-500">
        {t("shop.patternIllustration")}
      </div>
      <div className="p-4">
        <div className="text-base font-semibold text-gray-900 transition-colors dark:text-gray-50">
          {t(`patterns.${piece.pattern_type}`)}
        </div>
      </div>
    </div>
  );
}
