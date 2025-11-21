import { IHttpS3UploaderConfig, IHttpUploadService, TUploadedFile } from "@larascript-framework/contracts/http";
import { BaseSingleton } from "@larascript-framework/larascript-core";
import AWS from "aws-sdk";
import fs from "fs";
import path from "path";
import UploadedFile from "../data/UploadedFile.js";
import UploadFileException from "../exceptions/UploadFileException.js";
import { S3Service } from "./S3Service.js";

export class HttpS3Uploader extends BaseSingleton<IHttpS3UploaderConfig> implements IHttpUploadService {

    setConfig(config: IHttpS3UploaderConfig): void {
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

        if(!this.config?.bucketName) {
            throw new UploadFileException("uploadsDirectory not configured");
        }

        if(!this.config?.region) {
            throw new UploadFileException("region not configured");
        }

        if(!this.config?.accessKeyId) {
            throw new UploadFileException("accessKeyId not configured");
        }

        if(!this.config?.secretAccessKey) {
            throw new UploadFileException("secretAccessKey not configured");
        }

        if (!destination) {
            destination = fileName;
        }

        const timestamp = new Date().getTime();
        const uploadsDir = this.config!.tempUploadsDirectory;
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

        const defaultS3Key = path.basename(targetPath);
        const s3Key = this.config?.filename ? this.config?.filename(file, targetPath) : defaultS3Key;

        const s3 = this.getS3();
        await s3.upload({
            Bucket: this.config!.bucketName,
            Key: s3Key,
            Body: fs.createReadStream(targetPath),
        }).promise();

        const presignedUrl = await s3.getSignedUrl('getObject', {
            Bucket: this.config!.bucketName,
            Key: s3Key,
        });

        fs.unlinkSync(targetPath);
        
        return UploadedFile.create({
            ...file.getData(),
            file: presignedUrl,
            filename: s3Key,
        });
    }

   /**
   * Initializes and returns an AWS S3 client instance with configured credentials
   * @returns {AWS.S3} Configured AWS S3 client instance
   */
  protected getS3(): AWS.S3 {
    return S3Service.getS3(this.config!.accessKeyId, this.config!.secretAccessKey, this.config!.region);
  }

}

export default HttpS3Uploader;