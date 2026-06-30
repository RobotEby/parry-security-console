import { cn } from "@/lib/utils";
import { severityClasses } from "@/lib/utils/severity";

export function SeverityBadge({ severity, className }: { severity: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium uppercase tracking-wide",
        severityClasses(severity),
        className,
      )}
    >
      {severity}
    </span>
  );
}
