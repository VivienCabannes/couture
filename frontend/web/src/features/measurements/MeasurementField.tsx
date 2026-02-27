import { useTranslation } from "react-i18next";
import type { MeasurementField as Field } from "@shared/types";
import { FIELD_LABELS, FIELD_STEPS } from "./useMeasurements";

interface Props {
  field: Field;
  value: number;
  isIdk: boolean;
  onValueChange: (field: Field, value: number) => void;
  onIdkToggle: (field: Field) => void;
  onFocus: (field: Field) => void;
}

export function MeasurementFieldRow({
  field,
  value,
  isIdk,
  onValueChange,
  onIdkToggle,
  onFocus,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-700 transition-colors dark:text-gray-300">
        {t(FIELD_LABELS[field])}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={isIdk ? "" : value}
          step={FIELD_STEPS[field]}
          disabled={isIdk}
          onFocus={() => onFocus(field)}
          onChange={(e) => onValueChange(field, parseFloat(e.target.value) || 0)}
          className="min-w-0 flex-1 rounded-md border border-gray-300 bg-transparent px-2.5 py-1.5 font-sans text-[0.8125rem] outline-none transition-colors focus:border-blue-600 disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-600 dark:text-gray-50 dark:focus:border-blue-400 dark:disabled:bg-gray-900 dark:disabled:text-gray-500"
        />
        <span className="text-[0.8125rem] text-gray-700 dark:text-gray-300">
          cm
        </span>
        <label className="flex cursor-pointer items-center gap-1 whitespace-nowrap text-[0.6875rem] text-gray-500 dark:text-gray-400">
          <input
            type="checkbox"
            checked={isIdk}
            onChange={() => onIdkToggle(field)}
            className="cursor-pointer"
          />
          ?
        </label>
      </div>
    </div>
  );
}
