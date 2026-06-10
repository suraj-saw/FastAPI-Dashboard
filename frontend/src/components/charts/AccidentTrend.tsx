import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { TimeSeriesPoint } from "../../types/dashboard";

interface Props {
  data: TimeSeriesPoint[];
}

export function AccidentTrend({ data }: Props) {
  const recent = data.slice(-12);
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
        Accident trend over time
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={recent}>
          <defs>
            <linearGradient id="accidentGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="fatalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e2e8f0"
          />
          <XAxis
            dataKey="month_label"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            width={38}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              fontSize: 12,
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            formatter={(value) =>
              value === "accident_count" ? "Accidents" : "Fatalities"
            }
          />
          <Area
            type="monotone"
            dataKey="accident_count"
            stroke="#3b82f6"
            fill="url(#accidentGrad)"
            strokeWidth={2}
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="fatalities"
            stroke="#ef4444"
            fill="url(#fatalGrad)"
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}