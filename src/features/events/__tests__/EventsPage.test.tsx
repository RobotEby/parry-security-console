import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { EventsPage } from "../EventsPage";
import { renderWithProviders } from "@/test/render";

describe("EventsPage", () => {
  beforeEach(() => window.localStorage.clear());

  it("renders in mock mode", async () => {
    renderWithProviders(<EventsPage />);
    await waitFor(() => expect(screen.getByText("Threat Events")).toBeInTheDocument());
    await waitFor(() =>
      expect(screen.getAllByText(/SQL_INJECTION_BLOCKED/).length).toBeGreaterThan(0),
    );
  });
});
