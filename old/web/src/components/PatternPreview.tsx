import { useState } from "react";

interface Props {
  constructionSvg: string;
  patternSvg: string;
}

export default function PatternPreview({ constructionSvg, patternSvg }: Props) {
  const [tab, setTab] = useState<"construction" | "pattern">("construction");
  const svg = tab === "construction" ? constructionSvg : patternSvg;

  return (
    <div>
      <div className="flex gap-6 mb-4 border-b border-gray-200">
        <button
          className={`px-1 pb-2.5 text-sm font-medium transition-colors relative ${tab === "construction" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setTab("construction")}
        >
          Construction
        </button>
        <button
          className={`px-1 pb-2.5 text-sm font-medium transition-colors relative ${tab === "pattern" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setTab("pattern")}
        >
          Pattern
        </button>
      </div>
      <div
        className="bg-white rounded-xl shadow-sm p-3 overflow-auto max-h-[70vh]"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
