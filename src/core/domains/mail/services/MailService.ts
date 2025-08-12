import { BaseAdapter } from "@ben-shepherd/larascript-core";
import { IAppConfig } from "@src/config/app.config";
import { MailAdapters } from "@src/config/mail.config";
import { MailAdapter } from "@src/core/domains/mail/interfaces/adapter";
import { IMailConfig } from "@src/core/domains/mail/interfaces/config";
import { IMail } from "@src/core/domains/mail/interfaces/data";
import { IMailService } from "@src/core/domains/mail/interfaces/services";
import { app } from "@src/core/services/App";



/**
 * Short hand for app('mail')
 */
export const mail = () => app('mail')

class MailService extends BaseAdapter<MailAdapters> implements IMailService {

    /**
     * Creates an instance of MailService.
     * @param config The mail configuration.
     */
    constructor(
        // eslint-disable-next-line no-unused-vars
        protected readonly mailConfig: IMailConfig,
        // eslint-disable-next-line no-unused-vars
        protected readonly appConfig: IAppConfig
    ) {
        super()
    }

    /**
     * Boots the MailService by adding the configured mail adapters.
     */
    boot(): void {
        this.mailConfig.drivers.forEach(driverConfig => {
            const adapterConstructor = driverConfig.driver
            this.addAdapterOnce(driverConfig.name, new adapterConstructor(driverConfig.options))
        })
    }

    /**
     * Sends an email using the default mail driver.
     * @param mail The email data.
     * @returns A promise that resolves when the email is sent.
     */
    async send(mail: IMail, driver: keyof MailAdapter = this.mailConfig.default as keyof MailAdapter): Promise<void> {
        try {
            mail = this.addLocalesData(mail)
            return await this.getAdapter(driver).send(mail)
        }
        catch (err) {
            app('logger').error(err)
            throw err
        }
    }

    /**
     * Gets the default mail driver.
     * @returns The default MailAdapter.
     */
    getDefaultDriver(): MailAdapter {
        return this.getAdapter(this.mailConfig.default)
    }

    /**
     * Gets a specific mail driver by name.
     * @template T The expected type of the mail adapter.
     * @param name The name of the mail adapter.
     * @returns The specified MailAdapter.
     */
    getDriver<T extends MailAdapter = MailAdapter>(name: keyof MailAdapters): T {
        return this.getAdapter(name) as T
    }

    /**
     * Adds locale-related data to the mail body, such as application configuration and current date.
     * This is useful for rendering email templates with localized or dynamic information.
     *
     * @param mail The mail object to which locale data will be added.
     * @returns The mail object with updated body containing locale data.
     */
    private addLocalesData(mail: IMail) {
        const mailBody = mail.getBody()

        // Inject locales variables
        if(typeof mailBody === 'object') {
            const locales = {
                ...this.appConfig,
                date: new Date(),
            }

            mail.setBody({
                ...mailBody,
                data: {
                    ...(mailBody?.data ?? []),
                    locales
                }
            })
        }

        return mail
    }

}

export default MailService