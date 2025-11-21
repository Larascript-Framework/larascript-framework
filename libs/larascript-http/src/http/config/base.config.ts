import { IHttpServiceConfig } from '@larascript-framework/contracts/http';
import cors from 'cors';
import expressBusboy from 'express-busboy';
import path from 'path';

export const baseConfig: IHttpServiceConfig = {
    enabled: true,
    port: 5000,
    beforeAllMiddlewares: [
        cors()
    ],
    afterAllMiddlewares: [],
    extendExpress: (app) => {
        expressBusboy.extend(app, {
            upload: true,
            path: path.join(process.cwd(), 'storage', 'tmp'),
            allowedPath: /./
        })
    },
    csrf: {},
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