import AbstractRule from "../abstract/AbstractRule.js";
import { IRule, IRuleError } from "../interfaces/index.js";

type TSizeOptions = {
  size: number;
};

class SizeRule extends AbstractRule<TSizeOptions> implements IRule {
  protected name: string = "size";

  protected errorTemplate: string = "";

  protected errorTemplateNumber = "The :attribute field must be :size.";

  protected errorTemplateString =
    "The :attribute field must be :size characters.";

  protected errorTemplateArray =
    "The :attribute field must contain :size items.";

  constructor(size: TSizeOptions["size"]) {
    super({ size });
  }

  public async test(): Promise<boolean> {
    this.errorTemplate = this.defaultError;

    if (this.dataUndefinedOrNull()) return false;

    if (!this.testNumber()) return false;
    if (!this.testString()) return false;
    if (!this.testArray()) return false;

    return true;
  }

  protected testNumber(): boolean {
    if (typeof this.getAttributeData() === "number") {
      if ((this.getAttributeData() as number) !== this.options.size) {
        this.errorTemplate = this.errorTemplateNumber;
        return false;
      }
    }
    return true;
  }

  protected testString(): boolean {
    if (typeof this.getAttributeData() === "string") {
      if ((this.getAttributeData() as string).length !== this.options.size) {
        this.errorTemplate = this.errorTemplateString;
        return false;
      }
    }
    return true;
  }

  protected testArray(): boolean {
    if (Array.isArray(this.getAttributeData())) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((this.getAttributeData() as any[]).length !== this.options.size) {
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
          size: this.options.size,
        }),
      ],
    };
  }
}

export default SizeRule;
