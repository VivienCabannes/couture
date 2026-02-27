import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BackLink } from "../../components/BackLink";
import { PageHeading } from "../../components/PageHeading";
import { PatternCard } from "./PatternCard";
import { fetchGarments } from "@shared/api";
import type { GarmentInfo } from "@shared/types/patterns";

export function ShopPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [garments, setGarments] = useState<GarmentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGarments()
      .then(setGarments)
      .catch(() => setError(t("shop.error")))
      .finally(() => setLoading(false));
  }, [t]);

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
              onClick={() => navigate(`/modelist/${g.name}`)}
            />
          ))}
        </div>
      )}
    </>
  );
}
