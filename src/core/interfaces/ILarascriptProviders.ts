import { IEnvService, IPackageJsonService } from '@ben-shepherd/larascript-core-bundle';
import { ILoggerService } from '@ben-shepherd/larascript-logger-bundle';
import { IBasicACLService } from '@src/core/domains/accessControl/interfaces/IACLService';
import { IJwtAuthService } from '@src/core/domains/auth/interfaces/jwt/IJwtAuthService';
import { IAuthService } from '@src/core/domains/auth/interfaces/service/IAuthService';
import ICommandService from '@src/core/domains/console/interfaces/ICommandService';
import { ICryptoService } from '@src/core/domains/crypto/interfaces/ICryptoService';
import { IDatabaseService } from '@src/core/domains/database/interfaces/IDatabaseService';
import { IEloquentQueryBuilderService } from '@src/core/domains/eloquent/interfaces/IEloquentQueryBuilderService';
import { IEventService } from '@src/core/domains/events/interfaces/IEventService';
import IHttpService from '@src/core/domains/http/interfaces/IHttpService';
import { IRequestContext } from '@src/core/domains/http/interfaces/IRequestContext';
import { IMailService } from '@src/core/domains/mail/interfaces/services';
import { ISessionService } from '@src/core/domains/session/interfaces/ISessionService';
import { IStorageService } from '@src/core/domains/storage/interfaces/IStorageService';
import { IValidatorFn } from '@src/core/domains/validator/interfaces/IValidator';
import { IViewRenderService, IViewService } from '@src/core/domains/view/interfaces/services';
import readline from 'node:readline';

export interface ILarascriptProviders {

    [key: string]: unknown;

    /**
     * Services
     * TODO: place all services  here
     */
    envService: IEnvService;
    packageJsonService: IPackageJsonService;

    /**
     * Event Dispatcher Service
     * Provided by '@src/core/domains/events/providers/EventProvider'
     */
    events: IEventService;

    /**
     * Auth service
     * Provided by '@src/core/domains/auth/providers/AuthProvider'
     */
    auth: IAuthService;

    /**
     * JWT Auth service
     * Provided by '@src/core/domains/auth/providers/AuthProvider'
     */
    'auth.jwt': IJwtAuthService;

    /**
     * ACL service
     * Provided by '@src/core/domains/accessControl/providers/AccessControlProvider'
     */
    'acl.basic': IBasicACLService;

    /**

     * Database Service
     * Provided by '@src/core/domains/database/providers/DatabaseProvider'
     */

    db: IDatabaseService;

    /**
     * Query Service
     * Provided by '@src/core/domains/eloquent/providers/EloquentQueryProvider'
     * Provides fluent interface for database queries using the Eloquent ORM pattern
     */
    query: IEloquentQueryBuilderService;

    /**
     * Express web server Service
     * Provided by '@src/core/domains/http/providers/HttpProvider'
     */
    http: IHttpService;


    /**
     * Request Context service
     * Provided by '@src/core/domains/express/providers/ExpressProvider'
     */
    requestContext: IRequestContext;

    /**
     * Console service
     * Provided by '@src/core/domains/console/providers/ConsoleProvider'
     */
    console: ICommandService;

    /**
     * Readline interface
     * Provided by '@src/core/domains/console/providers/ConsoleProvider'
     */
    readline: readline.Interface;

    /**
     * Validator service
     * Provided by '@src/core/domains/validator/providers/ValidatorProvider'
     */
    validatorFn: IValidatorFn;

    /**
     * Logger service
     * Provided by '@src/core/domains/logger/providers/LoggerProvider'
     */
    logger: ILoggerService;

    /**
     * Crypto service
     * Provided by '@src/core/domains/crypto/providers/CryptoProvider'
     */
    crypto: ICryptoService;

    /**
     * Session service
     * Provided by '@src/core/domains/session/providers/SessionProvider'
     */
    session: ISessionService;

    /**
     * Storage service
     * Provided by '@src/core/domains/storage/providers/StorageProvider'
     */
    storage: IStorageService;

    /**
     * Email service
     * Provided by '@src/core/domains/email/providers/EmailProvider'
     */
    mail: IMailService;

    /**
     * View service
     * Provided by '@src/core/domains/view/providers/ViewProvider'
     */
    "view": IViewService;
    "view:ejs": IViewRenderService;
}
