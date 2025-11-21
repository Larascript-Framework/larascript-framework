import BaseMakeFileCommand from "../base/BaseMakeFileCommand.js";

export class MakeObserverCommand extends BaseMakeFileCommand {

    constructor() {
        super({
            signature: 'make:observer',
            description: 'Create a new observer',
            makeType: 'Observer',
            args: ['name'],
            endsWith: 'Observer'
        })
    }

}

export default MakeObserverCommand;