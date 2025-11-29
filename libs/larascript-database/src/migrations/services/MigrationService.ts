import { IRepository } from "@larascript-framework/contracts/database/repository";
import {
  IMigration,
  IMigrationConfig,
  IMigrationService,
  IMigrationServiceOptions,
  MigrationType,
} from "@larascript-framework/contracts/migrations";
import {
  DB,
  ModelConstructor,
  Repository,
} from "@larascript-framework/larascript-database";
import MigrationTypeEnum from "../enums/MigrationTypeEnum.js";
import FileNotFoundError from "../exceptions/FileNotFoundError.js";
import MigrationFactory from "../factory/MigrationFactory.js";
import MigrationModel from "../models/MigrationModel.js";
import MigrationFileService from "./MigrationFilesService.js";

interface MigrationDetail {
  fileName: string;
  migration: IMigration;
}
type ConstructorProps = {
  directory: string;
  modelCtor?: ModelConstructor;
  migrationType: MigrationType;
};

/**
 * MigrationService class is responsible for handling migrations.
 * It creates a MigrationRepository and a MigrationFileService.
 * It also provides methods to get the current batch count, to run up and down migrations.
 */
export class MigrationService implements IMigrationService {
  private readonly fileService!: MigrationFileService;

  private readonly repository!: IRepository;

  protected config!: IMigrationConfig;

  protected modelCtor!: ModelConstructor;

  protected migrationType!: MigrationType;

  protected emptyMigrationsMessage!: string;

  constructor(config: ConstructorProps = {} as ConstructorProps) {
    this.config = config;
    this.fileService = new MigrationFileService(config.directory);
    this.modelCtor = config.modelCtor ?? MigrationModel;
    this.repository = new Repository(this.modelCtor);
    this.migrationType = config.migrationType;
    this.emptyMigrationsMessage = `[Migration] No ${this.migrationType === MigrationTypeEnum.schema ? "migrations" : "seeders"} to run`;
  }

  async boot() {
    // Create the migrations schema
    await this.createSchema();
  }

  /**
   * Get the migration type of this service
   * @returns The migration type
   */
  getMigrationType(): MigrationType {
    return this.migrationType;
  }

  /**
   * Get all migration details
   * @returns A record of all migration class instances, keyed by the filename
   */
  async getMigrationDetails({
    group,
    filterByFileName,
  }: IMigrationServiceOptions): Promise<MigrationDetail[]> {
    const result: MigrationDetail[] = [];

    const migrationFileNames = this.fileService.getMigrationFileNames();

    for (const fileName of migrationFileNames) {
      try {
        const migration =
          await this.fileService.getImportMigrationClass(fileName);

        if (migration.migrationType !== this.migrationType) {
          continue;
        }

        if (filterByFileName && fileName !== filterByFileName) {
          continue;
        }

        if (group && migration.group !== group) {
          continue;
        }

        result.push({ fileName, migration });
      } catch (err) {
        if (err instanceof FileNotFoundError === false) {
          throw err;
        }
      }
    }

    return result;
  }

  /**
   * Run the migrations up
   * @param options
   */
  async up({
    filterByFileName,
    group,
  }: Omit<IMigrationServiceOptions, "batch">): Promise<void> {
    // Get the migration file names
    const migrationsDetails = await this.getMigrationDetails({
      filterByFileName,
      group,
    });

    // Sort from oldest to newest
    migrationsDetails.sort((a, b) => {
      const aDate = this.fileService.parseDate(a.fileName);
      const bDate = this.fileService.parseDate(b.fileName);

      if (!aDate || !bDate) {
        return 0;
      }

      return aDate.getTime() - bDate.getTime();
    });

    // Get the current batch count
    const newBatchCount = (await this.getCurrentBatchCount()) + 1;

    if (!migrationsDetails.length) {
      DB.getInstance().logger()?.info(this.emptyMigrationsMessage);
    }

    // Run the migrations for every file
    for (const migrationDetail of migrationsDetails) {
      DB.getInstance()
        .logger()
        ?.info("[Migration] up -> " + migrationDetail.fileName);

      await this.handleFileUp(migrationDetail, newBatchCount);
    }
  }

  /**
   * Run the migrations down
   */
  async down({
    batch,
  }: Pick<IMigrationServiceOptions, "batch">): Promise<void> {
    // Get the current batch count
    let batchCount =
      typeof batch !== "undefined" ? batch : await this.getCurrentBatchCount();
    batchCount = isNaN(batchCount) ? 1 : batchCount;

    // Get the migration results
    const results = await this.getMigrationResults({
      type: this.migrationType,
      batch: batchCount,
    });

    // Sort by oldest to newest
    results.sort((a, b) => {
      const aDate = a.getAttributeSync("appliedAt") as Date;
      const bDate = b.getAttributeSync("appliedAt") as Date;

      if (!aDate || !bDate) {
        return 0;
      }

      return aDate.getTime() - bDate.getTime();
    });

    if (!results.length) {
      DB.getInstance().logger()?.info(this.emptyMigrationsMessage);
    }

    // Run the migrations
    for (const result of results) {
      try {
        const fileName = result.getAttributeSync("name") as string;
        const migration =
          await this.fileService.getImportMigrationClass(fileName);

        // Run the down method
        DB.getInstance().logger()?.info(`[Migration] down -> ${fileName}`);
        await migration.down();

        // Delete the migration document
        await result.delete();
      } catch (err) {
        if (err instanceof FileNotFoundError) {
          continue;
        }
      }
    }
  }

  /**
   * Handle a migration file
   * @param fileName
   * @param newBatchCount
   * @returns
   */
  async handleFileUp(
    migrationDetail: MigrationDetail,
    newBatchCount: number,
  ): Promise<void> {
    const { fileName, migration } = migrationDetail;

    const fileChecksum = await this.fileService.checksum(fileName);

    const migrationDocument = await this.repository.findOne({
      name: fileName,
      checksum: fileChecksum,
    });

    if (migrationDocument) {
      DB.getInstance()
        .logger()
        ?.info(`[Migration] ${fileName} already applied`);
      return;
    }

    if (!migration.shouldUp()) {
      DB.getInstance()
        .logger()
        ?.info(`[Migration] Skipping (Provider mismatch) -> ${fileName}`);
      return;
    }

    DB.getInstance().logger()?.info(`[Migration] up -> ${fileName}`);
    await migration.up();

    const model = new MigrationFactory().create(
      {
        name: fileName,
        batch: newBatchCount,
        checksum: fileChecksum,
        type: this.migrationType,
        appliedAt: new Date(),
      },
      this.modelCtor,
    );
    await model.save();
  }

  /**
   * Get the current batch count
   * @returns
   */
  protected async getCurrentBatchCount(): Promise<number> {
    const results = await this.repository.findMany({});

    let current = 0;

    results.forEach((result) => {
      if ((result.getAttributeSync("batch") as number) > current) {
        current = result.getAttributeSync("batch") as number;
      }
    });

    return current;
  }

  /**
   * Get the migration results
   * @returns
   */
  protected async getMigrationResults(filters?: object) {
    return await this.repository.findMany({
      ...(filters ?? {}),
    });
  }

  /**
   * Create the migrations schema
   * @returns
   */
  protected async createSchema(): Promise<void> {
    try {
      const tableName = this.modelCtor.getTable();

      await DB.getInstance().databaseService().createMigrationSchema(tableName);
    } catch (err) {
      DB.getInstance().logger()?.info("[Migration] createSchema", err);

      if (err instanceof Error) {
        DB.getInstance().logger()?.exception(err);
      }
    }
  }
}

export default MigrationService;
