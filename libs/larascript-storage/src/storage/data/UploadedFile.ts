import {
  IUploadedFile,
  IUploadedFileAttributes,
} from "../interfaces/index.js";

/**
 * Concrete implementation of an uploaded file.
 * Represents a file that has been uploaded through a form or similar mechanism.
 * Provides access to file metadata and associated data.
 */
export class UploadedFile implements IUploadedFile {
  /**
   * Creates a new UploadedFile instance.
   *
   * @param field - The form field name that was used for the file upload
   * @param filename - The original filename of the uploaded file
   * @param filepath - The temporary file path where the file is stored
   * @param mimeType - The MIME type of the uploaded file
   * @param sizeKb - The size of the file in kilobytes
   * @param data - Additional data associated with the uploaded file
   */
  constructor(
    protected readonly field?: string,
    protected readonly filename?: string,
    protected readonly filepath?: string,
    protected readonly mimeType?: string,
    protected readonly sizeKb?: number,
    protected readonly data?: object,
  ) {}

  /**
   * Creates a new UploadedFile instance from partial attributes.
   * This is a factory method that allows creating an UploadedFile with only some attributes defined.
   *
   * @param data - Partial attributes for creating the UploadedFile
   * @returns A new UploadedFile instance
   */
  public static create(data: Partial<IUploadedFileAttributes>): UploadedFile {
    return new UploadedFile(
      data.field,
      data.filename,
      data.filepath,
      data.mimeType,
      data.sizeKb,
      data.data,
    );
  }

  /**
   * Gets the original filename of the uploaded file.
   * @returns The filename or undefined if not available
   */
  getFilename(): string | undefined {
    return this.filename;
  }

  /**
   * Gets the MIME type of the uploaded file.
   * @returns The MIME type or undefined if not available
   */
  getMimeType(): string | undefined {
    return this.mimeType;
  }

  /**
   * Gets the temporary file path where the file is stored.
   * @returns The file path or undefined if not available
   */
  getFilepath(): string | undefined {
    return this.filepath;
  }

  /**
   * Gets the form field name that was used for the file upload.
   * @returns The field name or undefined if not available
   */
  getField(): string | undefined {
    return this.field;
  }

  /**
   * Gets the size of the file in kilobytes.
   * @returns The file size in KB or undefined if not available
   */
  getSizeKb(): number | undefined {
    return this.sizeKb;
  }

  /**
   * Gets additional data associated with the uploaded file.
   * @returns The associated data or undefined if not available
   */
  getData(): object | undefined {
    return this.data;
  }
}
