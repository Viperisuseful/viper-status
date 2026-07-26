import { Badge } from "@/components/ui/badge";
import { STATE_LABEL } from "@/lib/constants";
import type { ServiceState } from "@/lib/types";

export function StatusState({
  state,
  compact = false,
}: {
  state: ServiceState;
  compact?: boolean;
}) {
  return (
    <Badge
      variant="outline"
      data-state={state}
      className="status-soft h-7 gap-2 border-transparent px-2.5"
    >
      <span className="status-dot size-2 rounded-full" aria-hidden="true" />
      <span className={compact ? "sr-only sm:not-sr-only" : undefined}>
        {STATE_LABEL[state]}
      </span>
    </Badge>
  );
}

