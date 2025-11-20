import { IAppConfig } from "@/config/app.config.js";

export interface IAppService {
    getConfig(): IAppConfig;
    boot(): Promise<void>;
}