import { TUploadedFile } from "@larascript-framework/contracts/http";
import { IRule, IRuleError } from "@larascript-framework/contracts/validator";
import AbstractRuleHttpContext from "../../abstract/AbstractRuleHttpContext.js";

type Options = {
    startsWith?: string;
    mimeType?: string | string[]
}

export class FileMimeType extends AbstractRuleHttpContext<Options> implements IRule {

    protected name: string = 'fileMimeType'

    protected errorTemplate: string = 'The :attribute field must have a mime type of :mimeType.';

    protected startsWithTemplate: string = 'The :attribute field mime type must start with :startsWith.'

    protected misconfiguredTemplate = 'The FileMimeTypeRule expects startsWith or mimeType but none were provided.'

    constructor({ startsWith, mimeType }: Options) {
        super({ startsWith, mimeType })
    }

    public async test(): Promise<boolean> {
        const files = this.getHttpContext().getFiles(this.getAttribute())      
        const tests = files?.every(file => this.handleSingleFile(file))

        return tests ?? false
    }

    protected handleSingleFile(file: TUploadedFile): boolean {
        
        if(typeof this.options.startsWith === 'string') {
            this.errorTemplate = this.startsWithTemplate
            return file.getMimeType().startsWith(this.options.startsWith)
        }

        if(typeof this.options.mimeType === 'string') {
            return this.getMimeTypes().includes(file.getMimeType())
        }

        this.errorTemplate = this.misconfiguredTemplate
        return false
    }

    /**
     * Gets an array of user provided extensions that includes the prefixed "."
     * @returns 
     */
    public getMimeTypes(): string[] {
        const mimeTypesArray = Array.isArray(this.options.mimeType) ? this.options.mimeType : [this.options.mimeType]
        return mimeTypesArray as string[]
    }

    public getError(): IRuleError {
        return {
            [this.getDotNotationPath()]: [
                this.formatErrorMessage({
                    mimeType: this.options.mimeType,
                    startsWith: this.options.startsWith
                })
            ]
        }
    }

}


export default FileMimeType;
