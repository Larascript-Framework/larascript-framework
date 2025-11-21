import AbstractRule from "../abstract/AbstractRule.js";
import { IRule, IRuleError } from "../interfaces/index.js";

class DateRule extends AbstractRule implements IRule {
  protected name: string = "date";

  protected errorTemplate: string = "The :attribute must be a valid date.";

  public async test(): Promise<boolean> {
    if (this.nullableString()) return true;

    if (typeof this.getAttributeData() !== "string") {
      return false;
    }

    const date = new Date(this.getAttributeData() as string);
    return date instanceof Date && !isNaN(date.getTime());
  }

  getError(): IRuleError {
    return {
      [this.getDotNotationPath()]: [this.formatErrorMessage()],
    };
  }
}

export default DateRule;
