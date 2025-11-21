export class RouteException extends Error {

    constructor(message: string) {
        super(message);
        this.name = 'RouteException';
    }

}

export default RouteException;