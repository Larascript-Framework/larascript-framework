import AWS from "aws-sdk";

export class S3Service {
    /**
     * Initializes and returns an AWS S3 client instance with configured credentials
     * @returns {AWS.S3} Configured AWS S3 client instance
     */
    public static getS3(accessKeyId: string, secretAccessKey: string, region: string): AWS.S3 {
        AWS.config.update({
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
            region: region,
        });
        return new AWS.S3();
    }

}