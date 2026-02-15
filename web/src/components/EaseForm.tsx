import type { EaseInput } from "@shared/types";

interface Props {
  value: EaseInput;
  onChange: (ease: EaseInput) => void;
}

const fields: { key: keyof EaseInput; label: string }[] = [
  { key: "bustEase", label: "Bust ease" },
  { key: "waistEase", label: "Waist ease" },
  { key: "hipEase", label: "Hip ease" },
];

export default function EaseForm({ value, onChange }: Props) {
  return (
    <div className="space-y-3">
      {fields.map((field) => (
        <div key={field.key} className="flex items-center gap-2">
          <label className="flex-1 text-xs text-gray-600">{field.label}</label>
          <input
            type="number"
            step="0.1"
            className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm text-right outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            value={value[field.key] ?? 0}
            onChange={(e) =>
              onChange({ ...value, [field.key]: parseFloat(e.target.value) || 0 })
            }
          />
          <span className="text-xs text-gray-500 w-5">cm</span>
        </div>
      ))}
    </div>
  );
}
