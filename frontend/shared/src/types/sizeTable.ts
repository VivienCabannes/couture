import type { MeasurementField } from "./measurements";

/** [baseValueAtT38, incrementPerSizeStep] */
type SizeEntry = [number, number];

export type SizeTable = Record<MeasurementField, SizeEntry>;

/**
 * French size table: base values at T38 with per-size-step increments.
 * Each size step is 2 units (T34→T36→T38→T40→…).
 * To compute a value: base + increment * ((size - 38) / 2).
 */
export const SIZE_TABLE: SizeTable = {
  back_waist_length: [41.0, 0.5],
  front_waist_length: [37.0, 0.5],
  full_bust: [88.0, 4.0],
  bust_height: [22.0, 0.5],
  half_bust_point_distance: [9.25, 0.25],
  full_waist: [68.0, 4.0],
  small_hip: [85.0, 4.0],
  full_hip: [94.0, 4.0],
  neck_circumference: [36.0, 1.0],
  half_back_width: [17.5, 0.25],
  half_front_width: [16.5, 0.25],
  shoulder_length: [12.0, 0.4],
  armhole_circumference: [39.5, 1.0],
  underarm_height: [21.5, 0.25],
  arm_length: [60.0, 0.0],
  upper_arm: [26.0, 1.0],
  elbow_height: [35.0, 0.0],
  wrist: [16.0, 0.25],
  waist_to_hip: [22.0, 0.0],
  crotch_depth: [26.5, 0.5],
  crotch_length: [60.0, 2.0],
  waist_to_knee: [58.0, 1.0],
  waist_to_floor: [105.0, 0.5],
  side_waist_to_floor: [105.5, 1.0],
};
