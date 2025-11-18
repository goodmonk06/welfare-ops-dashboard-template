import { describe, it, expect, beforeEach, vi } from "vitest";
import { incidentRouter } from "../server/routers/incident";
import type { PrismaClient } from "../generated/prisma/client";

// Mock event bus
vi.mock("../lib/events/domain-events", () => ({
  emitEvent: vi.fn(),
}));

// Mock Prisma client
const mockPrisma = {
  incident: {
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

describe("Incident Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should return all incidents with relations", async () => {
      const mockIncidents = [
        {
          id: "1",
          title: "居室内での転倒",
          description: "入所者が居室内で転倒。幸い外傷なし。",
          occurredAt: new Date(),
          severity: "medium",
          category: "転倒",
          reportedBy: "渡辺 大輔",
          reportedById: "staff-1",
          residentId: "resident-1",
          location: "101号室",
          status: "investigating",
          witnesses: ["小林 さくら"],
          actionsTaken: "医療スタッフによる確認実施",
          preventiveMeasures: "歩行時の見守り強化",
          tags: ["要注意"],
          reportedByStaff: {
            id: "staff-1",
            name: "渡辺 大輔",
            role: "介護士",
          },
          resident: {
            id: "resident-1",
            name: "山田 太郎",
            roomNumber: "101",
          },
          documents: [],
        },
      ];

      mockPrisma.incident.findMany.mockResolvedValue(mockIncidents);

      const caller = incidentRouter.createCaller(mockContext);
      const result = await caller.list();

      expect(result).toEqual(mockIncidents);
      expect(mockPrisma.incident.findMany).toHaveBeenCalled();
      const call = mockPrisma.incident.findMany.mock.calls[0][0];
      expect(call.where).toEqual({});
      expect(call.include.reportedBy).toBeDefined();
      expect(call.include.resident).toBeDefined();
    });

    it("should filter by severity", async () => {
      mockPrisma.incident.findMany.mockResolvedValue([]);

      const caller = incidentRouter.createCaller(mockContext);
      await caller.list({ severity: "high" });

      const call = mockPrisma.incident.findMany.mock.calls[0][0];
      expect(call.where.severity).toBe("high");
    });

    it("should filter by status", async () => {
      mockPrisma.incident.findMany.mockResolvedValue([]);

      const caller = incidentRouter.createCaller(mockContext);
      await caller.list({ status: "resolved" });

      const call = mockPrisma.incident.findMany.mock.calls[0][0];
      expect(call.where.status).toBe("resolved");
    });
  });

  describe("create", () => {
    it("should create a new incident and emit event", async () => {
      const input = {
        title: "服薬時のヒヤリハット",
        description: "配薬準備時に確認を怠りそうになった",
        occurredAt: new Date(),
        severity: "high" as const,
        category: "誤薬",
        reportedById: "staff-1",
        residentId: "resident-1",
        location: "処置室",
        witnesses: ["伊藤 美香"],
        actionsTaken: "ダブルチェック実施",
        tags: ["緊急対応"],
      };

      const mockCreatedIncident = {
        id: "new-incident-id",
        title: input.title,
        description: input.description,
        occurredAt: input.occurredAt,
        severity: input.severity,
        category: input.category,
        reportedBy: "渡辺 大輔",
        reportedById: input.reportedById,
        residentId: input.residentId,
        location: input.location,
        status: "reported",
        witnesses: input.witnesses,
        actionsTaken: input.actionsTaken,
        preventiveMeasures: null,
        tags: input.tags,
        metadata: null,
        archivedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.incident.create.mockResolvedValue(mockCreatedIncident);

      const caller = incidentRouter.createCaller(mockContext);
      const result = await caller.create(input);

      expect(result).toEqual(mockCreatedIncident);
      expect(mockPrisma.incident.create).toHaveBeenCalled();

      // Verify event was emitted
      const { emitEvent } = await import("../lib/events/domain-events");
      expect(emitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "incident.created",
          data: expect.objectContaining({
            incidentId: "new-incident-id",
            severity: "high",
          }),
        })
      );
    });

    it("should validate required fields", async () => {
      const caller = incidentRouter.createCaller(mockContext);

      await expect(
        caller.create({
          title: "",
          description: "Test",
          occurredAt: new Date().toISOString(),
          severity: "low",
          category: "その他",
          reportedBy: "Test",
          status: "reported",
        })
      ).rejects.toThrow();
    });
  });

  describe("update", () => {
    it("should update incident status", async () => {
      const input = {
        id: "incident-1",
        status: "resolved" as const,
        preventiveMeasures: "再発防止策を実施",
      };

      const mockUpdatedIncident = {
        id: "incident-1",
        title: "居室内での転倒",
        description: "入所者が居室内で転倒。幸い外傷なし。",
        occurredAt: new Date(),
        severity: "medium",
        category: "転倒",
        reportedBy: "渡辺 大輔",
        reportedById: "staff-1",
        residentId: "resident-1",
        location: "101号室",
        status: "resolved",
        witnesses: [],
        actionsTaken: "医療スタッフによる確認実施",
        preventiveMeasures: "再発防止策を実施",
        tags: [],
        metadata: null,
        archivedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.incident.update.mockResolvedValue(mockUpdatedIncident);

      const caller = incidentRouter.createCaller(mockContext);
      const result = await caller.update(input);

      expect(result).toEqual(mockUpdatedIncident);
      expect(mockPrisma.incident.update).toHaveBeenCalledWith({
        where: { id: "incident-1" },
        data: {
          status: "resolved",
          preventiveMeasures: "再発防止策を実施",
        },
      });
    });

    it("should emit event when incident is resolved", async () => {
      const input = {
        id: "incident-1",
        status: "resolved" as const,
      };

      const mockUpdatedIncident = {
        id: "incident-1",
        title: "Test",
        description: "Test",
        occurredAt: new Date(),
        severity: "low",
        category: "その他",
        reportedBy: "Test",
        reportedById: null,
        residentId: null,
        location: null,
        status: "resolved",
        witnesses: [],
        actionsTaken: null,
        preventiveMeasures: null,
        tags: [],
        metadata: null,
        archivedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.incident.update.mockResolvedValue(mockUpdatedIncident);

      const caller = incidentRouter.createCaller(mockContext);
      await caller.update(input);

      const { emitEvent } = await import("../lib/events/domain-events");
      expect(emitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "incident.resolved",
          data: expect.objectContaining({
            incidentId: "incident-1",
          }),
        })
      );
    });
  });
});
