import path from "path";
import { StorageFile } from "../data/index.js";
import { StorageTypes } from "../enums/index.js";
import { FileSystemMeta } from "../interfaces/index.js";

/**
 * Converts an absolute path to a relative path within the storage directory.
 * @param path - The absolute path to convert
 * @param storageDirectory - The storage directory path
 * @returns string - The relative path
 * @protected
 */
export const toRelativePath = (
  path: string,
  storageDirectory: string,
): string => {
  return path.replace(storageDirectory, "");
};

/**
 * Converts a relative path to an absolute path within the storage directory.
 * @param relativePath - The relative path to convert
 * @param storageDirectory - The storage directory path
 * @returns string - The absolute path
 * @protected
 */
export const toAbsolutePath = (
  relativePath: string,
  storageDirectory: string,
): string => {
  return path.join(storageDirectory, relativePath);
};

/**
 * Creates a storage file object
 * @param fullPath - The full path to the file
 * @param storageDirectory - The storage directory path
 * @returns StorageFile instance
 */
export const createFileSystemStorageFile = (
  fullPath: string,
  storageDirectory: string,
): StorageFile<FileSystemMeta> => {
  const key = toRelativePath(fullPath, storageDirectory);

  return new StorageFile({
    key,
    meta: {
      fullPath,
    },
    source: StorageTypes.fs,
  });
};
