import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

export function EmptyState({
  title = "No data",
  description,
  icon: Icon = Inbox,
}: {
  title?: string;
  description?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card/50 p-10 text-center">
      <Icon className="size-8 text-muted-foreground" />
      <div className="text-sm font-medium">{title}</div>
      {description ? (
        <div className="text-xs text-muted-foreground max-w-md">{description}</div>
      ) : null}
    </div>
  );
}
