import { useState } from "react";
import { useTranslation } from "react-i18next";

type Stretch = "none" | "low" | "medium" | "high";
type Drape = "stiff" | "moderate" | "fluid";
type WeightCategory = "light" | "medium" | "heavy";

interface Fabric {
  nameKey: string;
  usesKey: string;
  material: string;
  weight: number;
  weightCategory: WeightCategory;
  stretch: Stretch;
  drape: Drape;
}

const FABRICS: Fabric[] = [
  { nameKey: "cottonPoplin", usesKey: "cottonPoplinUses", material: "cotton", weight: 120, weightCategory: "light", stretch: "none", drape: "stiff" },
  { nameKey: "cottonJersey", usesKey: "cottonJerseyUses", material: "cotton", weight: 180, weightCategory: "medium", stretch: "medium", drape: "moderate" },
  { nameKey: "linen", usesKey: "linenUses", material: "linen", weight: 160, weightCategory: "medium", stretch: "none", drape: "moderate" },
  { nameKey: "silkCharmeuse", usesKey: "silkCharmeuseUses", material: "silk", weight: 80, weightCategory: "light", stretch: "low", drape: "fluid" },
  { nameKey: "silkOrganza", usesKey: "silkOrganzaUses", material: "silk", weight: 50, weightCategory: "light", stretch: "none", drape: "stiff" },
  { nameKey: "woolCrepe", usesKey: "woolCrepeUses", material: "wool", weight: 220, weightCategory: "medium", stretch: "low", drape: "moderate" },
  { nameKey: "denim", usesKey: "denimUses", material: "cotton", weight: 350, weightCategory: "heavy", stretch: "none", drape: "stiff" },
  { nameKey: "chiffon", usesKey: "chiffonUses", material: "silk", weight: 40, weightCategory: "light", stretch: "none", drape: "fluid" },
  { nameKey: "velvet", usesKey: "velvetUses", material: "silk", weight: 300, weightCategory: "heavy", stretch: "low", drape: "moderate" },
  { nameKey: "neoprene", usesKey: "neopreneUses", material: "synthetic", weight: 280, weightCategory: "heavy", stretch: "high", drape: "stiff" },
];

const MATERIALS = ["cotton", "silk", "wool", "linen", "synthetic"] as const;

const STRETCH_COLORS: Record<Stretch, string> = {
  none: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  low: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  high: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

const DRAPE_COLORS: Record<Drape, string> = {
  stiff: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  moderate: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  fluid: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
};

export function FabricsPage() {
  const { t } = useTranslation();
  const [materialFilter, setMaterialFilter] = useState<string>("all");
  const [weightFilter, setWeightFilter] = useState<string>("all");
  const [stretchFilter, setStretchFilter] = useState<string>("all");

  const filtered = FABRICS.filter((f) => {
    if (materialFilter !== "all" && f.material !== materialFilter) return false;
    if (weightFilter !== "all" && f.weightCategory !== weightFilter) return false;
    if (stretchFilter !== "all" && f.stretch !== stretchFilter) return false;
    return true;
  });

  return (
    <>
      {/* Filter bar */}
      <div className="mb-6 flex flex-wrap gap-3">
        <select
          value={materialFilter}
          onChange={(e) => setMaterialFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500"
        >
          <option value="all">{t("fabrics.allMaterials")}</option>
          {MATERIALS.map((m) => (
            <option key={m} value={m}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={weightFilter}
          onChange={(e) => setWeightFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500"
        >
          <option value="all">{t("fabrics.allWeights")}</option>
          <option value="light">{t("fabrics.weightLight")}</option>
          <option value="medium">{t("fabrics.weightMedium")}</option>
          <option value="heavy">{t("fabrics.weightHeavy")}</option>
        </select>

        <select
          value={stretchFilter}
          onChange={(e) => setStretchFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500"
        >
          <option value="all">{t("fabrics.allStretch")}</option>
          <option value="none">{t("fabrics.stretchNone")}</option>
          <option value="low">{t("fabrics.stretchLow")}</option>
          <option value="medium">{t("fabrics.stretchMedium")}</option>
          <option value="high">{t("fabrics.stretchHigh")}</option>
        </select>
      </div>

      {/* Fabric card grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((fabric) => (
          <div
            key={fabric.nameKey}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-50">
              {t(`fabrics.${fabric.nameKey}`)}
            </h3>

            <div className="mb-3 flex flex-wrap gap-1.5">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STRETCH_COLORS[fabric.stretch]}`}>
                {t(`fabrics.stretch${fabric.stretch.charAt(0).toUpperCase() + fabric.stretch.slice(1)}`)}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${DRAPE_COLORS[fabric.drape]}`}>
                {t(`fabrics.drape${fabric.drape.charAt(0).toUpperCase() + fabric.drape.slice(1)}`)}
              </span>
            </div>

            <dl className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <dt className="font-medium text-gray-700 dark:text-gray-300">{t("fabrics.material")}</dt>
                <dd className="capitalize">{fabric.material}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-700 dark:text-gray-300">{t("fabrics.weight")}</dt>
                <dd>{fabric.weight}</dd>
              </div>
            </dl>

            <div className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {t("fabrics.recommendedFor")}
              </p>
              <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-300">
                {t(`fabrics.${fabric.usesKey}`)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
