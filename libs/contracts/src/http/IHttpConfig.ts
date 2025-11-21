import express, { NextFunction, Request, Response } from "express";
import { ICsrfConfig } from "./ICSRF.js";
import { IHttpFileSystemUploaderConfig, IHttpS3UploaderConfig } from "./IHttpDependencies.js";
import { TExpressMiddlewareFnOrClass } from "./IMiddleware.js";

// eslint-disable-next-line no-unused-vars
export type ExtendExpressFn = (app: express.Application) => void

export interface IHttpServiceConfig {
    enabled: boolean;
    port: number;
    beforeAllMiddlewares?: (express.RequestHandler | TExpressMiddlewareFnOrClass)[];
    afterAllMiddlewares?: (express.RequestHandler | TExpressMiddlewareFnOrClass)[];
    currentRequestCleanupDelay?: number;
    extendExpress?: ExtendExpressFn
    csrf?: ICsrfConfig
    errorHandlers?: {
        notFoundHandler?: (req: Request, res: Response, next: NextFunction) => void;
        errorHandler?: (err: Error, req: Request, res: Response, next: NextFunction) => void;
    },
    disableErrorHandlers?: boolean;
    uploads: {
        driver: 'filesystem' | 's3';
        config: {
            filesystem?: IHttpFileSystemUploaderConfig;
            s3?: IHttpS3UploaderConfig;
        };
    };
}

export default IHttpServiceConfig