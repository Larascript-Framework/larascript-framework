import { IAsyncSessionService } from '@ben-shepherd/async-session';
import { ICryptoService } from '@ben-shepherd/crypto-js';
import { IAclConfig, IBasicACLService } from '@ben-shepherd/larascript-acl';
import { IEnvService, IPackageJsonService } from '@ben-shepherd/larascript-core';
import { ILoggerService } from '@ben-shepherd/larascript-logger';
import { IValidatorFn } from '@ben-shepherd/larascript-validator';
import { IViewRenderService, IViewService } from '@ben-shepherd/larascript-views';
import { IAppService } from "@src/app/interfaces/IAppService";
import AppServiceProvider from "@src/app/providers/AppServiceProvider";
import RoutesProvider from "@src/app/providers/RoutesProvider";
import { IAppConfig } from "@src/config/app.config";
import { IJwtAuthService } from '@src/core/domains/auth/interfaces/jwt/IJwtAuthService';
import { IAuthService } from '@src/core/domains/auth/interfaces/service/IAuthService';
import AuthProvider from "@src/core/domains/auth/providers/AuthProvider";
import ICommandService from '@src/core/domains/console/interfaces/ICommandService';
import ConsoleProvider from "@src/core/domains/console/providers/ConsoleProvider";
import { IDatabaseService } from '@src/core/domains/database/interfaces/IDatabaseService';
import DatabaseProvider from "@src/core/domains/database/providers/DatabaseProvider";
import { IEloquentQueryBuilderService } from '@src/core/domains/eloquent/interfaces/IEloquentQueryBuilderService';
import EloquentQueryProvider from "@src/core/domains/eloquent/providers/EloquentQueryProvider";
import { IEventService } from '@src/core/domains/events/interfaces/IEventService';
import EventProvider from "@src/core/domains/events/providers/EventProvider";
import IHttpService from '@src/core/domains/http/interfaces/IHttpService';
import { IRequestContext } from '@src/core/domains/http/interfaces/IRequestContext';
import HttpErrorHandlerProvider from "@src/core/domains/http/providers/HttpErrorHandlerProvider";
import HttpProvider from "@src/core/domains/http/providers/HttpProvider";
import { IMailService } from '@src/core/domains/mail/interfaces/services';
import MailProvider from "@src/core/domains/mail/providers/MailProvider";
import MakeProvider from "@src/core/domains/make/providers/MakeProvider";
import MigrationProvider from "@src/core/domains/migrations/providers/MigrationProvider";
import SetupProvider from "@src/core/domains/setup/providers/SetupProvider";
import { IStorageService } from '@src/core/domains/storage/interfaces/IStorageService';
import StorageProvider from "@src/core/domains/storage/providers/StorageProvider";
import ValidatorProvider from "@src/core/domains/validator/providers/ValidatorProvider";
import { IProvider } from "@src/core/interfaces/IProvider";
import ACLProvider from "@src/core/providers/ACLProvider";
import AsyncSessionProvider from "@src/core/providers/AsyncSessionProvider";
import CommandsProvider from '@src/core/providers/CommandsProvider';
import CryptoProvider from "@src/core/providers/CryptoProvider";
import EnvServiceProvider from "@src/core/providers/EnvServiceProvider";
import LoggerProvider from "@src/core/providers/LoggerProvider";
import PackageJsonProvider from "@src/core/providers/PackageJsonProvider";
import ViewProvider from "@src/core/providers/ViewProvider";
import readline from 'node:readline';

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
    "auth": IAuthService;
    "auth.jwt": IJwtAuthService;
    "acl.basic": IBasicACLService;
    "acl.basic.config": IAclConfig;
    "db": IDatabaseService;
    "query": IEloquentQueryBuilderService;
    "http": IHttpService;
    "requestContext": IRequestContext;
    "console": ICommandService;
    "readline": readline.Interface;
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

    // Include the core providers
    new LoggerProvider(),
    new EnvServiceProvider(),
    new PackageJsonProvider(),
    new ConsoleProvider(),
    new EventProvider(),
    new DatabaseProvider(),
    new EloquentQueryProvider(),
    new AuthProvider(),
    new ACLProvider(),
    new MigrationProvider(),
    new MakeProvider(),
    new ValidatorProvider(),
    new CryptoProvider(),
    new SetupProvider(),
    new CommandsProvider(),
    new AsyncSessionProvider(),
    new StorageProvider(),
    new MailProvider(),
    new ViewProvider(),
    new HttpProvider(),
    new RoutesProvider(),
    new HttpErrorHandlerProvider(),

    // Add your providers here
    new AppServiceProvider(),

]

export default providers;