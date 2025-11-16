import { IRule, IRuleError } from "../interfaces/index.js";
import { forceString } from "../utils/forceString.js";

/**
 * Abstract base class for validation rules.
 * Provides common functionality for implementing validation rules with customizable error messages and options.
 *
 * @template TOptions - Type of options object that can be passed to configure the rule
 */
export abstract class AbstractRule<TOptions extends object = object>
  implements IRule
{
  /** Name of the validation rule */
  protected abstract name: string;

  /** Template string for error messages. Use :attribute for the field name and :key for option values */
  protected abstract errorTemplate: string;

  /** Default error message if error template processing fails */
  protected defaultError: string = "This field is invalid.";

  /** Configuration options for the rule */
  protected options: TOptions = {} as TOptions;

  /** The value to validate */
  protected data: unknown = undefined;

  /** Custom messages for the rule */
  protected messages: Record<string, string> = {};

  /** All attributes/fields being validated */
  protected attributes: unknown = undefined;

  /** The current attribute */
  protected attribute!: string;

  /** Dot notation path to the field being validated (e.g. "users.*.name") */
  protected dotNotationPath!: string;

  /** Overridable error message for the rule, undefined by default */
  protected errorMessage?: string = undefined;

  /** Names of other rules that are being validated */
  protected otherRuleNames: string[] = [];

  /**
   * Additional context
   */
  protected context: Record<string, unknown> = {};

  /**
   * Constructor for AbstractRule
   *
   * @param additionalOptions - Additional options to be merged with the default options
   */
  constructor(additionalOptions?: object) {
    this.options = {
      ...(this.options ?? {}),
      ...(additionalOptions ?? {}),
    };
  }

  setContext(context: Record<string, unknown>): void {
    this.context = context;
  }

  getContext<T = unknown>(name: string): T | undefined {
    return (this.context?.[name] as T) ?? undefined;
  }

  /**
   * Tests if the current data value passes the validation rule
   * @returns True if validation passes, false if it fails
   */
  public abstract test(): Promise<boolean>;

  /**
   * Validates the data against the rule
   *
   * @returns True if validation passes, false if it fails
   */
  public async validate(): Promise<boolean> {
    try {
      if (this.nullable()) {
        return true;
      }

      return await this.test();
    } catch (error) {
      this.errorMessage = (error as Error).message;
      return false;
    }
  }

  /**
   * Sets the configuration options for this validation rule
   * @param options - Rule-specific options object
   * @returns this - For method chaining
   */
  public setOptions(options: TOptions): this {
    this.options = options;
    return this;
  }

  /**
   * Sets the value to be validated
   * @param data - The value to validate
   * @returns this - For method chaining
   */
  public setAttributeData(data: unknown): this {
    this.data = data;
    return this;
  }

  /**
   * Sets the custom messages for the rule
   * @param messages - Object containing custom messages
   * @returns this - For method chaining
   */
  public setMessages(messages: Record<string, string>): this {
    this.messages = messages;
    return this;
  }

  /**
   * Gets the current value being validated
   * @returns The value being validated
   */
  public getAttributeData<T = unknown>(): T {
    return this.data as T;
  }

  /**
   * Sets all attributes/fields being validated
   * @param attributes - Object containing all fields being validated
   * @returns this - For method chaining
   */
  public setAttributes(attributes: unknown): this {
    this.attributes = attributes;
    return this;
  }

  /**
   * Gets all attributes/fields being validated
   * @returns Object containing all fields being validated
   */
  public getAttributes<T = unknown>(): T {
    return this.attributes as T;
  }

  /**
   * Gets a specific option value by key
   * @param key - The option key to retrieve
   * @returns The option value
   */
  public getOption(key: string): unknown {
    return this.options[key];
  }

  /**
   * Gets the name of this validation rule
   * @returns The rule name
   */
  public getName(): string {
    return this.name;
  }

  /**
   * Gets the error message template
   * @returns The error template string
   */
  protected getErrorTemplate(): string {
    return this.errorTemplate;
  }

  /**
   * Sets the dot notation path to the field being validated
   * @param path - The field path (e.g. "users.*.name")
   * @returns this - For method chaining
   */
  public setDotNotationPath(path: string): this {
    this.dotNotationPath = path;
    return this;
  }

  /**
   * Gets the dot notation path to the field being validated
   * @returns The field path
   */
  public getDotNotationPath(): string {
    return this.dotNotationPath;
  }

  /**
   * Gets the custom message for the rule
   * @returns The custom message
   */
  public getCustomError(): IRuleError | undefined {
    const key = `${this.getDotNotationPath()}.${this.getName()}`;

    if (this.messages[key]) {
      return {
        [this.getDotNotationPath()]: [this.messages[key]],
      };
    }

    return undefined;
  }

  /**
   * Gets the error message for the rule
   * @returns The error message
   */
  public getError(): IRuleError {
    // Get the error message
    // If an error message is set, use it (overrides the error template)
    const message = this.errorMessage
      ? this.formatErrorMessage({}, this.errorMessage)
      : this.formatErrorMessage();

    return {
      [this.getDotNotationPath()]: [message],
    };
  }

  /**
   * Builds an error message by replacing placeholders in the error template
   *
   * @param replacer - Object containing key-value pairs to replace in the template
   * @param error - The error template string
   * @returns The formatted error message
   */
  protected formatErrorMessage(
    replacer: Record<string, unknown> = {},
    error: string = this.errorTemplate,
  ): string {
    // Add attributes to replacer if it doesn't exist
    if (!replacer["attribute"]) {
      replacer.attribute = this.getDotNotationPath();
    }

    // Replace placeholders in the error template
    for (const [key, value] of Object.entries(replacer)) {
      error = error.replace(`:${key}`, forceString(value));
    }

    return error;
  }

  /**
   * Checks if the rule includes another rule
   * @param name - The name of the rule to check
   * @returns True if the rule includes another rule, false otherwise
   */
  protected includesOtherRule(name: string): boolean {
    return this.otherRuleNames.includes(name);
  }

  /**
   * Checks if the data is undefined or null
   * @returns True if the data is undefined or null, false otherwise
   */
  protected dataUndefinedOrNull(): boolean {
    return (
      typeof this.getAttributeData() === "undefined" ||
      this.getAttributeData() === null
    );
  }

  /**
   * Checks if the rule allows null values
   * @returns True if the rule allows null values, false otherwise
   */
  protected nullable(): boolean {
    const allowNullable = this.otherRuleNames.includes("nullable");
    return allowNullable && this.dataUndefinedOrNull();
  }

  /**
   * Checks if the rule allows null values for strings
   * @returns True if the rule allows null values, false otherwise
   */
  protected nullableString(): boolean {
    const allowNullable = this.otherRuleNames.includes("nullable");
    const stringEmpty =
      typeof this.getAttributeData() === "string" &&
      (this.getAttributeData() as string).length === 0;
    return allowNullable && (this.dataUndefinedOrNull() || stringEmpty);
  }

  /**
   * Sets the names of other rules that are being validated
   * @param names - The names of the other rules
   * @returns this - For method chaining
   */
  public setOtherRuleNames(names: string[]): this {
    this.otherRuleNames = names;
    return this;
  }

  setAttribute(attribute: string): this {
    this.attribute = attribute;
    return this;
  }

  getAttribute(): string {
    return this.attribute;
  }
}

export default AbstractRule;
