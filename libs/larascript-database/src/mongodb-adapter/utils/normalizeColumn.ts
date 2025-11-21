export const normalizeColumn = (column: string): string => {
  if (column === "id") {
    return "_id";
  }
  return column;
};
