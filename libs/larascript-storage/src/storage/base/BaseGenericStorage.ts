import { IStorageService } from "../interfaces/index.js";

export abstract class BaseGenericStorage {
  constructor(protected readonly storageService: IStorageService) {}

  getStorageService(): IStorageService {
    return this.storageService;
  }
}
