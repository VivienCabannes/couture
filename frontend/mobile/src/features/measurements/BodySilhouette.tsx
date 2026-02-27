import { View, StyleSheet } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Ellipse, Path, Line, G, Text as SvgText } from "react-native-svg";
import type { MeasurementField } from "@shared/types";
import { useTheme } from "../../hooks/useTheme";

/** SVG measurement line definitions: field -> [x1, y1, x2, y2]. */
const LINES: Partial<
  Record<MeasurementField, [number, number, number, number]>
> = {
  neck_circumference: [8, 58, 192, 58],
  shoulder_length: [8, 74, 192, 74],
  full_bust: [8, 130, 192, 130],
  full_waist: [8, 190, 192, 190],
  small_hip: [8, 230, 192, 230],
  full_hip: [8, 250, 192, 250],
  upper_arm: [8, 100, 30, 100],
  wrist: [8, 255, 20, 255],
  waist_to_knee: [8, 380, 192, 380],
  waist_to_floor: [8, 475, 192, 475],
  crotch_depth: [8, 320, 192, 320],
};

const LINE_LABELS: Partial<
  Record<MeasurementField, [number, number, string]>
> = {
  neck_circumference: [194, 61, "9"],
  shoulder_length: [194, 77, "12"],
  full_bust: [194, 133, "3"],
  full_waist: [194, 193, "6"],
  small_hip: [194, 233, "7"],
  full_hip: [194, 253, "8"],
  upper_arm: [4, 97, "16"],
  wrist: [4, 252, "18"],
  waist_to_knee: [194, 383, "22"],
  waist_to_floor: [194, 478, "23"],
  crotch_depth: [194, 323, "20"],
};

interface Props {
  activeField: MeasurementField | null;
  style?: StyleProp<ViewStyle>;
}

/** Body silhouette SVG with measurement reference lines, ported from web. */
export function BodySilhouette({ activeField, style }: Props) {
  const { colors, isDark } = useTheme();
  const outlineColor = isDark ? "#6b7280" : "#9ca3af";
  const inactiveLine = isDark ? "#4b5563" : "#d1d5db";
  const inactiveLabel = isDark ? "#6b7280" : "#9ca3af";

  return (
    <View style={[styles.container, style]}>
      <Svg viewBox="0 0 200 500" width="100%" height="100%">
        {/* Head */}
        <Ellipse
          cx={100}
          cy={30}
          rx={16}
          ry={20}
          fill="none"
          stroke={outlineColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Neck */}
        <Path
          d="M90 49 L90 62 M110 49 L110 62"
          fill="none"
          stroke={outlineColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Torso */}
        <Path
          d="M90 62 Q88 66 48 74 Q36 80 34 100 L32 140 Q34 170 44 190 Q38 210 34 240 Q32 260 36 280 Q44 300 56 320 L60 360 L58 410 Q56 440 54 460 L52 475 M110 62 Q112 66 152 74 Q164 80 166 100 L168 140 Q166 170 156 190 Q162 210 166 240 Q168 260 164 280 Q156 300 144 320 L140 360 L142 410 Q144 440 146 460 L148 475"
          fill="none"
          stroke={outlineColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Feet */}
        <Path
          d="M52 475 L46 478 L44 480 L54 480 L58 476 M148 475 L154 478 L156 480 L146 480 L142 476"
          fill="none"
          stroke={outlineColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Arms */}
        <Path
          d="M48 74 L28 88 Q18 110 16 150 L14 200 Q12 230 14 250 L16 260 M152 74 L172 88 Q182 110 184 150 L186 200 Q188 230 186 250 L184 260"
          fill="none"
          stroke={outlineColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Hands */}
        <Path
          d="M16 260 L14 266 L18 264 M184 260 L186 266 L182 264"
          fill="none"
          stroke={outlineColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Inner legs */}
        <Path
          d="M78 320 L80 360 L82 410 Q80 440 78 460 L76 475 M122 320 L120 360 L118 410 Q120 440 122 460 L124 475"
          fill="none"
          stroke={outlineColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M76 475 L72 478 L70 480 L80 480 L82 476 M124 475 L128 478 L130 480 L120 480 L118 476"
          fill="none"
          stroke={outlineColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Measurement lines */}
        {(Object.keys(LINES) as MeasurementField[]).map((field) => {
          const [x1, y1, x2, y2] = LINES[field]!;
          const isActive = activeField === field;
          const labelDef = LINE_LABELS[field];
          return (
            <G key={field}>
              <Line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isActive ? colors.primary : inactiveLine}
                strokeWidth={isActive ? 2 : 1}
                strokeDasharray={isActive ? undefined : "4 3"}
              />
              {labelDef && (
                <SvgText
                  x={labelDef[0]}
                  y={labelDef[1]}
                  fontSize={7}
                  fill={isActive ? colors.primary : inactiveLabel}
                  fontWeight={isActive ? "600" : "400"}
                >
                  {labelDef[2]}
                </SvgText>
              )}
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 220,
    aspectRatio: 200 / 500,
    alignSelf: "center",
    marginBottom: 16,
  },
});
