import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility function", () => {
  it("should merge classnames correctly", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("should handle conditional classes", () => {
    const isActive = true;
    expect(cn("base", isActive && "active")).toBe("base active");
  });

  it("should handle undefined and null values", () => {
    expect(cn("base", undefined, null, "extra")).toBe("base extra");
  });

  it("should merge tailwind classes properly", () => {
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });
});
