import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { DistrictCount } from "../../types/dashboard";

interface Props {
  data: DistrictCount[];
  title?: string;
}

const BAR_COLOR = "#3b82f6";
const FATAL_COLOR = "#ef4444";

export function StateChart({ data, title = "Accidents by district" }: Props) {
  const top = data.slice(0, 10);
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
        {title}
      </h3>
      <ResponsiveContainer
        width="100%"
        height={Math.max(top.length * 42 + 60, 300)}
      >
        <BarChart data={top} layout="vertical" margin={{ left: 4, right: 16 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="#e2e8f0"
          />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="district"
            width={110}
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ borderRadius: 8, fontSize: 12 }}
            formatter={(value: any, name: any) => [
              value.toLocaleString("en-IN"),
              name === "accident_count" ? "Accidents" : "Fatalities",
            ]}
          />
          <Bar dataKey="accident_count" radius={[0, 4, 4, 0]} name="accident_count">
            {top.map((_, i) => (
              <Cell
                key={i}
                fill={BAR_COLOR}
                fillOpacity={1 - i * 0.07}
              />
            ))}
          </Bar>
          <Bar dataKey="fatalities" radius={[0, 4, 4, 0]} name="fatalities">
            {top.map((_, i) => (
              <Cell key={i} fill={FATAL_COLOR} fillOpacity={1 - i * 0.07} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}