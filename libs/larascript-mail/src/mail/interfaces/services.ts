import { BaseMailAdapters, MailAdapter } from "./adapter.js";
import { IMail } from "./data.js";

export interface IMailService {
  boot(): void;
  setDependencies(deps: Record<string, unknown>): void;
  send(mail: IMail, driver?: keyof BaseMailAdapters): Promise<void>;
  getDefaultDriver(): MailAdapter;
  getDriver<T extends MailAdapter = MailAdapter>(
    name: keyof BaseMailAdapters,
  ): T;
}
