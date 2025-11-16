import { IModelAttributes, Model } from "@/model/index.js";

/**
 * Represents a migration stored in the database.
 */
export interface MigrationModelData extends IModelAttributes {

    /**
     * The name of the migration.
     */
    name: string;

    /**
     * The batch number of the migration.
     */
    batch: number;

    /**
     * The checksum of the migration.
     */
    checksum: string;

    /**
     * The type of the migration. 
     * eg. 'seeder' | 'schema'
     */
    type: string;

    /**
     * The time when the migration was applied.
     */
    appliedAt: Date;
}

/**
 * Model for migrations stored in the database.
 */
export class MigrationModel extends Model<MigrationModelData> {

    public table: string = 'migrations';

    constructor(data: MigrationModelData | null) {
        super(data);
    }

    /**
     * The fields that are dates.
     */
    public dates = [
        'appliedAt'
    ]

    /**
     * The fields of the model.
     */
    public fields: string[] = [
        'name',
        'batch',
        'checksum',
        'type',
        'appliedAt'
    ]

}

/**
 * The default migration model.
 */
export default MigrationModel
