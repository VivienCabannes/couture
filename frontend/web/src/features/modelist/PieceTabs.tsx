import type { PieceInfo } from "@shared/types/patterns";

interface Props {
  pieces: PieceInfo[];
  activeIdx: number;
  onSelect: (idx: number) => void;
}

export function PieceTabs({ pieces, activeIdx, onSelect }: Props) {
  return (
    <div className="mb-5 flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
      {pieces.map((piece, idx) => (
        <button
          key={piece.pattern_type}
          onClick={() => onSelect(idx)}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
            activeIdx === idx
              ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-50"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          {piece.label}
        </button>
      ))}
    </div>
  );
}
