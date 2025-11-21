import AbstractRule from "../abstract/AbstractRule.js";
import { IRule, IRuleError } from "../interfaces/index.js";

export type ConstructorProps = {
  fn: (rule: IRule) => Promise<boolean>;
  errorTemplate?: string;
  replacer?: Record<string, unknown>;
};

class CustomRule extends AbstractRule implements IRule {
  protected name: string = "custom";

  protected errorTemplate: string = "The :attribute is invalid.";

  declare options: ConstructorProps;

  constructor(
    fn: ConstructorProps["fn"],
    options?: Omit<ConstructorProps, "fn">,
  ) {
    super();
    this.options = {
      fn,
      ...options,
    };
    this.errorTemplate = options?.errorTemplate ?? this.errorTemplate;
  }

  public async test(): Promise<boolean> {
    return await this.options.fn(this);
  }

  getError(): IRuleError {
    return {
      [this.getDotNotationPath()]: [
        this.formatErrorMessage(this.options.replacer, this.errorTemplate),
      ],
    };
  }
}

export default CustomRule;
