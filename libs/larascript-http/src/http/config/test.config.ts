import { IHttpServiceConfig } from "@larascript-framework/contracts/http";
import path from "path";

export const testConfig: IHttpServiceConfig = {
    enabled: true,
    port: 0, // Use dynamic port allocation
    beforeAllMiddlewares: [],
    afterAllMiddlewares: [],
    extendExpress: () => {},
    uploads: {
        driver: 'filesystem',
        config: {
            filesystem: {
                uploadsDirectory: path.join(process.cwd(), 'storage', 'uploads'),
            },
            s3: {
                tempUploadsDirectory: path.join(process.cwd(), 'storage', 'uploads'),
                bucketName: process.env.S3_BUCKET ?? '',
                region: process.env.S3_REGION ?? '',
                accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
            },
        },
    },
}