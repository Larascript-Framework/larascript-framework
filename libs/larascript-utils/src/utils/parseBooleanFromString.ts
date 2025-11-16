/**
 * Parse a boolean value from a string.
 *
 * If the value is undefined, the defaultValue is returned.
 *
 * @param {string | undefined} value The value to parse.
 * @param {boolean} defaultValue The default value to return if the value is undefined.
 * @returns {boolean} The parsed boolean value.
 */
export const parseBooleanFromString = (
  value: string | undefined,
  defaultValue: "true" | "false",
): boolean => {
  if (value === undefined) {
    return defaultValue === "true";
  }

  return value === "true";
};
