import { Resend } from "resend";
import BaseMailAdapter from "../base/BaseMailAdapter.js";
import Mail from "../data/Mail.js";
import { MailAdapter } from "../interfaces/index.js";

type ResendMailOptions = {
  apiKey: string;
};

/**
 * Nodemailer driver for sending emails.
 * Implements the MailAdapter interface.
 */
export class ResendMailDriver extends BaseMailAdapter implements MailAdapter {
  protected options!: ResendMailOptions;

  protected resend!: Resend;

  /**
   * Creates an instance of NodeMailDriver.
   * @param options The Nodemailer options for transport configuration.
   */
  constructor(options: ResendMailOptions = {} as ResendMailOptions) {
    super();
    this.options = options;
    if(typeof options.apiKey === 'string' && options.apiKey.length > 0) {
      this.resend = new Resend(options.apiKey);
    }
  }

  /**
   * Get the transporter options.
   * @returns The Nodemailer options.
   */
  getOptions<T = ResendMailOptions>(): T {
    return this.options as unknown as T;
  }

  /**
   * Sends an email using Nodemailer.
   * @param mail The Mail object containing email details.
   * @returns A promise that resolves when the email is sent.
   */
  async send(mail: Mail): Promise<void> {
    await this.resend.emails.send({
      from: mail.getFrom(),
      to: mail.getTo(),
      replyTo: mail.getOptions()?.["replyTo"] as string | string[] | undefined,
      subject: mail.getSubject(),
      html: await this.generateBodyString(mail),
    });
  }
}

export default ResendMailDriver;
