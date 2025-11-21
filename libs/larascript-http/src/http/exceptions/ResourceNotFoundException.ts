import { AbstractHttpException } from "../base/AbstractHttpException.js";

export class ResourceNotFoundException extends AbstractHttpException {
    code = 404;

    constructor(message: string) {
        super(message);
        this.name = 'ResourceNotFoundException';
    }

}

export default ResourceNotFoundException;