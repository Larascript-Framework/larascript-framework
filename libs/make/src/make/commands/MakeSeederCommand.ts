import BaseMakeFileCommand from "../base/BaseMakeFileCommand.js";
import MakeServices from "../services/MakeServices.js";

export class MakeSeederCommand extends BaseMakeFileCommand {

    constructor() {
        super({
            signature: 'make:seeder',
            description: 'Creates a new database seeder',
            makeType: 'Seeder',
            args: ['name'],
            endsWith: 'Seeder',
            customFilename: (name: string) => {
                return (MakeServices.getInstance().getMigrationCreateFileService()).createDateFilename(name)
            }
        })
    }

}

export default MakeSeederCommand;