import { BufferEncoding } from "./BufferingEncoding.js";

export interface ICryptoService {
  generateBytesAsString(length?: number, encoding?: BufferEncoding): string;
  encrypt(string: string): string;
  decrypt(string: string): string;
  hash(string: string): string;
  verifyHash(string: string, hashWithSalt: string): boolean;
  generateAppKey(): string;
}
