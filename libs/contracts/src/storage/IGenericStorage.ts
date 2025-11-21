import { IStorageFile } from "./IStorageFile.js";
import { IStorageService } from "./IStorageService.js";

export interface IGenericStorage {
  getStorageService(): IStorageService;
  put(file: IStorageFile | string, destination?: string): Promise<IStorageFile>;
  get(file: IStorageFile | string, ...args: unknown[]): Promise<IStorageFile>;
  delete(file: IStorageFile | string): Promise<void>;
}
