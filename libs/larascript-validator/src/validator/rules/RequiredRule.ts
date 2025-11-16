import AbstractRule from "../abstract/AbstractRule.js";
import { IRule } from "../interfaces/index.js";

class RequiredRule extends AbstractRule implements IRule {
  protected name: string = "required";

  protected errorTemplate: string = "The :attribute field is required.";

  public async test(): Promise<boolean> {
    if (this.dataUndefinedOrNull()) return false;

    if (typeof this.getAttributeData() === "string") {
      return this.getAttributeData() !== "";
    }

    if (Array.isArray(this.getAttributeData())) {
      return (this.getAttributeData() as unknown[]).length > 0;
    }

    if (typeof this.getAttributeData() === "object") {
      return (
        Object.keys(this.getAttributeData() as Record<string, unknown>).length >
        0
      );
    }

    return true;
  }
}

export default RequiredRule;
