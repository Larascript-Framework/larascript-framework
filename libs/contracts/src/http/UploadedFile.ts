export type TUploadedFile<Data extends object = TUploadedFileData> = {
    getFilename(): string;
    getMimeType(): string;
    getFilepath(): string;
    getField(): string;
    getSizeKb(): number;
    getSizeBytes(): number;
    getData(): Data
}

/**
 * Based on expected types using yahoo/express-busboy
 * 
 * @ref https://www.npmjs.com/package/express-busboy
 */
export type TUploadedFileData = {
    done: boolean;
    encoding: string;
    field: string;
    file: string;
    filename: string;
    mimetype: string;
    truncated: boolean;
    uuid: string;
}