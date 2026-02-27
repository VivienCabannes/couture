import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BackLink } from "../../components/BackLink";
import { PageHeading } from "../../components/PageHeading";
import { PatternCard } from "./PatternCard";
import { fetchPieces } from "@shared/api";
import { useSelectionsStore } from "../../stores";
import type { PieceInfo } from "@shared/types/patterns";

export function ShopPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [pieces, setPieces] = useState<PieceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selections, loaded: selectionsLoaded, fetch: fetchSelections, addGarment, removeGarment } =
    useSelectionsStore();
  const [showWarning, setShowWarning] = useState(false);
  const warningTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    fetchPieces()
      .then(setPieces)
      .catch(() => setError(t("shop.error")))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    if (!selectionsLoaded) fetchSelections();
  }, [selectionsLoaded, fetchSelections]);

  const isSelected = (patternType: string) =>
    selections.some((s) => s.garment_name === patternType);

  const activeCount = pieces.filter((p) => isSelected(p.pattern_type)).length;

  const handleGoClick = () => {
    if (activeCount > 0) {
      navigate("/modelist");
    } else {
      setShowWarning(true);
      clearTimeout(warningTimer.current);
      warningTimer.current = setTimeout(() => setShowWarning(false), 2000);
    }
  };

  const handleToggle = async (piece: PieceInfo) => {
    if (isSelected(piece.pattern_type)) {
      await removeGarment(piece.pattern_type);
    } else {
      await addGarment(piece.pattern_type);
    }
  };

  return (
    <>
      <BackLink />
      <PageHeading>{t("shop.title")}</PageHeading>

      {loading && (
        <p className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
          {t("shop.loading")}
        </p>
      )}

      {error && (
        <p className="py-12 text-center text-sm text-red-500">{error}</p>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pieces.map((piece) => (
            <PatternCard
              key={piece.pattern_type}
              piece={piece}
              selected={isSelected(piece.pattern_type)}
              onToggle={() => handleToggle(piece)}
            />
          ))}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white/95 px-6 py-4 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95">
        <div className="mx-auto flex max-w-5xl items-center justify-end gap-3">
          {showWarning && (
            <span className="text-sm text-amber-600 dark:text-amber-400">
              {t("shop.selectFirst")}
            </span>
          )}
          <button
            onClick={handleGoClick}
            className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors ${
              activeCount > 0
                ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                : "cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-500"
            }`}
          >
            {t("shop.goToModelist")}{activeCount > 0 && ` (${activeCount})`}
          </button>
        </div>
      </div>
    </>
  );
}
