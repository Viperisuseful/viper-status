import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StatusPageClient } from "@/components/status-page-client";
import { normalizeStatus } from "@/lib/normalize";
import {
  kumaHeartbeatFixture,
  kumaPageFixture,
} from "@/test/fixtures/kuma";

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt || ""} />
  ),
}));

describe("Viper Status page", () => {
  it("renders the public register and no private infrastructure", () => {
    const status = normalizeStatus(
      kumaPageFixture,
      kumaHeartbeatFixture,
      [],
      new Date("2026-07-25T23:00:00Z"),
    );
    render(<StatusPageClient initialStatus={status} />);

    expect(
      screen.getByRole("heading", { name: "Viper Status" }),
    ).toBeInTheDocument();
    expect(screen.getByText("All systems operational")).toBeInTheDocument();
    expect(screen.getByText("ViperCapture API")).toBeInTheDocument();
    expect(screen.queryByText("Vaultwarden")).not.toBeInTheDocument();
    expect(screen.queryByText("TinyAuth")).not.toBeInTheDocument();
  });
});

