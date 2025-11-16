import IConsoleService from "@/console/IConsoleService.js";
import { ICryptoService } from "@/crypto-js/ICryptoService.js";
import { ILoggerService } from "@/logger/Logger.t.js";
import { IDatabaseConfig } from "../database/config.js";
import { IDatabaseService } from "../database/service.js";
import { IEloquentQueryBuilderService } from "../eloquent/services.t.js";

export type IDatabaseEnvironmentDependencies = {
    logger?: ILoggerService;
    console?: IConsoleService;
    cryptoService?: ICryptoService;
    dispatcher?: (...args: any[]) => Promise<void>;
    eloquentQueryBuilder?: IEloquentQueryBuilderService;
    databaseService?: IDatabaseService;
}

export type IDatabaseEnvironmentOptions = {
    databaseConfig?: IDatabaseConfig;
    dependencies?: IDatabaseEnvironmentDependencies;
    secretKey?: string;
    boot?: boolean;
}

export type IDatabaseEnvironment = {
    databaseService: IDatabaseService;
    eloquentQueryBuilder: IEloquentQueryBuilderService;
    cryptoService: ICryptoService;
    dispatcher: (...args: any[]) => Promise<void>;
    console: IConsoleService;
    logger: ILoggerService;
    boot(): Promise<void>;
}