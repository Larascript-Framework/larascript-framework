export class RouteConfigException extends Error {

    constructor(message: string = 'Route Config Exception') {
        super(message);
        this.name = 'RouteConfigException';
    }

}

export default RouteConfigException;