import type { MeasurementFieldDefinition } from "../types";

interface Props {
  fields: MeasurementFieldDefinition[];
  values: Record<string, number>;
  onChange: (name: string, value: number) => void;
}

export default function MeasurementForm({ fields, values, onChange }: Props) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Measurements (cm)</h3>
      <div className="grid grid-cols-2 gap-3">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-xs text-gray-500 mb-0.5" title={field.description}>
              {field.description}
            </label>
            <input
              type="number"
              step="0.1"
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
              value={values[field.name] ?? ""}
              onChange={(e) => onChange(field.name, parseFloat(e.target.value) || 0)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
