import { jest } from "@jest/globals";
import path from "path";
import { StorageFile } from "../storage/data/index.js";
import { IStorageConfig } from "../storage/interfaces/index.js";
import StorageService from "../storage/services/StorageService.js";

// Mock path module
jest.mock("path", () => ({
  join: jest.fn((...args) => args.join("/")),
  cwd: jest.fn(() => "/mock/current/working/directory"),
}));

// Mock process.cwd
Object.defineProperty(process, "cwd", {
  value: jest.fn(() => "/mock/current/working/directory"),
  writable: true,
});

describe("StorageService", () => {
  let storageService: StorageService;
  let mockConfig: IStorageConfig;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock configuration
    mockConfig = {
      driver: "fs",
      storageDir: "storage",
      uploadsDir: "uploads",
      s3: {
        accessKeyId: "test-access-key",
        secretAccessKey: "test-secret-key",
        bucket: "test-bucket",
        region: "us-east-1",
      },
    };

    // Create storage service instance
    storageService = new StorageService(mockConfig);
  });

  describe("constructor", () => {
    it("should create a StorageService instance with the provided config", () => {
      expect(storageService).toBeInstanceOf(StorageService);
      expect(storageService.getConfig()).toBe(mockConfig);
    });
  });

  describe("adapter has storage service", () => {
    it("should set the storage service", () => {
      const adapter = storageService.getDefaultAdapter();

      expect(adapter.getStorageService()).toBe(storageService);
    });
  });

  describe("getStorageDirectory", () => {
    it("should return the absolute path to the storage directory", () => {
      const storageDir = storageService.getStorageDirectory();

      expect(path.join).toHaveBeenCalledWith(
        "/mock/current/working/directory",
        "storage",
      );
      expect(storageDir).toBe("/mock/current/working/directory/storage");
    });
  });

  describe("getUploadsDirectory", () => {
    it("should return the absolute path to the uploads directory", () => {
      const uploadsDir = storageService.getUploadsDirectory();

      expect(path.join).toHaveBeenCalledWith(
        "/mock/current/working/directory",
        "uploads",
      );
      expect(uploadsDir).toBe("/mock/current/working/directory/uploads");
    });
  });

  describe("toStorageFile", () => {
    it("should create a StorageFile from a full path", () => {
      const fullPath = "/mock/current/working/directory/storage/test/file.txt";
      const result = storageService.toStorageFile(fullPath);

      expect(result).toBeInstanceOf(StorageFile);
      expect(result.key).toBe("/test/file.txt");
      expect(result.meta).toEqual({ fullPath });
    });

    it("should handle paths with different storage directory", () => {
      const fullPath =
        "/mock/current/working/directory/storage/deep/path/file.txt";
      const result = storageService.toStorageFile(fullPath);

      expect(result.key).toBe("/deep/path/file.txt");
      expect(result.meta).toEqual({ fullPath });
    });
  });

  describe("driver method", () => {
    it("should throw error for invalid driver when no adapters are set", () => {
      expect(() => {
        storageService.driver("invalid");
      }).toThrow("Invalid driver: invalid");
    });
  });

  describe("configuration", () => {
    it("should have correct default driver configuration", () => {
      expect(storageService.getConfig().driver).toBe("fs");
    });

    it("should have correct storage directory configuration", () => {
      expect(storageService.getConfig().storageDir).toBe("storage");
    });

    it("should have correct uploads directory configuration", () => {
      expect(storageService.getConfig().uploadsDir).toBe("uploads");
    });

    it("should have S3 configuration", () => {
      expect(storageService.getConfig().s3).toEqual({
        accessKeyId: "test-access-key",
        secretAccessKey: "test-secret-key",
        bucket: "test-bucket",
        region: "us-east-1",
      });
    });
  });

  describe("path handling", () => {
    it("should handle different storage directory configurations", () => {
      const storageService = new StorageService({
        ...mockConfig,
        storageDir: "custom-storage",
      });
      const storageDir = storageService.getStorageDirectory();

      expect(storageDir).toBe("/mock/current/working/directory/custom-storage");
    });

    it("should handle different uploads directory configurations", () => {
      const storageService = new StorageService({
        ...mockConfig,
        uploadsDir: "custom-uploads",
      });
      const uploadsDir = storageService.getUploadsDirectory();

      expect(uploadsDir).toBe("/mock/current/working/directory/custom-uploads");
    });
  });

  describe("StorageFile creation", () => {
    it("should create StorageFile with correct key from full path", () => {
      const fullPath =
        "/mock/current/working/directory/storage/documents/file.pdf";
      const result = storageService.toStorageFile(fullPath);

      expect(result.key).toBe("/documents/file.pdf");
      expect(result.meta?.fullPath).toBe(fullPath);
    });

    it("should handle root storage files", () => {
      const fullPath = "/mock/current/working/directory/storage/root-file.txt";
      const result = storageService.toStorageFile(fullPath);

      expect(result.key).toBe("/root-file.txt");
    });
  });
});
