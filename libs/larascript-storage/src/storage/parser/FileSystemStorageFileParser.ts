import fs from "fs";
import StorageFile from "../data/StorageFile.js";
import { FileNotFoundException } from "../exceptions/FileNotFoundException.js";
import { InvalidStorageFileException } from "../exceptions/InvalidStorageFileException.js";
import { FileSystemMeta, IStorageFile, S3Meta } from "../interfaces/index.js";
import {
  createFileSystemStorageFile,
  toAbsolutePath,
} from "../utils/StorageUtils.js";

class FileSystemStorageFileParser {
  public parseStorageFileOrStringS3(
    file: StorageFile | string,
  ): StorageFile<S3Meta> {
    if (typeof file === "object") {
      return file as StorageFile<S3Meta>;
    }

    if (typeof file === "string") {
      // For S3 operations, treat string as S3 key
      return new StorageFile({
        key: file,
        source: "s3",
        meta: {} as S3Meta,
      });
    }

    throw new InvalidStorageFileException(
      "Unable to determine type of StorageFile from parameter. Expected string or object. Got: " +
        typeof file,
    );
  }

  /**
   * Parses the input and returns a StorageFile instance.
   * If the input is already a StorageFile, it is returned as-is.
   * If the input is a string, attempts to resolve it to a StorageFile.
   */
  public parseStorageFileOrString(
    file: IStorageFile | string,
    storageDirectory: string,
  ): StorageFile<FileSystemMeta> {
    if (typeof file === "object") {
      return file as StorageFile<FileSystemMeta>;
    }

    if (typeof file === "string") {
      return this.getStorageFileFromString(file, storageDirectory);
    }

    throw new InvalidStorageFileException(
      "Unable to determine type of StorageFile from parameter. Expected string or object. Got: " +
        typeof file,
    );
  }

  /**
   * Retrieves a StorageFile instance from a given file path string.
   * Attempts to resolve the file path as-is, and if not found, tries to resolve it as a relative path within the storage directory.
   * @param {string} file - The file path or key to resolve.
   * @param {string} storageDirectory - The storage directory path
   * @returns {StorageFile<FileSystemMeta>} The corresponding StorageFile instance.
   * @throws {FileNotFoundException} If the file cannot be found at either path.
   * @protected
   */
  protected getStorageFileFromString(file: string, storageDirectory: string) {
    if (fs.existsSync(file)) {
      return createFileSystemStorageFile(file, storageDirectory);
    }

    const fullPath = toAbsolutePath(file, storageDirectory);

    if (fs.existsSync(fullPath)) {
      return createFileSystemStorageFile(fullPath, storageDirectory);
    }

    throw new FileNotFoundException(
      "Unable to determine the correct file path for: " + file,
    );
  }
}

export default FileSystemStorageFileParser;
