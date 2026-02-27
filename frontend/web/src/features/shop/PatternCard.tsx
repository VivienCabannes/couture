import { useTranslation } from "react-i18next";
import type { GarmentInfo } from "@shared/types/patterns";

interface Props {
  garment: GarmentInfo;
  onClick: () => void;
}

export function PatternCard({ garment, onClick }: Props) {
  const { t } = useTranslation();

  return (
    <div
      onClick={onClick}
      className="cursor-pointer overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-800 dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
    >
      <div className="flex h-[180px] w-full items-center justify-center bg-gray-200 text-[0.8125rem] text-gray-400 dark:bg-gray-700 dark:text-gray-500">
        {t("shop.patternIllustration")}
      </div>
      <div className="p-4">
        <div className="mb-1 text-base font-semibold text-gray-900 transition-colors dark:text-gray-50">
          {garment.label}
        </div>
        <div className="text-[0.8125rem] leading-snug text-gray-500 transition-colors dark:text-gray-400">
          {t("shop.pieces", { count: garment.pieces.length })}
        </div>
      </div>
    </div>
  );
}
