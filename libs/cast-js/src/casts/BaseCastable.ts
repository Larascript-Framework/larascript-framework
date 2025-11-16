import { TClassConstructor } from "../utils/ClassConstructor.t.js";
import { compose } from "../utils/compose.js";
import { HasCastableConcern } from "./HasCastableConcern.js";
import { IHasCastableConcern } from "./types.t.js";

export const BaseCastable: TClassConstructor<IHasCastableConcern> = compose(
  class {},
  HasCastableConcern,
);
