import { RecentChecks } from "@/components/recent-checks";
import { StatusState } from "@/components/status-state";
import type { PublicService } from "@/lib/types";

function formatUptime(value: number | null) {
  if (value === null) return "Not available";
  return `${(value * 100).toFixed(value >= 0.9995 ? 0 : 2)}%`;
}

export function ServiceRow({ service }: { service: PublicService }) {
  return (
    <li className="grid gap-4 px-5 py-5 sm:px-6 lg:grid-cols-[minmax(13rem,1fr)_minmax(18rem,1.45fr)_10rem] lg:items-center">
      <div className="flex min-w-0 items-start justify-between gap-4 lg:block">
        <div className="min-w-0">
          <h3 className="font-semibold tracking-[-0.015em]">{service.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {service.description}
          </p>
        </div>
        <div className="lg:hidden">
          <StatusState state={service.state} compact />
        </div>
      </div>
      <RecentChecks checks={service.checks} serviceName={service.name} />
      <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-end">
        <div className="hidden lg:block">
          <StatusState state={service.state} />
        </div>
        <p className="font-mono text-xs tabular-nums text-muted-foreground">
          24h {formatUptime(service.uptime24h)}
        </p>
      </div>
    </li>
  );
}

