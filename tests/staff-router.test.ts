import { describe, it, expect, beforeEach, vi } from "vitest";
import { staffRouter } from "../server/routers/staff";
import type { PrismaClient } from "../generated/prisma/client";

// Mock Prisma client
const mockPrisma = {
  staff: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
} as unknown as PrismaClient;

const mockContext = {
  prisma: mockPrisma,
};

describe("Staff Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should return all staff members", async () => {
      const mockStaff = [
        {
          id: "1",
          name: "中村 健",
          role: "施設長",
          department: "管理部",
          email: "nakamura@example.com",
          phoneNumber: "090-1234-5678",
          hireDate: new Date("2020-04-01"),
          status: "active",
          certifications: [],
          tags: [],
          _count: { shifts: 10 },
        },
      ];

      mockPrisma.staff.findMany.mockResolvedValue(mockStaff);

      const caller = staffRouter.createCaller(mockContext);
      const result = await caller.list();

      expect(result).toEqual(mockStaff);
      expect(mockPrisma.staff.findMany).toHaveBeenCalled();
      const call = mockPrisma.staff.findMany.mock.calls[0][0];
      expect(call.where).toEqual({});
      expect(call.include._count).toBeDefined();
    });

    it("should filter by department", async () => {
      const mockStaff = [
        {
          id: "1",
          name: "中村 健",
          role: "施設長",
          department: "管理部",
          email: "nakamura@example.com",
          phoneNumber: "090-1234-5678",
          hireDate: new Date("2020-04-01"),
          status: "active",
          certifications: [],
          tags: [],
          _count: { shifts: 10 },
        },
      ];

      mockPrisma.staff.findMany.mockResolvedValue(mockStaff);

      const caller = staffRouter.createCaller(mockContext);
      const result = await caller.list({ department: "管理部" });

      expect(result).toEqual(mockStaff);
      const call = mockPrisma.staff.findMany.mock.calls[0][0];
      expect(call.where.department).toBe("管理部");
    });

    it("should filter by status and role", async () => {
      mockPrisma.staff.findMany.mockResolvedValue([]);

      const caller = staffRouter.createCaller(mockContext);
      await caller.list({ status: "active", role: "介護士" });

      const call = mockPrisma.staff.findMany.mock.calls[0][0];
      expect(call.where).toMatchObject({ status: "active", role: "介護士" });
    });
  });

  describe("create", () => {
    it("should create a new staff member", async () => {
      const input = {
        name: "田中 太郎",
        role: "介護士",
        email: "tanaka@example.com",
        phoneNumber: "090-9999-9999",
        hireDate: new Date("2024-01-01"),
        department: "介護部",
        certifications: ["介護福祉士"],
        tags: ["夜勤可"],
      };

      const mockCreatedStaff = {
        id: "new-id",
        ...input,
        hireDate: new Date(),
        status: "active",
        terminationDate: null,
        metadata: null,
        archivedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.staff.create.mockResolvedValue(mockCreatedStaff);

      const caller = staffRouter.createCaller(mockContext);
      const result = await caller.create(input);

      expect(result).toEqual(mockCreatedStaff);
      expect(mockPrisma.staff.create).toHaveBeenCalledWith({
        data: input,
      });
    });

    it("should validate required fields", async () => {
      const caller = staffRouter.createCaller(mockContext);

      await expect(
        caller.create({
          name: "",
          role: "介護士",
          email: "test@example.com",
          phoneNumber: "090-0000-0000",
        })
      ).rejects.toThrow();

      await expect(
        caller.create({
          name: "田中 太郎",
          role: "",
          email: "test@example.com",
          phoneNumber: "090-0000-0000",
        })
      ).rejects.toThrow();
    });
  });

  describe("update", () => {
    it("should update staff member fields", async () => {
      const input = {
        id: "staff-1",
        department: "看護部",
        tags: ["リーダー"],
      };

      const mockUpdatedStaff = {
        id: "staff-1",
        name: "中村 健",
        role: "看護師",
        email: "nakamura@example.com",
        phoneNumber: "090-1234-5678",
        hireDate: new Date("2020-04-01"),
        status: "active",
        department: "看護部",
        certifications: [],
        tags: ["リーダー"],
        terminationDate: null,
        metadata: null,
        archivedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.staff.update.mockResolvedValue(mockUpdatedStaff);

      const caller = staffRouter.createCaller(mockContext);
      const result = await caller.update(input);

      expect(result).toEqual(mockUpdatedStaff);
      expect(mockPrisma.staff.update).toHaveBeenCalledWith({
        where: { id: "staff-1" },
        data: { department: "看護部", tags: ["リーダー"] },
      });
    });
  });

  describe("delete", () => {
    it("should delete a staff member", async () => {
      const mockDeletedStaff = {
        id: "staff-1",
        name: "中村 健",
        role: "施設長",
        email: "nakamura@example.com",
        phoneNumber: "090-1234-5678",
        hireDate: new Date("2020-04-01"),
        status: "active",
        department: "管理部",
        certifications: [],
        tags: [],
        terminationDate: null,
        metadata: null,
        archivedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.staff.delete.mockResolvedValue(mockDeletedStaff);

      const caller = staffRouter.createCaller(mockContext);
      const result = await caller.delete({ id: "staff-1" });

      expect(result).toEqual(mockDeletedStaff);
      expect(mockPrisma.staff.delete).toHaveBeenCalledWith({
        where: { id: "staff-1" },
      });
    });
  });
});
