import AbstractRule from "../abstract/AbstractRule.js";
import { IRule, IRuleError } from "../interfaces/index.js";

class NumericRule extends AbstractRule<object> implements IRule {
  protected name: string = "numeric";

  protected errorTemplate: string = "The :attribute field must be numeric.";

  public async test(): Promise<boolean> {
    if (this.dataUndefinedOrNull()) return false;

    // Allow both numbers and numeric strings
    if (typeof this.getAttributeData() === "number") {
      return !isNaN(this.getAttributeData() as number);
    }

    if (typeof this.getAttributeData() === "string") {
      // Check if string is numeric (including decimals and negative numbers)
      return /^-?\d*\.?\d+$/.test(this.getAttributeData() as string);
    }

    return false;
  }

  getError(): IRuleError {
    return {
      [this.getDotNotationPath()]: [this.formatErrorMessage({})],
    };
  }
}

export default NumericRule;
