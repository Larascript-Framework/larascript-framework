export class EventInvalidPayloadException extends Error {

    constructor(message: string = 'Invalid payload') {
        super(message);
        this.name = 'EventInvalidPayloadException';
    }

}