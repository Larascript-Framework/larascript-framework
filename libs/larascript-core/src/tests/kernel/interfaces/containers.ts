import { DependencyLoader } from "@larascript-framework/contracts/larascript-core";

export type TestContainers = {
    example: string;
    object: {
      value: 1;
    };
    logger: {
      log: (message: string) => void;
      clear: () => void;
      containsLog: (message: string) => boolean;
    };
    database: {
      setDependencyLoader: (loader: DependencyLoader) => void;
      connect: () => Promise<boolean>;
      reset: () => void;
    };
  };