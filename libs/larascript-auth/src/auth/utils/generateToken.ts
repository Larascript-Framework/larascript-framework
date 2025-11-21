import crypto, { BinaryToTextEncoding } from "crypto";

/**
 * Generates a random token of the given size (in bytes) and encoding.
 * @param {number} [size=64] The size of the token in bytes.
 * @param {BinaryToTextEncoding} [bufferEncoding='hex'] The encoding to use when converting the buffer to a string.
 * @returns {string} A random token as a string.
 */
export const generateToken = (
  size: number = 64,
  bufferEncoding: BinaryToTextEncoding = "hex",
): string => crypto.randomBytes(size).toString(bufferEncoding);
