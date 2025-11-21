export const isFalsy = (value: unknown): boolean => {
  return (
    value === false ||
    value === "false" ||
    value === 0 ||
    value === "0" ||
    value === "no" ||
    value === "off"
  );
};

export default isFalsy;
