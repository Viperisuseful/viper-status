"use client";

import { CircleCheck } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import type { PublicIncident } from "@/lib/types";

const periods = [7, 30, 90] as const;

export function IncidentHistory({
  incidents,
  referenceTime,
}: {
  incidents: PublicIncident[];
  referenceTime: string;
}) {
  const [period, setPeriod] = useState<number>(30);
  const visible = useMemo(() => {
    const cutoff = new Date(referenceTime).getTime() - period * 86_400_000;
    return incidents.filter(
      (incident) => new Date(incident.createdAt).getTime() >= cutoff,
    );
  }, [incidents, period, referenceTime]);

  return (
    <section aria-labelledby="incident-history-heading">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2
          id="incident-history-heading"
          className="text-xl font-semibold tracking-[-0.025em]"
        >
          Incident history
        </h2>
        <ToggleGroup
          value={[String(period)]}
          onValueChange={(value) => {
            const next = Number(value[0]);
            if (periods.includes(next as (typeof periods)[number])) setPeriod(next);
          }}
          variant="outline"
          spacing={0}
          aria-label="Incident history period"
        >
          {periods.map((days) => (
            <ToggleGroupItem key={days} value={String(days)} aria-label={`${days} days`}>
              {days} days
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        {visible.length ? (
          <ol className="divide-y">
            {visible.map((incident) => (
              <li key={incident.key} className="px-5 py-5 sm:px-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-semibold">{incident.title}</h3>
                  <time
                    dateTime={incident.createdAt}
                    className="font-mono text-xs text-muted-foreground"
                  >
                    {new Date(incident.createdAt).toISOString().slice(0, 10)}
                  </time>
                </div>
                {incident.body ? (
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                    {incident.body}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        ) : (
          <Empty className="min-h-48 border-0">
            <EmptyHeader>
              <EmptyMedia
                variant="icon"
                data-state="operational"
                className="status-soft"
              >
                <CircleCheck />
              </EmptyMedia>
              <EmptyTitle>No incidents reported</EmptyTitle>
              <EmptyDescription>
                There have been no reported incidents in the selected period.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </section>
  );
}
