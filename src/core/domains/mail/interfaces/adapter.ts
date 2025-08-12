/* eslint-disable no-unused-vars */
import { BaseAdapterTypes } from "@ben-shepherd/larascript-core";
import { IMail } from "@src/core/domains/mail/interfaces/data";

export type BaseMailAdapters = BaseAdapterTypes<MailAdapter> & {
    local: MailAdapter
}

export type MailAdapterConstructor = new (options: any) => MailAdapter

export interface MailAdapter {
    send(mail: IMail): Promise<void>
    getOptions<T>(): T
}