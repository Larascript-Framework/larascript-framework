import { TClassConstructor } from "./ClassConstructor.t.js";

export const compose = (BaseClass: TClassConstructor, ...mixins) => {
  return mixins.reduce((Class, mixinFunc) => mixinFunc(Class), BaseClass);
};
