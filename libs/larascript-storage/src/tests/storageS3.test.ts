import { jest } from "@jest/globals";
import "dotenv/config";
import fs from "fs";
import path from "path";
import { StorageFile } from "../storage/data/index.js";
import { FileSystemMeta, IStorageConfig } from "../storage/interfaces/index.js";
import AmazonS3StorageService from "../storage/services/AmazonS3StorageService.js";
import StorageService from "../storage/services/StorageService.js";

// Check if AWS tests should run
const shouldRunAWSTests = process.env.AWS_SKIP_TESTS !== "true";

// Skip all tests if AWS_SKIP_TESTS is set to 'true'
(shouldRunAWSTests ? describe : describe.skip)("AmazonS3StorageService", () => {
  let storageService: StorageService;
  let s3Service: AmazonS3StorageService;
  let mockConfig: IStorageConfig;
  let testFilePath: string;
  let testFileContent: string;

  beforeAll(() => {
    // Create a temporary test file
    testFileContent = "This is a test file for S3 upload";
    testFilePath = path.join(process.cwd(), "storage", "test-upload.txt");

    // Ensure the storage directory exists
    const storageDir = path.dirname(testFilePath);
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    // Write test file
    fs.writeFileSync(testFilePath, testFileContent);
  });

  afterAll(async () => {
    // Clean up test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }

    // Clean up all test files from S3
    try {
      await s3Service.deleteObjectsWithPrefix("test-uploads/");
      console.log("✅ S3 test files cleaned up successfully");
    } catch (error) {
      console.error("❌ Failed to clean up S3 test files:", error);
    }
  }, 30000); // 30 second timeout for cleanup

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock configuration with environment variables
    mockConfig = {
      driver: "s3",
      storageDir: "storage",
      uploadsDir: "uploads",
      s3: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
        bucket: process.env.S3_BUCKET ?? "",
        region: process.env.S3_REGION ?? "",
      },
    };

    // Create storage service instance
    storageService = new StorageService(mockConfig);
    s3Service = storageService.driver("s3") as AmazonS3StorageService;
  });

  describe("configuration", () => {
    it("should have correct S3 configuration from environment variables", () => {
      expect(mockConfig.s3.accessKeyId).toBe(
        process.env.AWS_ACCESS_KEY_ID ?? "",
      );
      expect(mockConfig.s3.secretAccessKey).toBe(
        process.env.AWS_SECRET_ACCESS_KEY ?? "",
      );
      expect(mockConfig.s3.bucket).toBe(process.env.S3_BUCKET ?? "");
      expect(mockConfig.s3.region).toBe(process.env.S3_REGION ?? "");
    });

    it("should create S3 service with correct configuration", () => {
      expect(s3Service).toBeInstanceOf(AmazonS3StorageService);
      expect(s3Service.config.accessKeyId).toBe(
        process.env.AWS_ACCESS_KEY_ID ?? "",
      );
      expect(s3Service.config.secretAccessKey).toBe(
        process.env.AWS_SECRET_ACCESS_KEY ?? "",
      );
      expect(s3Service.config.bucket).toBe(process.env.S3_BUCKET ?? "");
      expect(s3Service.config.region).toBe(process.env.S3_REGION ?? "");
    });
  });

  describe("file upload (put)", () => {
    it("should upload a file to S3 with timestamp-based destination", async () => {
      const storageFile = storageService.toStorageFile(testFilePath);

      const result = await s3Service.put(storageFile);

      expect(result).toBeInstanceOf(StorageFile);
      expect(result.getKey()).toMatch(/^test-uploads\/\d+\/test-upload\.txt$/);
      expect(result.getMeta()).toBeDefined();
      expect(result.getMeta()?.Key).toBe(result.getKey());
    }, 30000); // 30 second timeout for S3 operations

    it("should upload a file to S3 with custom destination", async () => {
      const storageFile = storageService.toStorageFile(testFilePath);
      const customDestination = "test-uploads/custom/path/test-file.txt";

      const result = await s3Service.put(storageFile, customDestination);

      expect(result).toBeInstanceOf(StorageFile);
      expect(result.getKey()).toBe(customDestination);
      expect(result.getMeta()).toBeDefined();
      expect(result.getMeta()?.Key).toBe(customDestination);
    }, 30000);

    it("should upload a file using string path", async () => {
      const result = await s3Service.put(testFilePath);

      expect(result).toBeInstanceOf(StorageFile);
      expect(result.getKey()).toMatch(/^test-uploads\/\d+\/test-upload\.txt$/);
      expect(result.getMeta()).toBeDefined();
    }, 30000);

    it("should throw error when uploading non-existent file", async () => {
      const nonExistentPath = "/path/to/non-existent/file.txt";

      await expect(s3Service.put(nonExistentPath)).rejects.toThrow();
    });
  });

  describe("file retrieval (get)", () => {
    let uploadedFile: StorageFile;

    beforeEach(async () => {
      // Upload a test file first
      const storageFile = storageService.toStorageFile(testFilePath);
      uploadedFile = await s3Service.put(storageFile);
    }, 30000);

    it("should retrieve a file from S3 using StorageFile", async () => {
      const result = await s3Service.get(uploadedFile);

      expect(result).toBeInstanceOf(StorageFile);
      expect(result.getKey()).toBe(uploadedFile.getKey());
      expect(result.getMeta()).toBeDefined();
    }, 30000);

    it("should retrieve a file from S3 using string key", async () => {
      const result = await s3Service.get(uploadedFile.getKey());

      expect(result).toBeInstanceOf(StorageFile);
      expect(result.getKey()).toBe(uploadedFile.getKey());
      expect(result.getMeta()).toBeDefined();
    }, 30000);

    it("should retrieve a file with additional parameters", async () => {
      const additionalParams = {
        Expires: 3600, // 1 hour expiration
      };

      const result = await s3Service.get(uploadedFile, additionalParams);

      expect(result).toBeInstanceOf(StorageFile);
      expect(result.getMeta()?.presignedUrl).toBeDefined();
      expect(result.getMeta()?.presignedUrl).toContain("X-Amz-Expires=3600");
    }, 30000);
  });

  describe("file deletion (delete)", () => {
    let uploadedFile: StorageFile;

    beforeEach(async () => {
      // Upload a test file first
      const storageFile = storageService.toStorageFile(testFilePath);
      uploadedFile = await s3Service.put(storageFile);
    }, 30000);

    it("should delete a file from S3 using StorageFile", async () => {
      await expect(s3Service.delete(uploadedFile)).resolves.not.toThrow();

      // Note: S3 delete operations may not immediately reflect in get operations
      // This test may need to be adjusted based on S3 eventual consistency
    }, 30000);

    it("should delete a file from S3 using string key", async () => {
      const fileKey = uploadedFile.getKey();

      await expect(s3Service.delete(fileKey)).resolves.not.toThrow();

      // Note: S3 delete operations may not immediately reflect in get operations
      // This test may need to be adjusted based on S3 eventual consistency
    }, 30000);

    it("should delete multiple files with prefix", async () => {
      // Upload multiple test files
      const storageFile = storageService.toStorageFile(testFilePath);

      const file1 = await s3Service.put(
        storageFile,
        "test-uploads/bulk-delete-test/file1.txt",
      );
      const file2 = await s3Service.put(
        storageFile,
        "test-uploads/bulk-delete-test/file2.txt",
      );
      const file3 = await s3Service.put(
        storageFile,
        "test-uploads/bulk-delete-test/file3.txt",
      );

      expect(file1).toBeInstanceOf(StorageFile);
      expect(file2).toBeInstanceOf(StorageFile);
      expect(file3).toBeInstanceOf(StorageFile);

      // Delete all files with the prefix
      await expect(
        s3Service.deleteObjectsWithPrefix("test-uploads/bulk-delete-test/"),
      ).resolves.not.toThrow();

      // Verify files are deleted (with eventual consistency in mind)
      // Note: In a real scenario, you might want to add a small delay here
    }, 30000);
  });

  describe("StorageFile creation", () => {
    it("should create StorageFile with S3 source", () => {
      const key = "test-uploads/test/s3-file.txt";
      const options = {
        meta: {
          Key: key,
          Bucket: mockConfig.s3.bucket,
        },
      };

      const result = s3Service.createStorageFile(key, options);

      expect(result).toBeInstanceOf(StorageFile);
      expect(result.getKey()).toBe(key);
      expect(result.getSource()).toBe("s3");
      expect(result.getMeta()).toEqual(options.meta);
    });
  });

  describe("error handling", () => {
    it("should handle invalid file parameter in parseStorageFileOrS3Key", () => {
      const invalidFile = null as unknown as string;

      expect(() => {
        s3Service["parseStorageFileOrS3Key"](invalidFile);
      }).toThrow("Cannot read properties of null (reading 'getKey')");
    });

    it("should handle missing fullPath in put operation", async () => {
      const storageFile = new StorageFile({
        key: "test.txt",
        source: "fs",
        // Missing fullPath in meta
      });

      await expect(
        s3Service.put(storageFile as StorageFile<FileSystemMeta>),
      ).rejects.toThrow("fullPath not configured");
    });
  });

  describe("integration with StorageService", () => {
    it("should use S3 driver from StorageService", () => {
      const s3Driver = storageService.driver("s3");

      expect(s3Driver).toBeInstanceOf(AmazonS3StorageService);
      expect(s3Driver).toBe(s3Service);
    });

    it("should have storage service reference", () => {
      expect(s3Service.getStorageService()).toBe(storageService);
    });
  });
});
