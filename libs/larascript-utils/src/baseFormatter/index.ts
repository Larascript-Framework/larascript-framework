/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IFormatter<Options = unknown> {
  formatterOptions?: Options;
  format<T = unknown>(...args: any[]): T;
  setFormatterOptions(options?: Options): this;
  getFormatterOptions(): Options | undefined;
}

export abstract class BaseFormatter<Options = unknown>
  implements IFormatter<Options>
{
  /**
   * The formatter options.
   */
  formatterOptions?: Options;

  abstract format<T = unknown>(...args: any[]): T;

  /**
   * Sets the formatter options.
   * @param options The options to set.
   * @returns {this} The formatter instance.
   */
  setFormatterOptions(options?: Options): this {
    this.formatterOptions = options;
    return this;
  }

  /**
   * Gets the formatter options.
   * @returns {Options | undefined} The formatter options.
   */
  getFormatterOptions(): Options | undefined {
    return this.formatterOptions;
  }
}
