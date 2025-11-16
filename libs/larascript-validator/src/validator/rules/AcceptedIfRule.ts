import AbstractRule from "../abstract/AbstractRule.js";
import { IRule, IRuleError } from "../interfaces/index.js";
import isTruthy from "../utils/isTruthy.js";

type AcceptedIfOptions = {
  anotherField: string;
  value: unknown;
};

class AcceptedIfRule extends AbstractRule<AcceptedIfOptions> implements IRule {
  protected name: string = "acceptedIf";

  protected errorTemplate: string =
    "The :attribute field must be accepted when :another is :value.";

  constructor(anotherField: string, value: unknown) {
    super({ anotherField, value });
  }

  public async test(): Promise<boolean> {
    const { anotherField, value: expectedValue } = this.options;

    const mainFieldValue = this.getAttributeData();
    const otherFieldValue = this.getAttributes()?.[anotherField];

    if (otherFieldValue !== expectedValue) {
      return true;
    }

    return isTruthy(mainFieldValue);
  }

  getError(): IRuleError {
    return {
      [this.getDotNotationPath()]: [
        this.formatErrorMessage({
          another: this.options.anotherField,
          value: this.options.value,
        }),
      ],
    };
  }
}

export default AcceptedIfRule;
