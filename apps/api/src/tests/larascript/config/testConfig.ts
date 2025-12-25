import {
  EnvironmentTesting,
  EnvironmentType,
} from "@larascript-framework/contracts/larascript-core";

require("dotenv").config();

export type TestAppConfig = {
  appKey: string;
  env: EnvironmentType;
  appName: string;
};

const testAppConfig: TestAppConfig = {
  appName: "test",
  appKey: "test",
  env: EnvironmentTesting,
};

export default testAppConfig;
