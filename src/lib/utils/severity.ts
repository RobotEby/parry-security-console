import type { Severity } from "../api/types";

export const SEVERITIES: Severity[] = ["low", "medium", "high", "critical"];

export function severityClasses(severity: string): string {
  switch (severity) {
    case "low":
      return "bg-[color:var(--sev-low)]/15 text-[color:var(--sev-low)] border border-[color:var(--sev-low)]/30";
    case "medium":
      return "bg-[color:var(--sev-medium)]/15 text-[color:var(--sev-medium)] border border-[color:var(--sev-medium)]/30";
    case "high":
      return "bg-[color:var(--sev-high)]/15 text-[color:var(--sev-high)] border border-[color:var(--sev-high)]/30";
    case "critical":
      return "bg-[color:var(--sev-critical)]/20 text-[color:var(--sev-critical)] border border-[color:var(--sev-critical)]/40";
    default:
      return "bg-muted text-muted-foreground border border-border";
  }
}

export function actionClasses(action: string): string {
  switch (action) {
    case "blocked":
      return "bg-[color:var(--sev-critical)]/15 text-[color:var(--sev-critical)] border border-[color:var(--sev-critical)]/30";
    case "monitored":
    case "observed":
      return "bg-[color:var(--sev-medium)]/15 text-[color:var(--sev-medium)] border border-[color:var(--sev-medium)]/30";
    case "allowed":
      return "bg-[color:var(--success)]/15 text-[color:var(--success)] border border-[color:var(--success)]/30";
    default:
      return "bg-muted text-muted-foreground border border-border";
  }
}
