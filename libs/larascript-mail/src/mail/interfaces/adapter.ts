import { BaseAdapterTypes, RequiresDependency } from "@larascript-framework/contracts/larascript-core";
import LocalMailDriver from "../adapters/LocalMailDriver.js";
import NodeMailDriver from "../adapters/NodeMailerDriver.js";
import ResendMailDriver from "../adapters/ResendMailDriver.js";
import { IMail } from "./data.js";

export type BaseMailAdapters = BaseAdapterTypes<MailAdapter> & {
  [key: string]: MailAdapter;
};

export interface MailAdapters extends BaseMailAdapters {
  local: LocalMailDriver;
  nodemailer: NodeMailDriver;
  resend: ResendMailDriver;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MailAdapterConstructor = new (options: any) => MailAdapter;

export interface MailAdapter extends RequiresDependency {
  send(mail: IMail): Promise<void>;
  getOptions<T>(): T;
}
