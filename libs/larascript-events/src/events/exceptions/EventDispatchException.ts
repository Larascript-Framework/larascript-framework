export class EventDispatchException extends Error {

    constructor(message: string = 'Event Dispatch Exception') {
        super(message);
        this.name = 'EventDispatchException';
    }

}