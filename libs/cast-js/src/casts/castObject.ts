import { BaseCastable } from "./BaseCastable.js";
import { TCasts } from "./types.t.js";

const castObject = <ReturnType = unknown>(
  data: unknown,
  casts: TCasts,
): ReturnType => {
  return new BaseCastable().getCastFromObject<ReturnType>(
    data as Record<string, unknown>,
    casts,
  );
};

export default castObject;
