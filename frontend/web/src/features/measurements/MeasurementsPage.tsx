import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BackLink } from "../../components/BackLink";
import { PageHeading } from "../../components/PageHeading";
import { BodySilhouette } from "./BodySilhouette";
import { MeasurementFieldRow } from "./MeasurementField";
import { MEASUREMENT_SECTIONS } from "@shared/data";
import { useMeasurementsStore } from "../../stores";
import type { MeasurementField } from "@shared/types";

const SIZES = [
  { value: 34, label: "T34 (XS)" },
  { value: 36, label: "T36 (S)" },
  { value: 38, label: "T38 (M)" },
  { value: 40, label: "T40 (M/L)" },
  { value: 42, label: "T42 (L)" },
  { value: 44, label: "T44 (XL)" },
  { value: 46, label: "T46 (XXL)" },
  { value: 48, label: "T48 (XXXL)" },
];

export function MeasurementsPage() {
  const { t } = useTranslation();
  const { values, idk, size, preset, updateField, toggleIdk, applySize, applyPreset, fetch, loaded } =
    useMeasurementsStore();
  const [activeField, setActiveField] = useState<MeasurementField | null>(null);

  useEffect(() => {
    if (!loaded) fetch();
  }, [loaded, fetch]);

  return (
    <>
      <BackLink />
      <PageHeading>{t("measurements.title")}</PageHeading>

      <div className="flex gap-8 max-lg:flex-col">
        {/* Left: Body silhouette (45%) */}
        <div className="flex flex-[45] items-start justify-center">
          <BodySilhouette activeField={activeField} />
        </div>

        {/* Right: Inputs (55%) */}
        <div className="flex-[55]">
          {/* Size selector */}
          <div className="mb-6 flex flex-wrap gap-3">
            <select
              aria-label="Country"
              className="cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 font-sans text-sm text-gray-900 outline-none transition-colors focus:border-blue-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-50 dark:focus:border-blue-400"
            >
              <option value="FR">{t("measurements.france")}</option>
              <option value="US">{t("measurements.unitedStates")}</option>
              <option value="UK">{t("measurements.unitedKingdom")}</option>
            </select>
            <select
              aria-label="Size"
              value={size}
              onChange={(e) => applySize(parseInt(e.target.value))}
              className="cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 font-sans text-sm text-gray-900 outline-none transition-colors focus:border-blue-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-50 dark:focus:border-blue-400"
            >
              {SIZES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <select
              aria-label={t("measurements.preset")}
              value={preset ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                if (v) {
                  applyPreset(v);
                } else {
                  applySize(size);
                }
              }}
              className="cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 font-sans text-sm text-gray-900 outline-none transition-colors focus:border-blue-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-50 dark:focus:border-blue-400"
            >
              <option value="">{t("measurements.presetNone")}</option>
              <option value="kwama">{t("measurements.presetKwama")}</option>
              <option value="vivien">{t("measurements.presetVivien")}</option>
            </select>
          </div>

          {/* Measurement fields grid */}
          <div className="grid grid-cols-2 gap-x-5 gap-y-3 max-[480px]:grid-cols-1">
            {MEASUREMENT_SECTIONS.map((section) => (
              <div key={section.sectionKey} className="contents">
                <div className="col-span-full mt-2 border-b border-gray-200 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-blue-600 transition-colors dark:border-gray-700 dark:text-blue-400">
                  {t(section.sectionKey)}
                </div>
                {section.fields.map((field) => (
                  <MeasurementFieldRow
                    key={field}
                    field={field}
                    value={values[field]}
                    isIdk={!!idk[field]}
                    onValueChange={updateField}
                    onIdkToggle={toggleIdk}
                    onFocus={setActiveField}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
