import AccessControlProvider from "@src/core/domains/accessControl/providers/AccessControlProvider";
import AuthProvider from "@src/core/domains/auth/providers/AuthProvider";
import ConsoleProvider from "@src/core/domains/console/providers/ConsoleProvider";
import CryptoProvider from "@src/core/domains/crypto/providers/CryptoProvider";
import DatabaseProvider from "@src/core/domains/database/providers/DatabaseProvider";
import EloquentQueryProvider from "@src/core/domains/eloquent/providers/EloquentQueryProvider";
import EventProvider from "@src/core/domains/events/providers/EventProvider";
import HttpProvider from "@src/core/domains/http/providers/HttpProvider";
import LoggerProvider from "@src/core/domains/logger/providers/LoggerProvider";
import MailProvider from "@src/core/domains/mail/providers/MailProvider";
import MakeProvider from "@src/core/domains/make/providers/MakeProvider";
import MigrationProvider from "@src/core/domains/migrations/providers/MigrationProvider";
import SessionProvider from "@src/core/domains/session/providers/SessionProvider";
import SetupProvider from "@src/core/domains/setup/providers/SetupProvider";
import StorageProvider from "@src/core/domains/storage/providers/StorageProvider";
import ValidatorProvider from "@src/core/domains/validator/providers/ValidatorProvider";
import ViewProvider from "@src/core/domains/view/providers/ViewProvider";
import { ILarascriptProviders } from "@src/core/interfaces/ILarascriptProviders";
import { IProvider } from "@src/core/interfaces/IProvider";

import EnvServiceProvider from "./EnvServiceProvider";
import PackageJsonProvider from "./PackageJsonProvider";


/**
 * Core providers for the framework
 *
 * These providers are loaded by default when the application boots
 *
 * @see {@link IProvider} for more information about providers
 * @see {@link ILarascriptProviders} for providing type hints for providers
 */
const LarascriptProviders: IProvider[] = [
    new LoggerProvider(),
    new EnvServiceProvider(),
    new PackageJsonProvider(),
    new ConsoleProvider(),
    new EventProvider(),
    new DatabaseProvider(),
    new EloquentQueryProvider(),
    new HttpProvider(),
    new AuthProvider(),
    new AccessControlProvider(),
    new MigrationProvider(),
    new MakeProvider(),
    new ValidatorProvider(),
    new CryptoProvider(),
    new SetupProvider(),
    new SessionProvider(),
    new StorageProvider(),
    new MailProvider(),
    new ViewProvider(),
];

export default LarascriptProviders