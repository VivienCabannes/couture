import { Link } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { LanguageSelector } from "./LanguageSelector";

export function Header() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-colors duration-300 dark:bg-gray-800 dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
      <div className="mx-auto flex max-w-[1152px] items-center gap-3 p-6">
        <Link
          to="/"
          className="text-xl font-semibold text-gray-900 no-underline transition-colors duration-200 hover:text-blue-600 dark:text-gray-50 dark:hover:text-blue-400"
        >
          Couture
        </Link>
        <div className="flex-1" />
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-1.5 text-[0.8125rem] font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-700"
        >
          {isDark ? (
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 fill-none stroke-current stroke-2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 fill-none stroke-current stroke-2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          )}
        </button>
        <LanguageSelector />
      </div>
    </header>
  );
}
