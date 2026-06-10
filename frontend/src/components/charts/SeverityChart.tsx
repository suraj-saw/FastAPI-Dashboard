import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { SeverityCount } from "../../types/dashboard";

interface Props {
  data: SeverityCount[];
}

const COLORS = ["#ef4444", "#f97316", "#3b82f6", "#22c55e", "#a855f7"];

export function SeverityChart({ data }: Props) {
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
        Severity distribution
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="severity"
            innerRadius={52}
            outerRadius={82}
            paddingAngle={3}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any) => [
              `${value.toLocaleString("en-IN")} (${total > 0 ? Math.round((value / total) * 100) : 0}%)`,
              "Count",
            ]}
            contentStyle={{ borderRadius: 8, fontSize: 12 }}
          />
          <Legend
            formatter={(value) => (
              <span style={{ fontSize: 11 }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}