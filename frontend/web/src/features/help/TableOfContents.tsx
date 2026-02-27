import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const TOC_ITEMS = [
  { id: "how-it-works", key: "help.tocHowItWorks" },
  { id: "getting-started", key: "help.tocGettingStarted" },
  { id: "glossary", key: "help.tocGlossary" },
  { id: "faq", key: "help.tocFaq" },
];

export function TableOfContents() {
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState(TOC_ITEMS[0]!.id);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 100;
      const sections = TOC_ITEMS.map((item) => ({
        id: item.id,
        el: document.getElementById(item.id),
      }));
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]!;
        if (section.el && section.el.offsetTop <= scrollPos) {
          setActiveId(section.id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <aside className="sticky top-6 w-[200px] shrink-0 self-start max-md:static max-md:w-full">
      <nav className="flex flex-col gap-1 max-md:mb-6 max-md:flex-row max-md:flex-wrap">
        {TOC_ITEMS.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`block rounded-md px-3 py-1.5 text-[0.8125rem] no-underline transition-colors ${
              activeId === item.id
                ? "bg-blue-50 font-semibold text-blue-600 dark:bg-[#1e3a5f] dark:text-blue-400"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50"
            }`}
          >
            {t(item.key)}
          </a>
        ))}
      </nav>
    </aside>
  );
}
