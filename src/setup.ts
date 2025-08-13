import 'tsconfig-paths/register';

import { Kernel } from '@ben-shepherd/larascript-core';
import appConfig from '@src/config/app.config';
import ConsoleProvider from '@src/core/domains/console/providers/ConsoleProvider';
import DatabaseSetupProvider from '@src/core/domains/database/providers/DatabaseSetupProvider';
import SetupProvider from '@src/core/domains/setup/providers/SetupProvider';
import CryptoProvider from '@src/core/providers/CryptoProvider';
import LoggerProvider from '@src/core/providers/LoggerProvider';
import { app } from '@src/core/services/App';

import EnvServiceProvider from './core/providers/EnvServiceProvider';
import PackageJsonProvider from './core/providers/PackageJsonProvider';

(async () => {
    require('dotenv').config();

    await Kernel.boot({
        ...appConfig,
        environment: 'testing',
        providers: [
            new EnvServiceProvider(),
            new PackageJsonProvider(),
            new LoggerProvider(),
            new ConsoleProvider(),
            new DatabaseSetupProvider(),
            new CryptoProvider(),
            new SetupProvider()
        ]
    }, {})

    app('console').readerService(['app:setup']).handle();
})();