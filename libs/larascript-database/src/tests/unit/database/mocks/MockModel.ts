import Model from "@/model/base/Model.js";
import { IModelAttributes } from "@larascript-framework/contracts/database/model";

export interface MockModelAttributes extends IModelAttributes {
  id: string;
  name: string;
}

export class MockModel extends Model<MockModelAttributes> {
  constructor(data: MockModelAttributes | null = null) {
    super(data);
  }
}

export default MockModel;
