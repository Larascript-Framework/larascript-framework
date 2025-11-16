import { HttpEnvironment } from '@/http/environment/HttpEnvironment.js';
import { Request, Response } from 'express';
import { AbstractHttpException } from '../base/AbstractHttpException.js';

/**
 * Utility function to send an error response to the client.
 *
 * If the app is not in production mode, the error is logged to the console.
 *
 * @param req Express Request object
 * @param res Express Response object
 * @param err The error to log and send
 * @param code The HTTP status code to send (default: 500)
 */
export const responseError = (req: Request, res: Response, err: Error, code?: number) => {

    if(res.headersSent) {
        return;
    }

    if (typeof code === 'undefined' && err instanceof AbstractHttpException) {
        code = err.code
    }
    if (typeof code === 'undefined') {
        code = 500
    }

    if (HttpEnvironment.getInstance().environment === 'production') {
        res.status(code).send({ error: 'Something went wrong' })
        return;
    }

    HttpEnvironment.getInstance().loggerService?.error(err, err.stack)

    // Format the stack trace by splitting it into an array of lines
    const stackLines = err.stack ? err.stack.split('\n').map(line => line.trim()) : [];

    res.status(code).send({
        error: err.message,
        stack: stackLines
    })
}

export default responseError;