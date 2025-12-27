import BaseExpression from "@/eloquent/base/BaseExpression.js";

export class KnexExpressionBuilder extends BaseExpression<unknown> {

    build<T = unknown>(): T {
        return {
            select: () => this.buildSelect(),
            insert: () => this.buildInsert(),
            update: () => this.buildUpdate(),
            delete: () => this.buildDelete(),
          }[this.buildType]() as T;
    }

    buildSelect(): string {
        throw new Error("Method not implemented.");
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
}