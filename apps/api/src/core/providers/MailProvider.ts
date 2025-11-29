import appConfig, { IAppConfig } from "@/config/app.config.js";
import { mailConfig } from "@/config/mail.config.js";
import { app } from "@/core/services/App.js";
import {
  AppSingleton,
  BaseProvider,
} from "@larascript-framework/larascript-core";
import {
  IMailConfig,
  MailService,
} from "@larascript-framework/larascript-mail";

class MailProvider extends BaseProvider {
  config: IMailConfig = mailConfig;

  appConfig: IAppConfig = appConfig;

  async register(): Promise<void> {
    const mailService = new MailService(this.config, this.appConfig);
    mailService.setDependencyLoader(AppSingleton.container);
    this.bind("mail", mailService);
  }

  async boot(): Promise<void> {
    app("mail").boot();
  }
}

export default MailProvider;
