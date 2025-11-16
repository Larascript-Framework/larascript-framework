import BaseMakeFileCommand from "../base/BaseMakeFileCommand.js";

export class MakeMiddlewareCommand extends BaseMakeFileCommand {

    constructor() {
        super({
            signature: 'make:middleware',
            description: 'Create a new middleware',
            makeType: 'Middleware',
            args: ['name'],
            endsWith: 'Middleware',
            startWithLowercase: false
        })
    }

}

export default MakeMiddlewareCommand;