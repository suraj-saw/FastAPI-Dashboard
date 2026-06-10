import { useState, useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  Car,
  Users,
  Building2,
  RadioTower,
  ChevronDown,
  Search,
  RotateCcw,
  MapPin,
  ShieldAlert,
  CloudSun,
  Sun,
  Moon,
  Route,
  TrendingUp,
} from "lucide-react";

import { Sidebar } from "../components/layout/Sidebar";
import { Navbar } from "../components/layout/Navbar";
import { MetricCard } from "../components/cards/MetricCard";
import { AccidentTrend } from "../components/charts/AccidentTrend";
import { SeverityChart } from "../components/charts/SeverityChart";
import { StateChart } from "../components/charts/StateChart";
import { useDashboard } from "../hooks/useDashboard";
import type { DashboardFilters } from "../types/dashboard";

function fmt(n: number) {
  return n.toLocaleString("en-IN");
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<DashboardFilters>({
    district: "all",
    year: "all",
    severity: "all",
  });
  const [districtSearch, setDistrictSearch] = useState("");

  // Fetch with no filters so filter dropdowns always have full option lists
  const allDataFilters: DashboardFilters = { district: "all", year: "all", severity: "all" };
  const { data: allData } = useDashboard(allDataFilters);
  const { data, loading, error, refetch } = useDashboard(filters);

  // ── Dynamic filter options derived from live API data ──────────────────────

  /** Unique sorted years from the full (unfiltered) time series */
  const years = useMemo(() => {
    const uniqueYears = Array.from(
      new Set(allData.timeSeries.map((p) => String(p.year)))
    ).sort();
    return ["all", ...uniqueYears];
  }, [allData.timeSeries]);

  /** Severity labels from the full (unfiltered) severity breakdown */
  const severities = useMemo(() => {
    const labels = allData.severity
      .map((s) => s.severity)
      .filter(Boolean)
      .sort();
    return ["all", ...labels];
  }, [allData.severity]);

  /** District options derived from the filtered data (year-aware) */
  const districts = useMemo(() => {
    const names = data.districts.map((d) => d.district).filter(Boolean);
    return ["all", ...Array.from(new Set(names))];
  }, [data.districts]);

  const filteredDistricts = useMemo(
    () =>
      districts.filter((d) =>
        d.toLowerCase().includes(districtSearch.toLowerCase())
      ),
    [districts, districtSearch]
  );

  const topDangerous = data.dangerous[0];

  return (
    <div className="flex h-screen bg-[#f4f7fa] overflow-hidden font-sans text-gray-800">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-auto">
          {/* Reduced gap and padding to create a compact, modern feel */}
          <div className="flex gap-4 p-4 min-h-full max-w-[1600px] mx-auto">

            {/* ── Minimal Filter Sidebar ── */}
            <aside className="hidden xl:flex flex-col gap-4 w-[240px] shrink-0">
              <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-gray-100 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-4">
                  Filters
                </p>

                <div className="mb-4">
                  <label className="block text-[12px] font-medium text-gray-600 mb-1.5">Year</label>
                  <div className="relative">
                    <select
                      value={filters.year}
                      onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value }))}
                      className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-[13px] px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5]"
                    >
                      {years.map((y) => <option key={y} value={y}>{y === "all" ? "All years" : y}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-[12px] font-medium text-gray-600 mb-1.5">District</label>
                  <div className="relative">
                    <select
                      value={filters.district}
                      onChange={(e) => setFilters((f) => ({ ...f, district: e.target.value }))}
                      className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-[13px] px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5]"
                    >
                      {districts.map((d) => <option key={d} value={d}>{d === "all" ? "All districts" : d}</option>)}
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => setFilters({ district: "all", year: "all", severity: "all" })}
                  className="w-full flex items-center justify-center gap-2 text-[12px] font-semibold py-2 mt-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  Reset filters
                </button>
              </div>
            </aside>

            {/* ── Main content ── */}
            <div className="flex-1 min-w-0 flex flex-col gap-4">

              {/* KPIs */}
                            {/* KPIs - 8 Cards for maximum data insight */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="Total accidents" value={data.summary.total_accidents} valueColor="text-[#4f46e5]" />
                <MetricCard label="Fatalities" value={data.summary.total_fatalities} valueColor="text-[#f43f5e]" />
                <MetricCard label="Total injuries" value={data.summary.total_grievous + data.summary.total_minor} sub={`${data.summary.total_grievous.toLocaleString("en-IN")} grievous`} valueColor="text-[#f59e0b]" />
                <MetricCard label="Vehicles involved" value={data.summary.total_vehicles} valueColor="text-[#10b981]" />
                
                {/* Secondary Row */}
                <MetricCard label="Damage only" value={data.summary.total_damage_only} valueColor="text-[#8b5cf6]" />
                <MetricCard label="Districts covered" value={data.summary.districts_covered} valueColor="text-[#101828]" />
                <MetricCard label="Police stations" value={data.summary.police_stations} valueColor="text-[#101828]" />
                <MetricCard label="Mapped points" value={data.heatmap.length} valueColor="text-[#0ea5e9]" />
              </div>


              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <AccidentTrend data={data.timeSeries} />
                </div>
                <SeverityChart data={data.severity} />
              </div>

              {/* Removed the extra wrapper here to fix double-padding! */}
              <StateChart data={data.districts} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );


}
