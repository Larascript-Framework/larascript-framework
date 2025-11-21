import { testHelper } from "./testHelper.js";

export type ForEveryConnectionFn = (connectionName: string) => Promise<void>;
export type ForEveryConnectionOptions = {
  only?: string[];
  exclude?: string[];
};

export const forEveryConnection = async (
  fn: ForEveryConnectionFn,
  options: ForEveryConnectionOptions = {},
) => {
  const connectionNames = testHelper.getTestConnectionNames();
  for (const connectionName of connectionNames) {
    if (options.only && !options.only.includes(connectionName)) continue;
    if (options.exclude && options.exclude.includes(connectionName)) continue;

    console.log("[forEveryConnection]: " + connectionName);
    await fn(connectionName);
  }
};
