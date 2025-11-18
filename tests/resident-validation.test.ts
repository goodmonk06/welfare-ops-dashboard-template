import { describe, it, expect } from "vitest";
import { z } from "zod";

// Define the resident creation schema (same as in the tRPC router)
const residentCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.number().min(0, "Age must be positive").max(120, "Invalid age"),
  roomNumber: z.string().min(1, "Room number is required"),
  careLevel: z
    .number()
    .min(1, "Care level must be at least 1")
    .max(5, "Care level must be at most 5"),
  medicalInfo: z.string().optional(),
});

describe("Resident validation", () => {
  it("should validate valid resident data", () => {
    const validData = {
      name: "山田 太郎",
      age: 75,
      roomNumber: "101",
      careLevel: 3,
      medicalInfo: "高血圧症",
    };

    const result = residentCreateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject empty name", () => {
    const invalidData = {
      name: "",
      age: 75,
      roomNumber: "101",
      careLevel: 3,
    };

    const result = residentCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject invalid care level", () => {
    const invalidData = {
      name: "山田 太郎",
      age: 75,
      roomNumber: "101",
      careLevel: 6, // Invalid: should be 1-5
    };

    const result = residentCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject negative age", () => {
    const invalidData = {
      name: "山田 太郎",
      age: -10,
      roomNumber: "101",
      careLevel: 3,
    };

    const result = residentCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should accept optional medical info", () => {
    const validData = {
      name: "山田 太郎",
      age: 75,
      roomNumber: "101",
      careLevel: 3,
    };

    const result = residentCreateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});
