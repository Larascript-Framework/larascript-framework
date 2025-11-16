/**
 * Environment type constants
 */
export const EnvironmentDevelopment = "development";
export const EnvironmentProduction = "production";
export const EnvironmentTesting = "testing";

export type EnvironmentType =
  | typeof EnvironmentDevelopment
  | typeof EnvironmentProduction
  | typeof EnvironmentTesting;

export type EnvironmentConfig = {
  environment: EnvironmentType;
};
