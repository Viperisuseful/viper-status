import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "@/components/theme-toggle";
import { TooltipProvider } from "@/components/ui/tooltip";

const theme = vi.hoisted(() => ({
  resolvedTheme: "light",
  setTheme: vi.fn(),
}));

vi.mock("next-themes", () => ({
  useTheme: () => theme,
}));

function renderToggle() {
  return render(
    <TooltipProvider>
      <ThemeToggle />
    </TooltipProvider>,
  );
}

describe("ThemeToggle", () => {
  beforeEach(() => {
    theme.resolvedTheme = "light";
    theme.setTheme.mockReset();
  });

  it("switches from the resolved light theme to dark", async () => {
    const user = userEvent.setup();
    renderToggle();

    await user.click(
      screen.getByRole("button", { name: "Switch to dark theme" }),
    );

    expect(theme.setTheme).toHaveBeenCalledWith("dark");
  });

  it("switches from the resolved dark theme to light", async () => {
    const user = userEvent.setup();
    theme.resolvedTheme = "dark";
    renderToggle();

    await user.click(
      screen.getByRole("button", { name: "Switch to light theme" }),
    );

    expect(theme.setTheme).toHaveBeenCalledWith("light");
  });
});
