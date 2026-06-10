import axios from "./axios";
import type {
  DashboardFilters,
  DashboardData,
  SummaryResponse,
  DistrictCount,
  SeverityCount,
  TimeSeriesPoint,
  RoadCount,
  CasualtyBreakdown,
  DangerousDistrict,
  HeatmapPoint,
} from "../types/dashboard";

function buildParams(
  filters: DashboardFilters,
  keys: Array<keyof DashboardFilters>
): string {
  const params = new URLSearchParams();
  keys.forEach((key) => {
    const value = filters[key];
    if (value && value !== "all") params.set(key, value);
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchDashboard(
  filters: DashboardFilters
): Promise<DashboardData> {
  const districtYear = buildParams(filters, ["district", "year"]);
  const districtOnly = buildParams(filters, ["district"]);
  const yearOnly = buildParams(filters, ["year"]);
  const heatmapFilters = buildParams(filters, ["district", "year", "severity"]);

  const [
    summary,
    districts,
    severity,
    timeSeries,
    violations,
    weather,
    light,
    roads,
    casualty,
    dangerous,
    heatmap,
  ] = await Promise.all([
    axios.get<SummaryResponse>(`/dashboard/summary${districtYear}`),
    axios.get<{ data: DistrictCount[] }>(`/dashboard/by-district${yearOnly}`),
    axios.get<{ data: SeverityCount[] }>(
      `/dashboard/by-severity${districtYear}`
    ),
    axios.get<{ data: TimeSeriesPoint[] }>(
      `/dashboard/time-series${districtOnly}`
    ),
    axios.get<{ data: Array<{ traffic_violation: string; count: number }> }>(
      `/dashboard/by-violation${districtYear}`
    ),
    axios.get<{ data: Array<{ weather_condition: string; count: number }> }>(
      `/dashboard/by-weather${districtYear}`
    ),
    axios.get<{ data: Array<{ light_condition: string; count: number }> }>(
      `/dashboard/by-light${districtYear}`
    ),
    axios.get<{ data: RoadCount[] }>(`/dashboard/by-road${yearOnly}`),
    axios.get<{ data: CasualtyBreakdown[] }>(
      `/dashboard/casualty-breakdown${districtYear}`
    ),
    axios.get<{ data: DangerousDistrict[] }>(
      `/dashboard/top-dangerous${yearOnly}`
    ),
    axios.get<{ total: number; data: HeatmapPoint[] }>(
      `/dashboard/heatmap${heatmapFilters}`
    ),
  ]);

  return {
    summary: summary.data,
    districts: districts.data.data,
    severity: severity.data.data,
    timeSeries: timeSeries.data.data,
    violations: violations.data.data.map((v) => ({
      name: v.traffic_violation || "Unknown",
      count: v.count,
    })),
    weather: weather.data.data.map((w) => ({
      name: w.weather_condition || "Unknown",
      count: w.count,
    })),
    light: light.data.data.map((l) => ({
      name: l.light_condition || "Unknown",
      count: l.count,
    })),
    roads: roads.data.data,
    casualty: casualty.data.data,
    dangerous: dangerous.data.data,
    heatmap: heatmap.data.data,
  };
}