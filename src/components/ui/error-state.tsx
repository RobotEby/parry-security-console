import { AlertTriangle, RefreshCw } from "lucide-react";

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
  variant = "error",
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  variant?: "error" | "unauthorized" | "offline";
}) {
  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 flex items-start gap-4">
      <AlertTriangle className="size-5 text-destructive mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-destructive">{title}</div>
        {description ? (
          <div className="text-xs text-muted-foreground mt-1 break-words">{description}</div>
        ) : null}
        {variant === "unauthorized" ? (
          <div className="text-xs text-muted-foreground mt-2">
            Check the admin token in <span className="font-mono">/settings</span>.
          </div>
        ) : null}
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-2 rounded-md border border-border bg-surface-1 px-3 py-1.5 text-xs font-medium hover:bg-surface-2"
          >
            <RefreshCw className="size-3.5" /> Retry
          </button>
        ) : null}
      </div>
    </div>
  );
}
