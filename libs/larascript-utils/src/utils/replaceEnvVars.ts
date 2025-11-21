/**
 * Replaces a property in the .env content string with a new value
 *
 * @param {string} key The key of the property to replace
 * @param {string} value The new value to set
 * @param {string} content The entire .env file content as a string
 * @returns {string} The updated content string
 */
export const replaceEnvValue = (
  key: string,
  value: string,
  content: string,
): string => {
  const pattern = new RegExp(`(${key}=.*)`, "g");
  let match;
  while ((match = pattern.exec(content)) !== null) {
    content = content.replace(match[0], `${key}=${value}`);
  }

  return content;
};
