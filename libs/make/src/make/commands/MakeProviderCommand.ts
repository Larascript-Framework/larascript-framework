import BaseMakeFileCommand from "../base/BaseMakeFileCommand.js";

export class MakeProviderCommand extends BaseMakeFileCommand {

    constructor() {
        super({
            signature: 'make:provider',
            description: 'Create a new provider',
            makeType: 'Provider',
            args: ['name'],
            endsWith: 'Provider'
        })
    }

}

export default MakeProviderCommand;