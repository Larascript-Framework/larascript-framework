export type TPrettify<T> = {
  [K in keyof T]: T[K];
} & {};
