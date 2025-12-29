import BaseExpression from "@/eloquent/base/BaseExpression.js";
import BindingsHelper from "./BindingsHelper.js";

export class KnexExpression extends BaseExpression<BindingsHelper> {

    bindingsUtility: BindingsHelper = new BindingsHelper();

    static create(): KnexExpression {
        return new KnexExpression();
    }

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

    getBindingValues(): unknown[] {
        return this.bindingsUtility.getBindings().map(({ value }) => value);
    }
}