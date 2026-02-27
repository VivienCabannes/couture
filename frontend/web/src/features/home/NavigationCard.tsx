import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { CardDef } from "./cardData";

export function NavigationCard({ card }: { card: CardDef }) {
  const { t } = useTranslation();

  return (
    <Link
      to={card.route}
      className="block rounded-xl bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.05)] no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-800 dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.4),0_2px_4px_-2px_rgba(0,0,0,0.3)]"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[14px] bg-blue-50 transition-colors duration-300 dark:bg-[#1e3a5f]">
        <svg
          viewBox="0 0 24 24"
          className="h-7 w-7 fill-none stroke-blue-600 stroke-2 dark:stroke-blue-400"
          strokeLinecap="round"
          strokeLinejoin="round"
          dangerouslySetInnerHTML={{ __html: card.icon }}
        />
      </div>
      <div className="text-lg font-semibold text-gray-900 transition-colors dark:text-gray-50">
        {t(`home.${card.labelKey}`)}
      </div>
      <div className="text-sm text-gray-500 transition-colors dark:text-gray-400">
        {t(`home.${card.subtitleKey}`)}
      </div>
    </Link>
  );
}
