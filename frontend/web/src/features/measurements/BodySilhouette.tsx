import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { MeasurementField, FullMeasurements } from "@shared/types";
import { MEASUREMENT_SECTIONS } from "@shared/data";

/** Field number mapping (1–24) following section display order. */
const ALL_FIELDS = MEASUREMENT_SECTIONS.flatMap((s) => s.fields);
const FIELD_NUM = Object.fromEntries(
  ALL_FIELDS.map((f, i) => [f, i + 1]),
) as Record<MeasurementField, number>;

type MeasureLine =
  | { type: "h"; field: MeasurementField; y: number; x1: number; x2: number }
  | { type: "v"; field: MeasurementField; y1: number; y2: number; x: number };

interface Props {
  values: FullMeasurements;
  activeField: MeasurementField | null;
  onFieldSelect?: (field: MeasurementField) => void;
  onFieldHover?: (field: MeasurementField | null) => void;
}

// ── Geometry computation (memoized) ─────────────────────────────────────────

function computeGeometry(v: FullMeasurements) {
  const totalBodyH = v.waist_to_floor + v.back_waist_length;
  const scale = 420 / totalBodyH;
  const cx = 150;

  const pt = (x: number, y: number) => `${x.toFixed(1)},${y.toFixed(1)}`;

  // Vertical positions (y increases downward)
  const headR = 22;
  const headCy = 40;
  const neckBase = headCy + headR + 8;
  const shoulderY = neckBase + 6;
  const waistY = shoulderY + v.back_waist_length * scale;
  const bustY = shoulderY + v.bust_height * scale;
  const smallHipY = waistY + v.waist_to_hip * 0.6 * scale;
  const hipY = waistY + v.waist_to_hip * scale;
  const crotchY = waistY + v.crotch_depth * scale;
  const kneeY = waistY + v.waist_to_knee * scale;
  const floorY = waistY + v.waist_to_floor * scale;

  // Half-widths (circumference → front-view half-width via /π approximation)
  const neckHW = (v.neck_circumference / Math.PI) * scale * 0.5;
  const shoulderHW = (v.half_back_width + v.shoulder_length) * scale * 0.52;
  const bustHW = (v.full_bust / Math.PI) * scale * 0.55;
  const waistHW = (v.full_waist / Math.PI) * scale * 0.55;
  const smallHipHW = (v.small_hip / Math.PI) * scale * 0.55;
  const hipHW = (v.full_hip / Math.PI) * scale * 0.55;
  const upperArmW = (v.upper_arm / Math.PI) * scale * 0.5;
  const wristW = (v.wrist / Math.PI) * scale * 0.5;

  // Leg widths
  const thighHW = hipHW * 0.38;
  const kneeHW = thighHW * 0.7;
  const ankleHW = wristW * 0.8;
  const legGap = thighHW * 0.3;

  // Arm geometry
  const armLen = v.arm_length * scale;
  const elbowY = shoulderY + v.elbow_height * scale;
  const wristY = shoulderY + armLen;
  const armAngle = (12 * Math.PI) / 180;
  const armDx = Math.sin(armAngle);
  const armDy = Math.cos(armAngle);

  // ── Head ──
  const headRx = headR * 0.78;

  // ── Hair ──
  const hairD = [
    `M${cx - headR * 0.7} ${headCy - headR * 0.3}`,
    `Q${cx - headR * 0.85} ${headCy - headR * 1.1} ${cx} ${headCy - headR * 1.15}`,
    `Q${cx + headR * 0.85} ${headCy - headR * 1.1} ${cx + headR * 0.7} ${headCy - headR * 0.3}`,
  ].join(" ");

  // ── Neck ──
  const neckD = [
    `M${cx - neckHW} ${headCy + headR - 2} L${cx - neckHW} ${neckBase}`,
    `M${cx + neckHW} ${headCy + headR - 2} L${cx + neckHW} ${neckBase}`,
  ].join(" ");

  // ── Torso – front (quadratic Bézier outline with bust bump) ──
  const torsoD = [
    `M${pt(cx - neckHW, neckBase)}`,
    `Q${pt(cx - neckHW - 4, shoulderY - 2)} ${pt(cx - shoulderHW, shoulderY)}`,
    `Q${pt(cx - shoulderHW + 2, shoulderY + 8)} ${pt(cx - bustHW + 2, bustY - 8)}`,
    `Q${pt(cx - bustHW - 1, bustY)} ${pt(cx - bustHW, bustY + 4)}`,
    `Q${pt(cx - bustHW + 4, (bustY + waistY) / 2)} ${pt(cx - waistHW, waistY)}`,
    `Q${pt(cx - waistHW - 2, (waistY + smallHipY) / 2)} ${pt(cx - smallHipHW, smallHipY)}`,
    `Q${pt(cx - hipHW - 1, (smallHipY + hipY) / 2)} ${pt(cx - hipHW, hipY)}`,
    `Q${pt(cx - hipHW + 2, (hipY + crotchY) / 2)} ${pt(cx - legGap - thighHW * 2, crotchY)}`,
    `L${pt(cx - legGap, crotchY)}`,
    `M${pt(cx + legGap, crotchY)}`,
    `L${pt(cx + legGap + thighHW * 2, crotchY)}`,
    `Q${pt(cx + hipHW + 2, (hipY + crotchY) / 2)} ${pt(cx + hipHW, hipY)}`,
    `Q${pt(cx + hipHW + 1, (smallHipY + hipY) / 2)} ${pt(cx + smallHipHW, smallHipY)}`,
    `Q${pt(cx + waistHW + 2, (waistY + smallHipY) / 2)} ${pt(cx + waistHW, waistY)}`,
    `Q${pt(cx + bustHW - 4, (bustY + waistY) / 2)} ${pt(cx + bustHW, bustY + 4)}`,
    `Q${pt(cx + bustHW + 1, bustY)} ${pt(cx + bustHW - 2, bustY - 8)}`,
    `Q${pt(cx + shoulderHW - 2, shoulderY + 8)} ${pt(cx + shoulderHW, shoulderY)}`,
    `Q${pt(cx + neckHW + 4, shoulderY - 2)} ${pt(cx + neckHW, neckBase)}`,
  ].join(" ");

  // ── Torso – back (smooth 2-segment curve, no bust bump) ──
  const backTorsoD = [
    `M${pt(cx - neckHW, neckBase)}`,
    `Q${pt(cx - neckHW - 4, shoulderY - 2)} ${pt(cx - shoulderHW, shoulderY)}`,
    `Q${pt(cx - shoulderHW + 2, (shoulderY + bustY) / 2)} ${pt(cx - bustHW + 4, bustY)}`,
    `Q${pt(cx - bustHW + 6, (bustY + waistY) / 2)} ${pt(cx - waistHW, waistY)}`,
    `Q${pt(cx - waistHW - 2, (waistY + smallHipY) / 2)} ${pt(cx - smallHipHW, smallHipY)}`,
    `Q${pt(cx - hipHW - 1, (smallHipY + hipY) / 2)} ${pt(cx - hipHW, hipY)}`,
    `Q${pt(cx - hipHW + 2, (hipY + crotchY) / 2)} ${pt(cx - legGap - thighHW * 2, crotchY)}`,
    `L${pt(cx - legGap, crotchY)}`,
    `M${pt(cx + legGap, crotchY)}`,
    `L${pt(cx + legGap + thighHW * 2, crotchY)}`,
    `Q${pt(cx + hipHW + 2, (hipY + crotchY) / 2)} ${pt(cx + hipHW, hipY)}`,
    `Q${pt(cx + hipHW + 1, (smallHipY + hipY) / 2)} ${pt(cx + smallHipHW, smallHipY)}`,
    `Q${pt(cx + waistHW + 2, (waistY + smallHipY) / 2)} ${pt(cx + waistHW, waistY)}`,
    `Q${pt(cx + bustHW - 6, (bustY + waistY) / 2)} ${pt(cx + bustHW - 4, bustY)}`,
    `Q${pt(cx + shoulderHW - 2, (shoulderY + bustY) / 2)} ${pt(cx + shoulderHW, shoulderY)}`,
    `Q${pt(cx + neckHW + 4, shoulderY - 2)} ${pt(cx + neckHW, neckBase)}`,
  ].join(" ");

  // ── Bust darts (front only) ──
  const bpd = v.half_bust_point_distance * scale;
  const bustDartL = `M${cx - bpd - 4} ${bustY - 5} Q${cx - bpd} ${bustY + 5} ${cx - bpd + 4} ${bustY - 5}`;
  const bustDartR = `M${cx + bpd - 4} ${bustY - 5} Q${cx + bpd} ${bustY + 5} ${cx + bpd + 4} ${bustY - 5}`;

  // ── Legs ──
  const buildLeg = (outerX: number, innerX: number, legCx: number) => {
    const kO = outerX < cx ? -1 : 1;
    return [
      `M${pt(outerX, crotchY)}`,
      `Q${pt(legCx + kO * (kneeHW + 2), (crotchY + kneeY) / 2)} ${pt(legCx + kO * kneeHW, kneeY)}`,
      `Q${pt(legCx + kO * (ankleHW + 1), (kneeY + floorY) / 2)} ${pt(legCx + kO * ankleHW, floorY)}`,
      `L${pt(legCx - kO * ankleHW, floorY)}`,
      `Q${pt(legCx - kO * (ankleHW + 1), (kneeY + floorY) / 2)} ${pt(legCx - kO * kneeHW, kneeY)}`,
      `Q${pt(legCx - kO * (kneeHW + 2), (crotchY + kneeY) / 2)} ${pt(innerX, crotchY)}`,
    ].join(" ");
  };

  const lLO = cx - legGap - thighHW * 2;
  const lLI = cx - legGap;
  const lLCx = (lLO + lLI) / 2;
  const rLO = cx + legGap + thighHW * 2;
  const rLI = cx + legGap;
  const rLCx = (rLO + rLI) / 2;

  // ── Feet ──
  const footRx = ankleHW * 2.2;
  const footRy = 6;
  const footCy = floorY + footRy / 2;

  // ── Arms ──
  const buildArm = (side: "left" | "right") => {
    const s = side === "left" ? -1 : 1;
    const sx = cx + s * shoulderHW;
    const sy = shoulderY;

    const elX = sx + s * armDx * (elbowY - sy);
    const elY = sy + armDy * (elbowY - sy);
    const wrX = sx + s * armDx * (wristY - sy);
    const wrY = sy + armDy * (wristY - sy);

    const uaW = upperArmW;
    const elbW = upperArmW * 0.75;
    const wrW = wristW;
    const px = armDy;
    const py = -armDx;

    const armD = [
      `M${pt(sx + px * uaW, sy + py * uaW)}`,
      `Q${pt((sx + elX) / 2 + px * uaW, (sy + elY) / 2 + py * uaW)} ${pt(elX + px * elbW, elY + py * elbW)}`,
      `Q${pt((elX + wrX) / 2 + px * elbW * 0.7, (elY + wrY) / 2 + py * elbW * 0.7)} ${pt(wrX + px * wrW, wrY + py * wrW)}`,
      `Q${pt(wrX, wrY + 3)} ${pt(wrX - px * wrW, wrY - py * wrW)}`,
      `Q${pt((elX + wrX) / 2 - px * elbW * 0.7, (elY + wrY) / 2 - py * elbW * 0.7)} ${pt(elX - px * elbW, elY - py * elbW)}`,
      `Q${pt((sx + elX) / 2 - px * uaW, (sy + elY) / 2 - py * uaW)} ${pt(sx - px * uaW, sy - py * uaW)}`,
    ].join(" ");

    const handR = wrW * 1.1;
    return {
      armD,
      hand: { cx: wrX, cy: wrY + handR * 0.8, rx: handR * 0.85, ry: handR },
    };
  };

  const leftArm = buildArm("left");
  const rightArm = buildArm("right");

  // ── Navel (front only) ──
  const navelCy = waistY + (hipY - waistY) * 0.15;

  // ── Measurement indicator lines — split by view ──
  const backMeasureLines: MeasureLine[] = [
    { type: "v", field: "back_waist_length", y1: shoulderY, y2: waistY, x: cx + bustHW + 22 },
    { type: "h", field: "full_bust", y: bustY, x1: cx - bustHW - 15, x2: cx + bustHW + 15 },
    { type: "h", field: "full_waist", y: waistY, x1: cx - waistHW - 15, x2: cx + waistHW + 15 },
    { type: "h", field: "small_hip", y: smallHipY, x1: cx - smallHipHW - 12, x2: cx + smallHipHW + 12 },
    { type: "h", field: "full_hip", y: hipY, x1: cx - hipHW - 15, x2: cx + hipHW + 15 },
    { type: "h", field: "upper_arm", y: shoulderY + 20, x1: cx - shoulderHW - upperArmW - 8, x2: cx - shoulderHW + upperArmW + 2 },
    { type: "v", field: "waist_to_hip", y1: waistY, y2: hipY, x: cx + hipHW + 20 },
    { type: "h", field: "crotch_depth", y: crotchY, x1: cx - hipHW - 10, x2: cx + hipHW + 10 },
  ];

  const frontMeasureLines: MeasureLine[] = [
    { type: "v", field: "front_waist_length", y1: shoulderY, y2: waistY, x: cx - bustHW - 22 },
    { type: "v", field: "bust_height", y1: shoulderY, y2: bustY, x: cx - bustHW - 20 },
    { type: "h", field: "neck_circumference", y: neckBase - 2, x1: cx - neckHW - 12, x2: cx + neckHW + 12 },
    { type: "h", field: "shoulder_length", y: shoulderY, x1: cx - shoulderHW - 12, x2: cx + shoulderHW + 12 },
    { type: "h", field: "wrist", y: wristY, x1: cx - shoulderHW - armDx * armLen - wristW - 8, x2: cx - shoulderHW - armDx * armLen + wristW + 2 },
    { type: "h", field: "waist_to_knee", y: kneeY, x1: cx - kneeHW - 20, x2: cx + kneeHW + 20 },
    { type: "h", field: "waist_to_floor", y: floorY, x1: cx - ankleHW - 30, x2: cx + ankleHW + 30 },
    { type: "v", field: "arm_length", y1: shoulderY, y2: wristY, x: cx + shoulderHW + armDx * armLen + 15 },
  ];

  // ViewBox
  const minY = headCy - headR * 1.2 - 10;
  const maxY = floorY + 16;
  const svgH = maxY - minY;

  return {
    viewBox: `0 ${minY.toFixed(0)} 300 ${svgH.toFixed(0)}`,
    cx,
    head: { cx, cy: headCy, rx: headRx, ry: headR },
    hairD,
    neckD,
    torsoD,
    backTorsoD,
    bustDartL,
    bustDartR,
    leftLegD: buildLeg(lLO, lLI, lLCx),
    rightLegD: buildLeg(rLO, rLI, rLCx),
    feet: [
      { cx: lLCx, cy: footCy, rx: footRx, ry: footRy },
      { cx: rLCx, cy: footCy, rx: footRx, ry: footRy },
    ],
    leftArm,
    rightArm,
    navel: { cx, cy: navelCy },
    backMeasureLines,
    frontMeasureLines,
  };
}

