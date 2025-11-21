import nodemailer from "nodemailer";
import BaseMailAdapter from "../base/BaseMailAdapter.js";
import Mail from "../data/Mail.js";
import { MailAdapter } from "../interfaces/index.js";

type NodeMailerOptions = {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
};

/**
 * Nodemailer driver for sending emails.
 * Implements the MailAdapter interface.
 */
export class NodeMailDriver extends BaseMailAdapter implements MailAdapter {
  protected options!: NodeMailerOptions;

  /**
   * Creates an instance of NodeMailDriver.
   * @param options The Nodemailer options for transport configuration.
   */
  constructor(options: NodeMailerOptions = {} as NodeMailerOptions) {
    super();
    this.options = options;
  }

  /**
   * Get the transporter options.
   * @returns The Nodemailer options.
   */
  getOptions<T = NodeMailerOptions>(): T {
    return this.options as unknown as T;
  }

  /**
   * Sends an email using Nodemailer.
   * @param mail The Mail object containing email details.
   * @returns A promise that resolves when the email is sent.
   */
  async send(mail: Mail): Promise<void> {
    await this.createTransporter().sendMail({
      from: mail.getFrom(),
      to: mail.getTo(),
      subject: mail.getSubject(),
      html: await this.generateBodyString(mail),
    });
  }

  /**
   * Creates a Nodemailer transporter instance.
   * @returns The Nodemailer transporter.
   */
  protected createTransporter() {
    return nodemailer.createTransport({
      host: this.options.host,
      port: this.options.port,
      secure: this.options.secure, // true for 465, false for other ports
      auth: {
        user: this.options.auth?.user,
        pass: this.options.auth?.pass,
      },
    });
  }
}

export default NodeMailDriver;
