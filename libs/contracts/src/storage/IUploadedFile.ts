export interface IUploadedFileAttributes {
  filename?: string;
  mimeType?: string;
  filepath?: string;
  field?: string;
  sizeKb?: number;
  data?: object;
}

export type IUploadedFile<Data extends object = object> = {
  getFilename(): string | undefined;
  getMimeType(): string | undefined;
  getFilepath(): string | undefined;
  getField(): string | undefined;
  getSizeKb(): number | undefined;
  getData(): Data | undefined;
};
