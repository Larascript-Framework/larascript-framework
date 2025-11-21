 export type S3Meta = {
  Bucket?: string;
  ETag?: string;
  Key?: string;
  Location?: string;
  ServerSideEncryption?: string;
  presignedUrl?: string;
};

export type FileSystemMeta = {
  fullPath: string;
};
