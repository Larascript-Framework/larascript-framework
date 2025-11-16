import AbstractRule from "../abstract/AbstractRule.js";
import { IRule } from "../interfaces/index.js";

class ArrayRule extends AbstractRule implements IRule {
  protected name: string = "array";

  protected errorTemplate: string = "The :attribute field must be an array.";

  public async test(): Promise<boolean> {
    return Array.isArray(this.getAttributeData());
  }
}

export default ArrayRule;
