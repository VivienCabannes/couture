import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPatternTypes, generatePattern, downloadPatternPdf } from "../api/patterns";
import { fetchDefaultMeasurements } from "../api/measurements";
import type { PatternTypeInfo, PatternResponse, StretchInput } from "../types";
import SizeSelector from "../components/SizeSelector";
import MeasurementForm from "../components/MeasurementForm";
import ControlParametersForm from "../components/ControlParametersForm";
import StretchForm from "../components/StretchForm";
import PatternPreview from "../components/PatternPreview";

export default function PatternPage() {
  const { type } = useParams<{ type: string }>();
  const [patternInfo, setPatternInfo] = useState<PatternTypeInfo | null>(null);
  const [selectedSize, setSelectedSize] = useState<number | null>(38);
  const [measurements, setMeasurements] = useState<Record<string, number>>({});
  const [controlParams, setControlParams] = useState<Record<string, number>>({});
  const [stretch, setStretch] = useState<StretchInput>({ horizontal: 0, vertical: 0, usage: 1 });
  const [result, setResult] = useState<PatternResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load pattern type info
  useEffect(() => {
    fetchPatternTypes().then((types) => {
      const info = types.find((t) => t.name === type);
      if (info) {
        setPatternInfo(info);
        // Initialize control params with defaults
        const defaults: Record<string, number> = {};
        info.control_parameters.forEach((p) => {
          defaults[p.name] = p.default;
        });
        setControlParams(defaults);
      }
    });
  }, [type]);

  // Load default measurements when size changes
  useEffect(() => {
    if (selectedSize !== null && patternInfo?.name === "corset") {
      fetchDefaultMeasurements(selectedSize).then((m) => {
        setMeasurements(m as unknown as Record<string, number>);
      });
    }
  }, [selectedSize, patternInfo]);

  const handleGenerate = useCallback(async () => {
    if (!type) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await generatePattern({
        pattern_type: type,
        measurements,
        control_parameters: Object.keys(controlParams).length > 0 ? controlParams : undefined,
        stretch: stretch.horizontal > 0 || stretch.vertical > 0 ? stretch : undefined,
        output_format: "all",
      });
      setResult(resp);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }, [type, measurements, controlParams, stretch]);

  const handleDownloadPdf = useCallback(
    () => {
      if (!type) return;
      downloadPatternPdf({
        pattern_type: type,
        measurements,
        control_parameters: Object.keys(controlParams).length > 0 ? controlParams : undefined,
        stretch: stretch.horizontal > 0 || stretch.vertical > 0 ? stretch : undefined,
        output_format: "pdf",
      });
    },
    [type, measurements, controlParams, stretch]
  );

  if (!patternInfo) {
    return <p className="text-gray-500">Loading...</p>;
  }

  return (
    <div>
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 px-3 py-1.5 rounded-full mb-6 transition-colors">
        &larr; Back to patterns
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-8">{patternInfo.label}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left panel: forms */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-2">
          {patternInfo.name === "corset" && (
            <SizeSelector value={selectedSize} onChange={setSelectedSize} />
          )}

          <MeasurementForm
            fields={patternInfo.required_measurements}
            values={measurements}
            onChange={(name, value) =>
              setMeasurements((prev) => ({ ...prev, [name]: value }))
            }
          />

          <ControlParametersForm
            parameters={patternInfo.control_parameters}
            values={controlParams}
            onChange={(name, value) =>
              setControlParams((prev) => ({ ...prev, [name]: value }))
            }
          />

          {patternInfo.supports_stretch && (
            <StretchForm value={stretch} onChange={setStretch} />
          )}

          <button
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Pattern"}
          </button>
          </div>
        </div>

        {/* Right panel: preview */}
        <div className="lg:col-span-2">
          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {result && (
            <>
              <PatternPreview
                constructionSvg={result.construction_svg}
                patternSvg={result.pattern_svg}
              />

              <div className="mt-4 flex gap-3">
                <button
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  onClick={() => handleDownloadPdf()}
                >
                  Download PDF
                </button>
              </div>

              {result.warnings.length > 0 && (
                <div className="mt-4 bg-amber-50 rounded-lg px-4 py-3">
                  <h4 className="text-sm font-semibold text-amber-800 mb-1">Warnings</h4>
                  <ul className="text-sm text-amber-700 list-disc list-inside">
                    {result.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {!result && !error && (
            <div className="text-gray-400 text-center py-24 border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-lg">Configure measurements and click Generate to preview the pattern.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
