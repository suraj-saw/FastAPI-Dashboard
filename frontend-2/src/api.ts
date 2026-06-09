export type DashboardFilters = {
  district?: string;
  year?: string;
  severity?: string;
};

export type SummaryResponse = {
  total_accidents: number;
  total_fatalities: number;
  total_grievous: number;
  total_minor: number;
  total_damage_only: number;
  total_vehicles: number;
  districts_covered: number;
  police_stations: number;
};

export type DistrictCount = {
  district: string;
  accident_count: number;
  fatalities: number;
};

export type SeverityCount = {
  severity: string;
  count: number;
};

export type TimeSeriesPoint = {
  year: number;
  month: number;
  month_label: string;
  accident_count: number;
  fatalities: number;
};

export type NamedCount = {
  name: string;
  count: number;
};

export type RoadCount = {
  road_classification: string;
  accident_count: number;
  fatalities: number;
};

export type CasualtyBreakdown = {
  category: string;
  killed: number;
  grievous: number;
  minor: number;
};

export type DangerousDistrict = {
  rank: number;
  district: string;
  fatal_accidents: number;
  total_killed: number;
};

export type HeatmapPoint = {
  accident_id: string;
  latitude: number;
  longitude: number;
  severity: string;
  district: string;
};

export type DashboardData = {
  summary: SummaryResponse;
  districts: DistrictCount[];
  severity: SeverityCount[];
  timeSeries: TimeSeriesPoint[];
  violations: NamedCount[];
  weather: NamedCount[];
  light: NamedCount[];
  roads: RoadCount[];
  casualty: CasualtyBreakdown[];
  dangerous: DangerousDistrict[];
  heatmap: HeatmapPoint[];
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

function makeParams(filters: DashboardFilters, keys: Array<keyof DashboardFilters>) {
  const params = new URLSearchParams();
  keys.forEach((key) => {
    const value = filters[key];
    if (value && value !== "all") {
      params.set(key, value);
    }
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchDashboard(filters: DashboardFilters): Promise<DashboardData> {
  const districtYear = makeParams(filters, ["district", "year"]);
  const districtOnly = makeParams(filters, ["district"]);
  const yearOnly = makeParams(filters, ["year"]);
  const heatmapFilters = makeParams(filters, ["district", "year", "severity"]);

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
    request<SummaryResponse>(`/dashboard/summary${districtYear}`),
    request<{ data: DistrictCount[] }>(`/dashboard/by-district${yearOnly}`),
    request<{ data: SeverityCount[] }>(`/dashboard/by-severity${districtYear}`),
    request<{ data: TimeSeriesPoint[] }>(`/dashboard/time-series${districtOnly}`),
    request<{ data: Array<{ traffic_violation: string; count: number }> }>(`/dashboard/by-violation${districtYear}`),
    request<{ data: Array<{ weather_condition: string; count: number }> }>(`/dashboard/by-weather${districtYear}`),
    request<{ data: Array<{ light_condition: string; count: number }> }>(`/dashboard/by-light${districtYear}`),
    request<{ data: RoadCount[] }>(`/dashboard/by-road${yearOnly}`),
    request<{ data: CasualtyBreakdown[] }>(`/dashboard/casualty-breakdown${districtYear}`),
    request<{ data: DangerousDistrict[] }>(`/dashboard/top-dangerous${yearOnly}`),
    request<{ data: HeatmapPoint[] }>(`/dashboard/heatmap${heatmapFilters}`),
  ]);

  return {
    summary,
    districts: districts.data,
    severity: severity.data,
    timeSeries: timeSeries.data,
    violations: violations.data.map((item) => ({
      name: item.traffic_violation || "Unknown",
      count: item.count,
    })),
    weather: weather.data.map((item) => ({
      name: item.weather_condition || "Unknown",
      count: item.count,
    })),
    light: light.data.map((item) => ({
      name: item.light_condition || "Unknown",
      count: item.count,
    })),
    roads: roads.data,
    casualty: casualty.data,
    dangerous: dangerous.data,
    heatmap: heatmap.data,
  };
}
