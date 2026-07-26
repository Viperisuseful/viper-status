import { describe, expect, it } from "vitest";
import { kumaHeartbeatState, worstState } from "@/lib/aggregate";

describe("status aggregation", () => {
  it("uses the most severe child state", () => {
    expect(worstState(["operational", "outage", "maintenance"])).toBe(
      "outage",
    );
  });

  it("maps Kuma heartbeat states without leaking upstream details", () => {
    expect(kumaHeartbeatState(1)).toBe("operational");
    expect(kumaHeartbeatState(0)).toBe("outage");
    expect(kumaHeartbeatState(3)).toBe("maintenance");
    expect(kumaHeartbeatState(2)).toBe("unknown");
  });
});

