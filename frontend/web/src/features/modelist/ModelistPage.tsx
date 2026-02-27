import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BackLink } from "../../components/BackLink";
import { PageHeading } from "../../components/PageHeading";
import { PieceTabs } from "./PieceTabs";
import { PieceControls } from "./PieceControls";
import { fetchGarments } from "@shared/api";
import { usePatternForm } from "@shared/hooks/usePatternForm";
import type { GarmentInfo, PieceInfo } from "@shared/types/patterns";

export function ModelistPage() {
  const { t } = useTranslation();
  const { garmentType } = useParams<{ garmentType: string }>();
  const [garment, setGarment] = useState<GarmentInfo | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (garmentType) {
      fetchGarments().then((garments) => {
        const found = garments.find((g) => g.name === garmentType);
        if (found) setGarment(found);
      });
    }
  }, [garmentType]);

  const activePiece: PieceInfo | null = garment?.pieces[activeIdx] ?? null;

  return (
    <>
      <BackLink />
      <PageHeading>{t("modelist.title")}</PageHeading>

      {!garment ? (
        <p className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
          {t("shop.loading")}
        </p>
      ) : (
        <>
          <PieceTabs
            pieces={garment.pieces}
            activeIdx={activeIdx}
            onSelect={setActiveIdx}
          />
          {activePiece && <PieceEditor piece={activePiece} />}
        </>
      )}
    </>
  );
}

function PieceEditor({ piece }: { piece: PieceInfo }) {
  const { t } = useTranslation();
  const form = usePatternForm({ type: piece.pattern_type });
  const [view, setView] = useState<"construction" | "pattern">("construction");

  const svgContent = form.result
    ? view === "construction"
      ? form.result.construction_svg
      : form.result.pattern_svg
    : null;

  return (
    <div className="flex min-h-[60vh] gap-6 max-lg:flex-col">
      {/* Left: SVG Viewport */}
      <div className="flex-[3]">
        <div className="relative flex min-h-[500px] items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors dark:border-gray-700 dark:bg-gray-800">
          {svgContent ? (
            <div
              className="h-full w-full overflow-auto p-4"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {t("modelist.noPreview")}
            </p>
          )}
        </div>
        {form.result && (
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => setView("construction")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                view === "construction"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {t("modelist.construction")}
            </button>
            <button
              onClick={() => setView("pattern")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                view === "pattern"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {t("modelist.pattern")}
            </button>
          </div>
        )}
      </div>

      {/* Right: Controls */}
      <div className="flex-[2]">
        <PieceControls form={form} />
      </div>
    </div>
  );
}
