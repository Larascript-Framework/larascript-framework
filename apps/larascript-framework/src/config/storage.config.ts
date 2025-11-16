import { IStorageConfig } from "@larascript-framework/larascript-storage";

/**
 * Storage configuration object
 * 
 * @type {IStorageConfig}
 * @ref https://github.com/larascript-framework/larascript-storage
 */
export const config: IStorageConfig = {
    driver: process.env.STORAGE_DRIVER ?? 'fs',
    storageDir: 'storage',
    uploadsDir: 'storage/uploads',
    s3: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
        bucket: process.env.S3_BUCKET ?? '',
        region: process.env.S3_REGION ?? ''
    }
} as  const

