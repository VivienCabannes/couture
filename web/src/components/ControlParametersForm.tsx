import type { ControlParameterDefinition } from "@shared/types";

interface Props {
  parameters: ControlParameterDefinition[];
  values: Record<string, number>;
  onChange: (name: string, value: number) => void;
}

export default function ControlParametersForm({ parameters, values, onChange }: Props) {
  if (parameters.length === 0) return null;

  return (
    <div>
      <div className="space-y-4">
        {parameters.map((param) => {
          const val = values[param.name] ?? param.default;
          return (
            <div key={param.name}>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span title={param.description}>{param.description}</span>
                <span className="font-mono text-xs text-gray-500">{val.toFixed(2)}</span>
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
