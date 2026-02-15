interface Props {
  value: number;
  onChange: (value: number) => void;
}

export default function SeamAllowanceForm({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <label className="flex-1 text-xs text-gray-600">Seam allowance</label>
      <input
        type="number"
        step="0.1"
        className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm text-right outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      />
      <span className="text-xs text-gray-500 w-5">cm</span>
    </div>
  );
}
