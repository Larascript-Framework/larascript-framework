import { isUuid } from "@ben-shepherd/larascript-utils-bundle";
import AbstractRule from "@src/core/domains/validator/abstract/AbstractRule";
import { IRule, IRuleError } from "@src/core/domains/validator/interfaces/IRule";

class UuidRule extends AbstractRule<{}> implements IRule {

    protected name: string = 'uuid';

    protected errorTemplate: string = 'The :attribute field must be a valid UUID.';

    constructor() {
        super();
        this.options = {};
    }

    public async test(): Promise<boolean> {
        return isUuid(this.getAttributeData());
    }

    getError(): IRuleError {
        return {
            [this.getDotNotationPath()]: [
                this.formatErrorMessage({})
            ]
        };
    }

}

export default UuidRule; 