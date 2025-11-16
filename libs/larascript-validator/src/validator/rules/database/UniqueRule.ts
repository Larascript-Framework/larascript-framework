import { IRule } from "@larascript-framework/contracts/validator";
import { ModelConstructor, TWhereClauseValue } from "@larascript-framework/larascript-database";
import AbstractDatabaseRule from "../../abstract/AbstractDatabaseRule.js";

type UniqueRuleOptions = {
    modelConstructor: ModelConstructor;
    column: string;
}

export class UniqueRule extends AbstractDatabaseRule<UniqueRuleOptions> implements IRule {

    protected name: string = 'unique';

    protected errorTemplate: string = 'The :attribute field must be unique.';

    constructor(modelConstructor: ModelConstructor, column: string) {
        super(modelConstructor, { column });
    }

    public async test(): Promise<boolean> {
        
        if(this.dataUndefinedOrNull()) {
            this.errorMessage = 'The :attribute field is required.'
            return false;
        }
        
        return await this.query()
            .where(this.options.column, this.getAttributeData() as TWhereClauseValue)
            .count() === 0;
    }

}

export default UniqueRule; 