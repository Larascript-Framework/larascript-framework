import BaseMakeFileCommand from "../base/BaseMakeFileCommand.js";

export class MakeFactoryCommand extends BaseMakeFileCommand {

    constructor() {
        super({
            signature: 'make:factory',
            description: 'Create a factory',
            makeType: 'Factory',
            args: ['name'],
            endsWith: 'Factory',
            startWithLowercase: false
        })
    }

}

export default MakeFactoryCommand;