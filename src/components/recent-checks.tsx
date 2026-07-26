import { STATE_LABEL } from "@/lib/constants";
import type { RecentCheck } from "@/lib/types";

export function RecentChecks({
  checks,
  serviceName,
}: {
  checks: RecentCheck[];
  serviceName: string;
}) {
  const padded = [
    ...Array.from({ length: Math.max(0, 30 - checks.length) }, () => null),
    ...checks.slice(-30),
  ];

  return (
    <div
      className="grid min-w-0 grid-cols-[repeat(30,minmax(2px,1fr))] gap-1"
      aria-label={`${serviceName} recent checks`}
      role="img"
    >
      {padded.map((check, index) => (
        <span
          key={`${check?.at || "empty"}-${index}`}
          data-state={check?.state || "unknown"}
          className="status-dot h-6 min-w-0 rounded-[2px] opacity-90"
          title={
            check
              ? `${STATE_LABEL[check.state]} at ${check.at}`
              : "No check data"
          }
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
