import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiConnectionForm } from "../ApiConnectionForm";
import { renderWithProviders } from "@/test/render";

describe("ApiConnectionForm", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("test connection does not persist token", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ ok: true, name: "parry", version: "1", uptimeMs: 1, store: "redis" }),
        { status: 200 },
      ),
    );
    renderWithProviders(<ApiConnectionForm />);
    fireEvent.change(screen.getByPlaceholderText("http://localhost:3000/_parry"), {
      target: { value: "http://localhost/_parry" },
    });
    fireEvent.change(screen.getByPlaceholderText("paste admin token"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByText("Test connection"));
    await waitFor(() => expect(screen.getByText(/Reachable/)).toBeInTheDocument());
    expect(window.localStorage.length).toBe(0);
  });
});
