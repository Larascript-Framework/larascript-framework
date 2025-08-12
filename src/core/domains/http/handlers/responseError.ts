import { appEnv } from '@ben-shepherd/larascript-core';
import { app } from '@src/core/services/App';
import { Request, Response } from 'express';

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
export default (req: Request, res: Response, err: Error, code: number = 500) => {
    if (appEnv() === 'production') {
        res.status(code).send({ error: 'Something went wrong' })
        return;
    }

    app('logger').error(err, err.stack)

    // Format the stack trace by splitting it into an array of lines
    const stackLines = err.stack ? err.stack.split('\n').map(line => line.trim()) : [];

    res.status(code).send({
        error: err.message,
        stack: stackLines
    })
}