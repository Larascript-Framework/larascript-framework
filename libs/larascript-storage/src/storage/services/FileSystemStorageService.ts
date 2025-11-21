import fs from "fs";
import path from "path";
import { BaseGenericStorage } from "../base/BaseGenericStorage.js";
import { StorageFile } from "../data/index.js";
import {
  FileNotFoundException,
  InvalidStorageFileException,
} from "../exceptions/index.js";
import { FileSystemMeta, IGenericStorage, IUploadedFile } from "../interfaces/index.js";
import FileSystemStorageFileParser from "../parser/FileSystemStorageFileParser.js";
import { createFileSystemStorageFile } from "../utils/index.js";

/**
 * Service for handling file system storage operations.
 * Implements the IGenericStorage interface to provide file system-based storage functionality.
 */
export class FileSystemStorageService
  extends BaseGenericStorage
  implements IGenericStorage
{
  /**
   * Helper to determine the StorageFile from an object or string parameter
   */
  parser = new FileSystemStorageFileParser();

  /**
   * Moves an uploaded file to a specified destination
   */
  public async moveUploadedFile(file: IUploadedFile, destination?: string) {
    const fileName = file.getFilename();
    const filePath = file.getFilepath();

    if (!fileName) {
      throw new InvalidStorageFileException("filename not configured");
    }

    if (!filePath) {
      throw new InvalidStorageFileException("filepath not configured");
    }

    if (!destination) {
      destination = fileName;
    }

    const timestamp = new Date().getTime();
    const uploadsDir = this.storageService.getUploadsDirectory();
    const targetDir = path.join(uploadsDir, timestamp.toString());
    const targetPath = path.join(targetDir, fileName);

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir);
    }

    fs.copyFileSync(filePath, targetPath);
    fs.unlinkSync(filePath);

    return createFileSystemStorageFile(
      targetPath,
      this.storageService.getStorageDirectory(),
    );
  }

  /**
   * Retrieves a file from the storage system.
   * @param file - The StorageFile object containing the file information
   * @returns Promise<StorageFile> - A promise that resolves to the retrieved StorageFile
   * @throws {FileNotFoundException} When the file does not exist in the storage system
   */
  async get(file: StorageFile | string): Promise<StorageFile<FileSystemMeta>> {
    const parsedFile = this.parser.parseStorageFileOrString(
      file,
      this.storageService.getStorageDirectory(),
    );

    const filePath = parsedFile.getMetaValue<string>("fullPath");

    if (!filePath) {
      throw new InvalidStorageFileException("fullPath not configured");
    }

    if (!fs.existsSync(filePath)) {
      throw new FileNotFoundException();
    }

    return createFileSystemStorageFile(
      filePath,
      this.storageService.getStorageDirectory(),
    );
  }

  /**
   * Moves a file to a new destination within the storage system.
   * @param file - The StorageFile object to be moved
   * @param destination - The target path where the file should be moved to
   * @returns Promise<StorageFile> - A promise that resolves to the new StorageFile at the destination
   * @throws {FileNotFoundException} When the source file does not exist
   */
  async put(
    file: StorageFile<FileSystemMeta> | string,
    destination: string,
  ): Promise<StorageFile<FileSystemMeta>> {
    file = this.parser.parseStorageFileOrString(
      file,
      this.storageService.getStorageDirectory(),
    ) as StorageFile<FileSystemMeta>;

    // Get the full target path
    const targetPath = path.join(
      this.storageService.getStorageDirectory(),
      destination,
    );

    // Get the project root directory
    const currentFile = file.getMetaValue<string>("fullPath");

    if (!currentFile) {
      throw new InvalidStorageFileException("fullPath not configured");
    }

    if (!fs.existsSync(currentFile)) {
      throw new FileNotFoundException();
    }

    fs.copyFileSync(currentFile, targetPath);
    fs.unlinkSync(currentFile);

    return createFileSystemStorageFile(
      targetPath,
      this.storageService.getStorageDirectory(),
    );
  }

  /**
   * Deletes a file from the storage system.
   * @param file - The StorageFile object to be deleted
   * @returns Promise<void>
   * @throws {FileNotFoundException} When the file does not exist in the storage system
   */
  async delete(file: StorageFile | string): Promise<void> {
    const parsedFile = this.parser.parseStorageFileOrString(
      file,
      this.storageService.getStorageDirectory(),
    );

    const filePath = parsedFile.getMetaValue<string>("fullPath");

    if (!filePath) {
      throw new InvalidStorageFileException("fullPath not configured");
    }

    if (!fs.existsSync(filePath)) {
      throw new FileNotFoundException();
    }

    fs.unlinkSync(filePath);
  }
}

export default FileSystemStorageService;
