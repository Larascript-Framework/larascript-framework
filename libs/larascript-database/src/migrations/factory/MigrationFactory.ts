import { IModel, ModelConstructor } from "@larascript-framework/larascript-database";
import { MigrationType } from "../interfaces/index.js";
import MigrationModel from "../models/MigrationModel.js";



type Props = {
    name: string;
    batch: number;
    checksum: string;
    type: MigrationType;
    appliedAt: Date;
}

class MigrationFactory {

    /**
     * Create a migration model
     * @param param
     * @returns 
     */
    create({ name, batch, checksum, type, appliedAt }: Props, modelCtor: ModelConstructor = MigrationModel): IModel {
        return new modelCtor({
            name,
            batch,
            checksum,
            type,
            appliedAt
        });
    }

}

export default MigrationFactory