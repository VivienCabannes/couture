import type { StretchInput } from "@shared/types";

interface Props {
  value: StretchInput;
  onChange: (stretch: StretchInput) => void;
}

export default function StretchForm({ value, onChange }: Props) {
  const update = (field: keyof StretchInput, v: number) => {
    onChange({ ...value, [field]: v });
  };

  return (
    <div>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Horizontal stretch</span>
            <span className="font-mono text-xs text-gray-500">{(value.horizontal * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.01"
            className="w-full"
            value={value.horizontal}
            onChange={(e) => update("horizontal", parseFloat(e.target.value))}
          />
        </div>
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Vertical stretch</span>
            <span className="font-mono text-xs text-gray-500">{(value.vertical * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.01"
            className="w-full"
            value={value.vertical}
            onChange={(e) => update("vertical", parseFloat(e.target.value))}
          />
        </div>
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Usage</span>
            <span className="font-mono text-xs text-gray-500">{(value.usage * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            className="w-full"
            value={value.usage}
            onChange={(e) => update("usage", parseFloat(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}
