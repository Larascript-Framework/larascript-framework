export type TCastableType =
  | "string"
  | "number"
  | "boolean"
  | "array"
  | "object"
  | "date"
  | "integer"
  | "float"
  | "bigint"
  | "null"
  | "undefined"
  | "symbol"
  | "map"
  | "set";

export interface IHasCastableConcern {
  casts: Record<string, TCastableType>;
  getCastFromObject<ReturnType = unknown>(
    data: Record<string, unknown>,
    casts?: TCasts,
  ): ReturnType;
  getCast<T = unknown>(data: unknown, type: TCastableType): T;
  isValidType(type: TCastableType): boolean;
}

export type TCasts = Record<string, TCastableType>;
