import { IValidatorAttributes } from "./IValidator.js";

export interface IValidatorResult<
  T extends IValidatorAttributes = IValidatorAttributes,
> {
  passes(): boolean;
  fails(): boolean;
  errors(): Record<string, string[]>;
  validated(): T;
  mergeErrors(errors: Record<string, string[]>): void;
  updatePasses(): void;
}
