"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { IncidentHistory } from "@/components/incident-history";
import { OverallStatus } from "@/components/overall-status";
import { ServiceList } from "@/components/service-list";
import type { PublicStatusDocument } from "@/lib/types";

export function StatusPageClient({
  initialStatus,
}: {
  initialStatus: PublicStatusDocument;
}) {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch("/api/status", { cache: "no-store" });
        if (!response.ok) return;
        const next = (await response.json()) as PublicStatusDocument;
        if (active) setStatus(next);
      } catch {
        // Keep the last known public state. The stale flag comes from the server.
      }
    };
    const interval = window.setInterval(refresh, 60_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-8 sm:px-8 sm:py-12">
        <h1 className="sr-only">Viper Status</h1>
        <OverallStatus status={status} />
        <ServiceList services={status.services} />
        <IncidentHistory
          incidents={status.incidents}
          referenceTime={status.updatedAt}
        />
      </main>
      <footer className="border-t bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>Monitoring powered by Uptime Kuma</span>
          <a
            href="https://viperisuseful.cc"
            className="min-h-11 content-center rounded-md font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            Viperisuseful.cc
          </a>
        </div>
      </footer>
    </div>
  );
}
