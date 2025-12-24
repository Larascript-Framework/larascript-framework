import {
  IModelAttributes,
  Model,
} from "@larascript-framework/larascript-database";

export interface SeederTestModelAttributes extends IModelAttributes {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SeederTestModel extends Model<SeederTestModelAttributes> {
  public table: string = "seeder_test";

  public fields: string[] = ["name", "createdAt", "updatedAt"];
}
