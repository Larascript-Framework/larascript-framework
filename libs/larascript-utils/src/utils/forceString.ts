export const forceString = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }

  return String(value);
};
