import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function BackLink() {
  const { t } = useTranslation();
  return (
    <Link
      to="/"
      className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-4 py-1.5 text-[0.8125rem] font-semibold text-blue-600 no-underline transition-colors hover:bg-blue-100 dark:bg-[#1e3a5f] dark:text-blue-400 dark:hover:bg-[#1e4d8f]"
    >
      {t("common.backHome")}
    </Link>
  );
}
