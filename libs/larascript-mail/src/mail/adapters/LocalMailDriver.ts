import BaseMailAdapter from "../base/BaseMailAdapter.js";
import Mail from "../data/Mail.js";
import { MailAdapter } from "../interfaces/index.js";

export class LocalMailDriver extends BaseMailAdapter implements MailAdapter {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_options: object = {}) {
    super();
  }

  getOptions<T>(): T {
    return {} as T;
  }

  async send(mail: Mail): Promise<void> {
    this.logger.info(
      "Email",
      JSON.stringify({
        to: mail.getTo(),
        from: mail.getFrom(),
        subject: mail.getSubject(),
        body: await this.generateBodyString(mail),
        attachments: mail.getAttachments(),
      }),
    );
  }
}

export default LocalMailDriver;
