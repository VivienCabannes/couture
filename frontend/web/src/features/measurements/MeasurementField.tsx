import { useRef } from "react";
import { useTranslation } from "react-i18next";
import type { MeasurementField as Field } from "@shared/types";
import { FIELD_LABELS, FIELD_STEPS } from "@shared/data";

interface Props {
  field: Field;
  value: number;
  isIdk: boolean;
  isActive?: boolean;
  onValueChange: (field: Field, value: number) => void;
  onIdkToggle: (field: Field) => void;
  onFocus: (field: Field) => void;
  onHover?: (field: Field | null) => void;
}

export function MeasurementFieldRow({
  field,
  value,
  isIdk,
  isActive,
  onValueChange,
  onIdkToggle,
  onFocus,
  onHover,
}: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className={`flex h-9 cursor-text items-center gap-1.5 rounded px-2 transition-colors ${
        isActive
          ? "bg-blue-50 dark:bg-blue-950/30"
          : "hover:bg-gray-50 dark:hover:bg-gray-800/40"
      }`}
      data-field={field}
      onMouseEnter={() => onHover?.(field)}
      onMouseLeave={() => onHover?.(null)}
    >
      <span className="shrink-0 text-[13px] text-gray-900 dark:text-gray-100">
        {t(FIELD_LABELS[field])}
      </span>
      <span className="min-w-3 flex-1 border-b border-dotted border-gray-300 dark:border-gray-600" />
      <input
        ref={inputRef}
        type="number"
        value={isIdk ? "" : value}
        step={FIELD_STEPS[field]}
        disabled={isIdk}
        onFocus={() => onFocus(field)}
        onChange={(e) => onValueChange(field, parseFloat(e.target.value) || 0)}
        className="w-[80px] shrink-0 rounded border border-gray-300 bg-transparent px-2 py-1.5 text-center text-sm outline-none transition-colors focus:border-blue-600 disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-600 dark:text-gray-50 dark:focus:border-blue-400 dark:disabled:bg-gray-900 dark:disabled:text-gray-500"
      />
      <span className="shrink-0 text-[11px] text-gray-400 dark:text-gray-500">
        cm
      </span>
      <label
        className="flex shrink-0 cursor-pointer items-center gap-0.5 text-[11px] text-gray-400 dark:text-gray-500"
        title={t("measurements.idk") ?? "I don't know"}
      >
        <input
          type="checkbox"
          checked={isIdk}
          onChange={() => onIdkToggle(field)}
          className="cursor-pointer"
        />
        ?
      </label>
    </div>
  );
}
