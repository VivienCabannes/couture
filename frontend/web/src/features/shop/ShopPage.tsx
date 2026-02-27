import { useEffect, useState } from "react";
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

  const handleToggle = async (piece: PieceInfo) => {
    if (isSelected(piece.pattern_type)) {
      await removeGarment(piece.pattern_type);
    } else {
      await addGarment(piece.pattern_type);
      navigate("/modelist");
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
    </>
  );
}
