import { Collection, ICollection, collect } from "@ben-shepherd/larascript-collection-bundle";
import { IEloquent } from "@src/core/domains/eloquent/interfaces/IEloquent";
import { queryBuilder } from "@src/core/domains/eloquent/services/EloquentQueryBuilderService";
import { IModel, ModelConstructor } from "@src/core/domains/models/interfaces/IModel";
import ModelNotFound from "@src/core/exceptions/ModelNotFound";
import { IRepository } from "@src/core/interfaces/IRepository";

/**
 * Base class for repositories
 */
export default class Repository<Model extends IModel> implements IRepository<Model> {

    /**
     * The model constructor
     */
    public modelConstructor: ModelConstructor<Model>;

    /**
     * The connection to use for queries
     */
    public connection!: string;

    /**
     * Constructor
     * @param collectionName The name of the collection/table
     * @param modelConstructor The model constructor
     */
    constructor(modelConstructor: ModelConstructor<Model>, connectionName?: string) {
        this.connection = connectionName ?? modelConstructor.getConnectionName()
        this.modelConstructor = modelConstructor;
    }

    /**
     * Returns a new query builder instance that is a clone of the existing one.
     * @returns A new query builder instance.
     */
    protected query(): IEloquent<Model> {
        return queryBuilder(this.modelConstructor, this.connection);
    }

    /**
     * Set the model constructor
     * @param modelCtor The model constructor
     */
    protected setModelCtor(modelCtor: ModelConstructor<Model>) {
        this.modelConstructor = modelCtor;
    }

    /**
     * Adds relationships to the model/collection
     * @param results 
     * @param args 
     * @returns 
     */
    protected async withRelationships(results: IModel | ICollection, args: Parameters<IModel['loadRelationships']>[0]): Promise<ICollection<IModel>> {
        const resultsAsCollection = results instanceof Collection ? results : collect([results])

        for(const k in resultsAsCollection.toArray()) {
            await results[k].loadRelationships(args)
        }

        return results as ICollection<IModel>
    }
    
    /**
     * Find or fail if no document found
     * @param filter The filter to use for the search
     * @returns The found model or throws a ModelNotFound exception
     * @throws ModelNotFound
     */
    async findOrFail(filter: object): Promise<Model> {
        const model = await this.findOne(filter)

        if(!model) {
            throw new ModelNotFound()
        }

        return model
    }

    /**
     * Find document by id
     * @param id The id of the document to find
     * @returns The found model or null
     */
    async findById(id: string): Promise<Model | null> {
        return await this.query().find(id)
    }

    /**
     * Find a single document
     * @param filter The filter to use for the search
     * @returns The found model or null
     */
    async findOne(filter: object = {}): Promise<Model | null> {
        const builder = await this.query();

        Object.keys(filter).forEach(key => {
            builder.where(key, filter[key]);
        })

        return await builder.first();
    }

    /**
     * Find multiple documents
     * @param filter The filter to use for the search
     * @param options The options to use for the query
     * @returns The found models
     */
    async findMany(filter: object = {}): Promise<Model[]> {
        const builder = this.query();

        Object.keys(filter).forEach(key => {
            builder.where(key, filter[key]);
        })

        return (await builder.get()).toArray()
    }

}
