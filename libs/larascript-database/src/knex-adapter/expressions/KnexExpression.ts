import BaseExpression from "@/eloquent/base/BaseExpression.js";
import { Knex } from "knex";
import BindingsHelper from "./BindingsHelper.js";

export class KnexExpression extends BaseExpression<BindingsHelper> {

    private knex: Knex;

    bindingsUtility: BindingsHelper = new BindingsHelper();

    private constructor(knex: Knex) {
        super();
        this.knex = knex;
    }

    static create(knex: Knex): KnexExpression {
        return new KnexExpression(knex);
    }

    build<T = unknown>(): T {
        return {
            select: () => this.buildSelect(),
            insert: () => this.buildInsert(),
            update: () => this.buildUpdate(),
            delete: () => this.buildDelete(),
          }[this.buildType]() as T;
    }

    buildSelect(): Knex.QueryBuilder {
        const query = this.knex.select();
        const columns = (this.columns ?? []).filter(c => c.column).map((column) => column.column);

        // Set the columns
        if (columns.length > 0) {
            query.column(columns);
        }

        // Set the order by
        if ((this.orderByClauses ?? []).length > 0) {
            for(const orderBy of this.orderByClauses ?? []) {
                query.orderBy(orderBy.column, orderBy.direction);
            }
        }

        // Add where clauses
        if ((this.whereClauses ?? []).length > 0) {
            this.addWhereClauses(query);
        }

        // Set the limit
        if (this.offsetLimit?.limit) {
            query.limit(this.offsetLimit.limit);
        }

        // Set the offset
        if (this.offsetLimit?.offset) {
            query.offset(this.offsetLimit.offset);
        }

        // Set the table
        return query.select().from(this.table) as unknown as Knex.QueryBuilder;
    }

    addWhereClauses(query: Knex.QueryBuilder): Knex.QueryBuilder {
        for(const where of this.whereClauses ?? []) {
            if (where.operator === "=") {
                query.where(where.column, where.operator, where.value);
            } else if (where.operator === "!=") {
                query.orWhere(where.column, where.operator, where.value);
            } else if(where.operator === "in") {
                query.whereIn(where.column, where.value as string[]);
            } else if(where.operator === "not in") {
                query.whereNotIn(where.column, where.value as string[]);
            } else if(where.operator === "is null") {
                query.whereNull(where.column);
            } else if(where.operator === "is not null") {
                query.whereNotNull(where.column);
            } else {
                throw new Error(`Invalid operator: ${where.operator}`);
            }
        }
        return query;
    }

    buildInsert(): string {
        throw new Error("Method not implemented.");
    }

    buildUpdate(): string {
        throw new Error("Method not implemented.");
    }
    
    buildDelete(): string {
        throw new Error("Method not implemented.");
    }

    getBindingValues(): unknown[] {
        return this.bindingsUtility.getBindings().map(({ value }) => value);
    }
}