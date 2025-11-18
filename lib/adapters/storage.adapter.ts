/**
 * Storage adapter interface
 * Allows plugging in different storage providers (local, S3, Azure Blob, etc.)
 */

export interface StorageUploadOptions {
  filename: string;
  contentType: string;
  data: Buffer | Uint8Array;
  metadata?: Record<string, string>;
}

export interface StorageFile {
  key: string;
  url: string;
  size: number;
  contentType: string;
  uploadedAt: Date;
}

export interface IStorageAdapter {
  upload(options: StorageUploadOptions): Promise<StorageFile>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
  exists(key: string): Promise<boolean>;
}

/**
 * Local filesystem storage implementation
 */
export class LocalStorageAdapter implements IStorageAdapter {
  constructor(private basePath: string = "./uploads") {}

  async upload(options: StorageUploadOptions): Promise<StorageFile> {
    // In production, would actually write to filesystem
    const key = `${Date.now()}-${options.filename}`;

    console.log("[STORAGE] Upload", {
      key,
      size: options.data.length,
      contentType: options.contentType,
    });

    return {
      key,
      url: this.getUrl(key),
      size: options.data.length,
      contentType: options.contentType,
      uploadedAt: new Date(),
    };
  }

  async download(key: string): Promise<Buffer> {
    // In production, would read from filesystem
    console.log("[STORAGE] Download", { key });
    return Buffer.from("");
  }

  async delete(key: string): Promise<void> {
    console.log("[STORAGE] Delete", { key });
  }

  getUrl(key: string): string {
    return `/uploads/${key}`;
  }

  async exists(key: string): Promise<boolean> {
    return false; // Stub
  }
}

/**
 * S3-compatible storage implementation (stub)
 */
export class S3StorageAdapter implements IStorageAdapter {
  constructor(
    private config: {
      bucket: string;
      region: string;
      accessKeyId: string;
      secretAccessKey: string;
    }
  ) {}

  async upload(options: StorageUploadOptions): Promise<StorageFile> {
    const key = `${Date.now()}-${options.filename}`;

    // Would use AWS SDK here
    console.log("[S3] Upload", {
      bucket: this.config.bucket,
      key,
      size: options.data.length,
    });

    return {
      key,
      url: this.getUrl(key),
      size: options.data.length,
      contentType: options.contentType,
      uploadedAt: new Date(),
    };
  }

  async download(key: string): Promise<Buffer> {
    console.log("[S3] Download", { bucket: this.config.bucket, key });
    return Buffer.from("");
  }

  async delete(key: string): Promise<void> {
    console.log("[S3] Delete", { bucket: this.config.bucket, key });
  }

  getUrl(key: string): string {
    return `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}`;
  }

  async exists(key: string): Promise<boolean> {
    return false; // Stub
  }
}

// Default adapter factory
export function createStorageAdapter(): IStorageAdapter {
  const provider = process.env.STORAGE_PROVIDER || "local";

  switch (provider) {
    case "s3":
      return new S3StorageAdapter({
        bucket: process.env.S3_BUCKET || "",
        region: process.env.S3_REGION || "us-east-1",
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      });
    default:
      return new LocalStorageAdapter(process.env.UPLOAD_DIR || "./uploads");
  }
}
