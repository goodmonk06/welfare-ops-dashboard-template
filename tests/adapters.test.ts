import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  ConsoleNotificationAdapter,
  EmailNotificationAdapter,
  SmsNotificationAdapter,
  createNotificationAdapter,
} from "../lib/adapters/notification.adapter";
import {
  LocalStorageAdapter,
  S3StorageAdapter,
  createStorageAdapter,
} from "../lib/adapters/storage.adapter";

describe("Notification Adapters", () => {
  describe("ConsoleNotificationAdapter", () => {
    let adapter: ConsoleNotificationAdapter;
    let consoleLogSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      adapter = new ConsoleNotificationAdapter();
      consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    it("should log notification to console", async () => {
      await adapter.send({
        to: "test@example.com",
        subject: "Test",
        message: "Test message",
        priority: "normal",
      });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "[NOTIFICATION]",
        expect.stringContaining("test@example.com")
      );
    });

    it("should send bulk notifications", async () => {
      await adapter.sendBulk([
        { to: "user1@example.com", message: "Message 1" },
        { to: "user2@example.com", message: "Message 2" },
      ]);

      expect(consoleLogSpy).toHaveBeenCalledTimes(3); // 1 bulk log + 2 individual
    });
  });

  describe("EmailNotificationAdapter", () => {
    let adapter: EmailNotificationAdapter;
    let consoleLogSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      adapter = new EmailNotificationAdapter({
        apiKey: "test-key",
        from: "noreply@example.com",
      });
      consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    it("should send email notification", async () => {
      await adapter.send({
        to: "user@example.com",
        subject: "Important Notice",
        message: "This is important",
        priority: "high",
      });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "[EMAIL]",
        expect.objectContaining({
          from: "noreply@example.com",
          to: "user@example.com",
          subject: "Important Notice",
        })
      );
    });

    it("should send bulk emails", async () => {
      await adapter.sendBulk([
        { to: "user1@example.com", subject: "Test 1", message: "Message 1" },
        { to: "user2@example.com", subject: "Test 2", message: "Message 2" },
      ]);

      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe("SmsNotificationAdapter", () => {
    let adapter: SmsNotificationAdapter;
    let consoleLogSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      adapter = new SmsNotificationAdapter({
        apiKey: "test-key",
        from: "+1234567890",
      });
      consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    it("should send SMS notification", async () => {
      await adapter.send({
        to: "+0987654321",
        message: "緊急連絡です",
        priority: "urgent",
      });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "[SMS]",
        expect.objectContaining({
          from: "+1234567890",
          to: "+0987654321",
          message: "緊急連絡です",
        })
      );
    });
  });

  describe("createNotificationAdapter", () => {
    it("should create console adapter by default", () => {
      const originalEnv = process.env.NOTIFICATION_PROVIDER;
      delete process.env.NOTIFICATION_PROVIDER;

      const adapter = createNotificationAdapter();
      expect(adapter).toBeInstanceOf(ConsoleNotificationAdapter);

      process.env.NOTIFICATION_PROVIDER = originalEnv;
    });

    it("should create email adapter when configured", () => {
      const originalEnv = process.env.NOTIFICATION_PROVIDER;
      process.env.NOTIFICATION_PROVIDER = "email";
      process.env.EMAIL_API_KEY = "test-key";
      process.env.EMAIL_FROM = "test@example.com";

      const adapter = createNotificationAdapter();
      expect(adapter).toBeInstanceOf(EmailNotificationAdapter);

      process.env.NOTIFICATION_PROVIDER = originalEnv;
    });

    it("should create SMS adapter when configured", () => {
      const originalEnv = process.env.NOTIFICATION_PROVIDER;
      process.env.NOTIFICATION_PROVIDER = "sms";
      process.env.SMS_API_KEY = "test-key";
      process.env.SMS_FROM = "+1234567890";

      const adapter = createNotificationAdapter();
      expect(adapter).toBeInstanceOf(SmsNotificationAdapter);

      process.env.NOTIFICATION_PROVIDER = originalEnv;
    });
  });
});

describe("Storage Adapters", () => {
  describe("LocalStorageAdapter", () => {
    let adapter: LocalStorageAdapter;
    let consoleLogSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      adapter = new LocalStorageAdapter("./test-uploads");
      consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    it("should upload file and return metadata", async () => {
      const fileData = Buffer.from("test file content");
      const result = await adapter.upload({
        filename: "test.txt",
        contentType: "text/plain",
        data: fileData,
        metadata: { category: "document" },
      });

      expect(result).toMatchObject({
        key: expect.stringContaining("test.txt"),
        url: expect.stringContaining("/uploads/"),
        size: fileData.length,
        contentType: "text/plain",
        uploadedAt: expect.any(Date),
      });
    });

    it("should generate unique keys for files", async () => {
      const fileData = Buffer.from("test");
      const result1 = await adapter.upload({
        filename: "test.txt",
        contentType: "text/plain",
        data: fileData,
      });

      // Wait a bit to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      const result2 = await adapter.upload({
        filename: "test.txt",
        contentType: "text/plain",
        data: fileData,
      });

      expect(result1.key).not.toBe(result2.key);
    });

    it("should generate correct URL", () => {
      const url = adapter.getUrl("test-file.txt");
      expect(url).toBe("/uploads/test-file.txt");
    });

    it("should handle download operation", async () => {
      const result = await adapter.download("test-file.txt");
      expect(result).toBeInstanceOf(Buffer);
    });

    it("should handle delete operation", async () => {
      await expect(adapter.delete("test-file.txt")).resolves.not.toThrow();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "[STORAGE] Delete",
        expect.objectContaining({ key: "test-file.txt" })
      );
    });
  });

  describe("S3StorageAdapter", () => {
    let adapter: S3StorageAdapter;
    let consoleLogSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      adapter = new S3StorageAdapter({
        bucket: "test-bucket",
        region: "ap-northeast-1",
        accessKeyId: "test-access-key",
        secretAccessKey: "test-secret-key",
      });
      consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    it("should upload file to S3", async () => {
      const fileData = Buffer.from("test content");
      const result = await adapter.upload({
        filename: "document.pdf",
        contentType: "application/pdf",
        data: fileData,
      });

      expect(result).toMatchObject({
        key: expect.stringContaining("document.pdf"),
        url: expect.stringContaining("test-bucket.s3.ap-northeast-1.amazonaws.com"),
        size: fileData.length,
        contentType: "application/pdf",
      });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "[S3] Upload",
        expect.objectContaining({
          bucket: "test-bucket",
          size: fileData.length,
        })
      );
    });

    it("should generate correct S3 URL", () => {
      const url = adapter.getUrl("documents/report.pdf");
      expect(url).toBe(
        "https://test-bucket.s3.ap-northeast-1.amazonaws.com/documents/report.pdf"
      );
    });

    it("should handle download from S3", async () => {
      const result = await adapter.download("test-file.pdf");
      expect(result).toBeInstanceOf(Buffer);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "[S3] Download",
        expect.objectContaining({
          bucket: "test-bucket",
          key: "test-file.pdf",
        })
      );
    });

    it("should handle delete from S3", async () => {
      await adapter.delete("test-file.pdf");
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "[S3] Delete",
        expect.objectContaining({
          bucket: "test-bucket",
          key: "test-file.pdf",
        })
      );
    });
  });

  describe("createStorageAdapter", () => {
    it("should create local adapter by default", () => {
      const originalEnv = process.env.STORAGE_PROVIDER;
      delete process.env.STORAGE_PROVIDER;

      const adapter = createStorageAdapter();
      expect(adapter).toBeInstanceOf(LocalStorageAdapter);

      process.env.STORAGE_PROVIDER = originalEnv;
    });

    it("should create S3 adapter when configured", () => {
      const originalEnv = process.env.STORAGE_PROVIDER;
      process.env.STORAGE_PROVIDER = "s3";
      process.env.S3_BUCKET = "test-bucket";
      process.env.S3_REGION = "us-west-2";
      process.env.AWS_ACCESS_KEY_ID = "test-key";
      process.env.AWS_SECRET_ACCESS_KEY = "test-secret";

      const adapter = createStorageAdapter();
      expect(adapter).toBeInstanceOf(S3StorageAdapter);

      process.env.STORAGE_PROVIDER = originalEnv;
    });
  });
});
