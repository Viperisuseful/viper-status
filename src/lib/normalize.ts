import {
  PUBLIC_COMPONENTS,
  RECENT_CHECK_LIMIT,
  STALE_AFTER_MS,
} from "@/lib/constants";
import { kumaHeartbeatState, worstState } from "@/lib/aggregate";
import type {
  PublicIncident,
  PublicService,
  PublicStatusDocument,
} from "@/lib/types";
import type {
  KumaHeartbeatResponse,
  KumaStatusPage,
} from "@/lib/schemas";

type MonitorRecord = {
  id: number;
  name: string;
};

function monitorsByName(page: KumaStatusPage) {
  const monitors = page.publicGroupList.flatMap(
    (group) => group.monitorList as MonitorRecord[],
  );
  return new Map(monitors.map((monitor) => [monitor.name, monitor]));
}

function normalizeIncident(value: unknown, index: number): PublicIncident | null {
  if (!value || typeof value !== "object") return null;
  const incident = value as Record<string, unknown>;
  const title =
    typeof incident.title === "string" ? incident.title : "Service incident";
  const body =
    typeof incident.content === "string"
      ? incident.content.replace(/<[^>]*>/g, "").trim()
      : "";
  const createdAt =
    typeof incident.createdDate === "string"
      ? incident.createdDate
      : new Date().toISOString();
  const resolvedAt =
    typeof incident.resolvedDate === "string" ? incident.resolvedDate : null;
  const active = incident.style !== "success" && !resolvedAt;

  return {
    key: `${createdAt}-${index}`,
    title,
    body,
    createdAt,
    resolvedAt,
    active,
  };
}

export function normalizeStatus(
  page: KumaStatusPage,
  heartbeat: KumaHeartbeatResponse,
  historyValues: unknown[],
  now = new Date(),
): PublicStatusDocument {
  const monitorMap = monitorsByName(page);

  const services: PublicService[] = PUBLIC_COMPONENTS.map((component) => {
    const monitors = component.monitors
      .map((name) => monitorMap.get(name))
      .filter((monitor): monitor is MonitorRecord => Boolean(monitor));
    const monitorStates = monitors.map((monitor) => {
      const beats = heartbeat.heartbeatList[String(monitor.id)] || [];
      return kumaHeartbeatState(beats.at(-1)?.status);
    });
    const railMonitor =
      monitorMap.get(component.railMonitor) || monitors.at(0) || null;
    const railBeats = railMonitor
      ? heartbeat.heartbeatList[String(railMonitor.id)] || []
      : [];
    const checks = railBeats.slice(-RECENT_CHECK_LIMIT).map((beat) => ({
      state: kumaHeartbeatState(beat.status),
      at: beat.time,
    }));
    const lastCheckedAt =
      monitors
        .flatMap(
          (monitor) => heartbeat.heartbeatList[String(monitor.id)] || [],
        )
        .map((beat) => beat.time)
        .sort()
        .at(-1) || null;
    const uptimeValues = monitors
      .map((monitor) => heartbeat.uptimeList[`${monitor.id}_24`])
      .filter((value): value is number => Number.isFinite(value));

    return {
      key: component.key,
      name: component.name,
      description: component.description,
      state: worstState(monitorStates),
      uptime24h: uptimeValues.length ? Math.min(...uptimeValues) : null,
      checks,
      lastCheckedAt,
    };
  });

  const currentIncident = normalizeIncident(page.incident, 0);
  const incidents = [
    ...(currentIncident ? [currentIncident] : []),
    ...historyValues
      .map((incident, index) => normalizeIncident(incident, index + 1))
      .filter((incident): incident is PublicIncident => Boolean(incident)),
  ].filter(
    (incident, index, list) =>
      list.findIndex(
        (candidate) =>
          candidate.title === incident.title &&
          candidate.createdAt === incident.createdAt,
      ) === index,
  );

  const newestCheck = services
    .map((service) => service.lastCheckedAt)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);
  const updatedAt = newestCheck || now.toISOString();
  const stale = now.getTime() - new Date(updatedAt).getTime() > STALE_AFTER_MS;

  return {
    overall: currentIncident?.active
      ? "degraded"
      : worstState(services.map((service) => service.state)),
    services,
    incidents,
    updatedAt,
    stale,
  };
}

