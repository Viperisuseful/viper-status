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

  it("publishes recent heartbeat outages as incidents", () => {
    const heartbeat = structuredClone(kumaHeartbeatFixture);
    heartbeat.heartbeatList["8"].push(
      { status: 0, time: "2026-07-25 22:59:30" },
      { status: 1, time: "2026-07-25 23:00:00" },
    );
    const result = normalizeStatus(
      { ...kumaPageFixture, incidents: [] },
      heartbeat,
      [],
      new Date("2026-07-25T23:00:00Z"),
    );

    expect(result.incidents).toContainEqual({
      key: "heartbeat-8-2026-07-25 22:59:30",
      title: "ViperCapture outage",
      body: 'Uptime Kuma monitor "ViperCapture" reported an outage.',
      createdAt: "2026-07-25 22:59:30",
      resolvedAt: "2026-07-25 23:00:00",
      active: false,
    });
  });

  it("accepts current Kuma incident arrays", () => {
    const result = normalizeStatus(
      {
        ...kumaPageFixture,
        incidents: [
          {
            title: "ViperCapture maintenance",
            content: "Planned maintenance",
            createdDate: "2026-07-25 22:00:00",
            resolvedDate: "2026-07-25 22:30:00",
            style: "success",
          },
        ],
      },
      kumaHeartbeatFixture,
      [],
      new Date("2026-07-25T23:00:00Z"),
    );

    expect(result.incidents[0]).toMatchObject({
      title: "ViperCapture maintenance",
      body: "Planned maintenance",
      resolvedAt: "2026-07-25 22:30:00",
    });
  });
});

