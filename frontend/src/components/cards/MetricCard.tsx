import { motion } from "framer-motion";

interface MetricCardProps {
  label: string;
  value: number;
  sub?: string;
  valueColor?: string;
}

export function MetricCard({
  label,
  value,
  sub,
  valueColor = "text-[#1A1D2E]",
}: MetricCardProps) {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)" }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between"
    >
      <div className="flex justify-between items-start mb-2">
        <p className="text-[14px] font-medium text-gray-500">{label}</p>
      </div>
      <div className="flex items-baseline gap-3">
        <h3 className={`text-4xl font-bold tracking-tight ${valueColor}`}>
          {value.toLocaleString("en-IN")}
        </h3>
        {sub && (
          <span className="text-[12px] font-semibold text-gray-500 flex items-center gap-1">
            {sub}
          </span>
        )}
      </div>
    </motion.div>
  );
}
