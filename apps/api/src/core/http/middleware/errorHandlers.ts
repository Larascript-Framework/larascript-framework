import { EnvironmentProduction, appEnv } from '@larascript-framework/larascript-core';
import { NextFunction, Request, Response } from 'express';

/**
 * Handle 404 errors - this middleware should be added after all routes
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {

    if (res.headersSent) {
        return next();
    }

    const error = new Error(`Invalid route`);
    res.status(404);
    next(error);
};

/**
 * Global error handler middleware
 * 
 * This middleware:
 * - Handles all errors passed to next()
 * - Returns appropriate error responses
 */

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {

    if (res.headersSent) {
        return next();
    }

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode)

    if (appEnv() === EnvironmentProduction) {
        res.json({
            message: 'Whoops... something went wrong.',
        });
        return;
    }

    const formattedStack = err.stack
        ?.split('\n')
        .map(line => line.trim())
        .filter(Boolean);

    res.json({
        message: err.message,
        stack: formattedStack
    });
};

export default {
    notFoundHandler,
    errorHandler
};

