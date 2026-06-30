import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";

const DashboardPage = lazy(() =>
  import("@/features/dashboard/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  })),
);
const EventsPage = lazy(() =>
  import("@/features/events/EventsPage").then((module) => ({ default: module.EventsPage })),
);
const EventDetailPage = lazy(() =>
  import("@/features/events/EventDetailPage").then((module) => ({
    default: module.EventDetailPage,
  })),
);
const BansPage = lazy(() =>
  import("@/features/bans/BansPage").then((module) => ({ default: module.BansPage })),
);
const PoliciesPage = lazy(() =>
  import("@/features/policies/PoliciesPage").then((module) => ({ default: module.PoliciesPage })),
);
const HealthPage = lazy(() =>
  import("@/features/health/HealthPage").then((module) => ({ default: module.HealthPage })),
);
const SettingsPage = lazy(() =>
  import("@/features/settings/SettingsPage").then((module) => ({ default: module.SettingsPage })),
);

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
      Loading...
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <h2 className="mt-3 text-lg font-semibold">Route not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist in the console.
        </p>
        <div className="mt-5">
          <a
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            href="/"
          >
            Back to dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

export function AppRouter() {
  return (
    <AppShell>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/bans" element={<BansPage />} />
          <Route path="/policies" element={<PoliciesPage />} />
          <Route path="/health" element={<HealthPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/index.html" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}
