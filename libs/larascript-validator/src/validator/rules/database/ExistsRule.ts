import { IHttpContext } from "@larascript-framework/contracts/http";
import { IRule } from "@larascript-framework/contracts/validator";
import { IEloquent, ModelConstructor } from "@larascript-framework/larascript-database";
import AbstractDatabaseRule from "../../abstract/AbstractDatabaseRule.js";

type ExistsRuleOptions = {
    modelConstructor: ModelConstructor;
    column: string;
    // eslint-disable-next-line no-unused-vars
    callback?: (builder: IEloquent, context: IHttpContext) => IEloquent | null;
}

export class ExistsRule extends AbstractDatabaseRule<ExistsRuleOptions> implements IRule {

    protected name: string = 'exists';

    protected errorTemplate: string = 'The :attribute field must exist.';

    constructor(modelConstructor: ModelConstructor, column: string, callback?: ExistsRuleOptions['callback']) {
        super(modelConstructor, { column, callback });
    }

    public async test(): Promise<boolean> {
        if (this.dataUndefinedOrNull()) {
            this.errorMessage = 'The :attribute field is required.'
            return false;
        }

        const column = this.db.getAdapter().normalizeColumn(this.options.column)
        let builder = this.query();
        builder.where(column, this.getAttributeData())

        if (typeof this.options.callback === 'function') {
            const builderCustom = this.options.callback(builder.clone(), this.getHttpContext())

            if (builderCustom) {
                builder = builderCustom.clone()
            }
        }

        return await builder.count() > 0;
    }

}

export default ExistsRule; 