import { AbstractRule, IRule } from "@ben-shepherd/larascript-validator-bundle";


class MultipleFilesRule extends AbstractRule implements IRule {

    protected name: string = 'multipleFiles'

    protected errorTemplate: string = 'The :attribute field expects multiple files.';

    public async test(): Promise<boolean> {
        const files = this.getHttpContext().getFiles(this.getAttribute()) ?? []

        return files?.length >= 1
    }

}


export default MultipleFilesRule;
