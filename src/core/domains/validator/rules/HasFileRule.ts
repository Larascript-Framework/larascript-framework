import { IRule } from "@ben-shepherd/larascript-validator";

import ExtendedAbstractRule from "../abstract/ExtendedAbstractRule";


class HasFileRule extends ExtendedAbstractRule implements IRule {

    protected name: string = 'hasFile'

    protected errorTemplate: string = 'The :attribute field must be a file.';

    public async test(): Promise<boolean> {
        const files = this.getHttpContext().getFiles(this.getAttribute())
        const tests = files?.some(file => typeof file !== 'undefined') ?? false

        return tests
    }
    
}


export default HasFileRule;
