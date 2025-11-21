import { IDatabaseService, IEloquent, ModelConstructor, TOperator, TWhereClause, TWhereClauseValue } from "@larascript-framework/larascript-database";
import { ValidatorServices } from "@larascript-framework/larascript-validator";
import { IRule } from "../interfaces/index.js";
import AbstractRuleHttpContext from "./AbstractRuleHttpContext.js";

/**
 * Options for configuring an AbstractDatabaseRule
 */
type TAbstractDatabaseRuleOptions = {
    modelConstructor: ModelConstructor;
}

/**
 * Abstract base class for database validation rules.
 * Provides functionality to build database queries for validation purposes.
 * 
 * @template Options - The configuration options type extending TAbstractDatabaseRuleOptions
 */
abstract class AbstractDatabaseRule<Options extends TAbstractDatabaseRuleOptions> extends AbstractRuleHttpContext<Options> implements IRule {

    /**
     * Creates a new instance of AbstractDatabaseRule
     * 
     * @param modelConstructor - The model constructor to use for database operations
     */
    constructor(modelConstructor: ModelConstructor, additionalOptions?: object) {
        super();
        this.options = {
            ...(this.options ?? {}),
            ...(additionalOptions ?? {}),
            modelConstructor: modelConstructor,
        };

        if(ValidatorServices.getInstance().getDatabaseService() === undefined) {
            throw new Error('Database service is not initialized');
        }
        if(ValidatorServices.getInstance().getEloquentQueryBuilderService() === undefined) {
            throw new Error('Eloquent query builder service is not initialized');
        }
    }

    /**
     * Gets the query builder instance used to construct database queries
     * @returns The Eloquent query builder instance
     */
    get builder(): IEloquent {
        return ValidatorServices.getInstance().queryBuilder(this.options.modelConstructor);
    }

    /**
     * Gets the database service instance
     * @returns The database service instance
     */
    get db(): IDatabaseService {
        return ValidatorServices.getInstance().getDatabaseService();
    }

    /**
     * Adds a where clause to the query builder
     * 
     * @param column - The column to filter on
     * @param operator - The comparison operator to use
     * @param value - The value to compare against
     * @returns This instance for method chaining
     */
    public where(column: TWhereClause['column'], operator: TOperator, value: TWhereClauseValue): this {
        this.builder.where(column, operator, value);
        return this;
    }

    /**
     * Gets the current query builder instance
     * 
     * @returns The Eloquent query builder instance
     */
    public query(): IEloquent {
        return this.builder;
    }

}

export default AbstractDatabaseRule; 