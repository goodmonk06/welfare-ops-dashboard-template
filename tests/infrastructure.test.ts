import { describe, it, expect, beforeEach, vi } from "vitest";
import { metrics, measureTime } from "../lib/core/metrics";
import { logger } from "../lib/core/logger";

describe("Metrics Collector", () => {
  beforeEach(() => {
    metrics.clearMetrics();
  });

  describe("Counter Metrics", () => {
    it("should record counter with default value", () => {
      metrics.recordCounter("api.calls");
      const allMetrics = metrics.getMetrics();

      expect(allMetrics).toHaveLength(1);
      expect(allMetrics[0]).toMatchObject({
        name: "api.calls",
        value: 1,
      });
    });

    it("should record counter with custom value", () => {
      metrics.recordCounter("items.processed", 5);
      const allMetrics = metrics.getMetrics();

      expect(allMetrics[0]).toMatchObject({
        name: "items.processed",
        value: 5,
      });
    });

    it("should record counter with labels", () => {
      metrics.recordCounter("requests", 1, { method: "GET", status: "200" });
      const allMetrics = metrics.getMetrics();

      expect(allMetrics[0]).toMatchObject({
        name: "requests",
        value: 1,
        labels: { method: "GET", status: "200" },
      });
    });
  });

  describe("Gauge Metrics", () => {
    it("should record gauge value", () => {
      metrics.recordGauge("memory.usage", 1024);
      const allMetrics = metrics.getMetrics();

      expect(allMetrics[0]).toMatchObject({
        name: "memory.usage",
        value: 1024,
      });
    });

    it("should update gauge value", () => {
      metrics.recordGauge("active.connections", 10);
      metrics.recordGauge("active.connections", 15);
      const allMetrics = metrics.getMetrics();

      expect(allMetrics).toHaveLength(2);
      expect(allMetrics[1].value).toBe(15);
    });
  });

  describe("Histogram Metrics", () => {
    it("should record histogram values", () => {
      metrics.recordHistogram("response.time", 250);
      metrics.recordHistogram("response.time", 300);
      const allMetrics = metrics.getMetrics();

      expect(allMetrics).toHaveLength(2);
      expect(allMetrics[0].value).toBe(250);
      expect(allMetrics[1].value).toBe(300);
    });
  });

  describe("Timing Metrics", () => {
    it("should record timing in milliseconds", () => {
      metrics.recordTiming("operation", 150);
      const allMetrics = metrics.getMetrics();

      expect(allMetrics[0]).toMatchObject({
        name: "operation.duration_ms",
        value: 150,
      });
    });
  });

  describe("Specialized Metrics", () => {
    it("should track API calls", () => {
      metrics.trackApiCall("/api/residents", "GET", 200, 125);
      const allMetrics = metrics.getMetrics();

      expect(allMetrics).toHaveLength(2);
      expect(allMetrics[0]).toMatchObject({
        name: "api.calls.total",
        value: 1,
        labels: { endpoint: "/api/residents", method: "GET", status: "200" },
      });
      expect(allMetrics[1]).toMatchObject({
        name: "api.duration_ms",
        value: 125,
        labels: { endpoint: "/api/residents", method: "GET" },
      });
    });

    it("should track database queries", () => {
      metrics.trackDatabaseQuery("SELECT", "residents", 45);
      const allMetrics = metrics.getMetrics();

      expect(allMetrics).toHaveLength(2);
      expect(allMetrics[0]).toMatchObject({
        name: "database.queries.total",
        value: 1,
        labels: { operation: "SELECT", table: "residents" },
      });
      expect(allMetrics[1]).toMatchObject({
        name: "database.duration_ms",
        value: 45,
      });
    });

    it("should track cache hits and misses", () => {
      metrics.trackCacheHit("user:123", true);
      metrics.trackCacheHit("user:456", false);
      const allMetrics = metrics.getMetrics();

      expect(allMetrics).toHaveLength(2);
      expect(allMetrics[0].labels?.result).toBe("hit");
      expect(allMetrics[1].labels?.result).toBe("miss");
    });

    it("should track business metrics", () => {
      metrics.trackBusinessMetric("active_residents", 25);
      const allMetrics = metrics.getMetrics();

      expect(allMetrics[0]).toMatchObject({
        name: "business.active_residents",
        value: 25,
      });
    });
  });

  describe("measureTime Helper", () => {
    it("should measure execution time of async function", async () => {
      const slowOperation = async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return "result";
      };

      const result = await measureTime("slow.operation", slowOperation);

      expect(result).toBe("result");
      const allMetrics = metrics.getMetrics();
      expect(allMetrics[0]).toMatchObject({
        name: "slow.operation.duration_ms",
        value: expect.any(Number),
      });
      expect(allMetrics[0].value).toBeGreaterThanOrEqual(50);
    });

    it("should measure time even when function throws", async () => {
      const failingOperation = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        throw new Error("Operation failed");
      };

      await expect(
        measureTime("failing.operation", failingOperation)
      ).rejects.toThrow("Operation failed");

      const allMetrics = metrics.getMetrics();
      expect(allMetrics[0]).toMatchObject({
        name: "failing.operation.duration_ms",
        labels: { error: "true" },
      });
    });

    it("should include custom labels", async () => {
      const operation = async () => "done";
      await measureTime("test.operation", operation, { userId: "123" });

      const allMetrics = metrics.getMetrics();
      expect(allMetrics[0].labels).toMatchObject({ userId: "123" });
    });
  });

  describe("Metrics Storage", () => {
    it("should limit stored metrics to maxStoredMetrics", () => {
      // Record more than 1000 metrics
      for (let i = 0; i < 1100; i++) {
        metrics.recordCounter("test.metric", 1);
      }

      const allMetrics = metrics.getMetrics();
      expect(allMetrics.length).toBe(1000);
    });

    it("should include timestamp with each metric", () => {
      metrics.recordCounter("test.metric");
      const allMetrics = metrics.getMetrics();

      expect(allMetrics[0].timestamp).toBeInstanceOf(Date);
    });
  });
});

