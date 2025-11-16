import { IHttpServiceConfig } from '@larascript-framework/contracts/http';
import { error } from 'console';
import { NextFunction, Request, Response } from 'express';
import ResourceNotFoundException from '../exceptions/ResourceNotFoundException.js';
import responseError from './responseError.js';

export const baseNotFoundHandler = (config: IHttpServiceConfig) => (req: Request, res: Response, next: NextFunction) => {

    if (res.headersSent) {
        return next();
    }

    if(config.errorHandlers?.notFoundHandler) {
        return config.errorHandlers.notFoundHandler(req, res, next);
    }

    responseError(req, res, new ResourceNotFoundException('Invalid route'), 404);

    next(error);
};
