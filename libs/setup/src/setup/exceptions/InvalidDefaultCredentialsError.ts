export class InvalidDefaultCredentialsError extends Error {

    constructor(message: string = 'The default credentials are invalid or could not be found') {
        super(message);
        this.name = 'InvalidDefaultCredentialsError';
    }

}

export default InvalidDefaultCredentialsError;