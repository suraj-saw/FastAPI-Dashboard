import type { ReactNode } from "react";

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: number;
  sub?: string;
  variant?: "red" | "orange" | "blue" | "green" | "purple" | "teal";
}

const variantStyles: Record<
  NonNullable<MetricCardProps["variant"]>,
  { card: string; icon: string; value: string }
> = {
  red: {
    card: "border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/30",
    icon: "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400",
    value: "text-red-700 dark:text-red-300",
  },
  orange: {
    card: "border-orange-200 bg-orange-50 dark:border-orange-900/40 dark:bg-orange-950/30",
    icon: "bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400",
    value: "text-orange-700 dark:text-orange-300",
  },
  blue: {
    card: "border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/30",
    icon: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400",
    value: "text-blue-700 dark:text-blue-300",
  },
  green: {
    card: "border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-950/30",
    icon: "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400",
    value: "text-green-700 dark:text-green-300",
  },
  purple: {
    card: "border-purple-200 bg-purple-50 dark:border-purple-900/40 dark:bg-purple-950/30",
    icon: "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400",
    value: "text-purple-700 dark:text-purple-300",
  },
  teal: {
    card: "border-teal-200 bg-teal-50 dark:border-teal-900/40 dark:bg-teal-950/30",
    icon: "bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400",
    value: "text-teal-700 dark:text-teal-300",
  },
};

export function MetricCard({
  icon,
  label,
  value,
  sub,
  variant = "blue",
}: MetricCardProps) {
  const styles = variantStyles[variant];
  return (
    <div
      className={`rounded-xl border p-4 flex flex-col gap-3 ${styles.card}`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${styles.icon}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {label}
        </p>
        <p className={`text-2xl font-bold mt-0.5 ${styles.value}`}>
          {value.toLocaleString("en-IN")}
        </p>
        {sub && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}