from pydantic import BaseModel


class MeasurementsResponse(BaseModel):
    """Full body measurements response."""
    back_waist_length: float
    front_waist_length: float
    full_bust: float
    bust_height: float
    half_bust_point_distance: float
    full_waist: float
    small_hip: float
    full_hip: float
    neck_circumference: float
    half_back_width: float
    half_front_width: float
    shoulder_length: float
    armhole_circumference: float
    underarm_height: float
    arm_length: float
    upper_arm: float
    elbow_height: float
    wrist: float
    waist_to_hip: float
    crotch_depth: float
    crotch_length: float
    waist_to_knee: float
    waist_to_floor: float
    side_waist_to_floor: float
