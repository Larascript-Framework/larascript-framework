import BaseMakeFileCommand from "../base/BaseMakeFileCommand.js";

export class MakeSubscriberCommand extends BaseMakeFileCommand {

    constructor() {
        super({
            signature: 'make:subscriber',
            description: 'Create a new subscriber event',
            makeType: 'Subscriber',
            args: ['name'],
            endsWith: 'SubscriberEvent'
        })
    }

}

export default MakeSubscriberCommand;