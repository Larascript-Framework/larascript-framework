import ACLProvider from "@/core/providers/ACLProvider.js";
import AsyncSessionProvider from "@/core/providers/AsyncSessionProvider.js";
import EventProvider from "@/core/providers/EventProvider.js";
import LoggerProvider from "@/core/providers/LoggerProvider.js";
import MailProvider from "@/core/providers/MailProvider.js";
import SetupProvider from "@/core/providers/SetupProvider.js";
import ValidatorProvider from "@/core/providers/ValidatorProvider.js";
import { app } from "@/core/services/App.js";
import TestApiTokenModel from "@/tests/larascript/models/models/TestApiTokenModel.js";
import TestUser from "@/tests/larascript/models/models/TestUser.js";
import TestAuthProvider from "@/tests/larascript/providers/TestAuthProvider.js";
import TestConsoleProvider from "@/tests/larascript/providers/TestConsoleProvider.js";
import TestCryptoProvider from "@/tests/larascript/providers/TestCryptoProvider.js";
import TestDatabaseProvider, {
  testDbName,
} from "@/tests/larascript/providers/TestDatabaseProvider.js";
import TestEnvServiceProvider from "@/tests/larascript/providers/TestEnvServiceProvider.js";
import TestMigrationProvider from "@/tests/larascript/providers/TestMigrationProvider.js";
import TestViewProvider from "@/tests/larascript/providers/TestViewProvider.js";
import { Kernel, KernelConfig } from "@larascript-framework/bootstrap";
import {
  EnvironmentTesting,
} from "@larascript-framework/larascript-core";
import { DataTypes } from "sequelize";
import TestPackageJsonProvider from "./larascript/providers/TestPackageJsonProvider.js";

export const getTestDbName = () => testDbName;

/**
 * Boot the kernel in a test environment
 * @remarks
 * This function boots the kernel with the providers required for tests
 * @example
 * const testBootApp = await testBootApp()
 * expect(App.container('db')).toBeInstanceOf(TestDatabaseProvider)
 */
const testBootApp = async () => {
  const config: KernelConfig = {
    environment: EnvironmentTesting,
    providers: [
      new LoggerProvider(),
      new TestConsoleProvider(),
      new TestCryptoProvider(),
      new AsyncSessionProvider(),
      new TestDatabaseProvider(),
      new EventProvider(),
      new ACLProvider(),
      new TestAuthProvider(),
      new TestMigrationProvider(),
      new ValidatorProvider(),
      new TestViewProvider(),
      new MailProvider(),
      new TestEnvServiceProvider(),
      new TestPackageJsonProvider(),
      new SetupProvider(),
    ],
  };

  Kernel.reset();
  await Kernel.create(config).boot({})
};

/**
 * Creates the auth tables in the database
 * @remarks
 * This function creates the `users` and `api_tokens` tables in the database
 * @param connectionName The name of the database connection to use
 */
export const createAuthTables = async (connectionName?: string) => {
  const schema = app("db").schema(connectionName);

  const userTable = new TestUser().table;
  const apiTokenTable = TestApiTokenModel.getTable();

  const stringNullable = {
    type: DataTypes.STRING,
    allowNull: true,
  };

  await schema.createTable(userTable, {
    email: DataTypes.STRING,
    hashedPassword: DataTypes.STRING,
    groups: DataTypes.ARRAY(DataTypes.STRING),
    roles: DataTypes.ARRAY(DataTypes.STRING),
    firstName: stringNullable,
    lastName: stringNullable,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  });

  await schema.createTable(apiTokenTable, {
    userId: DataTypes.STRING,
    token: DataTypes.STRING,
    scopes: DataTypes.JSON,
    options: DataTypes.JSON,
    revokedAt: DataTypes.DATE,
    expiresAt: DataTypes.DATE,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  });
};

/**
 * Drops the `users` and `api_tokens` tables in the database
 * @remarks
 * This function removes the `users` and `api_tokens` tables from the database
 * @param connectionName The name of the database connection to use
 */
export const dropAuthTables = async (connectionName?: string) => {
  const schema = app("db").schema(connectionName);

  const userTable = new TestUser().table;
  const apiTokenTable = new TestApiTokenModel().table;

  await schema.dropTable(userTable);
  await schema.dropTable(apiTokenTable);
};

/**
 * Run fresh migrations with the testing group and seed the database
 * @remarks
 * This function is used to run fresh migrations with the testing group and seed the database
 * @example
 * await runFreshMigrations()
 */
const runFreshMigrations = async () => {
  await app("console")
    .readerService(["migrate:fresh", "--group=testing", "--seed"])
    .handle();
};

/**
 * Revert all migrations with the testing group
 * @remarks
 * This function is used to clear all migrations with the testing group. It is used
 * to reset the database to its original state after running tests.
 * @example
 * await clearMigrations()
 */
const clearMigrations = async () => {
  await app("console")
    .readerService(["migrate:down", "--group=testing"])
    .handle();
};

/**
 * Retrieves a list of test database connection names, excluding any specified.
 * @param exclude An array of connection names to exclude from the result.
 * @returns An array of connection names, excluding those specified in the `exclude` parameter.
 */
export const getTestConnectionNames = ({
  exclude = [],
}: { exclude?: string[] } = {}) => {
  return ["mongodb", "postgres"].filter(
    (connectionName) => !exclude.includes(connectionName),
  );
};

/**
 * Runs the given function once for every test connection name, excluding any in the `exclude` array
 * @param fn The function to run for each test connection name
 * @example
 * await forEveryConnection(async connectionName => {
 *     console.log(`Running test for connection ${connectionName}`)
 * })
 */

export type ForEveryConnectionFn = (connectionName: string) => Promise<void>;
export type ForEveryConnectionOptions = {
  only?: string[];
  exclude?: string[];
};
export const forEveryConnection = async (
  fn: ForEveryConnectionFn,
  options: ForEveryConnectionOptions = {},
) => {
  const connectionNames = getTestConnectionNames(options);
  for (const connectionName of connectionNames) {
    if (options.only && !options.only.includes(connectionName)) continue;
    if (options.exclude && options.exclude.includes(connectionName)) continue;

    console.log("[forEveryConnection]: " + connectionName);
    await fn(connectionName);
  }
};

const testHelper = {
  testBootApp,
  runFreshMigrations,
  clearMigrations,
  getTestDbName,
  getTestConnectionNames,
  createAuthTables,
  dropAuthTables,
} as const;

export default testHelper;
