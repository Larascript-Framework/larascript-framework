export class ResourceException extends Error {

    constructor(message: string) {
        super(message);
        this.name = 'ResourceException';
    }

}

export default ResourceException;