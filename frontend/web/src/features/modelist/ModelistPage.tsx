import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BackLink } from "../../components/BackLink";
import { PageHeading } from "../../components/PageHeading";
import { PieceTabs } from "./PieceTabs";
import { PieceControls } from "./PieceControls";
import { fetchGarments } from "@shared/api";
import { usePatternForm } from "@shared/hooks/usePatternForm";
import { useMeasurementsStore, useSelectionsStore } from "../../stores";
import type { GarmentInfo, PieceInfo } from "@shared/types/patterns";

export function ModelistPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { garmentType } = useParams<{ garmentType: string }>();
  const [garment, setGarment] = useState<GarmentInfo | null>(null);
  const [allGarments, setAllGarments] = useState<GarmentInfo[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const { values: measurementValues, loaded: measurementsLoaded, fetch: fetchMeasurements } =
    useMeasurementsStore();
  const { loaded: selectionsLoaded, fetch: fetchSelections } = useSelectionsStore();

  useEffect(() => {
    if (!measurementsLoaded) fetchMeasurements();
  }, [measurementsLoaded, fetchMeasurements]);

  useEffect(() => {
    if (!selectionsLoaded) fetchSelections();
  }, [selectionsLoaded, fetchSelections]);

  useEffect(() => {
    fetchGarments().then((garments) => {
      setAllGarments(garments);
      if (garmentType) {
        const found = garments.find((g) => g.name === garmentType);
        if (found) setGarment(found);
      }
    });
  }, [garmentType]);

  const activePiece: PieceInfo | null = garment?.pieces[activeIdx] ?? null;

  // When no garmentType in URL, show a garment picker
  if (!garmentType && allGarments.length > 0) {
    return (
      <>
        <BackLink />
        <PageHeading>{t("modelist.title")}</PageHeading>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          {t("modelist.chooseGarment")}
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {allGarments.map((g) => (
            <button
              key={g.name}
              onClick={() => navigate(`/modelist/${g.name}`)}
              className="rounded-xl border border-gray-200 bg-white p-4 text-left transition-colors hover:border-blue-400 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500 dark:hover:bg-gray-700"
            >
              <div className="text-base font-semibold text-gray-900 dark:text-gray-50">
                {g.label}
              </div>
              <div className="text-[0.8125rem] text-gray-500 dark:text-gray-400">
                {t("shop.pieces", { count: g.pieces.length })}
              </div>
            </button>
          ))}
        </div>
      </>
    );
  }

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
