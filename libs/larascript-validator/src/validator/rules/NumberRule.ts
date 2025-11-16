import AbstractRule from "../abstract/AbstractRule.js";
import { IRule } from "../interfaces/index.js";

class IsNumber extends AbstractRule implements IRule {
  protected name: string = "number";

  protected errorTemplate: string = "The :attribute field must be a number.";

  public async test(): Promise<boolean> {
    return typeof this.getAttributeData() === "number";
  }
}

export default IsNumber;
