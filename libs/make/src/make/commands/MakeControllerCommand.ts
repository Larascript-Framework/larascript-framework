import BaseMakeFileCommand from "../base/BaseMakeFileCommand.js";

export class MakeControllerCommand extends BaseMakeFileCommand {

    constructor() {
        super({
            signature: 'make:controller',
            description: 'Create a new controller',
            makeType: 'Controller',
            args: ['name'],
            endsWith: 'Controller',
            startWithLowercase: false
        })

    }

}

export default MakeControllerCommand;