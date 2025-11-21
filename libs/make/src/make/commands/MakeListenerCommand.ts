import BaseMakeFileCommand from "../base/BaseMakeFileCommand.js";

export class MakeListenerCommand extends BaseMakeFileCommand {

    constructor() {
        super({
            signature: 'make:listener',
            description: 'Create a new listener event',
            makeType: 'Listener',
            args: ['name'],
            endsWith: 'ListenerEvent'
        })
    }

}

export default MakeListenerCommand;