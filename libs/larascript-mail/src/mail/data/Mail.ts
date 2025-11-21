import { IMail, IMailOptions, IMailViewData } from "../interfaces/index.js";

/**
 * Represents a mail message.
 * @template T - The type of mail options.
 */
export class Mail<T extends IMailOptions = IMailOptions> implements IMail<T> {
  config: T;

  /**
   * Creates an instance of Mail.
   * @param config - The mail options.
   */
  constructor(config: T = {} as T) {
    this.config = config;
  }

  /**
   * Gets the mail config.
   * @returns The mail config.
   */
  getConfig(): T {
    return this.config;
  }

  /**
   * Gets the mail options
   * @returns
   */
  getOptions<
    Options extends Record<string, unknown> = Record<string, unknown>,
  >(): Options {
    return (this.config?.options ?? {}) as Options;
  }

  /**
   * Gets the recipient(s) of the email.
   * @returns The recipient(s) email address(es).
   */
  public getTo(): string | string[] {
    return this.config.to;
  }

  /**
   * Sets the recipient(s) of the email.
   * @param to - The recipient(s) email address(es).
   * @returns The Mail instance for chaining.
   */
  public setTo(to: string | string[]): this {
    this.config.to = to;
    return this;
  }

  /**
   * Gets the sender of the email.
   * @returns The sender's email address.
   */
  public getFrom(): string {
    return this.config.from;
  }

  /**
   * Sets the sender of the email.
   * @param from - The sender's email address.
   * @returns The Mail instance for chaining.
   */
  public setFrom(from: string): this {
    this.config.from = from;
    return this;
  }

  /**
   * Gets the subject of the email.
   * @returns The email subject.
   */
  public getSubject(): string {
    return this.config.subject;
  }

  /**
   * Sets the subject of the email.
   * @param subject - The email subject.
   * @returns The Mail instance for chaining.
   */
  public setSubject(subject: string): this {
    this.config.subject = subject;
    return this;
  }

  /**
   * Gets the body of the email.
   * @returns The email body.
   */
  public getBody(): string | IMailViewData {
    return this.config.body;
  }

  /**
   * Sets the body of the email.
   * @param body - The email body.
   * @returns The Mail instance for chaining.
   */
  public setBody(body: string | IMailViewData): this {
    this.config.body = body;
    return this;
  }

  /**
   * Gets the attachments of the email.
   * @template T - The type of the attachments.
   * @returns An array of attachments or undefined.
   */
  public getAttachments<T>(): T[] | undefined {
    return this.config.attachments as T[];
  }

  /**
   * Sets the attachments of the email.
   * @param attachments - An array of attachments or undefined.
   * @returns The Mail instance for chaining.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public setAttachments(attachments: any[] | undefined): this {
    this.config.attachments = attachments;
    return this;
  }
}

export default Mail;
