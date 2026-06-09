# backend/app/schemas/dashboard_schema.py

from pydantic import BaseModel
from typing import List, Optional


# ── Summary ───────────────────────────────────────────────────────────────────

class SummaryResponse(BaseModel):
    total_accidents:       int
    total_fatalities:      int
    total_grievous:        int
    total_minor:           int
    total_damage_only:     int
    total_vehicles:        int
    districts_covered:     int
    police_stations:       int


# ── By District ───────────────────────────────────────────────────────────────

class DistrictCount(BaseModel):
    district:        str
    accident_count:  int
    fatalities:      int

class DistrictResponse(BaseModel):
    data: List[DistrictCount]


# ── By Severity ───────────────────────────────────────────────────────────────

class SeverityCount(BaseModel):
    severity: str
    count:    int

class SeverityResponse(BaseModel):
    data: List[SeverityCount]


# ── Time Series ───────────────────────────────────────────────────────────────

class TimeSeriesPoint(BaseModel):
    year:          int
    month:         int
    month_label:   str      # e.g. "Jan 2022"
    accident_count: int
    fatalities:    int

class TimeSeriesResponse(BaseModel):
    data: List[TimeSeriesPoint]


# ── By Collision ──────────────────────────────────────────────────────────────

class CollisionCount(BaseModel):
    collision_type: str
    count:          int

class CollisionResponse(BaseModel):
    data: List[CollisionCount]


# ── Heatmap ───────────────────────────────────────────────────────────────────

class HeatmapPoint(BaseModel):
    accident_id:  str
    latitude:     float
    longitude:    float
    severity:     str
    district:     str

class HeatmapResponse(BaseModel):
    total: int
    data:  List[HeatmapPoint]


# ── By Violation ──────────────────────────────────────────────────────────────

class ViolationCount(BaseModel):
    traffic_violation: str
    count:             int

class ViolationResponse(BaseModel):
    data: List[ViolationCount]


# ── By Road Classification ────────────────────────────────────────────────────

class RoadClassCount(BaseModel):
    road_classification: str
    accident_count:      int
    fatalities:          int

class RoadClassResponse(BaseModel):
    data: List[RoadClassCount]


# ── By Weather ────────────────────────────────────────────────────────────────

class WeatherCount(BaseModel):
    weather_condition: str
    count:             int

class WeatherResponse(BaseModel):
    data: List[WeatherCount]


# ── By Light Condition ────────────────────────────────────────────────────────

class LightCount(BaseModel):
    light_condition: str
    count:           int

class LightResponse(BaseModel):
    data: List[LightCount]


# ── By Police Station ─────────────────────────────────────────────────────────

class PoliceStationCount(BaseModel):
    police_station:  str
    district:        str
    accident_count:  int
    fatalities:      int

class PoliceStationResponse(BaseModel):
    data: List[PoliceStationCount]


# ── Casualty Breakdown ────────────────────────────────────────────────────────

class CasualtyBreakdown(BaseModel):
    category:   str     # Drivers / Passengers / Pedestrians
    killed:     int
    grievous:   int
    minor:      int

class CasualtyResponse(BaseModel):
    data: List[CasualtyBreakdown]


# ── Top Dangerous Districts ───────────────────────────────────────────────────

class DangerousDistrict(BaseModel):
    rank:            int
    district:        str
    fatal_accidents: int
    total_killed:    int

class TopDangerousResponse(BaseModel):
    data: List[DangerousDistrict]


# ── Yearly Comparison ─────────────────────────────────────────────────────────

class YearlyStats(BaseModel):
    year:            int
    total_accidents: int
    fatalities:      int
    grievous:        int

class YearlyResponse(BaseModel):
    data: List[YearlyStats]