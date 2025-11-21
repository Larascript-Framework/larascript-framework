export class EventDriverException extends Error {

    constructor(message: string = 'Event Driver Exception') {
        super(message);
        this.name = 'EventDriverException';
    }

}