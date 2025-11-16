import { IHttpServiceConfig } from "@larascript-framework/contracts/http";
import { EnvironmentProduction } from "@larascript-framework/larascript-core";
import { NextFunction, Request, Response } from 'express';
import { HttpEnvironment } from "../environment/HttpEnvironment.js";
import { responseError } from "./responseError.js";

export const baseErrorHandler = (config: IHttpServiceConfig) => (err: Error, req: Request, res: Response, next: NextFunction) => {

    if (res.headersSent) {
        return next();
    }

    if(config.errorHandlers?.errorHandler) {
        return config.errorHandlers.errorHandler(err, req, res, next);
    }

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode)

    if (HttpEnvironment.getInstance().environment === EnvironmentProduction) {
        res.json({
            message: 'Whoops... something went wrong.',
        });
        return;
    }

    responseError(req, res, err, statusCode);
};