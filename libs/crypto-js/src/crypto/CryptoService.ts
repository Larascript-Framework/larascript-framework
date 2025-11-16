import crypto from "node:crypto";
import { ICryptoConfig } from "./ICryptoConfig.t.js";
import { ICryptoService } from "./ICryptoService.t.js";

export class CryptoService implements ICryptoService {
  protected config!: ICryptoConfig;

  constructor(config: ICryptoConfig) {
    this.config = config;
  }

  /**
   * Generate a new app key
   */
  generateBytesAsString(length: number = 32, encoding: BufferEncoding = "hex") {
    return crypto.randomBytes(length).toString(encoding);
  }

  /**
   * Encrypt a string
   */
  encrypt(toEncrypt: string): string {
    this.validateSecretKey();

    const iv = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(
      this.config.secretKey,
      "salt",
      100000,
      32,
      "sha256",
    );
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

    let encrypted = cipher.update(String(toEncrypt), "utf-8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + "|" + encrypted;
  }

  /**
   * Decrypt a string
   */
  decrypt(encryptedData: string): string {
    this.validateSecretKey();

    const [ivHex, encryptedText] = encryptedData.split("|");
    const iv = Buffer.from(ivHex, "hex");
    const key = crypto.pbkdf2Sync(
      this.config.secretKey,
      "salt",
      100000,
      32,
      "sha256",
    );

    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf-8");
    decrypted += decipher.final("utf-8");
    return decrypted;
  }

  /**
   * Hash a string using PBKDF2
   * @param string The string to hash
   * @param salt Optional salt (if not provided, a random one will be generated)
   * @returns The hashed string with salt, format: 'salt|hash'
   */
  hash(string: string, salt?: string): string {
    const useSalt = salt || crypto.randomBytes(16).toString("hex");
    const hashedString = crypto
      .pbkdf2Sync(
        string,
        useSalt,
        100000, // iterations
        64, // key length
        "sha512",
      )
      .toString("hex");

    return `${useSalt}|${hashedString}`;
  }

  /**
   * Verify a string against a hash
   * @param string The string to verify
   * @param hashWithSalt The hash with salt (format: 'salt|hash')
   * @returns boolean
   */
  verifyHash(string: string, hashWithSalt: string): boolean {
    const [salt] = hashWithSalt.split("|");
    const verifyHash = this.hash(string, salt);
    return verifyHash === hashWithSalt;
  }

  /**
   * Generate a new app key
   */
  generateAppKey(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Validate the app key
   */
  private validateSecretKey() {
    if (!this.config.secretKey || this.config.secretKey.length === 0) {
      throw new Error("App key is not set");
    }
  }
}

export default CryptoService;
