import {
  EnvironmentDevelopment,
  EnvironmentType,
} from "@larascript-framework/contracts/larascript-core";

const APP_URL = (process.env.APP_URL ?? "http://localhost:5000") as string;

// App configuration type definition
export type IAppConfig = {
  env: EnvironmentType;
  appKey: string;
  appLogoUrl?: string;
  appUrl?: string;
  appName?: string;
};

// App configuration
const appConfig: IAppConfig = {
  env: (process.env.APP_ENV as EnvironmentType) ?? EnvironmentDevelopment,
  appName: "Larascript Framework",
  appKey: process.env.APP_KEY ?? "",
  appLogoUrl: undefined,
  appUrl: APP_URL,
};

export default appConfig;
