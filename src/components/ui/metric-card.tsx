import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "default",
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  accent?: "default" | "danger" | "warning" | "success";
  className?: string;
}) {
  const accentColor: Record<string, string> = {
    default: "text-muted-foreground",
    danger: "text-[color:var(--sev-critical)]",
    warning: "text-[color:var(--warning)]",
    success: "text-[color:var(--success)]",
  };
  return (
    <div
      className={cn("rounded-lg border border-border bg-card p-4 flex flex-col gap-2", className)}
    >
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs uppercase tracking-wider font-medium">{label}</span>
        {Icon ? <Icon className={cn("size-4", accentColor[accent])} /> : null}
      </div>
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      {hint ? <div className="text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}
