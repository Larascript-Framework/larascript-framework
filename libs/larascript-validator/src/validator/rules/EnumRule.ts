import AbstractRule from "../abstract/AbstractRule.js";
import { IRule, IRuleError } from "../interfaces/index.js";

type Options = {
  values: (string | number)[];
  caseInsensitive?: boolean;
};

class EnumRule extends AbstractRule implements IRule {
  protected name: string = "enum";

  protected errorTemplate: string =
    "The :attribute contains an unexpected value. Must be one of :values";

  protected options: Options = {
    values: [],
    caseInsensitive: false,
  };

  constructor(options: Options) {
    super();
    this.options = options;
  }

  public async test(): Promise<boolean> {
    if (this.nullableString()) return true;
    if (this.dataUndefinedOrNull()) return false;

    const value = this.getAttributeData();
    const optionsWithDefaults: Options = {
      caseInsensitive: false,
      ...this.options,
    };
    const invalidType =
      typeof value !== "string" &&
      typeof value !== "number" &&
      !Array.isArray(value);

    if (invalidType) {
      return false;
    }

    if (typeof value === "string" || typeof value === "number") {
      return this.testStringOrNumber(value, optionsWithDefaults);
    }

    if (typeof value === "object" && Array.isArray(value)) {
      return this.testArray(value, optionsWithDefaults);
    }

    return false;
  }

  protected testStringOrNumber(
    value: string | number,
    optionsWithDefaults: Options,
  ): boolean {
    if (optionsWithDefaults.caseInsensitive) {
      const lowercaseValues = this.options.values.map((val) => {
        if (typeof val === "string") {
          return val.toLowerCase();
        }
        return val;
      });
      return lowercaseValues.some((val) => {
        if (typeof value === "string") {
          return val === value.toLocaleLowerCase();
        }
        return val === value;
      });
    }

    return this.options.values.includes(value);
  }

  protected testArray(
    value: (string | number)[],
    optionsWithDefaults: Options,
  ): boolean {
    return value.every((val) =>
      this.testStringOrNumber(val, optionsWithDefaults),
    );
  }

  getError(): IRuleError {
    return {
      [this.getDotNotationPath()]: [
        this.formatErrorMessage({
          values: this.options.values.join(", "),
        }),
      ],
    };
  }
}

export default EnumRule;
