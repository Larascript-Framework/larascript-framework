## Resource Repository

When implementing your own resource repository, you must implement the `IResourceRepository` interface.

```ts
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
```

## Recomendations

Write tests for your resource repository to ensure it works as expected.

You can see how this package has written it's test by looking at the `/src/tests/repository.test.ts` file.

## Example Resource Repository

You can see how this package implements the `IResourceRepository` by peering into the `DatabaseResourceRepository` class.

```ts
import { HttpEnvironment } from "@/http/environment/HttpEnvironment.js";
import ResourceException from "@/http/exceptions/ResourceException.js";
import { IEloquent, TWhereClauseValue } from "@larascript-framework/contracts/database/eloquent";
import { IModel } from "@larascript-framework/contracts/database/model";
import { DatabaseResourceRepositoryConfig, IDatabaseResourceRepository, IResourceData, IResourceQuery, ISortOption } from "@larascript-framework/contracts/http";
import { Model } from "@larascript-framework/larascript-database";
import { AbstractResourceRepository } from "../abstract/AbstractResourceRepository.js";

/**
 * Repository for CRUD operations backed by the Eloquent query builder.
 * It adapts a model constructor into the generic resource repository interface.
 */
export class DatabaseResourceRepository extends AbstractResourceRepository implements IDatabaseResourceRepository
{
    declare config: DatabaseResourceRepositoryConfig;
    
    /**
     * Create a new repository with the provided configuration.
     * @param config Repository configuration including the model constructor.
     */
    constructor(config: DatabaseResourceRepositoryConfig) {
        super(config);
    }
    
    /**
     * Returns an `IEloquent` query builder for the configured model.
     */
    get queryBuilder(): IEloquent<IModel> {
        return HttpEnvironment.getInstance().queryBuilderService.builder(this.config.modelConstructor);
    }

    /**
     * The primary key field name for the configured model.
     */
    get primaryKey(): string {
        return this.config.modelConstructor.getPrimaryKey();
    }

    /**
     * Fetch a single resource by id.
     * @param id Resource identifier.
     * @returns Resource data or undefined when not found.
     */
    async getResource(id: string): Promise<IResourceData | undefined> {
        return await this.toObject(
            (await this.queryBuilder.where(this.primaryKey, id).first()) ?? undefined
        );
    }

    /**
     * Create a new resource.
     * @param data Resource payload to create.
     * @returns Newly created resource as a plain object.
     */
    async createResource(data: IResourceData): Promise<IResourceData> {
        const resource = this.config.modelConstructor.create(data)
        await resource.save();
        await resource.refresh();

        return await this.toObject(
            resource
        ) as IResourceData;
    }

    /**
     * Create a new resource without saving it.
     * @param data Resource payload to create.
     * @returns Newly created resource as a plain object.
     */
    async createResourceWithoutSaving(data: IResourceData): Promise<IResourceData> {
        const resource = this.config.modelConstructor.create(data);
        return await this.toObject(resource) as IResourceData;
    }

    /**
     * Get the resource owner attribute.
     * @returns Resource owner attribute.
     */
    getResourceOwnerAttribute(): string {
        return 'userId';
    }

    /**
     * Update an existing resource by id.
     * @param id Resource identifier.
     * @param data Partial resource payload to update.
     * @throws {ResourceException} When the resource cannot be found.
     * @returns Updated resource as a plain object.
     */
    async updateResource(data: IResourceData): Promise<IResourceData> {
        const primaryKeyValue = data[this.primaryKey];

        if(!primaryKeyValue) {
            throw new ResourceException('Primary key (' + this.primaryKey + ') value is required');
        }

        const resource = await this.queryBuilder.where(this.primaryKey, primaryKeyValue as unknown as TWhereClauseValue).first();

        if(!resource) {
            throw new ResourceException('Resource not found');
        }

        await resource.fill(data);
        await resource.save();
        await resource.refresh();

        return await this.toObject(resource) as IResourceData;
    }

    /**
     * Delete a resource by id.
     * @param id Resource identifier.
     * @throws {ResourceException} When the resource cannot be found.
     */
    async deleteResource(data: IResourceData): Promise<void> {
        const primaryKeyValue = data[this.primaryKey];

        if(!primaryKeyValue) {
            throw new ResourceException('Primary key (' + this.primaryKey + ') value is required');
        }

        const resource = await this.queryBuilder.where(this.primaryKey, primaryKeyValue as unknown as TWhereClauseValue).first();

        if(!resource) {
            throw new ResourceException('Resource not found');
        }

        await resource.delete();
    }

    /**
     * Retrieve resources that match the provided query.
     * @param query Filter conditions.
     * @returns Array of matching resources as plain objects.
     */
    async getResources(query: IResourceQuery, sortOptions?: ISortOption[]): Promise<IResourceData[]> {
        const builder = this.applyQuery(this.queryBuilder, query);

        if(sortOptions) {
            sortOptions.forEach(sortOption => {
                builder.orderBy(sortOption.field, sortOption.sortDirection);
            });
        }

        return await this.toObjectArray(
            (await builder.get()).toArray()
        ) as IResourceData[];
    }

    /**
     * Count resources that match the provided query.
     * @param query Filter conditions.
     * @returns The total number of matching resources.
     */
    async getResourcesCount(query?: IResourceQuery): Promise<number> {
        const builder = this.applyQuery(this.queryBuilder, query ?? {});
        return await builder.count();
    }
    
    /**
     * Retrieve a paginated list of resources for a given query.
     * @param query Filter conditions.
     * @param page 1-based page number.
     * @param limit Number of items per page.
     * @returns Resources for the requested page as plain objects.
     */
    async getResourcesPage(query: IResourceQuery, page: number, limit: number, sortOptions?: ISortOption[]): Promise<IResourceData[]> {
        
        const skip = (page - 1) * limit;
        const builder = this.applyQuery(this.queryBuilder, query).skip(skip).take(limit);

        if(sortOptions) {
            sortOptions.forEach(sortOption => {
                builder.orderBy(sortOption.field, sortOption.sortDirection);
            });
        }
        
        return await this.toObjectArray(
            (await builder.get()).toArray()
        ) as IResourceData[];
    }
    
    /**
     * Convert a model instance to a resource object.
     * @param model Model instance to convert.
     * @returns Resource object or undefined when model is undefined.
     */
    private async toObject(model?: IModel): Promise<IResourceData | undefined> {
        if(!model) {
            return undefined;
        }
        return await model.toObject() as IResourceData;
    }

    /**
     * Convert a list of models into resource objects.
     * @param models List of model instances to convert.
     * @returns Array of resource objects.
     */
    private async toObjectArray(models?: IModel[]): Promise<IResourceData[]> {
        if(!models) {
            return [];
        }
        return await Promise.all(models.map(async (model) => await this.toObject(model))) as IResourceData[];
    }

    /**
     * Strip sensitive data from a resource object.
     * @param data Resource object to strip sensitive data from.
     * @returns Resource object with sensitive data stripped.
     */
    async stripSensitiveData(data: IResourceData): Promise<IResourceData> {
        if(data instanceof Model) {
            return data.toObject({ excludeGuarded: true }) as unknown as IResourceData;
        }
        return this.config.modelConstructor.create(data).toObject({ excludeGuarded: true }) as unknown as IResourceData;
    }

    /**
     * Applies the query to the builder.
     * @param builder The builder to apply the query to.
     * @param query The query to apply.
     * @returns The builder with the query applied.
     */
    private applyQuery(builder: IEloquent, query: IResourceQuery): IEloquent {
        if(!query) {
            return builder;
        }
        if(typeof query === 'function') {
            builder = query(builder);
        }
        else if(typeof query === 'object') {
            builder = this.applyObjectQueryToEloquent(query, builder);
        }

        return builder.clone();
    }

    /**
     * Applies the object query to the builder.
     * @param query The query to apply.
     * @param builder The builder to apply the query to.
     * @returns The builder with the query applied.
     */
    private applyObjectQueryToEloquent(query: object, builder: IEloquent): IEloquent {
        Object.keys(query).forEach(key => {
            const value = query[key];
            const containsStartOrEndPercentSign = value.startsWith('%') || value.endsWith('%');

            if(containsStartOrEndPercentSign) {
                builder.where(key, 'like', value);
            }
            else {
                builder.where(key, value);
            }
        });
        return builder;
    }
}
```