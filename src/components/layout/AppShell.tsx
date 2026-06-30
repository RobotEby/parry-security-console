import { useState, type ReactNode } from "react";
import { MobileSidebar, Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="dark min-h-screen flex bg-background text-foreground">
      <div className="hidden lg:flex sticky top-0 h-screen">
        <Sidebar />
      </div>
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onOpenMenu={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-6 max-w-[1600px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
