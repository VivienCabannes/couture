import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BackLink } from "../../components/BackLink";
import { PageHeading } from "../../components/PageHeading";
import { PatternCard } from "./PatternCard";
import { fetchGarments } from "@shared/api";
import { useSelectionsStore } from "../../stores";
import type { GarmentInfo } from "@shared/types/patterns";

export function ShopPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [garments, setGarments] = useState<GarmentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selections, loaded: selectionsLoaded, fetch: fetchSelections, addGarment, removeGarment } =
    useSelectionsStore();

  useEffect(() => {
    fetchGarments()
      .then(setGarments)
      .catch(() => setError(t("shop.error")))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    if (!selectionsLoaded) fetchSelections();
  }, [selectionsLoaded, fetchSelections]);

  const isSelected = (name: string) =>
    selections.some((s) => s.garment_name === name);

  const handleToggle = async (garment: GarmentInfo) => {
    if (isSelected(garment.name)) {
      await removeGarment(garment.name);
    } else {
      await addGarment(garment.name);
      navigate(`/modelist/${garment.name}`);
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
          {garments.map((g) => (
            <PatternCard
              key={g.name}
              garment={g}
              selected={isSelected(g.name)}
              onToggle={() => handleToggle(g)}
              onClick={() => navigate(`/modelist/${g.name}`)}
            />
          ))}
        </div>
      )}
    </>
  );
}
