import { NavLink, useLocation } from "react-router-dom";
import { Activity, Ban, Cog, Gauge, HeartPulse, Shield, ShieldAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof Gauge; exact?: boolean };
const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: Gauge, exact: true },
  { to: "/events", label: "Threat Events", icon: ShieldAlert },
  { to: "/bans", label: "Active Bans", icon: Ban },
  { to: "/policies", label: "Route Policies", icon: Shield },
  { to: "/health", label: "Admin API Health", icon: HeartPulse },
  { to: "/settings", label: "Settings", icon: Cog },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  return (
    <aside className="h-full w-60 shrink-0 border-r border-border bg-surface-1 flex flex-col">
      <div className="h-14 flex items-center gap-2 px-4 border-b border-border">
        <div className="size-7 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center">
          <Activity className="size-4 text-primary" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">Parry Security Console</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            App-layer telemetry
          </span>
        </div>
      </div>
      <nav className="flex-1 p-2 space-y-0.5 overflow-auto">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                active
                  ? "bg-surface-2 text-foreground"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
              )}
            >
              <Icon className={cn("size-4", active && "text-primary")} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border text-[10px] text-muted-foreground leading-snug">
        Application-layer security only. Volumetric DDoS belongs to CloudFront / AWS WAF / Shield /
        CDN.
      </div>
    </aside>
  );
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 w-64 shadow-xl flex">
        <Sidebar onNavigate={onClose} />
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 size-8 rounded-md border border-border bg-surface-1 flex items-center justify-center"
          aria-label="Close menu"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
