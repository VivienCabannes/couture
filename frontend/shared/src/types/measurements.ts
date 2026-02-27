export interface FullMeasurements {
  back_waist_length: number;
  front_waist_length: number;
  full_bust: number;
  bust_height: number;
  half_bust_point_distance: number;
  full_waist: number;
  small_hip: number;
  full_hip: number;
  neck_circumference: number;
  half_back_width: number;
  half_front_width: number;
  shoulder_length: number;
  armhole_circumference: number;
  underarm_height: number;
  arm_length: number;
  upper_arm: number;
  elbow_height: number;
  wrist: number;
  waist_to_hip: number;
  crotch_depth: number;
  crotch_length: number;
  waist_to_knee: number;
  waist_to_floor: number;
  side_waist_to_floor: number;
}

export type MeasurementField = keyof FullMeasurements;
