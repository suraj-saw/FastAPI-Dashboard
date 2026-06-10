import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import type { TimeSeriesPoint } from "../../types/dashboard";

interface Props {
  data: TimeSeriesPoint[];
}

export function AccidentTrend({ data }: Props) {
  const recent = data.slice(-12);
  return (
    <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-gray-100 p-5 h-full">
      <h3 className="text-[14px] font-semibold text-gray-800 mb-2">
        Accident trend over time
      </h3>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={recent} margin={{ top: 20, right: 15, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAccidents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorFatalities" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="month_label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Area type="monotone" name="Accidents" dataKey="accident_count" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorAccidents)" />
            <Area type="monotone" name="Fatalities" dataKey="fatalities" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorFatalities)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
