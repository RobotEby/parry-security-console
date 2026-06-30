import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: "connected" | "disconnected" | "unauthorized" | "mock";
  label?: string;
  className?: string;
}) {
  const map = {
    connected: {
      dot: "bg-[color:var(--success)]",
      ring: "ring-[color:var(--success)]/30",
      text: "text-[color:var(--success)]",
      label: label ?? "Connected",
    },
    disconnected: {
      dot: "bg-destructive",
      ring: "ring-destructive/30",
      text: "text-destructive",
      label: label ?? "Disconnected",
    },
    unauthorized: {
      dot: "bg-[color:var(--warning)]",
      ring: "ring-[color:var(--warning)]/30",
      text: "text-[color:var(--warning)]",
      label: label ?? "Unauthorized",
    },
    mock: {
      dot: "bg-[color:var(--warning)]",
      ring: "ring-[color:var(--warning)]/30",
      text: "text-[color:var(--warning)]",
      label: label ?? "Mock data active",
    },
  } as const;
  const s = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-border bg-surface-1 px-2.5 py-1 text-xs font-medium",
        s.text,
        className,
      )}
    >
      <span className={cn("inline-block size-2 rounded-full ring-2", s.dot, s.ring)} />
      {s.label}
    </span>
  );
}
