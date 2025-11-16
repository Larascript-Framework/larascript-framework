export class HttpContextException extends Error {

    constructor(message: string) {
        super(message);
        this.name = 'HttpContextException';
    }

}

export default HttpContextException;