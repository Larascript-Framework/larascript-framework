import AbstractRule from "../abstract/AbstractRule.js";
import { IRule } from "../interfaces/index.js";

class NullableRule extends AbstractRule implements IRule {
  protected name: string = "nullable";

  protected errorTemplate: string = "";

  public async test(): Promise<boolean> {
    return true;
  }
}

export default NullableRule;
