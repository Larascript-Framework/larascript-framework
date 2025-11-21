import { TUploadedFile, TUploadedFileData } from "@larascript-framework/contracts/http";
import fs from 'fs';

export class UploadedFile implements TUploadedFile {

    data: TUploadedFileData;

    constructor(data: TUploadedFileData) {
        this.data = data
    }

    static create(data: TUploadedFileData): UploadedFile {
        return new UploadedFile(data)
    }

    getFilename(): string {
        return this.data?.filename
    }

    getMimeType(): string {
        return this.data?.mimetype
    }

    getFilepath(): string {
        return this.data.file
    }

    getField(): string {
        return this.data.field
    }

    getSizeKb() {
        const stats = fs.statSync(this.getFilepath())
        const fileSizeInBytes = stats.size
        return fileSizeInBytes / 1024
    }

    getSizeBytes() {
        const stats = fs.statSync(this.getFilepath())
        return stats.size
    }

    getData<T>(): T {
        return this.data as T
    }

}

export default UploadedFile