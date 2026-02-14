import type { StretchInput } from "../types";

interface Props {
  value: StretchInput;
  onChange: (stretch: StretchInput) => void;
}

export default function StretchForm({ value, onChange }: Props) {
  const update = (field: keyof StretchInput, v: number) => {
    onChange({ ...value, [field]: v });
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Stretch Settings</h3>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-0.5">
            <span>Horizontal stretch</span>
            <span className="font-mono">{(value.horizontal * 100).toFixed(0)}%</span>
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
          <div className="flex justify-between text-xs text-gray-500 mb-0.5">
            <span>Vertical stretch</span>
            <span className="font-mono">{(value.vertical * 100).toFixed(0)}%</span>
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
          <div className="flex justify-between text-xs text-gray-500 mb-0.5">
            <span>Usage</span>
            <span className="font-mono">{(value.usage * 100).toFixed(0)}%</span>
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
