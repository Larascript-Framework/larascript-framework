import { IBaseModel, IBaseModelConstructor } from "@/test-helpers/BaseModel.js";

/**
 * Interface defining the contract for an in-memory repository that manages base models.
 * Provides both synchronous and asynchronous methods for CRUD operations.
 *
 * @template T - The type of the base model that extends IBaseModel
 */
export interface IBaseInMemoryRepository<T extends IBaseModel> {
  findOne(where: string, value: unknown): Promise<T | null>;
  findOneSync(where: string, value: unknown): T | null;

  findById(id: string): Promise<T | null>;
  findByIdSync(id: string): T | null;

  findMany(where: string, value: unknown): Promise<T[]>;
  findManySync(where: string, value: unknown): T[];

  update(
    where: string,
    value: unknown,
    data: Partial<T["attributes"]>,
  ): Promise<void>;
  updateSync(
    where: string,
    value: unknown,
    data: Partial<T["attributes"]>,
  ): void;

  delete(where: string, value: unknown): Promise<void>;
  deleteSync(where: string, value: unknown): void;

  setRecords(data: T[]): Promise<void>;
  setRecordsSync(data: T[]): void;

  getRecords(): Promise<T[]>;
  getRecordsSync(): T[];

  clearRecords(): Promise<void>;
  clearRecordsSync(): void;
}

/**
 * Abstract base class for implementing in-memory repositories.
 * Provides a complete implementation of the IBaseInMemoryRepository interface
 * with both synchronous and asynchronous methods for CRUD operations.
 *
 * This class is designed for testing purposes and stores all data in memory.
 *
 * @template T - The type of the base model that extends IBaseModel
 *
 * @example
 * ```typescript
 * class UserRepository extends BaseInMemoryRepository<User> {
 *   constructor() {
 *     super(User);
 *   }
 * }
 *
 * const userRepo = new UserRepository();
 * const user = await userRepo.create({ id: '1', name: 'John', email: 'john@example.com' });
 * const foundUser = await userRepo.findById('1');
 * ```
 */
export abstract class BaseInMemoryRepository<T extends IBaseModel>
  implements IBaseInMemoryRepository<T>
{
  protected records: T[] = [];

  constructor(protected model: IBaseModelConstructor<T>) {}

  async findOne(where: string, value: unknown): Promise<T | null> {
    return this.findOneSync(where, value);
  }

  findOneSync(where: string, value: unknown): T | null {
    return (
      this.records.find((item) => item.getAttributes()[where] === value) ?? null
    );
  }

  async findById(id: string): Promise<T | null> {
    return this.findByIdSync(id);
  }

  findByIdSync(id: string): T | null {
    return this.records.find((item) => item.getId() === id) ?? null;
  }

  async findMany(where: string, value: unknown): Promise<T[]> {
    return this.findManySync(where, value);
  }

  findManySync(where: string, value: unknown): T[] {
    return this.records.filter((item) => item.getAttributes()[where] === value);
  }

  async create(attributes: T["attributes"]): Promise<T> {
    return this.createSync(attributes);
  }

  createSync(attributes: T["attributes"]): T {
    const item = new this.model(attributes);
    this.records.push(item);
    return item;
  }

  async update(
    where: string,
    value: unknown,
    data: Partial<T["attributes"]>,
  ): Promise<void> {
    this.updateSync(where, value, data);
  }

  updateSync(
    where: string,
    value: unknown,
    data: Partial<T["attributes"]>,
  ): void {
    this.records = this.records.map((item) => {
      if (item.getAttributes()[where] === value) {
        item.setAttributes({ ...item.getAttributes(), ...data });
      }
      return item;
    });
  }

  async delete(where: string, value: unknown): Promise<void> {
    this.deleteSync(where, value);
  }

  deleteSync(where: string, value: unknown): void {
    this.records = this.records.filter(
      (item) => item.getAttributes()[where] !== value,
    );
  }

  async setRecords(data: T[]): Promise<void> {
    this.setRecordsSync(data);
  }

  setRecordsSync(data: T[]): void {
    this.records = data;
  }

  async clearRecords(): Promise<void> {
    this.clearRecordsSync();
  }

  clearRecordsSync(): void {
    this.records = [];
  }

  async getRecords(): Promise<T[]> {
    return this.records;
  }

  getRecordsSync(): T[] {
    return this.records;
  }
}
