export default class MissingSecurityError extends Error {

    constructor(message: string = 'Missing security for this route') {
        super(message);
        this.name = 'MissingSecurityError';
    }

}