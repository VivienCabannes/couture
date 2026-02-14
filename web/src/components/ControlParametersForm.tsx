import type { ControlParameterDefinition } from "../types";

interface Props {
  parameters: ControlParameterDefinition[];
  values: Record<string, number>;
  onChange: (name: string, value: number) => void;
}

export default function ControlParametersForm({ parameters, values, onChange }: Props) {
  if (parameters.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Control Parameters</h3>
      <div className="space-y-3">
        {parameters.map((param) => {
          const val = values[param.name] ?? param.default;
          return (
            <div key={param.name}>
              <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                <span title={param.description}>{param.description}</span>
                <span className="font-mono">{val.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                className="w-full"
                value={val}
                onChange={(e) => onChange(param.name, parseFloat(e.target.value))}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
