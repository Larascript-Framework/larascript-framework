import AbstractRule from "../abstract/AbstractRule.js";
import { IRule, IRuleError } from "../interfaces/index.js";

type TRegexOptions = {
  pattern: RegExp;
};

class RegexRule extends AbstractRule<TRegexOptions> implements IRule {
  protected name: string = "regex";

  protected errorTemplate: string = "The :attribute field format is invalid.";

  constructor(pattern: string | RegExp) {
    super({
      pattern: pattern instanceof RegExp ? pattern : new RegExp(pattern),
    });
  }

  public async test(): Promise<boolean> {
    if (this.dataUndefinedOrNull()) return false;
    if (this.nullableString()) return true;

    const value = String(this.getAttributeData());
    return this.options.pattern.test(value);
  }

  getError(): IRuleError {
    return {
      [this.getDotNotationPath()]: [this.formatErrorMessage()],
    };
  }
}

export default RegexRule;
