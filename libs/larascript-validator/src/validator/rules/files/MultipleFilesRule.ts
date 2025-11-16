import { IRule } from "@larascript-framework/contracts/validator";
import AbstractRuleHttpContext from "../../abstract/AbstractRuleHttpContext.js";

export class MultipleFilesRule extends AbstractRuleHttpContext implements IRule {

    protected name: string = 'multipleFiles'

    protected errorTemplate: string = 'The :attribute field expects multiple files.';

    public async test(): Promise<boolean> {
        const files = this.getHttpContext().getFiles(this.getAttribute()) ?? []

        return files?.length >= 1
    }

}


export default MultipleFilesRule;
