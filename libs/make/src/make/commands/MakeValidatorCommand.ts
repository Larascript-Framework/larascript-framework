import BaseMakeFileCommand from "../base/BaseMakeFileCommand.js";

export class MakeValidatorCommand extends BaseMakeFileCommand {

    constructor() {
        super({
            signature: 'make:validator',
            description: 'Create a validator',
            makeType: 'Validator',
            args: ['name'],
            endsWith: 'Validator',
            startWithLowercase: false
        })
    }

}

export default MakeValidatorCommand;