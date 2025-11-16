import AbstractRule from "../abstract/AbstractRule.js";
import { IRule } from "../interfaces/index.js";

class BooleanRule extends AbstractRule implements IRule {
  protected name: string = "boolean";

  protected errorTemplate: string = "The :attribute field must be a boolean.";

  public async test(): Promise<boolean> {
    return typeof this.getAttributeData() === "boolean";
  }
}

export default BooleanRule;
