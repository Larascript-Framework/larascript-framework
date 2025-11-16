import { IRule } from "@larascript-framework/contracts/validator";
import AbstractRuleHttpContext from "../../abstract/AbstractRuleHttpContext.js";

export class HasFileRule extends AbstractRuleHttpContext implements IRule {

    protected name: string = 'hasFile'

    protected errorTemplate: string = 'The :attribute field must be a file.';

    public async test(): Promise<boolean> {
        const files = this.getHttpContext().getFiles(this.getAttribute())
        const tests = files?.some(file => typeof file !== 'undefined') ?? false

        return tests
    }
    
}


export default HasFileRule;
