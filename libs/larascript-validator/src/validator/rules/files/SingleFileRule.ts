import { IRule, IRuleError } from "@larascript-framework/contracts/validator";
import AbstractRuleHttpContext from "../../abstract/AbstractRuleHttpContext.js";

export class SingleFileRule extends AbstractRuleHttpContext implements IRule {

    protected name: string = 'singleFile'

    protected errorTemplate: string = 'The :attribute field expects a single file but :amount were provided.';

    protected amount!: number;

    public async test(): Promise<boolean> {
        const files = this.getHttpContext().getFiles(this.getAttribute())      
        this.amount = files?.length ?? -1
        return files?.length === 1
    }

    public getError(): IRuleError {
        return {
            [this.getDotNotationPath()]: [
                this.formatErrorMessage({
                    amount: this.amount
                })
            ]
        }
    }

}


export default SingleFileRule;
