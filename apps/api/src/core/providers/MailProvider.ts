import appConfig, { IAppConfig } from "@/config/app.config.js";
import { mailConfig } from "@/config/mail.config.js";
import { app } from "@/core/services/App.js";
import { AbstractProvider } from "@larascript-framework/bootstrap";
import {
  IMailConfig,
  MailService,
} from "@larascript-framework/larascript-mail";

class MailProvider extends AbstractProvider {
  config: IMailConfig = mailConfig;

  appConfig: IAppConfig = appConfig;

  async register(): Promise<void> {
    const mailService = new MailService(this.config, this.appConfig);
    this.bind("mail", mailService);
  }

  async boot(): Promise<void> {
    app("mail").boot();
  }
}

export default MailProvider;
