import { createHash } from "crypto";
import { createReadStream } from "fs";

/**
 * Calculates the checksum of a file using a given algorithm.
 *
 * @param {string} path The path to the file to calculate the checksum of.
 * @param {string} [algorithm='sha256'] The algorithm to use. Defaults to 'sha256'.
 *
 * @returns {Promise<string>} A promise that resolves with the calculated checksum as a string.
 */
export const checksumFile = async (
  path: string,
  algorithm: string = "sha256",
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const hash = createHash(algorithm);
    const stream = createReadStream(path);

    // If there's an error, reject the promise with the error.
    stream.on("error", (error) => {
      reject(error);
    });

    // Update the hash with each chunk of data from the stream.
    stream.on("data", (chunk) => {
      hash.update(chunk);
    });

    // When the stream ends, resolve the promise with the calculated checksum.
    stream.on("end", () => {
      resolve(hash.digest("hex"));
    });
  });
};
