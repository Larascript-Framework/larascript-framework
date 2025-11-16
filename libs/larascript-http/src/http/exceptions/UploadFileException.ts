export class UploadFileException extends Error {

    constructor(message: string = 'Upload file exception') {
        super(message);
        this.name = 'UploadFileException';
    }

}

export default UploadFileException;