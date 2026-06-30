import { AlertTriangle } from "lucide-react";
import { ApiConnectionForm } from "./ApiConnectionForm";

export function SettingsPage() {
  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Connection to the Parry Admin API. Stored locally in your browser.
        </p>
      </div>
      <div className="rounded-lg border border-[color:var(--warning)]/40 bg-[color:var(--warning)]/5 p-4 flex gap-3">
        <AlertTriangle className="size-5 text-[color:var(--warning)] mt-0.5" />
        <div className="text-xs text-foreground/90 leading-relaxed">
          Browser-stored admin tokens are intended for local and demo usage only. In production,
          protect the Admin API behind a VPN, private network, reverse proxy auth, Cognito,
          Cloudflare Access, ALB auth or an equivalent layer. The console never sends your token
          anywhere except the API URL you configure.
        </div>
      </div>
      <ApiConnectionForm />
    </div>
  );
}
