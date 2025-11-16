import { beforeEach, describe, test } from "@jest/globals";
import { ICryptoService } from "@larascript-framework/crypto-js";
import { ConsoleService } from "@larascript-framework/larascript-console";
import { LoggerService } from "@larascript-framework/larascript-logger";
import path from "path";
import { IDatabaseService } from "../database/index.js";
import DB from "../database/services/DB.js";
import { IEloquent, IEloquentQueryBuilderService } from "../eloquent/index.js";
import {
  IModel,
  IModelAttributes,
  ModelConstructor,
} from "../model/index.js";

describe("Example Test Suite", () => {
  let mockModel: ModelConstructor<IModel<IModelAttributes>>;

  describe("DB", () => {
    beforeEach(() => {
      mockModel = jest.fn().mockImplementation((...args: any[]) => {
        return {} as unknown as ModelConstructor<IModel<IModelAttributes>>;
      }) as unknown as ModelConstructor<IModel<IModelAttributes>>;

      const databaseServiceMock = jest
        .fn()
        .mockImplementation((...args: any[]) => {
          return {} as unknown as IDatabaseService;
        });

      const cryptoServiceMock = jest
        .fn()
        .mockImplementation((...args: any[]) => {
          return {} as unknown as ICryptoService;
        });

      const eloquentQueryBuilderMock = jest
        .fn()
        .mockImplementation((...args: any[]) => {
          return {
            builder: jest.fn().mockImplementation((...args: any[]) => {
              return {} as unknown as IEloquent;
            }),
          } as unknown as IEloquentQueryBuilderService;
        });

      const logger = new LoggerService({
        logPath: path.join(process.cwd(), "storage/logs"),
      });

      DB.init({
        databaseService: databaseServiceMock(),
        eloquentQueryBuilder: eloquentQueryBuilderMock(),
        cryptoService: cryptoServiceMock(),
        dispatcher: () => Promise.resolve(),
        logger: logger,
        console: new ConsoleService(),
      });
    });

    test("init", () => {
      expect(DB.getInstance().databaseService()).toBeDefined();
      expect(DB.getInstance().queryBuilder(mockModel, "test")).toBeDefined();
      expect(DB.getInstance().cryptoService()).toBeDefined();
      expect(DB.getInstance().dispatcher()).toBeDefined();
      expect(DB.getInstance().logger()).toBeDefined();
    });
  });
});
