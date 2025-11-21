import { beforeEach, describe, expect, test } from "@jest/globals";
import { CryptoService } from "../crypto/CryptoService.js";
import { ICryptoConfig } from "../crypto/ICryptoConfig.t.js";

describe("CryptoService", () => {
  let cryptoService: CryptoService;
  let validConfig: ICryptoConfig;

  beforeEach(() => {
    validConfig = {
      secretKey: "test-secret-key-32-chars-long!!!",
    };
    cryptoService = new CryptoService(validConfig);
  });

  describe("constructor", () => {
    test("should create instance with valid config", () => {
      expect(cryptoService).toBeInstanceOf(CryptoService);
    });
  });

  describe("generateBytesAsString", () => {
    test("should generate hex string with default length", () => {
      const result = cryptoService.generateBytesAsString();
      expect(result).toHaveLength(64); // 32 bytes = 64 hex chars
      expect(result).toMatch(/^[0-9a-f]+$/);
    });

    test("should generate hex string with custom length", () => {
      const result = cryptoService.generateBytesAsString(16);
      expect(result).toHaveLength(32); // 16 bytes = 32 hex chars
      expect(result).toMatch(/^[0-9a-f]+$/);
    });

    test("should generate base64 string", () => {
      const result = cryptoService.generateBytesAsString(32, "base64");
      expect(result).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
    });

    test("should generate different strings on each call", () => {
      const result1 = cryptoService.generateBytesAsString();
      const result2 = cryptoService.generateBytesAsString();
      expect(result1).not.toBe(result2);
    });
  });

  describe("encrypt", () => {
    test("should encrypt a simple string", () => {
      const plaintext = "Hello, World!";
      const encrypted = cryptoService.encrypt(plaintext);

      expect(encrypted).toBeDefined();
      expect(encrypted).toContain("|");
      expect(encrypted.split("|")).toHaveLength(2);
    });

    test("should encrypt empty string", () => {
      const encrypted = cryptoService.encrypt("");
      expect(encrypted).toBeDefined();
      expect(encrypted).toContain("|");
    });

    test("should encrypt special characters", () => {
      const plaintext = "Special chars: !@#$%^&*()_+-=[]{}|;':\",./<>?";
      const encrypted = cryptoService.encrypt(plaintext);

      expect(encrypted).toBeDefined();
      expect(encrypted).toContain("|");
    });

    test("should encrypt unicode characters", () => {
      const plaintext = "Unicode: 🚀🌟🎉中文日本語한국어";
      const encrypted = cryptoService.encrypt(plaintext);

      expect(encrypted).toBeDefined();
      expect(encrypted).toContain("|");
    });

    test("should generate different ciphertexts for same plaintext", () => {
      const plaintext = "Same text";
      const encrypted1 = cryptoService.encrypt(plaintext);
      const encrypted2 = cryptoService.encrypt(plaintext);

      expect(encrypted1).not.toBe(encrypted2);
    });

    test("should throw error when secret key is empty", () => {
      const emptyConfig: ICryptoConfig = { secretKey: "" };
      const serviceWithEmptyKey = new CryptoService(emptyConfig);

      expect(() => {
        serviceWithEmptyKey.encrypt("test");
      }).toThrow("App key is not set");
    });

    test("should throw error when secret key is not set", () => {
      const noKeyConfig = {} as ICryptoConfig;
      const serviceWithNoKey = new CryptoService(noKeyConfig);

      expect(() => {
        serviceWithNoKey.encrypt("test");
      }).toThrow("App key is not set");
    });
  });

  describe("decrypt", () => {
    test("should decrypt encrypted string correctly", () => {
      const plaintext = "Hello, World!";
      const encrypted = cryptoService.encrypt(plaintext);
      const decrypted = cryptoService.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    test("should decrypt empty string", () => {
      const encrypted = cryptoService.encrypt("");
      const decrypted = cryptoService.decrypt(encrypted);

      expect(decrypted).toBe("");
    });

    test("should decrypt special characters", () => {
      const plaintext = "Special chars: !@#$%^&*()_+-=[]{}|;':\",./<>?";
      const encrypted = cryptoService.encrypt(plaintext);
      const decrypted = cryptoService.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    test("should decrypt unicode characters", () => {
      const plaintext = "Unicode: 🚀🌟🎉中文日本語한국어";
      const encrypted = cryptoService.encrypt(plaintext);
      const decrypted = cryptoService.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    test("should throw error when secret key is empty", () => {
      const emptyConfig: ICryptoConfig = { secretKey: "" };
      const serviceWithEmptyKey = new CryptoService(emptyConfig);

      expect(() => {
        serviceWithEmptyKey.decrypt("invalid|data");
      }).toThrow("App key is not set");
    });

    test("should throw error when secret key is not set", () => {
      const noKeyConfig = {} as ICryptoConfig;
      const serviceWithNoKey = new CryptoService(noKeyConfig);

      expect(() => {
        serviceWithNoKey.decrypt("invalid|data");
      }).toThrow("App key is not set");
    });

    test("should handle malformed encrypted data gracefully", () => {
      expect(() => {
        cryptoService.decrypt("invalid-data-without-pipe");
      }).toThrow();
    });
  });

  describe("hash", () => {
    test("should hash string with generated salt", () => {
      const plaintext = "password123";
      const hashed = cryptoService.hash(plaintext);

      expect(hashed).toBeDefined();
      expect(hashed).toContain("|");
      expect(hashed.split("|")).toHaveLength(2);
    });

    test("should hash string with provided salt", () => {
      const plaintext = "password123";
      const salt = "custom-salt";
      const hashed = cryptoService.hash(plaintext, salt);

      expect(hashed).toContain("|");
      expect(hashed.split("|")[0]).toBe(salt);
      expect(hashed.split("|")[1]).toBeDefined();
    });

    test("should generate different hashes for same input", () => {
      const plaintext = "password123";
      const hashed1 = cryptoService.hash(plaintext);
      const hashed2 = cryptoService.hash(plaintext);

      expect(hashed1).not.toBe(hashed2);
    });

    test("should hash empty string", () => {
      const hashed = cryptoService.hash("");
      expect(hashed).toBeDefined();
      expect(hashed).toContain("|");
    });

    test("should hash special characters", () => {
      const plaintext = "Special chars: !@#$%^&*()";
      const hashed = cryptoService.hash(plaintext);

      expect(hashed).toBeDefined();
      expect(hashed).toContain("|");
    });
  });

  describe("verifyHash", () => {
    test("should verify correct password", () => {
      const plaintext = "password123";
      const hashed = cryptoService.hash(plaintext);
      const isValid = cryptoService.verifyHash(plaintext, hashed);

      expect(isValid).toBe(true);
    });

    test("should reject incorrect password", () => {
      const plaintext = "password123";
      const hashed = cryptoService.hash(plaintext);
      const isValid = cryptoService.verifyHash("wrongpassword", hashed);

      expect(isValid).toBe(false);
    });

    test("should verify with provided salt", () => {
      const plaintext = "password123";
      const salt = "custom-salt";
      const hashed = cryptoService.hash(plaintext, salt);
      const isValid = cryptoService.verifyHash(plaintext, hashed);

      expect(isValid).toBe(true);
    });

    test("should handle empty string", () => {
      const hashed = cryptoService.hash("");
      const isValid = cryptoService.verifyHash("", hashed);

      expect(isValid).toBe(true);
    });

    test("should handle malformed hash gracefully", () => {
      // The verifyHash method calls hash internally, which will handle malformed input
      // by treating it as a salt and generating a new hash
      const result = cryptoService.verifyHash("password", "invalid-hash");
      expect(result).toBe(false);
    });
  });

  describe("generateAppKey", () => {
    test("should generate app key", () => {
      const appKey = cryptoService.generateAppKey();

      expect(appKey).toBeDefined();
      expect(appKey).toHaveLength(64); // 32 bytes = 64 hex chars
      expect(appKey).toMatch(/^[0-9a-f]+$/);
    });

    test("should generate different keys on each call", () => {
      const key1 = cryptoService.generateAppKey();
      const key2 = cryptoService.generateAppKey();

      expect(key1).not.toBe(key2);
    });
  });

  describe("integration tests", () => {
    test("should encrypt and decrypt complex data", () => {
      const complexData = {
        username: "testuser",
        email: "test@example.com",
        password: "securePassword123!",
        metadata: {
          created: new Date().toISOString(),
          tags: ["test", "crypto", "integration"],
        },
      };

      const jsonString = JSON.stringify(complexData);
      const encrypted = cryptoService.encrypt(jsonString);
      const decrypted = cryptoService.decrypt(encrypted);
      const parsed = JSON.parse(decrypted);

      expect(parsed).toEqual(complexData);
    });

    test("should handle large strings", () => {
      const largeString = "A".repeat(10000);
      const encrypted = cryptoService.encrypt(largeString);
      const decrypted = cryptoService.decrypt(encrypted);

      expect(decrypted).toBe(largeString);
    });

    test("should work with different configs", () => {
      const config1: ICryptoConfig = {
        secretKey: "first-secret-key-32-chars!!",
      };
      const config2: ICryptoConfig = {
        secretKey: "second-secret-key-32-chars!",
      };

      const service1 = new CryptoService(config1);
      const service2 = new CryptoService(config2);

      const plaintext = "test message";
      const encrypted1 = service1.encrypt(plaintext);
      const encrypted2 = service2.encrypt(plaintext);

      expect(encrypted1).not.toBe(encrypted2);
      expect(service1.decrypt(encrypted1)).toBe(plaintext);
      expect(service2.decrypt(encrypted2)).toBe(plaintext);
    });
  });
});
