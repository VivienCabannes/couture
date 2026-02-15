import { useCallback, useEffect, useState } from "react";
import { fetchPatternTypes, generatePattern } from "../api/patterns";
import { fetchDefaultMeasurements } from "../api/measurements";
import type {
  PatternTypeInfo,
  PatternResponse,
  PatternRequest,
  StretchInput,
  EaseInput,
} from "../types";

interface UsePatternFormOptions {
  type: string;
  onError?: (message: string) => void;
}

export function usePatternForm({ type, onError }: UsePatternFormOptions) {
  const [patternInfo, setPatternInfo] = useState<PatternTypeInfo | null>(null);
  const [selectedSize, setSelectedSize] = useState<number | null>(38);
  const [showAdvancedMeasurements, setShowAdvancedMeasurements] = useState(false);
  const [measurements, setMeasurements] = useState<Record<string, number>>({});
  const [controlParams, setControlParams] = useState<Record<string, number>>({});
  const [stretch, setStretch] = useState<StretchInput>({ horizontal: 0, vertical: 0, usage: 1 });
  const [ease, setEase] = useState<EaseInput>({ bustEase: 0, waistEase: 0, hipEase: 0 });
  const [seamAllowance, setSeamAllowance] = useState(1.0);
  const [result, setResult] = useState<PatternResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load pattern type info
  useEffect(() => {
    fetchPatternTypes().then((types) => {
      const info = types.find((t) => t.name === type);
      if (info) {
        setPatternInfo(info);
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
    if (selectedSize !== null) {
      fetchDefaultMeasurements(selectedSize).then((m) => {
        setMeasurements(m as unknown as Record<string, number>);
      });
    }
  }, [selectedSize]);

  const buildRequest = useCallback(
    (outputFormat: "all" | "svg" | "pdf"): PatternRequest => ({
      pattern_type: type,
      measurements,
      control_parameters: Object.keys(controlParams).length > 0 ? controlParams : undefined,
      stretch: stretch.horizontal > 0 || stretch.vertical > 0 ? stretch : undefined,
      output_format: outputFormat,
    }),
    [type, measurements, controlParams, stretch]
  );

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await generatePattern(buildRequest("all"));
      setResult(resp);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      setError(msg);
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  }, [buildRequest, onError]);

  const updateMeasurement = useCallback((name: string, value: number) => {
    setMeasurements((prev: Record<string, number>) => ({ ...prev, [name]: value }));
  }, []);

  const updateControlParam = useCallback((name: string, value: number) => {
    setControlParams((prev: Record<string, number>) => ({ ...prev, [name]: value }));
  }, []);

  return {
    patternInfo,
    selectedSize,
    setSelectedSize,
    showAdvancedMeasurements,
    setShowAdvancedMeasurements,
    measurements,
    updateMeasurement,
    controlParams,
    updateControlParam,
    stretch,
    setStretch,
    ease,
    setEase,
    seamAllowance,
    setSeamAllowance,
    result,
    loading,
    error,
    handleGenerate,
    buildRequest,
  };
}
