import { useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { downloadPatternPdf } from "../api/patterns";
import { usePatternForm } from "@shared/hooks/usePatternForm";
import CollapsibleSection from "../components/CollapsibleSection";
import SizeSelector from "../components/SizeSelector";
import MeasurementForm from "../components/MeasurementForm";
import EaseForm from "../components/EaseForm";
import SeamAllowanceForm from "../components/SeamAllowanceForm";
import ControlParametersForm from "../components/ControlParametersForm";
import StretchForm from "../components/StretchForm";
import PatternPreview from "../components/PatternPreview";

export default function PatternPage() {
  const { type } = useParams<{ type: string }>();
  const form = usePatternForm({ type: type! });

  const handleDownloadPdf = useCallback(() => {
    downloadPatternPdf(form.buildRequest("pdf"));
  }, [form.buildRequest]);

  if (!form.patternInfo) {
    return <p className="text-gray-500">Loading...</p>;
  }

  return (
    <div>
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 px-3 py-1.5 rounded-full mb-6 transition-colors">
        &larr; Back to patterns
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-8">{form.patternInfo.label}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left panel: forms */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-2">
            {/* Size */}
            <CollapsibleSection title="Size" defaultExpanded>
              <SizeSelector value={form.selectedSize} onChange={form.setSelectedSize} />
              <label className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                <input
                  type="checkbox"
                  checked={form.showAdvancedMeasurements}
                  onChange={(e) => form.setShowAdvancedMeasurements(e.target.checked)}
                />
                Show custom measurements
              </label>
              {form.showAdvancedMeasurements && (
                <div className="mt-3">
                  <MeasurementForm
                    fields={form.patternInfo.required_measurements}
                    values={form.measurements}
                    onChange={form.updateMeasurement}
                  />
                </div>
              )}
            </CollapsibleSection>

            {/* Ease */}
            <CollapsibleSection title="Ease">
              <EaseForm value={form.ease} onChange={form.setEase} />
            </CollapsibleSection>

            {/* Seam Allowance */}
            <CollapsibleSection title="Seam Allowance">
              <SeamAllowanceForm value={form.seamAllowance} onChange={form.setSeamAllowance} />
            </CollapsibleSection>

            {/* Transformations */}
            {form.patternInfo.supports_stretch && (
              <CollapsibleSection title="Transformations">
                <StretchForm value={form.stretch} onChange={form.setStretch} />
              </CollapsibleSection>
            )}

            {/* Advanced Controls */}
            {form.patternInfo.control_parameters.length > 0 && (
              <CollapsibleSection title="Advanced Controls">
                <ControlParametersForm
                  parameters={form.patternInfo.control_parameters}
                  values={form.controlParams}
                  onChange={form.updateControlParam}
                />
              </CollapsibleSection>
            )}

            <button
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
              onClick={form.handleGenerate}
              disabled={form.loading}
            >
              {form.loading ? "Generating..." : "Generate Pattern"}
            </button>
          </div>
        </div>

        {/* Right panel: preview */}
        <div className="lg:col-span-2">
          {form.error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {form.error}
            </div>
          )}

          {form.result && (
            <>
              <PatternPreview
                constructionSvg={form.result.construction_svg}
                patternSvg={form.result.pattern_svg}
              />

              <div className="mt-4 flex gap-3">
                <button
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  onClick={handleDownloadPdf}
                >
                  Download PDF
                </button>
              </div>

              {form.result.warnings.length > 0 && (
                <div className="mt-4 bg-amber-50 rounded-lg px-4 py-3">
                  <h4 className="text-sm font-semibold text-amber-800 mb-1">Warnings</h4>
                  <ul className="text-sm text-amber-700 list-disc list-inside">
                    {form.result.warnings.map((w: string, i: number) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {!form.result && !form.error && (
            <div className="text-gray-400 text-center py-24 border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-lg">Configure measurements and click Generate to preview the pattern.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
