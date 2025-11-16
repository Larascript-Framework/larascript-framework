import { isUuid } from "./isUuid.js";

/**
 * Validates a UUID and throws an error if invalid
 * @param value The UUID to validate
 * @throws Error if the UUID is invalid
 */
export function validateUuid(value: unknown): void {
  if (!isUuid(value)) {
    throw new Error("Invalid UUID format");
  }
}
