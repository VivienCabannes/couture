import type { MeasurementFieldDefinition } from "@shared/types";

interface Props {
  fields: MeasurementFieldDefinition[];
  values: Record<string, number>;
  onChange: (name: string, value: number) => void;
}

export default function MeasurementForm({ fields, values, onChange }: Props) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-xs font-medium text-gray-600 mb-1" title={field.description}>
              {field.description}
            </label>
            <input
              type="number"
              step="0.1"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              value={values[field.name] ?? ""}
              onChange={(e) => onChange(field.name, parseFloat(e.target.value) || 0)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
