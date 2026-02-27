import { useTranslation } from "react-i18next";
import type { usePatternForm } from "@shared/hooks/usePatternForm";
import type { ControlParameterDefinition } from "@shared/types/patterns";

interface Props {
  form: ReturnType<typeof usePatternForm>;
}

export function PieceControls({ form }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2">
      {/* Size selector */}
      <details
        open
        className="overflow-hidden rounded-[10px] border border-gray-200 bg-white transition-colors dark:border-gray-700 dark:bg-gray-800"
      >
        <summary className="flex cursor-pointer list-none items-center gap-2 p-3 px-4 text-sm font-semibold text-gray-900 transition-colors dark:text-gray-50">
          <span className="inline-block transition-transform [[open]>&]:rotate-90">
            &#9656;
          </span>
          {t("modelist.size")}
        </summary>
        <div className="px-4 pb-4">
          <select
            value={form.selectedSize ?? 38}
            onChange={(e) => form.setSelectedSize(Number(e.target.value))}
            className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:border-blue-600 dark:border-gray-600 dark:text-gray-50 dark:focus:border-blue-400"
          >
            {[34, 36, 38, 40, 42, 44, 46, 48].map((s) => (
              <option key={s} value={s}>
                T{s}
              </option>
            ))}
          </select>
        </div>
      </details>

      {/* Stretch */}
      {form.patternInfo?.supports_stretch && (
        <details className="overflow-hidden rounded-[10px] border border-gray-200 bg-white transition-colors dark:border-gray-700 dark:bg-gray-800">
          <summary className="flex cursor-pointer list-none items-center gap-2 p-3 px-4 text-sm font-semibold text-gray-900 transition-colors dark:text-gray-50">
            <span className="inline-block transition-transform [[open]>&]:rotate-90">
              &#9656;
            </span>
            {t("modelist.stretch")}
          </summary>
          <div className="px-4 pb-4">
            <ControlRow
              label="Horizontal (%)"
              value={form.stretch.horizontal * 100}
              onChange={(v) =>
                form.setStretch({ ...form.stretch, horizontal: v / 100 })
              }
            />
            <ControlRow
              label="Vertical (%)"
              value={form.stretch.vertical * 100}
              onChange={(v) =>
                form.setStretch({ ...form.stretch, vertical: v / 100 })
              }
            />
          </div>
        </details>
      )}

      {/* Advanced controls */}
      {form.patternInfo && form.patternInfo.control_parameters.length > 0 && (
        <details className="overflow-hidden rounded-[10px] border border-gray-200 bg-white transition-colors dark:border-gray-700 dark:bg-gray-800">
          <summary className="flex cursor-pointer list-none items-center gap-2 p-3 px-4 text-sm font-semibold text-gray-900 transition-colors dark:text-gray-50">
            <span className="inline-block transition-transform [[open]>&]:rotate-90">
              &#9656;
            </span>
            {t("modelist.advancedControls")}
          </summary>
          <div className="px-4 pb-4">
            {form.patternInfo.control_parameters.map((cp: ControlParameterDefinition) => (
              <ControlRow
                key={cp.name}
                label={cp.name}
                value={form.controlParams[cp.name] ?? cp.default}
                onChange={(v) => form.updateControlParam(cp.name, v)}
              />
            ))}
          </div>
        </details>
      )}

      {/* Generate button */}
      <button
        onClick={form.handleGenerate}
        disabled={form.loading}
        className="mt-2 w-full cursor-pointer rounded-lg border-none bg-blue-600 px-4 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {form.loading ? t("modelist.generating") : t("modelist.generate")}
      </button>

      {form.error && (
        <p className="text-sm text-red-500">{form.error}</p>
      )}
    </div>
  );
}

function ControlRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 text-[0.8125rem] text-gray-700 dark:text-gray-300">
      <label className="flex-1">{label}</label>
      <input
        type="number"
        value={value}
        step={0.1}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-[72px] rounded-md border border-gray-300 bg-transparent px-2 py-1 text-right font-sans text-[0.8125rem] outline-none transition-colors focus:border-blue-600 dark:border-gray-600 dark:text-gray-50 dark:focus:border-blue-400"
      />
    </div>
  );
}
