import { useTranslation } from "react-i18next";

export function SewingPage() {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
        <svg
          viewBox="0 0 24 24"
          className="h-12 w-12 fill-none stroke-gray-400 dark:stroke-gray-500"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="6" cy="6" r="3" />
          <path d="M8.12 8.12L12 12" />
          <path d="M20 4L8.12 15.88" />
          <circle cx="6" cy="18" r="3" />
          <path d="M14.8 14.8L20 20" />
        </svg>
        <span>{t("sewing.placeholder")}</span>
        <div className="mt-4 rounded-lg bg-amber-100 px-4 py-2 text-[0.8125rem] font-semibold text-amber-800 dark:bg-amber-900 dark:text-amber-300">
          {t("sewing.underDevelopment")}
        </div>
      </div>
    </>
  );
}
