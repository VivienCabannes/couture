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
      <div className="flex gap-2 mb-3">
        <button
          className={`px-3 py-1.5 text-sm rounded ${tab === "construction" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          onClick={() => setTab("construction")}
        >
          Construction
        </button>
        <button
          className={`px-3 py-1.5 text-sm rounded ${tab === "pattern" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          onClick={() => setTab("pattern")}
        >
          Pattern
        </button>
      </div>
      <div
        className="border border-gray-200 rounded bg-white p-2 overflow-auto"
        style={{ maxHeight: "70vh" }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
