import { BaseProvider } from "@ben-shepherd/larascript-core";
import appConfig, { IAppConfig } from "@src/config/app.config";
import { mailConfig } from "@src/config/mail.config";
import { IMailConfig } from "@src/core/domains/mail/interfaces/config";
import MailService from "@src/core/domains/mail/services/MailService";
import { app } from "@src/core/services/App";

class MailProvider extends BaseProvider {

    config: IMailConfig = mailConfig

    appConfig: IAppConfig = appConfig
    
    async register(): Promise<void> {
        this.bind('mail', new MailService(this.config, this.appConfig))
    }

    async boot(): Promise<void> {
        app('mail').boot()
    }

}

export default MailProvider