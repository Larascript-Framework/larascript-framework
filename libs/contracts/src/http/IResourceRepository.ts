import { IEloquent } from "@/database/index.js";

export type IResourceData = {
    [key: string]: unknown;
} & Record<string, unknown>;

export type IResourceRepositoryConfig = {
    [key: string]: unknown;
} & Record<string, unknown>;

export type IResourceRepositoryConstructor<
T extends IResourceData = IResourceData,
C extends IResourceRepositoryConfig = IResourceRepositoryConfig
> = new (config?: C) => IResourceRepository<T, C>;

export type ISortOption = {
    field: string;
    sortDirection: 'asc' | 'desc';
}

export type IResourceQueryCallback = (query: IEloquent) => IEloquent;
export type IResourceQuery = object | null | IResourceQueryCallback; 

export interface IResourceRepository<
    T extends IResourceData = IResourceData,
    C extends IResourceRepositoryConfig = IResourceRepositoryConfig
> {
    setConfig(config: C): void;
    getConfig(): C;
    getResource(id: string): Promise<T | undefined>;
    createResource(data: T): Promise<T>;
    createResourceWithoutSaving(data: T): Promise<T>;
    updateResource(data: T): Promise<T>;
    deleteResource(data: T): Promise<void>;
    getResources(query: IResourceQuery, sortOptions?: ISortOption[]): Promise<T[]>;
    getResourcesCount(query?: IResourceQuery): Promise<number>;
    getResourcesPage(query: IResourceQuery, page: number, limit: number, sortOptions?: ISortOption[]): Promise<T[]>;
    getResourceOwnerAttribute(): string;
    stripSensitiveData(data: T): Promise<T>;
}

