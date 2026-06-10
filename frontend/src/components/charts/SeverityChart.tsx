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

const COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#f43f5e"];

export function SeverityChart({ data }: Props) {
  const total = data.reduce((s, d) => s + d.count, 0);
  
  return (
    <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-gray-100 p-5 flex flex-col h-full">
      <h3 className="text-[14px] font-semibold text-gray-800 mb-4">
        Severity distribution
      </h3>
      <div className="w-full h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="severity"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [
                `${Number(value).toLocaleString("en-IN")} (${total > 0 ? Math.round((Number(value) / total) * 100) : 0}%)`,
                "Count",
              ]}
              contentStyle={{ borderRadius: 8, fontSize: 12, border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              formatter={(value) => (
                <span style={{ fontSize: 12, color: '#6b7280' }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
