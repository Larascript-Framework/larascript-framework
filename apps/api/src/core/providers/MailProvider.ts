import appConfig, { IAppConfig } from "@/config/app.config.js";
import { mailConfig } from "@/config/mail.config.js";
import { app } from "@/core/services/App.js";
import { AbstractProvider, AppContainer } from "@larascript-framework/bootstrap";
import { ILoggerService } from "@larascript-framework/larascript-logger";
import {
  IMailConfig,
  MailService,
} from "@larascript-framework/larascript-mail";
import { IViewRenderService } from "@larascript-framework/larascript-views";

class MailProvider extends AbstractProvider {
  config: IMailConfig = mailConfig;

  appConfig: IAppConfig = appConfig;

  async register(): Promise<void> {
    const mailService = new MailService(this.config, this.appConfig);

    mailService.setDependencies({
      view: AppContainer.container().resolve<IViewRenderService>("view:ejs"),
      logger: AppContainer.container().resolve<ILoggerService>("logger")
    })
    
    this.bind("mail", mailService);
  }

  async boot(): Promise<void> {
    app("mail").boot();
  }
}

export default MailProvider;
