import { IAppService } from "@/app/interfaces/IAppService.js";
import AppServiceProvider from "@/app/providers/AppServiceProvider.js";
import { IAppConfig } from "@/config/app.config.js";
import ACLProvider from "@/core/providers/ACLProvider.js";
import AsyncSessionProvider from "@/core/providers/AsyncSessionProvider.js";
import AuthProvider from "@/core/providers/AuthProvider.js";
import ConsoleProvider from "@/core/providers/ConsoleProvider.js";
import CryptoProvider from "@/core/providers/CryptoProvider.js";
import DatabaseProvider from "@/core/providers/DatabaseProvider.js";
import EnvServiceProvider from "@/core/providers/EnvServiceProvider.js";
import EventProvider from "@/core/providers/EventProvider.js";
import HttpProvider from "@/core/providers/HttpProvider.js";
import LoggerProvider from "@/core/providers/LoggerProvider.js";
import MailProvider from "@/core/providers/MailProvider.js";
import MakeProvider from "@/core/providers/MakeProvider.js";
import MigrationProvider from "@/core/providers/MigrationProvider.js";
import PackageJsonProvider from "@/core/providers/PackageJsonProvider.js";
import SetupProvider from "@/core/providers/SetupProvider.js";
import StorageProvider from "@/core/providers/StorageProvider.js";
import ValidatorProvider from "@/core/providers/ValidatorProvider.js";
import ViewProvider from "@/core/providers/ViewProvider.js";
import { IAsyncSessionService } from '@larascript-framework/async-session';
import { IProvider } from "@larascript-framework/contracts/larascript-core";
import { ICryptoService } from '@larascript-framework/crypto-js';
import { IAclConfig, IBasicACLService } from '@larascript-framework/larascript-acl';
import { IAuthService } from '@larascript-framework/larascript-auth';
import { IConsoleService } from '@larascript-framework/larascript-console';
import { IEnvService, IPackageJsonService } from '@larascript-framework/larascript-core';
import { IDatabaseService, IEloquentQueryBuilderService } from '@larascript-framework/larascript-database';
import { IEventService, IWorkerService } from '@larascript-framework/larascript-events';
import { IHttpService, IRequestContext } from "@larascript-framework/larascript-http";
import { ILoggerService } from '@larascript-framework/larascript-logger';
import { IMailService } from '@larascript-framework/larascript-mail';
import { IStorageService } from '@larascript-framework/larascript-storage';
import { IValidatorFn } from '@larascript-framework/larascript-validator';
import { IViewRenderService, IViewService } from '@larascript-framework/larascript-views';

/**
 * Interface defining all available service providers in the application.
 * This interface provides TypeScript type hints when accessing providers using app('serviceName').
 */
export interface Providers {
    [key: string]: unknown;

    // Larascript providers
    "envService": IEnvService;
    "packageJsonService": IPackageJsonService;
    "events": IEventService;
    "events.worker": IWorkerService;
    "auth": IAuthService;
    "acl": IBasicACLService;
    "acl.config": IAclConfig;
    "db": IDatabaseService;
    "query": IEloquentQueryBuilderService;
    "http": IHttpService;
    "requestContext": IRequestContext;
    "console": IConsoleService;
    "validatorFn": IValidatorFn;
    "logger": ILoggerService;
    "crypto": ICryptoService;
    "asyncSession": IAsyncSessionService;
    "storage": IStorageService;
    "mail": IMailService;
    "view": IViewService;
    "view:ejs": IViewRenderService;

    // App specific providers
    "app": IAppService;
    "app.config": IAppConfig;
}

/**
 * Providers
 */
const providers: IProvider[] = [

    /**
     * Include the core providers
     * Important: Do not change the order of the core providers otherwise bad things will happen
     */
    new LoggerProvider(),
    new AsyncSessionProvider(),
    new EnvServiceProvider(),
    new PackageJsonProvider(),
    new ConsoleProvider(),
    new CryptoProvider(),
    new DatabaseProvider(),
    new EventProvider(),
    new ACLProvider(),
    new AuthProvider(),
    new MigrationProvider(),
    new MakeProvider(),
    new ValidatorProvider(),
    new SetupProvider(),
    new StorageProvider(),
    new ViewProvider(),
    new MailProvider(),
    new HttpProvider(),

    /**
     * Add your providers here
     */
    new AppServiceProvider(),

]

export default providers;