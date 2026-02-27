/**
 * Platform-agnostic measurement metadata — sections, labels, and step values.
 * No React dependency; safe for use in both web and mobile.
 */

import type { MeasurementField } from "../types/measurements";

/** The 24 fields grouped by section for display order. */
export const MEASUREMENT_SECTIONS = [
  {
    sectionKey: "measurements.lengths",
    fields: ["back_waist_length", "front_waist_length"] as MeasurementField[],
  },
  {
    sectionKey: "measurements.circumferences",
    fields: [
      "full_bust",
      "bust_height",
      "half_bust_point_distance",
      "full_waist",
      "small_hip",
      "full_hip",
      "neck_circumference",
    ] as MeasurementField[],
  },
  {
    sectionKey: "measurements.widths",
    fields: [
      "half_back_width",
      "half_front_width",
      "shoulder_length",
    ] as MeasurementField[],
  },
  {
    sectionKey: "measurements.arm",
    fields: [
      "armhole_circumference",
      "underarm_height",
      "arm_length",
      "upper_arm",
      "elbow_height",
      "wrist",
    ] as MeasurementField[],
  },
  {
    sectionKey: "measurements.lowerBody",
    fields: [
      "waist_to_hip",
      "crotch_depth",
      "crotch_length",
      "waist_to_knee",
      "waist_to_floor",
      "side_waist_to_floor",
    ] as MeasurementField[],
  },
];

/** Mapping from field key to i18n label key. */
export const FIELD_LABELS: Record<MeasurementField, string> = {
  back_waist_length: "measurements.backWaistLength",
  front_waist_length: "measurements.frontWaistLength",
  full_bust: "measurements.fullBust",
  bust_height: "measurements.bustHeight",
  half_bust_point_distance: "measurements.bustPointDistance",
  full_waist: "measurements.fullWaist",
  small_hip: "measurements.smallHip",
  full_hip: "measurements.fullHip",
  neck_circumference: "measurements.neckCircumference",
  half_back_width: "measurements.halfBackWidth",
  half_front_width: "measurements.halfFrontWidth",
  shoulder_length: "measurements.shoulderLength",
  armhole_circumference: "measurements.armholeCircumference",
  underarm_height: "measurements.underarmHeight",
  arm_length: "measurements.armLength",
  upper_arm: "measurements.upperArm",
  elbow_height: "measurements.elbowHeight",
  wrist: "measurements.wrist",
  waist_to_hip: "measurements.waistToHip",
  crotch_depth: "measurements.crotchDepth",
  crotch_length: "measurements.crotchLength",
  waist_to_knee: "measurements.waistToKnee",
  waist_to_floor: "measurements.waistToFloor",
  side_waist_to_floor: "measurements.sideWaistToFloor",
};

/** Step values per field for the number input. */
export const FIELD_STEPS: Record<MeasurementField, number> = {
  back_waist_length: 0.5,
  front_waist_length: 0.5,
  full_bust: 0.5,
  bust_height: 0.5,
  half_bust_point_distance: 0.25,
  full_waist: 0.5,
  small_hip: 0.5,
  full_hip: 0.5,
  neck_circumference: 0.5,
  half_back_width: 0.25,
  half_front_width: 0.25,
  shoulder_length: 0.5,
  armhole_circumference: 0.5,
  underarm_height: 0.25,
  arm_length: 0.5,
  upper_arm: 0.5,
  elbow_height: 0.5,
  wrist: 0.25,
  waist_to_hip: 0.5,
  crotch_depth: 0.5,
  crotch_length: 0.5,
  waist_to_knee: 0.5,
  waist_to_floor: 0.5,
  side_waist_to_floor: 0.5,
};
