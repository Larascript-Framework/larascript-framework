import { IValidatorAttributes, IValidatorResult } from "../interfaces/index.js";

/**
 * ValidatorResult class represents the outcome of a validation operation.
 * It holds information about whether the validation passed or failed,
 * the validated data, and any validation errors that occurred.
 *
 * @template T Type of the validated attributes extending IValidatorAttributes
 * @implements {IValidatorResult<T>}
 */
export class ValidatorResult<T extends IValidatorAttributes>
  implements IValidatorResult<T>
{
  constructor(
    /** Whether the validation passed */

    private _passes: boolean,

    /** The validated data if validation passed */

    private _validated: T | undefined = undefined,

    /** Object containing validation errors by field */

    private _errors: Record<string, string[]> | undefined = undefined,
  ) {}

  /**
   * Creates a ValidatorResult instance for successful validation
   * @template T Type of the validated attributes
   * @param {T} [validated] The validated data
   * @returns {IValidatorResult<T>} A successful validation result
   */
  public static passes<T extends IValidatorAttributes = IValidatorAttributes>(
    validated?: T,
  ): IValidatorResult<T> {
    return new ValidatorResult<T>(true, validated);
  }

  /**
   * Creates a ValidatorResult instance for failed validation
   * @template T Type of the validated attributes
   * @param {Record<string, string[]>} errors Validation errors by field
   * @param {T} [validated] The partially validated data
   * @returns {IValidatorResult<T>} A failed validation result
   */
  public static fails<T extends IValidatorAttributes = IValidatorAttributes>(
    errors: Record<string, string[]>,
    validated?: T,
  ): IValidatorResult<T> {
    return new ValidatorResult<T>(false, validated, errors);
  }

  /**
   * Checks if validation passed
   * @returns {boolean} True if validation passed, false otherwise
   */
  public passes(): boolean {
    return this._passes;
  }

  /**
   * Checks if validation failed
   * @returns {boolean} True if validation failed, false otherwise
   */
  public fails(): boolean {
    return !this._passes;
  }

  /**
   * Gets validation errors by field
   * @returns {Record<string, string[]>} Object containing validation errors
   */
  public errors(): Record<string, string[]> {
    return this._errors ?? {};
  }

  /**
   * Gets the validated data
   * @returns {T} The validated data
   */
  public validated(): T {
    return this._validated ?? ({} as T);
  }

  /**
   * Sets the errors for the validator
   * @param errors - The errors to set
   */
  public mergeErrors(errors: Record<string, string[]>): void {
    Object.keys(errors).forEach((key) => {
      if (!this._errors) {
        this._errors = {};
      }
      if (!this._errors[key]) {
        this._errors[key] = [];
      }
      this._errors[key] = [...(this._errors[key] ?? []), ...errors[key]];
    });
  }

  /**
   * Updates the passes property based on the errors
   */
  public updatePasses(): void {
    this._passes = Object.keys(this._errors ?? {}).length === 0;
  }
}

export default ValidatorResult;
