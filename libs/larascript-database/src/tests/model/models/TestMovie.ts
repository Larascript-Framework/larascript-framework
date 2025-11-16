import { IModelAttributes, Model } from "@/model/index.js";
import { BaseFactory } from "@larascript-framework/larascript-core";

class TestMovieFactory extends BaseFactory<TestMovieModel> {
  getDefinition(): TestMovieModel["attributes"] {
    return {
      authorId: this.faker.number.int({ min: 1, max: 100 }).toString(),
      name: this.faker.person.fullName(),
      yearReleased: this.faker.number.int({ min: 1900, max: 2000 }),
      createdAt: this.faker.date.past(),
      updatedAt: this.faker.date.recent(),
    };
  }
}

export default TestMovieFactory;

export interface TestMovieModelData extends IModelAttributes {
  authorId?: string;
  name?: string;
  yearReleased?: number;
}
export class TestMovieModel extends Model<TestMovieModelData> {
  protected factory = TestMovieFactory;

  public table: string = "tests";

  public fields: string[] = [
    "authorId",
    "name",
    "yearReleased",
    "createdAt",
    "updatedAt",
  ];
}
