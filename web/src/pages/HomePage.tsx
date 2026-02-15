import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPatternTypes } from "../api/patterns";
import type { PatternTypeInfo } from "@shared/types";

export default function HomePage() {
  const [types, setTypes] = useState<PatternTypeInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatternTypes()
      .then(setTypes)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-gray-500">Loading pattern types...</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-8">Choose a Pattern</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {types.map((t) => (
          <Link
            key={t.name}
            to={`/pattern/${t.name}`}
            className="block p-7 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{t.label}</h2>
            <p className="text-sm text-gray-600">
              {t.required_measurements.length} measurements
              {t.supports_stretch && " · stretch support"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
