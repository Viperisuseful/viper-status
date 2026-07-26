import type { ServiceState } from "@/lib/types";

export const KUMA_STATUS_SLUG = process.env.KUMA_STATUS_SLUG || "viper";
export const KUMA_BASE_URL =
  process.env.KUMA_BASE_URL || "https://uptimekuma.fr-1.instapods.app";

export const CACHE_TTL_MS = 60_000;
export const STALE_AFTER_MS = 180_000;
export const RECENT_CHECK_LIMIT = 30;

export const PUBLIC_COMPONENTS = [
  {
    key: "portfolio",
    name: "Portfolio",
    description: "Personal portfolio and projects",
    monitors: ["Viper Hub"],
    railMonitor: "Viper Hub",
  },
  {
    key: "vipercapture",
    name: "ViperCapture",
    description: "Fast, private screen capture",
    monitors: ["ViperCapture"],
    railMonitor: "ViperCapture",
  },
  {
    key: "vipercapture-api",
    name: "ViperCapture API",
    description: "Programmatic capture and rendering",
    monitors: [
      "ViperCapture API Route",
      "ViperCapture API Functional",
    ],
    railMonitor: "ViperCapture API Route",
  },
  {
    key: "turtle-cave",
    name: "Turtle Cave",
    description: "Dashboard and knowledge tools",
    monitors: ["Turtle Cave Database Health"],
    railMonitor: "Turtle Cave Database Health",
  },
  {
    key: "quickrunlab",
    name: "QuickRunLab",
    description: "Online code runner and playground",
    monitors: ["QuickRunLab"],
    railMonitor: "QuickRunLab",
  },
  {
    key: "quickrunlab-api",
    name: "QuickRunLab API",
    description: "Live execution transport",
    monitors: ["QuickRunLab API"],
    railMonitor: "QuickRunLab API",
  },
] as const;

export const STATE_PRIORITY: Record<ServiceState, number> = {
  unknown: 0,
  operational: 1,
  maintenance: 2,
  degraded: 3,
  outage: 4,
};

export const STATE_LABEL: Record<ServiceState, string> = {
  operational: "Operational",
  degraded: "Degraded",
  outage: "Major outage",
  maintenance: "Maintenance",
  unknown: "Status unknown",
};

