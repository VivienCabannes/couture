import { useState } from "react";

interface Props {
  title: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export default function CollapsibleSection({
  title,
  defaultExpanded = false,
  children,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-gray-200 rounded-lg mb-3 overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <span className="text-sm font-semibold text-gray-700">{title}</span>
        <span
          className={`text-xs text-gray-400 transition-transform duration-200 ${
            expanded ? "rotate-90" : ""
          }`}
        >
          &#9654;
        </span>
      </button>
      {expanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
