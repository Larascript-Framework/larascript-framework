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
        throw new Error("Use the specific build methods instead.");
    }

    buildSelect(): Knex.QueryBuilder {
        const query = this.knex.select();
        const columns = (this.columns ?? []).filter(c => c.column).map((column) => column.column);

        // Set the columns
        if (columns.length > 0) {
            query.column(columns);
        }

        // Set the order by
        this.addOrderByClauses(query);

        // Add where clauses
        this.addWhereClauses(query);

        // Set the limit
        this.addLimitAndOffsetClauses(query);

        // Set the table
        return query.select().from(this.table) as unknown as Knex.QueryBuilder;
    }

    private addOrderByClauses(query: Knex.QueryBuilder): void {
        for(const orderBy of this.orderByClauses ?? []) {
            query.orderBy(orderBy.column, orderBy.direction);
        }
    }

    private addLimitAndOffsetClauses(query: Knex.QueryBuilder): void {
        if (this.offsetLimit?.limit) {
            query.limit(this.offsetLimit.limit);
        }
        if (this.offsetLimit?.offset) {
            query.offset(this.offsetLimit.offset);
        }
    }

    private addWhereClauses(query: Knex.QueryBuilder): void {
        if ((this.whereClauses ?? []).length === 0) {
            return;
        }

        for(const where of this.whereClauses ?? []) {

            let method: string;

            if(where.logicalOperator === "and") {
                method = "where";
            } else {
                method = "orWhere";
            }

            if(where.operator === "like") {
                if(where.logicalOperator === "and") {
                    method = "whereLike";
                } else {
                    method = "orWhereLike";
                }
            }

            if(where.operator === "not like") {
                if(where.logicalOperator === "and") {
                    method = "whereNotLike";
                } else {
                    method = "orWhereNotLike";
                }
            }

            if(where.operator === "in") {
                if(where.logicalOperator === "and") {
                    method = "whereIn";
                } else {
                    method = "orWhereIn";
                }
            }

            if(where.operator === "not in") {
                if(where.logicalOperator === "and") {
                    method = "whereNotIn";
                } else {
                    method = "orWhereNotIn";
                }
            }


            if (where.operator === "=") {
                query[method](where.column, where.operator, where.value);
            } else if (where.operator === ">") {
                query[method](where.column, ">", where.value);
            } else if (where.operator === ">=") {
                query[method](where.column, ">=", where.value);
            } else if (where.operator === "<") {
                query[method](where.column, "<", where.value);
            } else if (where.operator === "<=") {
                query[method](where.column, "<=", where.value);
            } else if (where.operator === "!=") {
                query[method](where.column, where.operator, where.value);
            } else if(where.operator === "in") {
                query[method](where.column, where.value as string[]);
            } else if(where.operator === "not in") {
                query.whereNotIn(where.column, where.value as string[]);
            } else if(where.operator === "is null") {
                query.whereNull(where.column);
            } else if(where.operator === "is not null") {
                query.whereNotNull(where.column);
            } else if(where.operator === "between") {
                query.whereBetween(where.column, where.value as [number, number]);
            } else if(where.operator === "not between") {
                query.whereNotBetween(where.column, where.value as [number, number]);
            } else if(where.operator === "like") {
                query[method](where.column, where.value);
            } else if(where.operator === "not like") {
                query.whereRaw(`${where.column} NOT LIKE ?`, [where.value]);
            } else {
                throw new Error(`Invalid operator: ${where.operator}`);
            }
        }
    }

    buildInsert(documents: object | object[]): Knex.QueryBuilder {
        return this.knex.insert(documents).into(this.table).returning("*");
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