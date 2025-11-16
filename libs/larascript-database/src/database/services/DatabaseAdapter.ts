import { TClassConstructor } from "@larascript-framework/larascript-utils";
import {
  IAdapterComposerFileName,
  IDatabaseAdapter,
  IDatabaseService,
} from "../interfaces/index.js";

export class DatabaseAdapter {
  public static getName(adapter: TClassConstructor<IDatabaseAdapter>): string {
    return adapter.name;
  }

  /**
   * Retrieves a list of composer file names from all registered database adapters.
   *
   * @returns An array of objects, each containing:
   *  - fullName: The full composer file name (e.g., 'docker-compose.mongodb.yml').
   *  - shortName: The shortened composer file name without the extension (e.g., 'mongodb').
   */
  public static getComposerFileNames(
    db: IDatabaseService,
  ): IAdapterComposerFileName[] {
    const adapterCtors = db.getAllAdapterConstructors();
    const adapters = adapterCtors.map(
      (adapterCtor: TClassConstructor<IDatabaseAdapter>) =>
        new adapterCtor("", {}),
    );
    const composerFileNames = adapters.map((adapter: IDatabaseAdapter) =>
      adapter.getDockerComposeFileName(),
    );

    const lastPartRegex = RegExp(/docker-compose.(\w+).yml$/);

    return composerFileNames.map((composerFileName: string) => ({
      fullName: composerFileName,
      shortName: composerFileName.replace(lastPartRegex, "$1"),
    }));
  }

  /**
   * Retrieves an array of short composer file names (e.g., ['mongodb', 'postgres'])
   * @returns {string[]}
   */
  public static getComposerShortFileNames(db: IDatabaseService): string[] {
    return this.getComposerFileNames(db).map(
      (composerFileName: IAdapterComposerFileName) =>
        composerFileName.shortName,
    );
  }
}

export default DatabaseAdapter;
