export class EventMockException extends Error {

    constructor(message: string = 'Mock Exception') {
        super(message);
        this.name = 'MockException';
    }

}