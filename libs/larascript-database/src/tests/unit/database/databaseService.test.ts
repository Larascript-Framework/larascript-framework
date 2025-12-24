import DatabaseConnectionException from "@/database/exceptions/DatabaseConnectionException.js";
import { IDatabaseConfig } from "@/database/index.js";
import DatabaseConfig from "@/database/services/DatabaseConfig.js";
import DatabaseService from "@/database/services/DatabaseService.js";
import { beforeEach, describe, expect, test } from "@jest/globals";
import {
  MockMongoDBAdapter,
  MockPostgresAdapter,
  MockSQLAdapter,
  MockSQLConfig,
} from "./mocks/MockSQLAdapter.js";

describe("Database Service", () => {
  const DEFAULT_CONNECTION = "sql";
  let databaseService: DatabaseService;
  const defaultConfig: IDatabaseConfig = {
    defaultConnectionName: DEFAULT_CONNECTION,
    keepAliveConnections: "",
    connections: [
      DatabaseConfig.connection(MockSQLAdapter, "sql", MockSQLConfig),
    ],
  };

  beforeEach(() => {
    databaseService = new DatabaseService(defaultConfig);
  });

  describe("getConfig", () => {
    test("should return the config", () => {
      const config = databaseService.getConfig();

      expect(config).toBeDefined();
      expect(config.defaultConnectionName).toBe(DEFAULT_CONNECTION);
      expect(config.keepAliveConnections).toBe("");
    });
  });

  describe("connectionConfig", () => {
    test("should add a connection", () => {
      databaseService.register();

      expect(databaseService.getConnectionConfig("sql")).toBeDefined();
      expect(databaseService.getConnectionConfig("sql").connectionString).toBe(
        "sql://user:pass@localhost:3306/db",
      );
      expect(databaseService.getAdapter("sql")).toBeInstanceOf(MockSQLAdapter);
    });

    test("should throw error if multiple conncetion names detected", async () => {
      const config: IDatabaseConfig = {
        defaultConnectionName: "sql-1",
        keepAliveConnections: "",
        connections: [
          DatabaseConfig.connection(MockSQLAdapter, "sql-1", MockSQLConfig),
          DatabaseConfig.connection(MockSQLAdapter, "sql-1", MockSQLConfig),
        ],
      };

      databaseService = new DatabaseService(config);

      expect(() => databaseService.register()).toThrow(
        "Connection 'sql-1' already defined",
      );
    });

    test("should create multiple connections with the same adapter", async () => {
      const config: IDatabaseConfig = {
        defaultConnectionName: "sql-1",
        keepAliveConnections: "",
        connections: [
          DatabaseConfig.connection(MockSQLAdapter, "sql-1", MockSQLConfig),
          DatabaseConfig.connection(MockSQLAdapter, "sql-2", {
            connectionString: "sql://user:pass@localhost:3307/db",
          }),
        ],
      };

      databaseService = new DatabaseService(config);
      databaseService.register();

      expect(databaseService.getAdapter("sql-1")).toBeInstanceOf(
        MockSQLAdapter,
      );
      expect(
        databaseService.getAdapter<MockSQLAdapter>("sql-1").getConfig()
          .connectionString,
      ).toBe(MockSQLConfig.connectionString);
      expect(databaseService.getAdapter("sql-2")).toBeInstanceOf(
        MockSQLAdapter,
      );
      expect(
        databaseService.getAdapter<MockSQLAdapter>("sql-2").getConfig()
          .connectionString,
      ).toBe("sql://user:pass@localhost:3307/db");
    });

    test("should return default connection", () => {
      expect(databaseService.getDefaultConnectionName()).toBe(
        DEFAULT_CONNECTION,
      );
    });

    test("should override connection name and return override value", () => {
      databaseService.setDefaultConnectionName("change");

      expect(databaseService.getDefaultConnectionName()).toBe("change");
    });
  });

  describe("adapters", () => {
    test("should return expected adapter", () => {
      databaseService.addConnection(
        DEFAULT_CONNECTION,
        MockSQLAdapter,
        MockSQLConfig,
      );

      const adapter = databaseService.getAdapter(DEFAULT_CONNECTION);

      expect(adapter).toBeInstanceOf(MockSQLAdapter);
    });

    test("should throw an error for adapter that doesn't exist", () => {
      databaseService.addConnection(
        DEFAULT_CONNECTION,
        MockSQLAdapter,
        MockSQLConfig,
      );

      expect(() => databaseService.getAdapter("bad-adapter")).toThrow(
        "Adapter not found: bad-adapter",
      );
    });

    test("should return true if an adapter is registered", () => {
      databaseService.register();

      expect(databaseService.isRegisteredAdapter(MockSQLAdapter)).toBeTruthy();
    });
  });

  describe("boot", () => {
    test("should fail when no connection is added", async () => {
      await expect(databaseService.boot()).rejects.toThrow(
        DatabaseConnectionException,
      );
    });

    test("should connect to the default connection", async () => {
      databaseService.addConnection(DEFAULT_CONNECTION, MockSQLAdapter, {
        connectionString: "sql://user:pass@localhost:3306/db",
      });

      jest
        .spyOn(databaseService, "connectDefault")
        .mockImplementation(() => Promise.resolve());

      await databaseService.boot();

      expect(databaseService.connectDefault).toHaveBeenCalled();
    });

    test("should not connect to the default connection if onBootConnect is false", async () => {
      const databaseService = new DatabaseService({
        ...defaultConfig,
        onBootConnect: false,
      });

      jest
        .spyOn(databaseService, "connectDefault")
        .mockImplementation(() => Promise.resolve());

      await databaseService.boot();

      expect(databaseService.connectDefault).not.toHaveBeenCalled();
    });

    test("should connect keep alive with other connections defined", async () => {
      const databaseService = new DatabaseService({
        ...defaultConfig,
        keepAliveConnections: "other",
      });

      jest
        .spyOn(databaseService, "connectDefault")
        .mockImplementation(() => Promise.resolve());
      jest
        .spyOn(databaseService, "connectAdapter")
        .mockImplementation(() => Promise.resolve());

      await databaseService.boot();

      expect(databaseService.connectAdapter).toHaveBeenCalledWith("other");
    });

    test("should throw an error on connect keep alive with missing connection", async () => {
      const databaseService = new DatabaseService({
        ...defaultConfig,
        keepAliveConnections: "other",
      });

      jest
        .spyOn(databaseService, "connectDefault")
        .mockImplementation(() => Promise.resolve());

      await expect(databaseService.boot()).rejects.toThrow(
        DatabaseConnectionException,
      );
    });
  });

  describe("setDependencyLoader", () => {
    test("should set logger dependency", () => {
      const mockLogger = { info: jest.fn() };
      const mockLoader = jest.fn().mockReturnValue(mockLogger);

      databaseService.setDependencyLoader(mockLoader);

      expect(mockLoader).toHaveBeenCalledWith("logger");
    });
  });

  describe("connectDefault", () => {
    test("should connect to default connection successfully", async () => {
      databaseService.addConnection(
        DEFAULT_CONNECTION,
        MockSQLAdapter,
        MockSQLConfig,
      );
      const connectSpy = jest.spyOn(
        databaseService.getAdapter(DEFAULT_CONNECTION),
        "connectDefault",
      );

      await databaseService.connectDefault();

      expect(connectSpy).toHaveBeenCalled();
    });

    test("should throw error when default connection not found", async () => {
      await expect(databaseService.connectDefault()).rejects.toThrow(
        DatabaseConnectionException,
      );
    });
  });

  describe("connectKeepAlive", () => {
    test("should connect to multiple keep alive connections", async () => {
      const config: IDatabaseConfig = {
        defaultConnectionName: "sql-1",
        keepAliveConnections: "sql-2,sql-3",
        connections: [
          DatabaseConfig.connection(MockSQLAdapter, "sql-1", MockSQLConfig),
          DatabaseConfig.connection(MockSQLAdapter, "sql-2", MockSQLConfig),
          DatabaseConfig.connection(MockSQLAdapter, "sql-3", MockSQLConfig),
        ],
      };

      databaseService = new DatabaseService(config);
      databaseService.register();

      const connectSpy = jest.spyOn(databaseService, "connectAdapter");

      await databaseService.connectKeepAlive();

      expect(connectSpy).toHaveBeenCalledWith("sql-2");
      expect(connectSpy).toHaveBeenCalledWith("sql-3");
    });

    test("should skip empty connection names", async () => {
      const config: IDatabaseConfig = {
        defaultConnectionName: "sql-1",
        keepAliveConnections: "sql-2,,sql-3",
        connections: [
          DatabaseConfig.connection(MockSQLAdapter, "sql-1", MockSQLConfig),
          DatabaseConfig.connection(MockSQLAdapter, "sql-2", MockSQLConfig),
          DatabaseConfig.connection(MockSQLAdapter, "sql-3", MockSQLConfig),
        ],
      };

      databaseService = new DatabaseService(config);
      databaseService.register();

      const connectSpy = jest.spyOn(databaseService, "connectAdapter");

      await databaseService.connectKeepAlive();

      expect(connectSpy).toHaveBeenCalledWith("sql-2");
      expect(connectSpy).toHaveBeenCalledWith("sql-3");
      expect(connectSpy).toHaveBeenCalledTimes(2);
    });

    test("should skip default connection in keep alive", async () => {
      const config: IDatabaseConfig = {
        defaultConnectionName: "sql-1",
        keepAliveConnections: "sql-1,sql-2",
        connections: [
          DatabaseConfig.connection(MockSQLAdapter, "sql-1", MockSQLConfig),
          DatabaseConfig.connection(MockSQLAdapter, "sql-2", MockSQLConfig),
        ],
      };

      databaseService = new DatabaseService(config);
      databaseService.register();

      const connectSpy = jest.spyOn(databaseService, "connectAdapter");

      await databaseService.connectKeepAlive();

      expect(connectSpy).toHaveBeenCalledWith("sql-2");
      expect(connectSpy).not.toHaveBeenCalledWith("sql-1");
    });
  });

  describe("connectAdapter", () => {
    test("should connect to specific adapter", async () => {
      databaseService.addConnection(
        DEFAULT_CONNECTION,
        MockSQLAdapter,
        MockSQLConfig,
      );
      const connectSpy = jest.spyOn(
        databaseService.getAdapter(DEFAULT_CONNECTION),
        "connectDefault",
      );

      await databaseService.connectAdapter(DEFAULT_CONNECTION);

      expect(connectSpy).toHaveBeenCalled();
    });

    test("should throw error when adapter not found", async () => {
      await expect(
        databaseService.connectAdapter("non-existent"),
      ).rejects.toThrow(DatabaseConnectionException);
    });

    test("should use default connection when no connection name provided", async () => {
      databaseService.addConnection(
        DEFAULT_CONNECTION,
        MockSQLAdapter,
        MockSQLConfig,
      );
      const connectSpy = jest.spyOn(
        databaseService.getAdapter(DEFAULT_CONNECTION),
        "connectDefault",
      );

      await databaseService.connectAdapter();

      expect(connectSpy).toHaveBeenCalled();
    });
  });

  describe("getAdapterConstructor", () => {
    test("should return adapter constructor", () => {
      databaseService.addConnection(
        DEFAULT_CONNECTION,
        MockSQLAdapter,
        MockSQLConfig,
      );

      const constructor =
        databaseService.getAdapterConstructor(DEFAULT_CONNECTION);

      expect(constructor).toBe(MockSQLAdapter);
    });

    test("should throw error when connection not found", () => {
      expect(() =>
        databaseService.getAdapterConstructor("non-existent"),
      ).toThrow("Connection not found: non-existent");
    });

    test("should use default connection when no connection name provided", () => {
      databaseService.addConnection(
        DEFAULT_CONNECTION,
        MockSQLAdapter,
        MockSQLConfig,
      );

      const constructor = databaseService.getAdapterConstructor();

      expect(constructor).toBe(MockSQLAdapter);
    });
  });

  describe("getAllAdapterConstructors", () => {
    test("should return all unique adapter constructors", () => {
      const config: IDatabaseConfig = {
        defaultConnectionName: "sql-1",
        keepAliveConnections: "",
        connections: [
          DatabaseConfig.connection(MockSQLAdapter, "sql-1", MockSQLConfig),
          DatabaseConfig.connection(MockSQLAdapter, "sql-2", MockSQLConfig),
        ],
      };

      databaseService = new DatabaseService(config);
      databaseService.register();

      const constructors = databaseService.getAllAdapterConstructors();

      expect(constructors).toHaveLength(1);
      expect(constructors[0]).toBe(MockSQLAdapter);
    });

    test("should return multiple different adapter constructors", () => {
      const config: IDatabaseConfig = {
        defaultConnectionName: "sql-1",
        keepAliveConnections: "",
        connections: [
          DatabaseConfig.connection(MockSQLAdapter, "sql-1", MockSQLConfig),
          DatabaseConfig.connection(MockMongoDBAdapter, "mongo-1", {
            uri: "mongodb://localhost:27017/test",
          }),
        ],
      };

      databaseService = new DatabaseService(config);
      databaseService.register();

      const constructors = databaseService.getAllAdapterConstructors();

      expect(constructors).toHaveLength(2);
      expect(constructors).toContain(MockSQLAdapter);
      expect(constructors).toContain(MockMongoDBAdapter);
    });
  });

  describe("getDefaultCredentials", () => {
    test("should return default credentials for adapter", () => {
      databaseService.addConnection(
        DEFAULT_CONNECTION,
        MockSQLAdapter,
        MockSQLConfig,
      );

      const credentials =
        databaseService.getDefaultCredentials(DEFAULT_CONNECTION);

      expect(credentials).toBe("sql://user:pass@localhost:3306/db");
    });

    test("should return null when adapter not found", () => {
      expect(() =>
        databaseService.getDefaultCredentials("non-existent"),
      ).toThrow("Connection not found: non-existent");
    });
  });

  describe("schema", () => {
    test("should return schema from adapter", () => {
      databaseService.addConnection(
        DEFAULT_CONNECTION,
        MockSQLAdapter,
        MockSQLConfig,
      );

      const schema = databaseService.schema(DEFAULT_CONNECTION);

      expect(schema).toBeDefined();
      expect(schema.createDatabase).toBeDefined();
      expect(schema.tableExists).toBeDefined();
    });

    test("should use default connection when no connection name provided", () => {
      databaseService.addConnection(
        DEFAULT_CONNECTION,
        MockSQLAdapter,
        MockSQLConfig,
      );

      const schema = databaseService.schema();

      expect(schema).toBeDefined();
    });

    test("should throw error when adapter not found", () => {
      expect(() => databaseService.schema("non-existent")).toThrow(
        "Adapter not found: non-existent",
      );
    });
  });

  describe("createMigrationSchema", () => {
    test("should create migration schema", async () => {
      databaseService.addConnection(
        DEFAULT_CONNECTION,
        MockSQLAdapter,
        MockSQLConfig,
      );
      const createSchemaSpy = jest.spyOn(
        databaseService.getAdapter(DEFAULT_CONNECTION),
        "createMigrationSchema",
      );

      await databaseService.createMigrationSchema("migrations");

      expect(createSchemaSpy).toHaveBeenCalledWith("migrations");
    });

    test("should use default connection when no connection name provided", async () => {
      databaseService.addConnection(
        DEFAULT_CONNECTION,
        MockSQLAdapter,
        MockSQLConfig,
      );
      const createSchemaSpy = jest.spyOn(
        databaseService.getAdapter(DEFAULT_CONNECTION),
        "createMigrationSchema",
      );

      await databaseService.createMigrationSchema("migrations");

      expect(createSchemaSpy).toHaveBeenCalledWith("migrations");
    });

    test("should throw error when adapter not found", async () => {
      await expect(
        databaseService.createMigrationSchema("migrations", "non-existent"),
      ).rejects.toThrow("Adapter not found: non-existent");
    });
  });

  describe("showLogs", () => {
    test("should return true when enableLogging is true", () => {
      const config: IDatabaseConfig = {
        ...defaultConfig,
        enableLogging: true,
      };
      databaseService = new DatabaseService(config);

      expect(databaseService.showLogs()).toBe(true);
    });

    test("should return false when enableLogging is false", () => {
      const config: IDatabaseConfig = {
        ...defaultConfig,
        enableLogging: false,
      };
      databaseService = new DatabaseService(config);

      expect(databaseService.showLogs()).toBe(false);
    });

    test("should return false when enableLogging is undefined", () => {
      expect(databaseService.showLogs()).toBe(false);
    });
  });

  describe("isRegisteredAdapter", () => {
    test("should return false when no adapters are registered", () => {
      expect(databaseService.isRegisteredAdapter(MockSQLAdapter)).toBe(false);
    });

    test("should return true when adapter is registered with different connection name", () => {
      databaseService.addConnection(
        "different-connection",
        MockSQLAdapter,
        MockSQLConfig,
      );

      expect(databaseService.isRegisteredAdapter(MockSQLAdapter)).toBe(true);
    });

    test("should return false when adapter type is not registered", () => {
      databaseService.addConnection(
        DEFAULT_CONNECTION,
        MockSQLAdapter,
        MockSQLConfig,
      );

      expect(databaseService.isRegisteredAdapter(MockMongoDBAdapter)).toBe(
        false,
      );
    });
  });

  describe("postgres", () => {
    test("should return postgres adapter by default connection name", () => {
      const databaseService = new DatabaseService({
        ...defaultConfig,
        defaultConnectionName: "postgres-1",
        connections: [
          DatabaseConfig.connection(MockPostgresAdapter, "postgres-1", {
            uri: "postgres://user:pass@localhost:5432/db",
          }),
        ],
      });
      databaseService.register();

      const postgres = databaseService.postgres();

      expect(postgres._adapter_type_).toBe("postgres");
    });

    test("should return postgres adapter by connection name", () => {
      const databaseService = new DatabaseService({
        ...defaultConfig,
        defaultConnectionName: "postgres-1",
        connections: [
          DatabaseConfig.connection(MockPostgresAdapter, "postgres-1", {
            uri: "postgres://user:pass@localhost:5433/db",
          }),
          DatabaseConfig.connection(MockPostgresAdapter, "postgres-2", {
            uri: "postgres://user:pass@localhost:5432/db",
          }),
        ],
      });
      databaseService.register();

      const postgres = databaseService.postgres("postgres-2");

      expect(postgres._adapter_type_).toBe("postgres");
      expect(postgres.getConfig().uri).toBe(
        "postgres://user:pass@localhost:5432/db",
      );
    });

    test("should throw error when adapter is not a postgres adapter", () => {
      databaseService.register();

      expect(() => databaseService.postgres()).toThrow(
        "Adapter is not a PostgresAdapter: sql",
      );
    });

    test("should return mongodb adapter by connection name", () => {
      const databaseService = new DatabaseService({
        ...defaultConfig,
        defaultConnectionName: "mongodb-1",
        connections: [
          DatabaseConfig.connection(MockMongoDBAdapter, "mongodb-1", {
            uri: "mongodb://user:pass@localhost:27017/db",
          }),
          DatabaseConfig.connection(MockMongoDBAdapter, "mongodb-2", {
            uri: "mongodb://user:pass@localhost:27018/db",
          }),
        ],
      });
      databaseService.register();

      const mongodb = databaseService.mongodb("mongodb-2");

      expect(mongodb._adapter_type_).toBe("mongodb");
      expect(mongodb.getConfig().uri).toBe(
        "mongodb://user:pass@localhost:27018/db",
      );
    });

    test("should throw error when adapter is not a mongodb adapter", () => {
      databaseService.register();

      expect(() => databaseService.mongodb()).toThrow(
        "Adapter is not a MongoDBAdapter: sql",
      );
    });
  });
});
