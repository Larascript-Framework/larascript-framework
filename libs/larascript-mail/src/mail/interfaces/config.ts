import { MailAdapterConstructor } from "./adapter.js";

export type MailAdapterConfig = MailAdapterConfigItem[];

export interface MailAdapterConfigItem {
  name: string;
  driver: MailAdapterConstructor;
  options: Record<string, unknown>;
}

export interface IMailConfig {
  default: string;
  drivers: MailAdapterConfigItem[];
}
