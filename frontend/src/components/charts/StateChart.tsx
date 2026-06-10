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

const BAR_COLOR = "#4f46e5"; // Indigo matching the trend chart
const FATAL_COLOR = "#0ea5e9"; // Sky blue

export function StateChart({ data, title = "Accidents by district" }: Props) {
  const top = data.slice(0, 10);
  return (
    <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-gray-100 p-5">
      <h3 className="text-[14px] font-semibold text-gray-800 mb-4">
        {title}
      </h3>
      <div className="w-full" style={{ height: Math.max(top.length * 36 + 40, 250) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={top} layout="vertical" margin={{ left: 0, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
            <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="district" width={100} tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
            <Bar dataKey="accident_count" radius={[0, 4, 4, 0]} name="Accidents">
              {top.map((_, i) => (
                <Cell key={i} fill={BAR_COLOR} fillOpacity={1 - i * 0.05} />
              ))}
            </Bar>
            <Bar dataKey="fatalities" radius={[0, 4, 4, 0]} name="Fatalities">
              {top.map((_, i) => (
                <Cell key={i} fill={FATAL_COLOR} fillOpacity={1 - i * 0.05} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
