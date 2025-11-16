import 'dotenv/config';

import appConfig from '@/config/app.config.js';
import providers from '@/config/providers.config.js';
import CommandBootService from '@/core/services/CommandBootService.js';
import { logger } from '@/core/services/Logger.js';
import { CommandNotFoundException } from '@larascript-framework/larascript-console';
import { Kernel, KernelOptions } from '@larascript-framework/larascript-core';

(async () => {
    try {
        const args = process.argv.slice(2);
        const cmdBoot  = new CommandBootService();
        const options: KernelOptions = cmdBoot.getKernelOptions(args, {})
        const environment = appConfig.env
        
        /**
         * Boot the kernel
         */
        await Kernel.boot({ environment, providers }, options);
        logger().info('[App]: Started');

        /**
         * Execute commands
         */
        await cmdBoot.boot(args);
    
    }
    catch (err) {
        
        // We can safetly ignore CommandNotFoundExceptions 
        if(err instanceof CommandNotFoundException) {
            return;
        }

        logger().error('[App]: Failed to start', err);
        throw err;
    }
})();