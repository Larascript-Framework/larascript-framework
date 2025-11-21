/* eslint-disable @typescript-eslint/no-explicit-any */
export type TClassConstructor<T = any> = new (...args: any[]) => T;

export const compose = (BaseClass: TClassConstructor, ...mixins) => {
  return mixins.reduce((Class, mixinFunc) => mixinFunc(Class), BaseClass);
};