// ── Measurement line sub-component ──────────────────────────────────────────

function MeasureIndicator({
  line,
  num,
  isActive,
  centerX,
  onSelect,
  onHover,
}: {
  line: MeasureLine;
  num: number;
  isActive: boolean;
  centerX: number;
  onSelect: () => void;
  onHover: (hovering: boolean) => void;
}) {
  const cls = isActive ? "ml-line active" : "ml-line";
  const capCls = isActive ? "ml-cap active" : "ml-cap";
  const lblCls = isActive ? "ml-label active" : "ml-label";
  const sw = isActive ? 2 : 0.8;
  const dash = isActive ? undefined : "4 3";
  const opacity = isActive ? 1 : 0.5;
  const fontWeight = isActive ? 700 : 400;
  const lblOpacity = isActive ? 1 : 0.7;

  if (line.type === "h") {
    return (
      <g
        className="cursor-pointer"
        onClick={onSelect}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
      >
        <line
          x1={line.x1} y1={line.y} x2={line.x2} y2={line.y}
          stroke="transparent" strokeWidth={10}
        />
        <line
          x1={line.x1} y1={line.y} x2={line.x2} y2={line.y}
          className={cls} strokeWidth={sw} strokeDasharray={dash} opacity={opacity}
        />
        <text
          x={line.x2 + 4} y={line.y + 3} fontSize={9}
          className={lblCls} fontWeight={fontWeight} opacity={lblOpacity}
        >
          {num}
        </text>
      </g>
    );
  }

  const capSz = 3;
  const labelX = line.x > centerX ? line.x + 6 : line.x - 8;
  const labelY = (line.y1 + line.y2) / 2 + 3;

  return (
    <g
      className="cursor-pointer"
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <line
        x1={line.x} y1={line.y1} x2={line.x} y2={line.y2}
        stroke="transparent" strokeWidth={10}
      />
      <line
        x1={line.x} y1={line.y1} x2={line.x} y2={line.y2}
        className={cls} strokeWidth={sw} strokeDasharray={dash} opacity={opacity}
      />
      <line
        x1={line.x - capSz} y1={line.y1} x2={line.x + capSz} y2={line.y1}
        className={capCls} strokeWidth={sw} opacity={opacity}
      />
      <line
        x1={line.x - capSz} y1={line.y2} x2={line.x + capSz} y2={line.y2}
        className={capCls} strokeWidth={sw} opacity={opacity}
      />
      <text
        x={labelX} y={labelY} fontSize={9}
        className={lblCls} fontWeight={fontWeight} opacity={lblOpacity}
      >
        {num}
      </text>
    </g>
  );
}

