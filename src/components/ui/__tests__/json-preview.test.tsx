import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JsonPreview } from "../json-preview";

describe("JsonPreview", () => {
  it("does not show sensitive values", () => {
    render(<JsonPreview value={{ password: "secret", token: "abc", visible: "ok" }} />);
    expect(screen.getByText(/\[REDACTED\]/)).toBeInTheDocument();
    expect(screen.queryByText(/secret/)).not.toBeInTheDocument();
    expect(screen.queryByText(/abc/)).not.toBeInTheDocument();
  });
});
