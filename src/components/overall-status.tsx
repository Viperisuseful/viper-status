import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { PublicStatusDocument } from "@/lib/types";

const copy = {
  operational: [
    "All systems operational",
    "All public Viper services are operating normally.",
  ],
  degraded: [
    "Some systems are degraded",
    "One or more public Viper services are experiencing issues.",
  ],
  outage: [
    "Service disruption",
    "One or more public Viper services are currently unavailable.",
  ],
  maintenance: [
    "Maintenance in progress",
    "Scheduled maintenance is affecting one or more services.",
  ],
  unknown: [
    "Status temporarily unavailable",
    "Live monitoring data could not be refreshed. We are retrying automatically.",
  ],
} as const;

export function OverallStatus({ status }: { status: PublicStatusDocument }) {
  const [title, description] = copy[status.overall];
  const updated = new Date(status.updatedAt);
  const updatedLabel = Number.isNaN(updated.getTime())
    ? "Update time unavailable"
    : `Updated ${updated.toISOString().slice(11, 16)} UTC`;

  return (
    <Alert
      data-state={status.overall}
      className="grid gap-4 border-[var(--state-color)] bg-card px-5 py-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:px-6"
    >
      <span className="status-dot size-4 rounded-full sm:size-5" aria-hidden="true" />
      <div>
        <AlertTitle className="text-lg font-semibold tracking-[-0.02em]">
          {title}
        </AlertTitle>
        <AlertDescription className="mt-1">{description}</AlertDescription>
      </div>
      <p className="text-xs font-medium text-muted-foreground sm:text-right">
        {status.stale ? "Data may be delayed" : updatedLabel}
      </p>
    </Alert>
  );
}