// ── Single body view sub-component ──────────────────────────────────────────

type ViewId = "front" | "back";

function BodyView({
  viewId,
  geo,
  measureLines,
  activeField,
  onFieldSelect,
  onFieldHover,
}: {
  viewId: ViewId;
  geo: ReturnType<typeof computeGeometry>;
  measureLines: MeasureLine[];
  activeField: MeasurementField | null;
  onFieldSelect?: (field: MeasurementField) => void;
  onFieldHover?: (field: MeasurementField | null) => void;
}) {
  const gradId = `bodyGrad-${viewId}`;
  const torsoPath = viewId === "front" ? geo.torsoD : geo.backTorsoD;

  return (
    <svg
      viewBox={geo.viewBox}
      xmlns="http://www.w3.org/2000/svg"
      className="h-auto w-full"
      style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.06))" }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fdf6ee" />
          <stop offset="100%" stopColor="#f0e6d6" />
        </linearGradient>
      </defs>

      {/* Head */}
      <ellipse
        cx={geo.head.cx} cy={geo.head.cy} rx={geo.head.rx} ry={geo.head.ry}
        className="si-body" fill={`url(#${gradId})`} strokeWidth={1.5}
      />
      {/* Hair */}
      <path d={geo.hairD} className="si-stroke" strokeWidth={1.2} />
      {/* Neck */}
      <path d={geo.neckD} className="si-stroke" strokeWidth={1.5} />
      {/* Torso */}
      <path
        d={torsoPath} className="si-body" fill={`url(#${gradId})`}
        strokeWidth={1.5} strokeLinejoin="round"
      />
      {/* Bust darts — front only */}
      {viewId === "front" && (
        <>
          <path d={geo.bustDartL} className="si-stroke" strokeWidth={0.8} opacity={0.5} />
          <path d={geo.bustDartR} className="si-stroke" strokeWidth={0.8} opacity={0.5} />
        </>
      )}
      {/* Legs */}
      <path d={geo.leftLegD} className="si-body" fill={`url(#${gradId})`} strokeWidth={1.5} strokeLinejoin="round" />
      <path d={geo.rightLegD} className="si-body" fill={`url(#${gradId})`} strokeWidth={1.5} strokeLinejoin="round" />
      {/* Feet */}
      {geo.feet.map((f, i) => (
        <ellipse
          key={i} cx={f.cx} cy={f.cy} rx={f.rx} ry={f.ry}
          className="si-body" fill={`url(#${gradId})`} strokeWidth={1.2}
        />
      ))}
      {/* Arms */}
      <path d={geo.leftArm.armD} className="si-body" fill={`url(#${gradId})`} strokeWidth={1.3} strokeLinejoin="round" />
      <path d={geo.rightArm.armD} className="si-body" fill={`url(#${gradId})`} strokeWidth={1.3} strokeLinejoin="round" />
      {/* Hands */}
      <ellipse
        cx={geo.leftArm.hand.cx} cy={geo.leftArm.hand.cy}
        rx={geo.leftArm.hand.rx} ry={geo.leftArm.hand.ry}
        className="si-body" fill={`url(#${gradId})`} strokeWidth={1}
      />
      <ellipse
        cx={geo.rightArm.hand.cx} cy={geo.rightArm.hand.cy}
        rx={geo.rightArm.hand.rx} ry={geo.rightArm.hand.ry}
        className="si-body" fill={`url(#${gradId})`} strokeWidth={1}
      />
      {/* Navel — front only */}
      {viewId === "front" && (
        <circle cx={geo.navel.cx} cy={geo.navel.cy} r={1.5} className="si-dot" />
      )}

      {/* Measurement indicator lines */}
      {measureLines.map((line) => (
        <MeasureIndicator
          key={line.field}
          line={line}
          num={FIELD_NUM[line.field]}
          isActive={activeField === line.field}
          centerX={geo.cx}
          onSelect={() => onFieldSelect?.(line.field)}
          onHover={(h) => onFieldHover?.(h ? line.field : null)}
        />
      ))}
    </svg>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export function BodySilhouette({
  values,
  activeField,
  onFieldSelect,
  onFieldHover,
}: Props) {
  const { t } = useTranslation();
  const geo = useMemo(() => computeGeometry(values), [values]);

  return (
    <div className="sticky top-6 flex w-full items-start justify-center gap-3 max-lg:static max-lg:mx-auto max-lg:mb-6">
      {/* Back view */}
      <div className="flex max-w-[200px] flex-col items-center">
        <BodyView
          viewId="back"
          geo={geo}
          measureLines={geo.backMeasureLines}
          activeField={activeField}
          onFieldSelect={onFieldSelect}
          onFieldHover={onFieldHover}
        />
        <span className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          {t("measurements.backView")}
        </span>
      </div>

      {/* Front view */}
      <div className="flex max-w-[200px] flex-col items-center">
        <BodyView
          viewId="front"
          geo={geo}
          measureLines={geo.frontMeasureLines}
          activeField={activeField}
          onFieldSelect={onFieldSelect}
          onFieldHover={onFieldHover}
        />
        <span className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          {t("measurements.frontView")}
        </span>
      </div>

      <style>{`
        .si-body { stroke: #6b6b6b; }
        .si-stroke { fill: none; stroke: #6b6b6b; }
        .si-dot { fill: #6b6b6b; opacity: 0.3; }
        .ml-line { stroke: #bbbbbb; }
        .ml-line.active { stroke: #c05050; }
        .ml-cap { stroke: #bbbbbb; }
        .ml-cap.active { stroke: #c05050; }
        .ml-label { fill: #bbbbbb; font-family: -apple-system, "Segoe UI", Roboto, sans-serif; }
        .ml-label.active { fill: #c05050; }

        .dark .si-body { fill: #374151; stroke: #9ca3af; }
        .dark .si-stroke { stroke: #9ca3af; }
        .dark .si-dot { fill: #9ca3af; }
        .dark .ml-line { stroke: #666; }
        .dark .ml-line.active { stroke: #ef4444; }
        .dark .ml-cap { stroke: #666; }
        .dark .ml-cap.active { stroke: #ef4444; }
        .dark .ml-label { fill: #666; }
        .dark .ml-label.active { fill: #ef4444; }
      `}</style>
    </div>
  );
}
