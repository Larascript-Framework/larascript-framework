/* eslint-disable @typescript-eslint/no-explicit-any */

export interface IMailOptions {
  to: string | string[];
  from: string;
  subject: string;
  body: string | IMailViewData;
  attachments?: any[];
  options?: Record<string, unknown>;
}

export interface IMailViewData {
  view: string;
  data?: Record<string, unknown>;
}

export interface IMail<T extends IMailOptions = IMailOptions> {
  getConfig(): T;
  getOptions<Options extends Record<string, unknown>>(): Options;
  getTo(): string | string[];
  setTo(to: string | string[]): void;
  getFrom(): string;
  setFrom(from: string): void;
  getSubject(): string;
  setSubject(subject: string): void;
  getBody(): string | IMailViewData;
  setBody(body: string | IMailViewData): void;
  getAttachments<T>(): T[] | undefined;
  setAttachments(attachments: any[] | undefined): void;
}
