import AbstractRule from "../abstract/AbstractRule.js";
import { IRule, IRuleError } from "../interfaces/index.js";

class JsonRule extends AbstractRule implements IRule {
  protected name: string = "json";

  protected errorTemplate: string =
    "The :attribute must be a valid JSON string.";

  public async test(): Promise<boolean> {
    if (typeof this.getAttributeData() !== "string") {
      return false;
    }

    try {
      JSON.parse(this.getAttributeData() as string);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return false;
    }

    return true;
  }

  getError(): IRuleError {
    return {
      [this.getDotNotationPath()]: [this.formatErrorMessage()],
    };
  }
}

export default JsonRule;