describe("Logger", () => {
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleDebugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
    logger.clearContext();
  });

  afterEach(() => {
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleDebugSpy.mockRestore();
  });

  describe("Basic Logging", () => {
    it("should log info messages as JSON", () => {
      logger.info("Test message");
      expect(consoleInfoSpy).toHaveBeenCalledOnce();
      const logOutput = consoleInfoSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);
      expect(parsed).toMatchObject({
        level: "info",
        message: "Test message",
        context: {},
      });
      expect(parsed.timestamp).toBeDefined();
    });

    it("should log warning messages as JSON", () => {
      logger.warn("Warning message");
      expect(consoleWarnSpy).toHaveBeenCalledOnce();
      const logOutput = consoleWarnSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);
      expect(parsed).toMatchObject({
        level: "warn",
        message: "Warning message",
      });
    });

    it("should log error messages as JSON", () => {
      logger.error("Error message");
      expect(consoleErrorSpy).toHaveBeenCalledOnce();
      const logOutput = consoleErrorSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);
      expect(parsed).toMatchObject({
        level: "error",
        message: "Error message",
      });
    });

    it("should log debug messages in development", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      logger.debug("Debug message");
      expect(consoleDebugSpy).toHaveBeenCalledOnce();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("Structured Logging", () => {
    it("should include metadata in logs", () => {
      logger.info("User action", { userId: "123", action: "login" });
      const logOutput = consoleInfoSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);
      expect(parsed).toMatchObject({
        message: "User action",
        userId: "123",
        action: "login",
      });
    });

    it("should handle error objects", () => {
      const error = new Error("Test error");
      logger.error("Operation failed", error);
      const logOutput = consoleErrorSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);
      expect(parsed).toMatchObject({
        message: "Operation failed",
        errorName: "Error",
        errorMessage: "Test error",
      });
      expect(parsed.errorStack).toBeDefined();
    });
  });

  describe("Specialized Logging", () => {
    it("should log audit events", () => {
      logger.logAudit("create", "Resident", "res-123", { createdBy: "admin" });
      const logOutput = consoleInfoSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);
      expect(parsed).toMatchObject({
        message: "Audit log",
        type: "audit",
        action: "create",
        entityType: "Resident",
        entityId: "res-123",
        createdBy: "admin",
      });
    });

    it("should log API requests", () => {
      logger.logRequest("GET", "/api/residents", { statusCode: 200, duration: 125 });
      const logOutput = consoleInfoSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);
      expect(parsed).toMatchObject({
        message: "GET /api/residents",
        type: "request",
        statusCode: 200,
        duration: 125,
      });
    });

    it("should log database queries", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      logger.logDatabaseQuery("SELECT * FROM residents", 45);
      const logOutput = consoleDebugSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);
      expect(parsed).toMatchObject({
        message: "Database query",
        type: "database",
        query: "SELECT * FROM residents",
        duration: 45,
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("Context Management", () => {
    it("should set and use context", () => {
      logger.setContext({ requestId: "req-123" });
      logger.info("Test with context");

      const logOutput = consoleInfoSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);
      expect(parsed.context).toMatchObject({ requestId: "req-123" });
    });

    it("should merge context", () => {
      logger.setContext({ requestId: "req-123" });
      logger.info("Test", { userId: "user-456" });

      const logOutput = consoleInfoSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);
      expect(parsed).toMatchObject({
        context: { requestId: "req-123" },
        userId: "user-456",
      });
    });

    it("should clear context", () => {
      logger.setContext({ requestId: "req-123" });
      logger.clearContext();
      logger.info("Test without context");

      const logOutput = consoleInfoSpy.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);
      expect(parsed.context).toEqual({});
    });
  });
});
