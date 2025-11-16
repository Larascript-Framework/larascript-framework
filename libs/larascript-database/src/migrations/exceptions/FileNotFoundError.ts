export default class FileNotFoundError extends Error {

    constructor(message: string = 'File not found') {
        super(message);
        this.name = 'FileNotFoundError';
    }

}