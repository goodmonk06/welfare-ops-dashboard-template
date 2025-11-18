import { describe, it, expect, beforeEach, vi } from "vitest";
import { EventBus, emitEvent } from "../lib/events/domain-events";
import type { DomainEvent } from "../lib/events/domain-events";

describe("Event Bus", () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  describe("Event Registration and Emission", () => {
    it("should register and trigger event handler", async () => {
      const handler = vi.fn();
      const event: DomainEvent = {
        type: "resident.created",
        timestamp: new Date(),
        data: { residentId: "res-1", name: "山田 太郎" },
      };

      eventBus.on("resident.created", handler);
      await eventBus.emit(event);

      expect(handler).toHaveBeenCalledWith(event);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should trigger multiple handlers for the same event", async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const event: DomainEvent = {
        type: "incident.created",
        timestamp: new Date(),
        data: { incidentId: "inc-1", severity: "high" },
      };

      eventBus.on("incident.created", handler1);
      eventBus.on("incident.created", handler2);
      await eventBus.emit(event);

      expect(handler1).toHaveBeenCalledWith(event);
      expect(handler2).toHaveBeenCalledWith(event);
    });

    it("should only trigger handlers for matching event type", async () => {
      const residentHandler = vi.fn();
      const incidentHandler = vi.fn();

      eventBus.on("resident.created", residentHandler);
      eventBus.on("incident.created", incidentHandler);

      await eventBus.emit({
        type: "resident.created",
        timestamp: new Date(),
        data: { residentId: "res-1" },
      });

      expect(residentHandler).toHaveBeenCalledTimes(1);
      expect(incidentHandler).not.toHaveBeenCalled();
    });
  });

  describe("Global Event Handler", () => {
    it("should trigger global handler for all events", async () => {
      const globalHandler = vi.fn();
      const specificHandler = vi.fn();

      eventBus.onAll(globalHandler);
      eventBus.on("resident.created", specificHandler);

      const event1: DomainEvent = {
        type: "resident.created",
        timestamp: new Date(),
        data: { residentId: "res-1" },
      };

      const event2: DomainEvent = {
        type: "incident.created",
        timestamp: new Date(),
        data: { incidentId: "inc-1" },
      };

      await eventBus.emit(event1);
      await eventBus.emit(event2);

      expect(globalHandler).toHaveBeenCalledTimes(2);
      expect(globalHandler).toHaveBeenCalledWith(event1);
      expect(globalHandler).toHaveBeenCalledWith(event2);
      expect(specificHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe("Error Handling", () => {
    it("should continue execution if handler throws error", async () => {
      const errorHandler = vi.fn(() => {
        throw new Error("Handler error");
      });
      const successHandler = vi.fn();
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      eventBus.on("resident.created", errorHandler);
      eventBus.on("resident.created", successHandler);

      await eventBus.emit({
        type: "resident.created",
        timestamp: new Date(),
        data: { residentId: "res-1" },
      });

      expect(errorHandler).toHaveBeenCalled();
      expect(successHandler).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("emitEvent Helper", () => {
    it("should use the singleton event bus", async () => {
      const handler = vi.fn();
      const { eventBus: singletonBus } = await import("../lib/events/domain-events");

      singletonBus.on("staff.created", handler);

      await emitEvent({
        type: "staff.created",
        timestamp: new Date(),
        data: { staffId: "staff-1", name: "中村 健" },
      });

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe("Event Types", () => {
    it("should handle resident events", async () => {
      const createHandler = vi.fn();
      const updateHandler = vi.fn();
      const deleteHandler = vi.fn();

      eventBus.on("resident.created", createHandler);
      eventBus.on("resident.updated", updateHandler);
      eventBus.on("resident.deleted", deleteHandler);

      await eventBus.emit({
        type: "resident.created",
        timestamp: new Date(),
        data: { residentId: "res-1" },
      });

      await eventBus.emit({
        type: "resident.updated",
        timestamp: new Date(),
        data: { residentId: "res-1" },
      });

      await eventBus.emit({
        type: "resident.deleted",
        timestamp: new Date(),
        data: { residentId: "res-1" },
      });

      expect(createHandler).toHaveBeenCalledTimes(1);
      expect(updateHandler).toHaveBeenCalledTimes(1);
      expect(deleteHandler).toHaveBeenCalledTimes(1);
    });

    it("should handle incident events", async () => {
      const createHandler = vi.fn();
      const resolveHandler = vi.fn();

      eventBus.on("incident.created", createHandler);
      eventBus.on("incident.resolved", resolveHandler);

      await eventBus.emit({
        type: "incident.created",
        timestamp: new Date(),
        data: { incidentId: "inc-1", severity: "high" },
      });

      await eventBus.emit({
        type: "incident.resolved",
        timestamp: new Date(),
        data: { incidentId: "inc-1" },
      });

      expect(createHandler).toHaveBeenCalledTimes(1);
      expect(resolveHandler).toHaveBeenCalledTimes(1);
    });
  });
});
