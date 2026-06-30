import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { DashboardPage } from "../DashboardPage";
import { renderWithProviders } from "@/test/render";

describe("DashboardPage", () => {
  beforeEach(() => window.localStorage.clear());

  it("renders in mock mode", async () => {
    renderWithProviders(<DashboardPage />);
    await waitFor(() => expect(screen.getByText("Total Requests")).toBeInTheDocument());
  });
});
