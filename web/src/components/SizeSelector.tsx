import { useEffect, useState } from "react";
import { fetchSizes } from "../api/measurements";

interface Props {
  value: number | null;
  onChange: (size: number | null) => void;
}

export default function SizeSelector({ value, onChange }: Props) {
  const [sizes, setSizes] = useState<number[]>([]);

  useEffect(() => {
    fetchSizes().then(setSizes);
  }, []);

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Standard Size
      </label>
      <select
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        value={value ?? "custom"}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "custom" ? null : Number(v));
        }}
      >
        <option value="custom">Custom measurements</option>
        {sizes.map((s) => (
          <option key={s} value={s}>
            T{s}
          </option>
        ))}
      </select>
    </div>
  );
}
