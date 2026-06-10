import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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

const YEARS = [
  "all",
  "2019",
  "2020",
  "2021",
  "2022",
  "2023",
  "2024",
  "2025",
  "2026",
];
const SEVERITIES = [
  "all",
  "Fatal",
  "Grievous Injury",
  "Minor Injury",
  "Damage Only",
];

function fmt(n: number) {
  return n.toLocaleString("en-IN");
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<DashboardFilters>({
    district: "all",
    year: "all",
    severity: "all",
  });
  const [districtSearch, setDistrictSearch] = useState("");

  const { data, loading, error, refetch } = useDashboard(filters);

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

  function handleLogout() {
    const refresh = sessionStorage.getItem("refresh_token");
    if (refresh) {
      import("../api/axios").then(({ default: api }) =>
        api.post("/auth/logout", { refresh_token: refresh }).catch(() => {})
      );
    }
    sessionStorage.clear();
    navigate("/login");
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          loading={loading}
          onRefresh={refetch}
        />

        <div className="flex-1 overflow-auto">
          <div className="flex gap-5 p-5 min-h-full">
            {/* ── Filter panel ─────────────────────────────────── */}
            <aside className="hidden xl:flex flex-col gap-4 w-56 shrink-0">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                  Filters
                </p>

                {/* Year */}
                <div className="mb-3">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Year
                  </label>
                  <div className="relative">
                    <select
                      value={filters.year}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, year: e.target.value }))
                      }
                      className="w-full appearance-none rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y === "all" ? "All years" : y}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                </div>

                {/* District search + select */}
                <div className="mb-3">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    District
                  </label>
                  <div className="relative mb-1">
                    <Search
                      size={13}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      value={districtSearch}
                      onChange={(e) => setDistrictSearch(e.target.value)}
                      placeholder="Search…"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm pl-7 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={filters.district}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, district: e.target.value }))
                      }
                      className="w-full appearance-none rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {filteredDistricts.map((d) => (
                        <option key={d} value={d}>
                          {d === "all" ? "All districts" : d}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                </div>

                {/* Severity */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Severity (map)
                  </label>
                  <div className="relative">
                    <select
                      value={filters.severity}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, severity: e.target.value }))
                      }
                      className="w-full appearance-none rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {SEVERITIES.map((s) => (
                        <option key={s} value={s}>
                          {s === "all" ? "All severity" : s}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                </div>

                <button
                  onClick={() =>
                    setFilters({
                      district: "all",
                      year: "all",
                      severity: "all",
                    })
                  }
                  className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <RotateCcw size={13} /> Reset filters
                </button>
              </div>

              {/* Focus summary */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <p className="font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Current focus
                </p>
                <p>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    Year:
                  </span>{" "}
                  {filters.year === "all" ? "All" : filters.year}
                </p>
                <p>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    District:
                  </span>{" "}
                  {filters.district === "all" ? "All" : filters.district}
                </p>
                <p className="mt-2 text-slate-400">
                  {fmt(data.heatmap.length)} mapped accident points.
                </p>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full text-xs font-semibold py-2 rounded-lg border border-red-200 dark:border-red-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                Logout
              </button>
            </aside>

            {/* ── Main content ──────────────────────────────────── */}
            <div className="flex-1 min-w-0 flex flex-col gap-5">
              {/* Error banner */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900/50 px-4 py-3 flex gap-3 items-start text-sm text-red-700 dark:text-red-300">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <div>
                    <strong>Failed to load data</strong>
                    <p className="text-xs mt-0.5 text-red-500">{error}</p>
                  </div>
                </div>
              )}

              {/* KPI metric cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MetricCard
                  icon={<Activity size={18} />}
                  label="Total accidents"
                  value={data.summary.total_accidents}
                  variant="blue"
                />
                <MetricCard
                  icon={<AlertTriangle size={18} />}
                  label="Fatalities"
                  value={data.summary.total_fatalities}
                  variant="red"
                />
                <MetricCard
                  icon={<Users size={18} />}
                  label="Total injuries"
                  value={
                    data.summary.total_grievous + data.summary.total_minor
                  }
                  sub={`${fmt(data.summary.total_grievous)} grievous · ${fmt(data.summary.total_minor)} minor`}
                  variant="orange"
                />
                <MetricCard
                  icon={<Car size={18} />}
                  label="Vehicles involved"
                  value={data.summary.total_vehicles}
                  variant="teal"
                />
              </div>

              {/* Second row KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MetricCard
                  icon={<ShieldAlert size={18} />}
                  label="Damage only"
                  value={data.summary.total_damage_only}
                  variant="purple"
                />
                <MetricCard
                  icon={<Building2 size={18} />}
                  label="Districts covered"
                  value={data.summary.districts_covered}
                  variant="green"
                />
                <MetricCard
                  icon={<RadioTower size={18} />}
                  label="Police stations"
                  value={data.summary.police_stations}
                  variant="blue"
                />
                <MetricCard
                  icon={<MapPin size={18} />}
                  label="Mapped points"
                  value={data.heatmap.length}
                  variant="teal"
                />
              </div>

              {/* Charts row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <AccidentTrend data={data.timeSeries} />
                </div>
                <SeverityChart data={data.severity} />
              </div>

              {/* District bar chart */}
              <StateChart data={data.districts} />

              {/* Bottom row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Casualty breakdown */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Users size={15} /> Casualty breakdown
                  </h3>
                  <div className="space-y-3">
                    {data.casualty.map((c) => {
                      const total = c.killed + c.grievous + c.minor || 1;
                      return (
                        <div key={c.category}>
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            {c.category}
                          </p>
                          <div className="flex rounded-full overflow-hidden h-2.5">
                            <div
                              className="bg-red-500"
                              style={{
                                width: `${(c.killed / total) * 100}%`,
                              }}
                            />
                            <div
                              className="bg-orange-400"
                              style={{
                                width: `${(c.grievous / total) * 100}%`,
                              }}
                            />
                            <div
                              className="bg-blue-400"
                              style={{
                                width: `${(c.minor / total) * 100}%`,
                              }}
                            />
                          </div>
                          <div className="flex gap-3 mt-1 text-xs text-slate-400">
                            <span className="text-red-500">
                              {fmt(c.killed)} killed
                            </span>
                            <span className="text-orange-400">
                              {fmt(c.grievous)} grievous
                            </span>
                            <span className="text-blue-400">
                              {fmt(c.minor)} minor
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Conditions */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <CloudSun size={15} /> Conditions
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <Sun size={12} /> Weather
                      </p>
                      {data.weather.slice(0, 4).map((w) => (
                        <div
                          key={w.name}
                          className="flex items-center justify-between py-1 text-sm"
                        >
                          <span className="text-slate-600 dark:text-slate-400 truncate mr-2">
                            {w.name}
                          </span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                            {fmt(w.count)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <Moon size={12} /> Light
                      </p>
                      {data.light.slice(0, 3).map((l) => (
                        <div
                          key={l.name}
                          className="flex items-center justify-between py-1 text-sm"
                        >
                          <span className="text-slate-600 dark:text-slate-400 truncate mr-2">
                            {l.name}
                          </span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                            {fmt(l.count)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Most dangerous + road types */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 flex flex-col gap-3">
                  {/* Most dangerous district */}
                  {topDangerous && (
                    <div className="rounded-lg bg-linear-to-br from-slate-800 to-red-900 text-white p-4">
                      <p className="text-xs text-slate-300 uppercase tracking-widest mb-1">
                        Most dangerous district
                      </p>
                      <p className="text-lg font-bold">
                        {topDangerous.district}
                      </p>
                      <p className="text-xs text-red-300 mt-1">
                        {fmt(topDangerous.fatal_accidents)} fatal accidents ·{" "}
                        {fmt(topDangerous.total_killed)} killed
                      </p>
                    </div>
                  )}

                  {/* Road types */}
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Route size={12} /> Road types
                    </p>
                    {data.roads.slice(0, 4).map((r, i) => (
                      <div
                        key={r.road_classification}
                        className="flex items-center justify-between py-1 text-sm"
                      >
                        <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400 truncate mr-2">
                          <span className="w-5 h-5 flex items-center justify-center rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                            {i + 1}
                          </span>
                          {r.road_classification}
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                          {fmt(r.accident_count)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top dangerous districts table */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <TrendingUp size={15} /> Top dangerous districts (fatal accidents)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        <th className="text-left text-xs font-bold text-slate-400 uppercase py-2 pr-4">
                          Rank
                        </th>
                        <th className="text-left text-xs font-bold text-slate-400 uppercase py-2 pr-4">
                          District
                        </th>
                        <th className="text-right text-xs font-bold text-slate-400 uppercase py-2 pr-4">
                          Fatal accidents
                        </th>
                        <th className="text-right text-xs font-bold text-slate-400 uppercase py-2">
                          Total killed
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.dangerous.slice(0, 10).map((d) => (
                        <tr
                          key={d.rank}
                          className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-2 pr-4 text-slate-400 font-mono">
                            #{d.rank}
                          </td>
                          <td className="py-2 pr-4 font-medium text-slate-700 dark:text-slate-300">
                            {d.district}
                          </td>
                          <td className="py-2 pr-4 text-right font-semibold text-red-500">
                            {fmt(d.fatal_accidents)}
                          </td>
                          <td className="py-2 text-right font-semibold text-slate-600 dark:text-slate-400">
                            {fmt(d.total_killed)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Violations */}
              {data.violations.length > 0 && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Traffic violations
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {data.violations.slice(0, 8).map((v) => {
                      const max = data.violations[0]?.count || 1;
                      const pct = Math.round((v.count / max) * 100);
                      return (
                        <div
                          key={v.name}
                          className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3"
                        >
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-1">
                            {v.name}
                          </p>
                          <p className="text-base font-bold text-slate-700 dark:text-slate-200">
                            {fmt(v.count)}
                          </p>
                          <div className="mt-2 h-1 rounded-full bg-slate-200 dark:bg-slate-700">
                            <div
                              className="h-1 rounded-full bg-blue-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}