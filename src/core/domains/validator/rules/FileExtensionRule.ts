
import { AbstractRule, IRule, IRuleError } from "@ben-shepherd/larascript-validator-bundle";
import { TUploadedFile } from "@src/core/domains/http/interfaces/UploadedFile";
import path from "path";

type Options = {
    ext: string | string[]
}

class FileExtensionRule extends AbstractRule<Options> implements IRule {

    protected name: string = 'fileExtension'

    protected errorTemplate: string = 'The :attribute field must use the :ext extension.';

    constructor({ ext }: Options) {
        super({ ext })
    }

    public async test(): Promise<boolean> {
        const files = this.getHttpContext().getFiles(this.getAttribute())      
        const tests = files?.every(file => this.handleSingleFile(file))

        return tests ?? false
    }

    protected handleSingleFile(file: TUploadedFile): boolean {
        const allowedExtensions = this.getExtensions()
        const fileExtension = path.extname(file.getFilename().toLowerCase())

        return allowedExtensions.includes(fileExtension)
    }

    /**
     * Gets an array of user provided extensions that includes the prefixed "."
     * @returns 
     */
    public getExtensions(): string[] {
        const extsArray = Array.isArray(this.options.ext) ? this.options.ext : [this.options.ext]

        const extsArrayWithPrefixedDot = extsArray.map((ext) => {
            return ext.startsWith('.') ? ext : `.${ext}`
        })

        return extsArrayWithPrefixedDot
    }

    public getError(): IRuleError {
        return {
            [this.getDotNotationPath()]: [
                this.formatErrorMessage({
                    ext: this.options.ext
                })
            ]
        }
    }

}


export default FileExtensionRule;
