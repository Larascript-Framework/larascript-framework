import { DB } from "@/database/index.js";
import { IModelAttributes, Model } from "@/model/index.js";
import { forEveryConnection } from "@/tests/tests-helper/forEveryConnection.js";
import { Observer } from "@larascript-framework/larascript-observer";
import { DataTypes } from "sequelize";

export interface TestObserverModelData extends IModelAttributes {
  number: number;
  name: string;
}

const tableName = "test_observer";

export const resetTestObserverTable = async () => {
  await forEveryConnection(async (connectionName) => {
    const schema = DB.getInstance().databaseService().schema(connectionName);

    if (await schema.tableExists(tableName)) {
      await schema.dropTable(tableName);
    }

    await schema.createTable(tableName, {
      number: DataTypes.INTEGER,
      name: DataTypes.STRING,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    });
  });
};

export interface TestObserverModelData extends IModelAttributes {
  number: number;
  name: string;
}

export class TestObserver extends Observer<TestObserverModelData> {
  async creating(data: TestObserverModelData): Promise<TestObserverModelData> {
    data.number = 1;
    return data;
  }

  onNameChange = (attributes: TestObserverModelData) => {
    attributes.name = "Bob";
    return attributes;
  };
}

export class TestObserverModel extends Model<TestObserverModelData> {
  constructor(data: TestObserverModelData | null = null) {
    super(data);
    this.setObserverConstructor(TestObserver);
    this.setObserveProperty("name", "onNameChange");
  }

  public table: string = tableName;

  public fields: string[] = ["name", "number", "createdAt", "updatedAt"];
}
