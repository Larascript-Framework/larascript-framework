export class EventNotDispatchedException extends Error {

    constructor(message: string = 'Event Not Dispatched Exception') {
        super(message);
        this.name = 'EventNotDispatchedException';
    }

}