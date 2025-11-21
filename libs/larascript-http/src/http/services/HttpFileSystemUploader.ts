import { IHttpFileSystemUploaderConfig, IHttpUploadService, TUploadedFile } from "@larascript-framework/contracts/http";
import { BaseSingleton } from "@larascript-framework/larascript-core";
import fs from "fs";
import path from "path";
import UploadedFile from "../data/UploadedFile.js";
import UploadFileException from "../exceptions/UploadFileException.js";

export class HttpFileSystemUploader extends BaseSingleton<IHttpFileSystemUploaderConfig> implements IHttpUploadService {

    setConfig(config: IHttpFileSystemUploaderConfig): void {
        this.config = config;
    }

    async moveUploadedFile(file: TUploadedFile, destination?: string): Promise<TUploadedFile> {
        const fileName = file.getFilename();
        const filePath = file.getFilepath();

        if (!fileName) {
            throw new UploadFileException("filename not configured");
        }

        if (!filePath) {
            throw new UploadFileException("filepath not configured");
        }

        if(!this.config?.uploadsDirectory) {
            throw new UploadFileException("uploadsDirectory not configured");
        }

        if (!destination) {
            destination = fileName;
        }

        const timestamp = new Date().getTime();
        const uploadsDir = this.config!.uploadsDirectory;
        const targetDir = path.join(uploadsDir, timestamp.toString());
        const targetPath = path.join(targetDir, fileName);

        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        fs.copyFileSync(filePath, targetPath);
        fs.unlinkSync(filePath);
        
        return UploadedFile.create({
            ...file.getData(),
            file: targetPath,
        });
    }
}

export default HttpFileSystemUploader;