import TestPeopleModel from "@/tests/larascript/eloquent/models/TestPeopleModel.js";
import { Repository } from "@larascript-framework/larascript-database";

export default class TestPeopleRepository extends Repository<TestPeopleModel> {
  constructor(connectionName?: string) {
    super(TestPeopleModel, connectionName);
  }

  /**
   * Finds one record with name equal to 'Jane'
   * @returns {Promise<IApiTokenModel | null>}
   */
  findOneJane() {
    return this.findOne({
      name: "Jane",
    });
  }
}
