# backend/app/routers/dashboard.py

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import Optional
import calendar

from app.database import get_db
from app.models.accident import Accident
from app.schemas.dashboard_schema import (
    SummaryResponse,
    DistrictResponse,   DistrictCount,
    SeverityResponse,   SeverityCount,
    TimeSeriesResponse, TimeSeriesPoint,
    CollisionResponse,  CollisionCount,
    HeatmapResponse,    HeatmapPoint,
    ViolationResponse,  ViolationCount,
    RoadClassResponse,  RoadClassCount,
    WeatherResponse,    WeatherCount,
    LightResponse,      LightCount,
    PoliceStationResponse, PoliceStationCount,
    CasualtyResponse,   CasualtyBreakdown,
    TopDangerousResponse, DangerousDistrict,
    YearlyResponse,     YearlyStats,
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


# ── helper: reusable district filter ─────────────────────────────────────────
def apply_filters(query, district: Optional[str], year: Optional[int]):
    if district:
        query = query.filter(Accident.district == district)
    if year:
        query = query.filter(
            extract("year", Accident.accident_datetime) == year
        )
    return query


# ─────────────────────────────────────────────────────────────────────────────
# GET /dashboard/summary
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/summary", response_model=SummaryResponse)
def get_summary(
    district: Optional[str] = Query(None),
    year:     Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Returns high-level KPI cards:
    total accidents, fatalities, injury breakdown, vehicles, coverage.
    Supports optional ?district= and ?year= filters.
    """
    q = db.query(Accident)
    q = apply_filters(q, district, year)
    accidents = q.all()

    total_fatalities = sum(
        (a.drivers_killed or 0) +
        (a.passengers_killed or 0) +
        (a.pedestrians_killed or 0)
        for a in accidents
    )
    total_grievous = sum(
        (a.drivers_grievous_injury or 0) +
        (a.passengers_grievous_injury or 0) +
        (a.pedestrians_grievous_injury or 0)
        for a in accidents
    )
    total_minor = sum(
        (a.drivers_minor_injury or 0) +
        (a.passengers_minor_injury or 0) +
        (a.pedestrians_minor_injury or 0)
        for a in accidents
    )

    return SummaryResponse(
        total_accidents   = len(accidents),
        total_fatalities  = total_fatalities,
        total_grievous    = total_grievous,
        total_minor       = total_minor,
        total_damage_only = sum(1 for a in accidents if a.severity == "Damage Only"),
        total_vehicles    = sum(a.no_of_vehicles or 0 for a in accidents),
        districts_covered = len(set(a.district for a in accidents)),
        police_stations   = len(set(a.police_station for a in accidents)),
    )


# ─────────────────────────────────────────────────────────────────────────────
# GET /dashboard/by-district
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/by-district", response_model=DistrictResponse)
def get_by_district(
    year: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Accident count + fatalities per district. For bar/choropleth charts."""
    q = db.query(Accident)
    if year:
        q = q.filter(extract("year", Accident.accident_datetime) == year)

    from collections import defaultdict
    district_map = defaultdict(lambda: {"accident_count": 0, "fatalities": 0})

    for a in q.all():
        district_map[a.district]["accident_count"] += 1
        district_map[a.district]["fatalities"] += (
            (a.drivers_killed or 0) +
            (a.passengers_killed or 0) +
            (a.pedestrians_killed or 0)
        )

    data = [
        DistrictCount(
            district       = d,
            accident_count = v["accident_count"],
            fatalities     = v["fatalities"]
        )
        for d, v in sorted(
            district_map.items(),
            key=lambda x: x[1]["accident_count"],
            reverse=True
        )
    ]
    return DistrictResponse(data=data)


# ─────────────────────────────────────────────────────────────────────────────
# GET /dashboard/by-severity
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/by-severity", response_model=SeverityResponse)
def get_by_severity(
    district: Optional[str] = Query(None),
    year:     Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Severity distribution — for pie/donut chart."""
    q = db.query(
        Accident.severity,
        func.count(Accident.id).label("count")
    )
    q = apply_filters(q, district, year)
    rows = q.group_by(Accident.severity).all()

    return SeverityResponse(
        data=[SeverityCount(severity=r.severity, count=r.count) for r in rows]
    )


# ─────────────────────────────────────────────────────────────────────────────
# GET /dashboard/time-series
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/time-series", response_model=TimeSeriesResponse)
def get_time_series(
    district:    Optional[str] = Query(None),
    granularity: str           = Query("month", enum=["month", "year"]),
    db: Session = Depends(get_db)
):
    """
    Accidents grouped by month+year (default) or year only.
    For line/area charts. Supports ?district= filter.
    """
    q = db.query(Accident)
    if district:
        q = q.filter(Accident.district == district)

    from collections import defaultdict
    buckets = defaultdict(lambda: {"count": 0, "fatalities": 0})

    for a in q.all():
        if a.accident_datetime is None:
            continue
        if granularity == "year":
            key = (a.accident_datetime.year, 1)
        else:
            key = (a.accident_datetime.year, a.accident_datetime.month)

        buckets[key]["count"]      += 1
        buckets[key]["fatalities"] += (
            (a.drivers_killed or 0) +
            (a.passengers_killed or 0) +
            (a.pedestrians_killed or 0)
        )

    data = [
        TimeSeriesPoint(
            year           = y,
            month          = m,
            month_label    = f"{calendar.month_abbr[m]} {y}" if granularity == "month" else str(y),
            accident_count = v["count"],
            fatalities     = v["fatalities"],
        )
        for (y, m), v in sorted(buckets.items())
    ]
    return TimeSeriesResponse(data=data)


# ─────────────────────────────────────────────────────────────────────────────
# GET /dashboard/by-collision
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/by-collision", response_model=CollisionResponse)
def get_by_collision(
    district: Optional[str] = Query(None),
    year:     Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Collision type distribution — for horizontal bar chart."""
    q = db.query(
        Accident.collision_type,
        func.count(Accident.id).label("count")
    )
    q = apply_filters(q, district, year)
    rows = (
        q.group_by(Accident.collision_type)
         .order_by(func.count(Accident.id).desc())
         .all()
    )
    return CollisionResponse(
        data=[CollisionCount(collision_type=r.collision_type, count=r.count) for r in rows]
    )


# ─────────────────────────────────────────────────────────────────────────────
# GET /dashboard/heatmap
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/heatmap", response_model=HeatmapResponse)
def get_heatmap(
    district: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    year:     Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Lat/lon + severity for every accident.
    For map heatmap/cluster layer. Supports all three filters.
    """
    q = db.query(Accident)
    q = apply_filters(q, district, year)
    if severity:
        q = q.filter(Accident.severity == severity)

    accidents = q.all()

    return HeatmapResponse(
        total=len(accidents),
        data=[
            HeatmapPoint(
                accident_id = a.accident_id,
                latitude    = a.latitude,
                longitude   = a.longitude,
                severity    = a.severity,
                district    = a.district,
            )
            for a in accidents
            if a.latitude is not None and a.longitude is not None
        ]
    )


# ─────────────────────────────────────────────────────────────────────────────
# GET /dashboard/by-violation
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/by-violation", response_model=ViolationResponse)
def get_by_violation(
    district: Optional[str] = Query(None),
    year:     Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Traffic violation type counts — for bar chart."""
    q = db.query(
        Accident.traffic_violation,
        func.count(Accident.id).label("count")
    )
    q = apply_filters(q, district, year)
    rows = (
        q.filter(Accident.traffic_violation != "nan")
         .group_by(Accident.traffic_violation)
         .order_by(func.count(Accident.id).desc())
         .all()
    )
    return ViolationResponse(
        data=[ViolationCount(traffic_violation=r.traffic_violation, count=r.count) for r in rows]
    )


# ─────────────────────────────────────────────────────────────────────────────
# GET /dashboard/by-road
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/by-road", response_model=RoadClassResponse)
def get_by_road(
    year: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Accidents + fatalities grouped by road classification."""
    q = db.query(Accident)
    if year:
        q = q.filter(extract("year", Accident.accident_datetime) == year)

    from collections import defaultdict
    road_map = defaultdict(lambda: {"accident_count": 0, "fatalities": 0})

    for a in q.all():
        road_map[a.road_classification]["accident_count"] += 1
        road_map[a.road_classification]["fatalities"] += (
            (a.drivers_killed or 0) +
            (a.passengers_killed or 0) +
            (a.pedestrians_killed or 0)
        )

    return RoadClassResponse(
        data=[
            RoadClassCount(
                road_classification = rc,
                accident_count      = v["accident_count"],
                fatalities          = v["fatalities"],
            )
            for rc, v in sorted(
                road_map.items(),
                key=lambda x: x[1]["accident_count"],
                reverse=True
            )
        ]
    )


# ─────────────────────────────────────────────────────────────────────────────
# GET /dashboard/by-weather
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/by-weather", response_model=WeatherResponse)
def get_by_weather(
    district: Optional[str] = Query(None),
    year:     Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Weather condition distribution — for pie/bar chart."""
    q = db.query(
        Accident.weather_condition,
        func.count(Accident.id).label("count")
    )
    q = apply_filters(q, district, year)
    rows = (
        q.group_by(Accident.weather_condition)
         .order_by(func.count(Accident.id).desc())
         .all()
    )
    return WeatherResponse(
        data=[WeatherCount(weather_condition=r.weather_condition, count=r.count) for r in rows]
    )


# ─────────────────────────────────────────────────────────────────────────────
# GET /dashboard/by-light
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/by-light", response_model=LightResponse)
def get_by_light(
    district: Optional[str] = Query(None),
    year:     Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Light condition distribution — for pie chart."""
    q = db.query(
        Accident.light_condition,
        func.count(Accident.id).label("count")
    )
    q = apply_filters(q, district, year)
    rows = (
        q.group_by(Accident.light_condition)
         .order_by(func.count(Accident.id).desc())
         .all()
    )
    return LightResponse(
        data=[LightCount(light_condition=r.light_condition, count=r.count) for r in rows]
    )


# ─────────────────────────────────────────────────────────────────────────────
# GET /dashboard/by-police-station
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/by-police-station", response_model=PoliceStationResponse)
def get_by_police_station(
    district: Optional[str] = Query(None),
    year:     Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Accident count + fatalities per police station."""
    q = db.query(Accident)
    q = apply_filters(q, district, year)

    from collections import defaultdict
    ps_map = defaultdict(lambda: {"district": "", "accident_count": 0, "fatalities": 0})

    for a in q.all():
        ps_map[a.police_station]["district"]       = a.district
        ps_map[a.police_station]["accident_count"] += 1
        ps_map[a.police_station]["fatalities"]     += (
            (a.drivers_killed or 0) +
            (a.passengers_killed or 0) +
            (a.pedestrians_killed or 0)
        )

    return PoliceStationResponse(
        data=[
            PoliceStationCount(
                police_station = ps,
                district       = v["district"],
                accident_count = v["accident_count"],
                fatalities     = v["fatalities"],
            )
            for ps, v in sorted(
                ps_map.items(),
                key=lambda x: x[1]["accident_count"],
                reverse=True
            )
        ]
    )


# ─────────────────────────────────────────────────────────────────────────────
# GET /dashboard/casualty-breakdown
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/casualty-breakdown", response_model=CasualtyResponse)
def get_casualty_breakdown(
    district: Optional[str] = Query(None),
    year:     Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Killed / grievous / minor split across Drivers, Passengers, Pedestrians.
    For stacked bar chart.
    """
    q = db.query(Accident)
    q = apply_filters(q, district, year)
    accidents = q.all()

    totals = {
        "Drivers":     {"killed": 0, "grievous": 0, "minor": 0},
        "Passengers":  {"killed": 0, "grievous": 0, "minor": 0},
        "Pedestrians": {"killed": 0, "grievous": 0, "minor": 0},
    }
    for a in accidents:
        totals["Drivers"]["killed"]     += a.drivers_killed or 0
        totals["Drivers"]["grievous"]   += a.drivers_grievous_injury or 0
        totals["Drivers"]["minor"]      += a.drivers_minor_injury or 0
        totals["Passengers"]["killed"]  += a.passengers_killed or 0
        totals["Passengers"]["grievous"]+= a.passengers_grievous_injury or 0
        totals["Passengers"]["minor"]   += a.passengers_minor_injury or 0
        totals["Pedestrians"]["killed"] += a.pedestrians_killed or 0
        totals["Pedestrians"]["grievous"]+= a.pedestrians_grievous_injury or 0
        totals["Pedestrians"]["minor"]  += a.pedestrians_minor_injury or 0

    return CasualtyResponse(
        data=[
            CasualtyBreakdown(
                category = cat,
                killed   = v["killed"],
                grievous = v["grievous"],
                minor    = v["minor"],
            )
            for cat, v in totals.items()
        ]
    )


# ─────────────────────────────────────────────────────────────────────────────
# GET /dashboard/top-dangerous
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/top-dangerous", response_model=TopDangerousResponse)
def get_top_dangerous(
    top_n: int           = Query(10, ge=1, le=50),
    year:  Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Top N most dangerous districts by fatal accidents.
    For ranked leaderboard table.
    """
    q = db.query(Accident).filter(Accident.severity == "Fatal")
    if year:
        q = q.filter(extract("year", Accident.accident_datetime) == year)

    from collections import defaultdict
    dist_map = defaultdict(lambda: {"fatal_accidents": 0, "total_killed": 0})

    for a in q.all():
        dist_map[a.district]["fatal_accidents"] += 1
        dist_map[a.district]["total_killed"]    += (
            (a.drivers_killed or 0) +
            (a.passengers_killed or 0) +
            (a.pedestrians_killed or 0)
        )

    ranked = sorted(
        dist_map.items(),
        key=lambda x: x[1]["fatal_accidents"],
        reverse=True
    )[:top_n]

    return TopDangerousResponse(
        data=[
            DangerousDistrict(
                rank            = i + 1,
                district        = d,
                fatal_accidents = v["fatal_accidents"],
                total_killed    = v["total_killed"],
            )
            for i, (d, v) in enumerate(ranked)
        ]
    )


# ─────────────────────────────────────────────────────────────────────────────
# GET /dashboard/yearly-comparison
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/yearly-comparison", response_model=YearlyResponse)
def get_yearly_comparison(
    district: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Year-over-year comparison of accidents and casualties. For grouped bar."""
    q = db.query(Accident)
    if district:
        q = q.filter(Accident.district == district)

    from collections import defaultdict
    year_map = defaultdict(lambda: {"total_accidents": 0, "fatalities": 0, "grievous": 0})

    for a in q.all():
        if a.accident_datetime is None:
            continue
        y = a.accident_datetime.year
        year_map[y]["total_accidents"] += 1
        year_map[y]["fatalities"]      += (
            (a.drivers_killed or 0) +
            (a.passengers_killed or 0) +
            (a.pedestrians_killed or 0)
        )
        year_map[y]["grievous"]        += (
            (a.drivers_grievous_injury or 0) +
            (a.passengers_grievous_injury or 0) +
            (a.pedestrians_grievous_injury or 0)
        )

    return YearlyResponse(
        data=[
            YearlyStats(
                year            = y,
                total_accidents = v["total_accidents"],
                fatalities      = v["fatalities"],
                grievous        = v["grievous"],
            )
            for y, v in sorted(year_map.items())
        ]
    )