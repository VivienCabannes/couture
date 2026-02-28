import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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

const selectClass =
  "cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 font-sans text-sm text-gray-900 outline-none transition-colors focus:border-blue-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-50 dark:focus:border-blue-400";

export function MeasurementsPage() {
  const { t } = useTranslation();
  const {
    values,
    idk,
    size,
    preset,
    updateField,
    toggleIdk,
    applySize,
    applyPreset,
    fetch,
    loaded,
  } = useMeasurementsStore();
  const [activeField, setActiveField] = useState<MeasurementField | null>(null);

  useEffect(() => {
    if (!loaded) fetch();
  }, [loaded, fetch]);

  /** Clicking an indicator on the body scrolls to and focuses the matching input. */
  const handleFieldSelect = useCallback((field: MeasurementField) => {
    const el = document.querySelector<HTMLElement>(`[data-field="${field}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      const input = el.querySelector<HTMLInputElement>("input[type=number]");
      input?.focus();
    }
  }, []);

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-4">
        <div className="ml-auto flex flex-wrap gap-2">
        <select aria-label="Country" className={selectClass}>
          <option value="FR">{t("measurements.france")}</option>
          <option value="US">{t("measurements.unitedStates")}</option>
          <option value="UK">{t("measurements.unitedKingdom")}</option>
        </select>
        <select
          aria-label="Size"
          value={size}
          onChange={(e) => applySize(parseInt(e.target.value))}
          className={selectClass}
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
          className={selectClass}
        >
          <option value="">{t("measurements.presetNone")}</option>
          <option value="kwama">{t("measurements.presetKwama")}</option>
          <option value="vivien">{t("measurements.presetVivien")}</option>
        </select>
        </div>
      </div>

      <div className="flex gap-8 max-lg:flex-col">
        {/* Left: Body diagrams */}
        <div className="flex-[45] items-start justify-center">
          <BodySilhouette
            values={values}
            activeField={activeField}
            onFieldSelect={handleFieldSelect}
            onFieldHover={setActiveField}
          />
        </div>

        {/* Right: Measurements list */}
        <div className="min-w-0 max-w-[480px]">
          {MEASUREMENT_SECTIONS.flatMap((s) => s.fields).map((field) => (
            <MeasurementFieldRow
              key={field}
              field={field}
              value={values[field]}
              isIdk={!!idk[field]}
              isActive={activeField === field}
              onValueChange={updateField}
              onIdkToggle={toggleIdk}
              onFocus={setActiveField}
              onHover={setActiveField}
            />
          ))}
        </div>
      </div>
    </>
  );
}
