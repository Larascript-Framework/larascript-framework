import { AppSingleton } from "../../../app/AppSingleton.js";
import { TestContainers } from "../providers/providers.js";

export const testApp = <K extends keyof TestContainers>(name: K) =>
  AppSingleton.container<TestContainers>(name) as TestContainers[K];
