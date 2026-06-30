import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { parryFetchWithConfig } from "../client";

describe("parryFetchWithConfig", () => {
  afterEach(() => vi.restoreAllMocks());

  it("sends x-parry-admin-token when token exists", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    await parryFetchWithConfig(
      { apiUrl: "http://localhost/_parry", adminToken: "secret" },
      "/health",
      z.object({ ok: z.boolean() }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost/_parry/health",
      expect.objectContaining({
        headers: expect.objectContaining({ "x-parry-admin-token": "secret" }),
      }),
    );
  });

  it("does not send x-parry-admin-token when token is empty", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    await parryFetchWithConfig(
      { apiUrl: "http://localhost/_parry" },
      "/health",
      z.object({ ok: z.boolean() }),
    );
    const headers = (fetchMock.mock.calls[0]?.[1] as RequestInit).headers as Record<string, string>;
    expect(headers["x-parry-admin-token"]).toBeUndefined();
  });

  it("accepts Vite proxy paths as API URL", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    await parryFetchWithConfig(
      { apiUrl: "/api/parry", adminToken: "secret" },
      "/health",
      z.object({ ok: z.boolean() }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/parry/health",
      expect.any(Object),
    );
  });
});
