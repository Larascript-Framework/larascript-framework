import AbstractRule from "../abstract/AbstractRule.js";
import { IRule, IRuleError } from "../interfaces/index.js";

class EmailRule extends AbstractRule<object> implements IRule {
  protected name: string = "email";

  protected errorTemplate: string =
    "The :attribute field must be a valid email address.";

  // RFC 5322 compliant email regex
  private emailRegex: RegExp =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  public async test(): Promise<boolean> {
    if (typeof this.getAttributeData() !== "string") {
      return false;
    }

    return this.emailRegex.test(this.getAttributeData() as string);
  }

  getError(): IRuleError {
    return {
      [this.getDotNotationPath()]: [this.formatErrorMessage({})],
    };
  }
}

export default EmailRule;
