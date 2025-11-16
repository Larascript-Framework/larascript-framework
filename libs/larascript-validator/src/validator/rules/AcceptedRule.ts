import AbstractRule from "../abstract/AbstractRule.js";
import { IRule } from "../interfaces/index.js";
import isTruthy from "../utils/isTruthy.js";

class AcceptedRule extends AbstractRule implements IRule {
  protected name: string = "accepted";

  protected errorTemplate: string = "The :attribute field must be accepted.";

  public async test(): Promise<boolean> {
    return isTruthy(this.getAttributeData());
  }
}

export default AcceptedRule;
