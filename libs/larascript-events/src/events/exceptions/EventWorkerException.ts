export class EventWorkerException extends Error {

    constructor(message: string = 'Event Worker Exception') {
        super(message);
        this.name = 'EventWorkerException';
    }

}