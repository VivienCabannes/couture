import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BackLink } from "../../components/BackLink";
import { PageHeading } from "../../components/PageHeading";
import { PieceTabs } from "./PieceTabs";
import { PieceControls } from "./PieceControls";
import { PatternPreview } from "./PatternPreview";
import { fetchPieces } from "@shared/api";
import { usePatternForm } from "@shared/hooks/usePatternForm";
import { useMeasurementsStore, useSelectionsStore } from "../../stores";
import type { PieceInfo } from "@shared/types/patterns";

export function ModelistPage() {
  const { t } = useTranslation();
  const [allPieces, setAllPieces] = useState<PieceInfo[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const { values: measurementValues, loaded: measurementsLoaded, fetch: fetchMeasurements } =
    useMeasurementsStore();
  const { selections, loaded: selectionsLoaded, fetch: fetchSelections } =
    useSelectionsStore();

  useEffect(() => {
    if (!measurementsLoaded) fetchMeasurements();
  }, [measurementsLoaded, fetchMeasurements]);

  useEffect(() => {
    if (!selectionsLoaded) fetchSelections();
  }, [selectionsLoaded, fetchSelections]);

  useEffect(() => {
    fetchPieces().then(setAllPieces);
  }, []);

  const selectedPieces = allPieces.filter((p) =>
    selections.some((s) => s.garment_name === p.pattern_type),
  );

  const activePiece: PieceInfo | null = selectedPieces[activeIdx] ?? selectedPieces[0] ?? null;

  // No pieces selected — prompt user to visit the Pattern Rack
  if (selectionsLoaded && allPieces.length > 0 && selectedPieces.length === 0) {
    return (
      <>
        <BackLink />
        <PageHeading>{t("modelist.title")}</PageHeading>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          {t("modelist.noPiecesSelected")}
        </p>
        <Link
          to="/shop"
          className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {t("modelist.goToRack")}
        </Link>
      </>
    );
  }

  return (
    <>
      <BackLink />
      <PageHeading>{t("modelist.title")}</PageHeading>

      {selectedPieces.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
          {t("shop.loading")}
        </p>
      ) : (
        <>
          <PieceTabs
            pieces={selectedPieces}
            activeIdx={activeIdx}
            onSelect={setActiveIdx}
          />
          {activePiece && measurementsLoaded && (
            <PieceEditor
              key={activePiece.pattern_type}
              piece={activePiece}
              initialMeasurements={measurementValues as unknown as Record<string, number>}
            />
          )}
        </>
      )}
    </>
  );
}

function PieceEditor({
  piece,
  initialMeasurements,
}: {
  piece: PieceInfo;
  initialMeasurements?: Record<string, number>;
}) {
  const { t } = useTranslation();
  const form = usePatternForm({ type: piece.pattern_type, initialMeasurements });
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
            <PatternPreview svgContent={svgContent} />
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
