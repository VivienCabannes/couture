import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { LANGUAGES } from "@shared/i18n";

const FLAGS: Record<string, string> = {
  en: "🇬🇧",
  fr: "🇫🇷",
  es: "🇪🇸",
};

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [open]);

  const currentLang = i18n.language;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Select language"
        className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-1.5 text-[0.8125rem] font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-700"
      >
        <span>{FLAGS[currentLang]}</span>
        <span>{currentLang.toUpperCase()}</span>
        <span className="text-[0.625rem]">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 min-w-[120px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => {
                i18n.changeLanguage(lang);
                setOpen(false);
              }}
              className="flex w-full cursor-pointer items-center gap-2 border-none bg-transparent px-3.5 py-2 text-left text-[0.8125rem] text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <span>{FLAGS[lang]}</span>
              <span>{lang.toUpperCase()}</span>
              {lang === currentLang && (
                <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
