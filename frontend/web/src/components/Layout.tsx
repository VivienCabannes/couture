import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Header } from "./Header";

/** Maps route paths to their i18n title keys. */
const ROUTE_TITLE_KEYS: Record<string, string> = {
  "/designer": "designer.title",
  "/shop": "shop.title",
  "/modelist": "modelist.title",
  "/measurements": "measurements.title",
  "/sewing": "sewing.title",
  "/help": "help.title",
};

export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const titleKey = ROUTE_TITLE_KEYS[pathname];
  const title = titleKey ? t(titleKey) : undefined;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 transition-colors duration-300 dark:bg-gray-900 dark:text-gray-50">
      <Header title={title} />
      <main className="mx-auto max-w-[1152px] px-6 py-6">{children}</main>
    </div>
  );
}
