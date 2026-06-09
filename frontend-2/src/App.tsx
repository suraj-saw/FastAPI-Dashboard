import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Car,
  ChevronDown,
  CloudSun,
  Crosshair,
  Filter,
  MapPin,
  Moon,
  RefreshCcw,
  Route,
  Search,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardData, DashboardFilters, fetchDashboard } from "./api";

const severityColors = ["#ec5b67", "#f59e0b", "#3b82f6", "#22c55e", "#8b5cf6"];
const years = ["all", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"];
const severities = ["all", "Fatal", "Grievous Injury", "Minor Injury", "Damage Only"];

function formatNumber(value = 0) {
  return new Intl.NumberFormat("en-IN").format(value);
}

const fallback: DashboardData = {
  summary: {
    total_accidents: 0,
    total_fatalities: 0,
    total_grievous: 0,
    total_minor: 0,
    total_damage_only: 0,
    total_vehicles: 0,
    districts_covered: 0,
    police_stations: 0,
  },
  districts: [],
  severity: [],
  timeSeries: [],
  violations: [],
  weather: [],
  light: [],
  roads: [],
  casualty: [],
  dangerous: [],
  heatmap: [],
};

export default function App() {
  const [filters, setFilters] = useState<DashboardFilters>({
    district: "all",
    year: "all",
    severity: "all",
  });
  const [data, setData] = useState<DashboardData>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [districtSearch, setDistrictSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchDashboard(filters)
      .then((nextData) => {
        if (!cancelled) {
          setData(nextData);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [filters]);

  const districts = useMemo(() => {
    const names = data.districts.map((item) => item.district).filter(Boolean);
    return ["all", ...new Set(names)];
  }, [data.districts]);

  const filteredDistricts = useMemo(
    () =>
      districts.filter((district) =>
        district.toLowerCase().includes(districtSearch.toLowerCase())
      ),
    [districts, districtSearch]
  );

  const activeLabel = [
    filters.year !== "all" ? filters.year : "All years",
    filters.district !== "all" ? filters.district : "All districts",
    filters.severity !== "all" ? filters.severity : "All severity",
  ].join(" / ");

  const mostDangerous = data.dangerous[0];
  const recentTrend = data.timeSeries.slice(-8);
  const topDistricts = data.districts.slice(0, 8);
  const topViolations = data.violations.slice(0, 6);
  const topRoads = data.roads.slice(0, 5);

  return (
    <div className="app-shell">
      <aside className="filter-rail">
        <div className="rail-brand">
          <div className="brand-mark">
            <ShieldAlert size={22} />
          </div>
          <div>
            <p>SVNIT</p>
            <strong>Accident Intel</strong>
          </div>
        </div>

        <div className="filter-title">
          <Filter size={16} />
          <span>Filters</span>
        </div>

        <div className="field">
          <label>Year</label>
          <SelectShell>
            <select
              data-testid="year-filter"
              value={filters.year}
              onChange={(event) => setFilters((current) => ({ ...current, year: event.target.value }))}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year === "all" ? "All years" : year}
                </option>
              ))}
            </select>
          </SelectShell>
        </div>

        <div className="field">
          <label>District</label>
          <div className="search-box">
            <Search size={15} />
            <input
              data-testid="district-search"
              value={districtSearch}
              onChange={(event) => setDistrictSearch(event.target.value)}
              placeholder="Search district"
            />
          </div>
          <SelectShell>
            <select
              data-testid="district-filter"
              value={filters.district}
              onChange={(event) => setFilters((current) => ({ ...current, district: event.target.value }))}
            >
              {filteredDistricts.map((district) => (
                <option key={district} value={district}>
                  {district === "all" ? "All districts" : district}
                </option>
              ))}
            </select>
          </SelectShell>
        </div>

        <div className="field">
          <label>Severity map</label>
          <SelectShell>
            <select
              data-testid="severity-filter"
              value={filters.severity}
              onChange={(event) => setFilters((current) => ({ ...current, severity: event.target.value }))}
            >
              {severities.map((severity) => (
                <option key={severity} value={severity}>
                  {severity === "all" ? "All severity" : severity}
                </option>
              ))}
            </select>
          </SelectShell>
        </div>

        <button
          className="reset-button"
          data-testid="reset-filters"
          onClick={() => setFilters({ district: "all", year: "all", severity: "all" })}
        >
          <RefreshCcw size={16} />
          Reset filters
        </button>

        <div className="rail-insight">
          <span>Current focus</span>
          <strong>{activeLabel}</strong>
          <p>{formatNumber(data.heatmap.length)} mapped accident points match this view.</p>
        </div>
      </aside>

      <main className="dashboard-stage">
        <motion.header
          className="topbar"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <div>
            <p className="eyebrow">Road safety analytics</p>
            <h1>District accident command center</h1>
          </div>
          <div className="status-pill">
            <Sparkles size={16} />
            {loading ? "Syncing API" : "Live API data"}
          </div>
        </motion.header>

        <AnimatePresence mode="wait">
          <motion.section
            key={`${filters.year}-${filters.district}-${filters.severity}`}
            className="center-panel"
            initial={{ opacity: 0, scale: 0.985, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.985, y: -12 }}
            transition={{ duration: 0.42, ease: "easeOut" }}
          >
            {error ? (
              <div className="error-panel">
                <AlertTriangle />
                <div>
                  <strong>Could not load dashboard data</strong>
                  <p>{error}</p>
                </div>
              </div>
            ) : null}

            <div className="metric-grid">
              <MetricCard icon={<Activity />} label="Total accidents" value={data.summary.total_accidents} tone="coral" />
              <MetricCard icon={<Crosshair />} label="Fatalities" value={data.summary.total_fatalities} tone="red" />
              <MetricCard icon={<Users />} label="Injuries" value={data.summary.total_grievous + data.summary.total_minor} tone="blue" />
              <MetricCard icon={<Car />} label="Vehicles involved" value={data.summary.total_vehicles} tone="green" />
            </div>

            <div className="hero-grid">
              <Panel className="trend-panel" title="Accidents over time" icon={<TrendingUp />}>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={recentTrend}>
                    <defs>
                      <linearGradient id="accidentFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#ec5b67" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#ec5b67" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d9e2ef" />
                    <XAxis dataKey="month_label" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} width={38} />
                    <Tooltip />
                    <Area type="monotone" dataKey="accident_count" stroke="#ec5b67" fill="url(#accidentFill)" strokeWidth={3} />
                    <Line type="monotone" dataKey="fatalities" stroke="#1d4ed8" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </Panel>

              <Panel className="map-panel" title="Mapped accident intensity" icon={<MapPin />}>
                <div className="map-orbit">
                  {data.heatmap.slice(0, 34).map((point, index) => (
                    <span
                      key={`${point.accident_id}-${index}`}
                      className={`map-dot severity-${(index % 5) + 1}`}
                      style={{
                        left: `${14 + ((Math.abs(point.longitude) * 11 + index * 7) % 74)}%`,
                        top: `${12 + ((Math.abs(point.latitude) * 13 + index * 9) % 70)}%`,
                        animationDelay: `${index * 90}ms`,
                      }}
                      title={`${point.district} - ${point.severity}`}
                    />
                  ))}
                  <div className="map-core">
                    <strong>{formatNumber(data.heatmap.length)}</strong>
                    <span>points</span>
                  </div>
                </div>
              </Panel>
            </div>

            <div className="content-grid">
              <Panel title="Top districts" icon={<BarChart3 />}>
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={topDistricts} layout="vertical" margin={{ left: 8, right: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#d9e2ef" />
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="district" width={96} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="accident_count" fill="#2563eb" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Panel>

              <Panel title="Severity split" icon={<AlertTriangle />}>
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie data={data.severity} dataKey="count" nameKey="severity" innerRadius={54} outerRadius={86} paddingAngle={4}>
                      {data.severity.map((_, index) => (
                        <Cell key={index} fill={severityColors[index % severityColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="legend-row">
                  {data.severity.slice(0, 4).map((item, index) => (
                    <span key={item.severity}>
                      <i style={{ background: severityColors[index % severityColors.length] }} />
                      {item.severity}
                    </span>
                  ))}
                </div>
              </Panel>

              <Panel title="Traffic violations" icon={<Route />}>
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={topViolations}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d9e2ef" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} tick={{ fontSize: 10 }} />
                    <YAxis tickLine={false} axisLine={false} width={34} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#14b8a6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Panel>

              <Panel title="Casualty profile" icon={<Users />}>
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={data.casualty}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d9e2ef" />
                    <XAxis dataKey="category" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} width={34} />
                    <Tooltip />
                    <Bar dataKey="killed" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="grievous" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="minor" stackId="a" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Panel>
            </div>

            <div className="lower-grid">
              <Panel title="Road classes" icon={<Route />}>
                <div className="rank-list">
                  {topRoads.map((road, index) => (
                    <div className="rank-item" key={road.road_classification}>
                      <span>{index + 1}</span>
                      <div>
                        <strong>{road.road_classification || "Unknown"}</strong>
                        <p>{formatNumber(road.accident_count)} accidents / {formatNumber(road.fatalities)} fatalities</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Conditions" icon={<CloudSun />}>
                <div className="condition-grid">
                  <ConditionCard icon={<CloudSun />} label="Weather" items={data.weather.slice(0, 3)} />
                  <ConditionCard icon={<Moon />} label="Light" items={data.light.slice(0, 3)} />
                </div>
              </Panel>

              <Panel title="Dangerous districts" icon={<ShieldAlert />}>
                <div className="danger-callout">
                  <span>Highest fatal accident district</span>
                  <strong>{mostDangerous?.district ?? "No data"}</strong>
                  <p>
                    {formatNumber(mostDangerous?.fatal_accidents ?? 0)} fatal accidents,
                    {" "}
                    {formatNumber(mostDangerous?.total_killed ?? 0)} killed
                  </p>
                </div>
              </Panel>
            </div>
          </motion.section>
        </AnimatePresence>
      </main>
    </div>
  );
}

function SelectShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="select-shell">
      {children}
      <ChevronDown size={16} />
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <motion.div className={`metric-card ${tone}`} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 280, damping: 22 }}>
      <div className="metric-icon">{icon}</div>
      <span>{label}</span>
      <strong>{formatNumber(value)}</strong>
    </motion.div>
  );
}

function Panel({
  title,
  icon,
  children,
  className = "",
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.article className={`panel ${className}`} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <div className="panel-title">
        <span>{icon}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </motion.article>
  );
}

function ConditionCard({ icon, label, items }: { icon: React.ReactNode; label: string; items: Array<{ name: string; count: number }> }) {
  return (
    <div className="condition-card">
      <div>
        {icon}
        <strong>{label}</strong>
      </div>
      {items.map((item) => (
        <p key={item.name}>
          <span>{item.name}</span>
          <b>{formatNumber(item.count)}</b>
        </p>
      ))}
    </div>
  );
}
