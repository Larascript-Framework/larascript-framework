export const prettifyStack = (str?: string) =>
  str ? str?.split("\n").map((line) => line.trim()) : undefined;
