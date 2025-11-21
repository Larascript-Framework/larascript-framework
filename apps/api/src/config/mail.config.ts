import { BaseMailAdapters, IMailConfig, LocalMailDriver, MailConfig, NodeMailDriver, ResendMailDriver } from "@larascript-framework/larascript-mail";
import { parseBooleanFromString } from "@larascript-framework/larascript-utils";


/**
 * Provide type hinting when accessing passing names to the getDriver method in app('mail').getDriver(name)
 */
export interface MailAdapters extends BaseMailAdapters {
    local: LocalMailDriver
    nodemailer: NodeMailDriver
    resend: ResendMailDriver
}

/**
 * Mail config for setting up different types of mail drivers
 * local - sends mail to the log file
 */
export const mailConfig: IMailConfig = {

    /**
     * The name of the default email driver 
     */
    default: process.env.MAIL_DRIVER ?? 'local',

    /**
     * Define additional mail drivers
     * Usage: app('mail').getDriver('nameOfDriver').send(mail)
     */
    drivers: MailConfig.drivers([
        MailConfig.define({
            name: 'local',
            driver: LocalMailDriver,
            options: {}
        }),
        MailConfig.define({
            name: 'nodemailer',
            driver: NodeMailDriver,
            options: {
                host: process.env.NODEMAILER_HOST ?? '',
                port: process.env.NODEMAILER_PORT ?? '',
                secure: parseBooleanFromString(process.env.NODEMAILER_SECURE, 'false'), // true for 465, false for other ports
                auth: {
                    user: process.env.NODEMAILER_AUTH_USER ?? '',
                    pass: process.env.NODEMAILER_AUTH_PASS ?? '',
                },
            }
        }),
        MailConfig.define({
            name: 'resend',
            driver: ResendMailDriver,
            options: {
                apiKey: process.env.RESEND_API_KEY
            }
        })
    ])
}

