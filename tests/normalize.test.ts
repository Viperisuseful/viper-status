import { describe, expect, it } from "vitest";
import { normalizeStatus } from "@/lib/normalize";
import {
  kumaHeartbeatFixture,
  kumaPageFixture,
} from "@/test/fixtures/kuma";

describe("Kuma normalization", () => {
  it("publishes exactly six customer-facing components", () => {
    const result = normalizeStatus(
      kumaPageFixture,
      kumaHeartbeatFixture,
      [],
      new Date("2026-07-25T23:00:00Z"),
    );

    expect(result.services.map((service) => service.name)).toEqual([
      "Portfolio",
      "ViperCapture",
      "ViperCapture API",
      "Turtle Cave",
      "QuickRunLab",
      "QuickRunLab API",
    ]);
    expect(result.overall).toBe("operational");
    expect(JSON.stringify(result)).not.toContain('"id"');
  });

  it("aggregates functional and route checks for the ViperCapture API", () => {
    const heartbeat = structuredClone(kumaHeartbeatFixture);
    heartbeat.heartbeatList["15"].push({
      status: 0,
      time: "2026-07-25 22:59:30",
    });
    const result = normalizeStatus(
      kumaPageFixture,
      heartbeat,
      [],
      new Date("2026-07-25T23:00:00Z"),
    );

    expect(
      result.services.find((service) => service.key === "vipercapture-api")
        ?.state,
    ).toBe("outage");
  });
});

