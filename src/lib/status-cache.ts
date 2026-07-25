import { CACHE_TTL_MS, PUBLIC_COMPONENTS } from "@/lib/constants";
import { fetchPublicStatus } from "@/lib/kuma-client";
import type { PublicStatusDocument } from "@/lib/types";

let lastGood: PublicStatusDocument | null = null;
let lastFetchedAt = 0;
let pending: Promise<PublicStatusDocument> | null = null;

function unavailableDocument(): PublicStatusDocument {
  return {
    overall: "unknown",
    services: PUBLIC_COMPONENTS.map((component) => ({
      key: component.key,
      name: component.name,
      description: component.description,
      state: "unknown",
      uptime24h: null,
      checks: [],
      lastCheckedAt: null,
    })),
    incidents: [],
    updatedAt: new Date().toISOString(),
    stale: true,
  };
}

export async function getPublicStatus(): Promise<PublicStatusDocument> {
  if (lastGood && Date.now() - lastFetchedAt < CACHE_TTL_MS) return lastGood;
  if (pending) return pending;

  pending = fetchPublicStatus()
    .then((document) => {
      lastGood = document;
      lastFetchedAt = Date.now();
      return document;
    })
    .catch(() =>
      lastGood ? { ...lastGood, stale: true } : unavailableDocument(),
    )
    .finally(() => {
      pending = null;
    });

  return pending;
}

