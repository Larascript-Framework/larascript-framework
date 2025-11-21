import { ValidatorResult } from "../data/index.js";
import { ValidatorException } from "../exceptions/index.js";
import {
  IRuleContext,
  IRulesObject,
  IValidator,
  IValidatorAttributes,
  IValidatorMessages,
  IValidatorResult,
} from "../interfaces/index.js";
import { Validator } from "../service/index.js";

/**
 * Abstract base class for creating custom validators with type-safe validation rules and error messages.
 * Extend this class to create specific validators for different data structures.
 *
 * @template Attributes - Interface describing the shape of validated data
 */
export abstract class BaseCustomValidator<
  Attributes extends IValidatorAttributes = IValidatorAttributes,
> implements IValidator
{
  protected abstract rules: IRulesObject;

  protected messages: IValidatorMessages = {};

  protected result!: IValidatorResult<Attributes>;

  protected ruleContextCallback?: IRuleContext;

  setRuleContext(callback?: IRuleContext): void {
    this.ruleContextCallback = callback;
  }

  /**
   * Validates the provided data against the defined rules.
   *
   * @param data - Object containing the data to validate
   * @returns Promise resolving to validation result
   * @throws Error if validation fails unexpectedly
   */
  public async validate(
    data: Attributes,
    validator?: Validator,
  ): Promise<IValidatorResult<Attributes>> {
    // Reset the result
    this.result = ValidatorResult.fails({});

    // Validate the data
    if (typeof validator === "undefined") {
      validator = Validator.make(this.rules, this.messages) as Validator;
    }

    // Apply additional rule context callback
    validator.setRuleContext(this.ruleContextCallback);

    const validatorResult = (await validator.validate(
      data,
    )) as IValidatorResult<Attributes>;

    // Run the custom validation
    const customPassed = await this.customValidation(data);

    // If the custom validation failed, add the errors to the result
    if (!customPassed) {
      validatorResult.mergeErrors({ ...this.result.errors() });
      validatorResult.updatePasses();
    }

    // If the validation passed, return the result
    if (Object.keys(validatorResult.errors()).length === 0) {
      return ValidatorResult.passes(data);
    }

    // Did not pass
    return validatorResult;
  }

  /**
   * Custom validation method to be implemented by subclasses.
   *
   * @param data - Object containing the data to validate
   * @returns Promise resolving to boolean indicating validation result
   */

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async customValidation(data: Attributes): Promise<boolean> {
    return true;
  }

  /**
   * Sets the errors for the validator
   * @param errors - The errors to set
   */
  public addErrors(errors: Record<string, string[]>): void {
    this.result.mergeErrors(errors);
  }

  /**
   * Checks if the validation passed.
   *
   * @returns true if validation passed, false otherwise
   * @throws Error if validate() hasn't been called yet
   */
  public passes(): boolean {
    if (!this.result) {
      throw new ValidatorException("Validator has not been validated yet");
    }

    return this.result.passes();
  }

  /**
   * Returns validation error messages if validation failed.
   *
   * @returns Object with field names as keys and array of error messages as values
   * @throws Error if validate() hasn't been called yet
   */
  public errors(): Record<string, string[]> {
    if (!this.result) {
      throw new ValidatorException("Validator has not been validated yet");
    }

    return this.result.errors();
  }

  /**
   * Returns the validated data with proper typing.
   * Only call this method if validation passed.
   *
   * @returns Object containing the validated data with proper types
   * @throws Error if validate() hasn't been called yet
   */
  public validated(): Attributes {
    if (!this.result) {
      throw new ValidatorException("Validator has not been validated yet");
    }

    return this.result.validated();
  }

  /**
   * Returns the validation rules
   * @returns The validation rules
   */
  public getRules(): IRulesObject {
    return this.rules;
  }

  /**
   * Returns the validation messages
   * @returns The validation messages
   */
  public getMessages(): IValidatorMessages {
    return this.messages;
  }
}

export default BaseCustomValidator;
