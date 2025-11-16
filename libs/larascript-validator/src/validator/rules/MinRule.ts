import AbstractRule from "../abstract/AbstractRule.js";
import { IRule, IRuleError } from "../interfaces/index.js";

type TMinOptions = {
  min: number;
};

class MinRule extends AbstractRule<TMinOptions> implements IRule {
  protected name: string = "min";

  protected errorTemplate: string = "";

  protected errorTemplateNumber = "The :attribute field must be at least :min.";

  protected errorTemplateString =
    "The :attribute field must be at least :min characters.";

  protected errorTemplateArray =
    "The :attribute field must have at least :min items.";

  constructor(min: TMinOptions["min"]) {
    super({ min });
  }

  public async test(): Promise<boolean> {
    this.errorTemplate = this.errorTemplateNumber;

    if (this.nullableAndEmptyString()) return true;
    if (this.dataUndefinedOrNull()) return false;
    if (!this.testNumber()) return false;
    if (!this.testString()) return false;
    if (!this.testArray()) return false;

    return true;
  }

  protected nullableAndEmptyString() {
    const data = (
      typeof this.getAttributeData() === "string" ? this.getAttributeData() : ""
    ) as string;
    return this.otherRuleNames.includes("nullable") && data.length === 0;
  }

  protected testNumber(): boolean {
    if (typeof this.getAttributeData() === "number") {
      if ((this.getAttributeData() as number) < this.options.min) {
        this.errorTemplate = this.errorTemplateNumber;
        return false;
      }
    }
    return true;
  }

  protected testString(): boolean {
    if (typeof this.getAttributeData() === "string") {
      if ((this.getAttributeData() as string).length < this.options.min) {
        this.errorTemplate = this.errorTemplateString;
        return false;
      }
    }
    return true;
  }

  protected testArray(): boolean {
    if (Array.isArray(this.getAttributeData())) {
      if ((this.getAttributeData() as unknown[]).length < this.options.min) {
        this.errorTemplate = this.errorTemplateArray;
        return false;
      }
    }
    return true;
  }

  getError(): IRuleError {
    return {
      [this.getDotNotationPath()]: [
        this.formatErrorMessage({
          min: this.options.min,
        }),
      ],
    };
  }
}

export default MinRule;
