import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Variant = "blue" | "red" | "amber" | "teal" | "purple" | "green";

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: number;
  sub?: string;
  variant?: Variant;
}

const VARIANTS: Record<Variant, { accent: string; iconBg: string; iconColor: string; valueColor: string }> = {
  blue:   { accent: "#2C6EF2", iconBg: "#EEF3FF", iconColor: "#2C6EF2", valueColor: "#2C6EF2" },
  red:    { accent: "#E85D4A", iconBg: "#FEF0EE", iconColor: "#E85D4A", valueColor: "#E85D4A" },
  amber:  { accent: "#F5A623", iconBg: "#FEF6E7", iconColor: "#D4891A", valueColor: "#D4891A" },
  teal:   { accent: "#0891B2", iconBg: "#E0F4F8", iconColor: "#0891B2", valueColor: "#0891B2" },
  purple: { accent: "#7C3AED", iconBg: "#F3EFFE", iconColor: "#7C3AED", valueColor: "#7C3AED" },
  green:  { accent: "#27AE60", iconBg: "#E7F8EF", iconColor: "#27AE60", valueColor: "#27AE60" },
};

function fmt(n: number) {
  return n.toLocaleString("en-IN");
}

export function MetricCard({ icon, label, value, sub, variant = "blue" }: MetricCardProps) {
  const v = VARIANTS[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -3, boxShadow: "0 8px 28px rgba(26,29,46,0.12)" }}
      className="relative overflow-hidden rounded-xl border border-[#E4E8F4] bg-white p-5"
      style={{ boxShadow: "0 1px 3px rgba(26,29,46,0.06), 0 4px 12px rgba(26,29,46,0.04)" }}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl"
        style={{ background: v.accent }}
      />

      {/* Icon */}
      <div
        className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg"
        style={{ background: v.iconBg, color: v.iconColor }}
      >
        {icon}
      </div>

      {/* Label */}
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.07em] text-[#6B7299]">
        {label}
      </p>

      {/* Value — animated */}
      <motion.p
        key={value}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="text-[26px] font-bold leading-tight tracking-tight"
        style={{ color: v.valueColor }}
      >
        {fmt(value)}
      </motion.p>

      {sub && (
        <p className="mt-1 text-[11px] text-[#9BA3C2]">{sub}</p>
      )}
    </motion.div>
  );
}
