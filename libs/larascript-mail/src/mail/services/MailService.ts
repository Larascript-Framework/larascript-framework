import {
  BaseAdapter
} from "@larascript-framework/larascript-core";
import { ILoggerService } from "@larascript-framework/larascript-logger";
import {
  BaseMailAdapters,
  IMail,
  IMailConfig,
  IMailService,
  MailAdapter,
  MailAdapters,
} from "../interfaces/index.js";
export class MailService
  extends BaseAdapter<MailAdapters>
  implements IMailService
{
  protected deps!: Record<string, unknown>

  /**
   * Creates an instance of MailService.
   * @param config The mail configuration.
   */
  constructor(
    protected readonly mailConfig: IMailConfig,
    protected readonly localesConfig: Record<string, unknown>,
  ) {
    super();
  }

  setDependencies(deps: Record<string, unknown>): void {
    if(!deps["logger"]) {
      throw new Error("Dependency 'logger' not set")
    }

    if(!deps["view"]) {
      throw new Error("Dependency 'view' not set")
    }
    
    this.deps = deps;
  }

  addAdapterOnce(name: string, adapter: MailAdapter): void {
    adapter.setDependencies(this.deps)
    super.addAdapterOnce(name, adapter);
  }

  /**
   * Boots the MailService by adding the configured mail adapters.
   */
  boot(): void {
    this.mailConfig.drivers.forEach((driverConfig) => {
      const adapterConstructor = driverConfig.driver;
      this.addAdapterOnce(
        driverConfig.name,
        new adapterConstructor(driverConfig.options),
      );
    });
  }

  /**
   * Sends an email using the default mail driver.
   * @param mail The email data.
   * @returns A promise that resolves when the email is sent.
   */
  async send(
    mail: IMail,
    driver: keyof MailAdapter = this.mailConfig.default as keyof MailAdapter,
  ): Promise<void> {
    try {
      mail = this.addLocalesData(mail);
      return await this.getAdapter(driver as keyof BaseMailAdapters).send(mail);
    } catch (err) {
      (this.deps["logger"] as ILoggerService).error(err);
      throw err;
    }
  }

  /**
   * Gets the default mail driver.
   * @returns The default MailAdapter.
   */
  getDefaultDriver(): MailAdapter {
    return this.getAdapter(this.mailConfig.default as keyof BaseMailAdapters);
  }

  /**
   * Gets a specific mail driver by name.
   * @template T The expected type of the mail adapter.
   * @param name The name of the mail adapter.
   * @returns The specified MailAdapter.
   */
  getDriver<T extends MailAdapter = MailAdapter>(
    name: keyof BaseMailAdapters,
  ): T {
    return this.getAdapter(name) as unknown as T;
  }

  /**
   * Adds locale-related data to the mail body, such as application configuration and current date.
   * This is useful for rendering email templates with localized or dynamic information.
   *
   * @param mail The mail object to which locale data will be added.
   * @returns The mail object with updated body containing locale data.
   */
  private addLocalesData(mail: IMail) {
    const mailBody = mail.getBody();

    // Inject locales variables
    if (typeof mailBody === "object") {
      const locales = {
        ...this.localesConfig,
        date: new Date(),
      };

      mail.setBody({
        ...mailBody,
        data: {
          ...(mailBody?.data ?? []),
          locales,
        },
      });
    }

    return mail;
  }
}

export default MailService;
