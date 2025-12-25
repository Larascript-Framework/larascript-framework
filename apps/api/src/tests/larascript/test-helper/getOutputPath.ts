import path from "path";

export const getOutputPath = (fileName?: string): string => {
  if (fileName) {
    return path.join(process.cwd(), "src", "tests/output", fileName);
  }
  return path.join(process.cwd(), "src", "tests/output");
};
