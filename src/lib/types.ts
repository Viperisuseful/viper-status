export type ServiceState =
  | "operational"
  | "degraded"
  | "outage"
  | "maintenance"
  | "unknown";

export type RecentCheck = {
  state: ServiceState;
  at: string;
};

export type PublicService = {
  key: string;
  name: string;
  description: string;
  state: ServiceState;
  uptime24h: number | null;
  checks: RecentCheck[];
  lastCheckedAt: string | null;
};

export type PublicIncident = {
  key: string;
  title: string;
  body: string;
  createdAt: string;
  resolvedAt: string | null;
  active: boolean;
};

export type PublicStatusDocument = {
  overall: ServiceState;
  services: PublicService[];
  incidents: PublicIncident[];
  updatedAt: string;
  stale: boolean;
};

