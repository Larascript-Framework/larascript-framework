import BaseMakeFileCommand from "../base/BaseMakeFileCommand.js";

export class MakeRepositoryCommand extends BaseMakeFileCommand {

    constructor() {
        super({
            signature: 'make:repository',
            description: 'Create a new repository',
            makeType: 'Repository',
            args: ['name', 'collection'],
            endsWith: 'Repository'
        })
    }

}

export default MakeRepositoryCommand;