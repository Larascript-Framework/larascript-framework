import BaseMakeFileCommand from "../base/BaseMakeFileCommand.js";

export class MakeCmdCommand extends BaseMakeFileCommand {

    constructor() {
        super({
            signature: 'make:command',
            description: 'Create a new command',
            makeType: 'Command',
            args: ['name'],
            endsWith: 'Command'
        })
    }

}

export default MakeCmdCommand;