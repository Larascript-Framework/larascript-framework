import { AbstractRule, IRule } from "@ben-shepherd/larascript-validator-bundle";
import { IEloquent, TOperator, TWhereClause, TWhereClauseValue } from "@src/core/domains/eloquent/interfaces/IEloquent";
import { queryBuilder } from "@src/core/domains/eloquent/services/EloquentQueryBuilderService";
import { ModelConstructor } from "@src/core/domains/models/interfaces/IModel";

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
abstract class AbstractDatabaseRule<Options extends TAbstractDatabaseRuleOptions> extends AbstractRule<Options> implements IRule {

    /**
     * The query builder instance used to construct database queries
     * @protected
     */
    protected builder!: IEloquent;

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
        this.builder = queryBuilder(this.options.modelConstructor);
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