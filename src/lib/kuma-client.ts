import {
  KUMA_BASE_URL,
  KUMA_STATUS_SLUG,
} from "@/lib/constants";
import {
  heartbeatResponseSchema,
  incidentHistorySchema,
  statusPageSchema,
} from "@/lib/schemas";
import { normalizeStatus } from "@/lib/normalize";
import type { PublicStatusDocument } from "@/lib/types";

async function getJson(path: string): Promise<unknown> {
  const response = await fetch(`${KUMA_BASE_URL}${path}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error("Status source unavailable");
  return response.json();
}

export async function fetchPublicStatus(): Promise<PublicStatusDocument> {
  const base = `/api/status-page/${encodeURIComponent(KUMA_STATUS_SLUG)}`;
  const [pageValue, heartbeatValue, historyValue] = await Promise.all([
    getJson(base),
    getJson(
      `/api/status-page/heartbeat/${encodeURIComponent(KUMA_STATUS_SLUG)}`,
    ),
    getJson(`${base}/incident-history`).catch(() => ({ incidentList: [] })),
  ]);

  const page = statusPageSchema.parse(pageValue);
  const heartbeat = heartbeatResponseSchema.parse(heartbeatValue);
  const history = incidentHistorySchema.parse(historyValue);

  return normalizeStatus(page, heartbeat, history.incidentList || []);
}
