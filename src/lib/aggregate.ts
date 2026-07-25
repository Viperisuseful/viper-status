import { STATE_PRIORITY } from "@/lib/constants";
import type { ServiceState } from "@/lib/types";

export function worstState(states: ServiceState[]): ServiceState {
  if (!states.length) return "unknown";
  return states.reduce((worst, state) =>
    STATE_PRIORITY[state] > STATE_PRIORITY[worst] ? state : worst,
  );
}

export function kumaHeartbeatState(status: number | undefined): ServiceState {
  if (status === 1) return "operational";
  if (status === 0) return "outage";
  if (status === 3) return "maintenance";
  return "unknown";
}

