import { replaceEnvValue } from "@larascript-framework/larascript-utils";
import fs from "fs";

export interface IEnvService {
  envPath: string;
  envExamplePath: string;
  updateValues(props: Record<string, string>, filePath?: string): Promise<void>;
  fetchAndUpdateContent(
    filePath: string,
    props: Record<string, string>,
  ): Promise<string>;
  readFileContentsSync(filePath: string): string;
  copyFileFromEnvExample(from?: string, to?: string): void;
}

export type IEnvServiceConfig = {
  envPath: string;
  envExamplePath: string;
};

type UpdateProps = Record<string, string>;

/**
 * Environment variables service
 */
export class EnvService implements IEnvService {
  /**
   * Path to the .env file
   */
  public envPath!: string;

  /**
   * Path to the .env.example file
   */
  public envExamplePath!: string;

  constructor(protected readonly config: IEnvServiceConfig) {
    this.envPath = config.envPath;
    this.envExamplePath = config.envExamplePath;
  }
  readFileContents(filePath: string): Promise<string> {
    throw new Error("Method not implemented.");
  }

  /**
   * Updates values in the .env file
   * @param props - key-value pairs to update
   * @param filePath - path to the file to update (defaults to envPath)
   */
  public updateValues = async (props: UpdateProps, filePath = this.envPath) => {
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return;
    }

    // Fetch and update the file
    const contents = await this.fetchAndUpdateContent(filePath, props);

    // Write the file
    fs.writeFileSync(filePath, contents);
  };

  /**
   * Fetches and updates the contents of the file
   * @param filePath - path to the file to fetch and update
   * @param props - key-value pairs to update
   * @returns the updated contents of the file
   */
  public fetchAndUpdateContent = async (
    filePath: string,
    props: UpdateProps,
  ): Promise<string> => {
    let contents: string = "";

    contents = this.readFileContentsSync(filePath);

    // Replace properties
    for (const [key, value] of Object.entries(props)) {
      contents = replaceEnvValue(key, value, contents);
    }

    return contents;
  };

  public readFileContentsSync = (filePath: string = this.envPath): string => {
    return fs.readFileSync(filePath, "utf8");
  };

  /**
   * Copies the .env.example file to the .env file if it doesn't exist
   * @param from - path to the file to copy from (defaults to envExamplePath)
   * @param to - path to the file to copy to (defaults to envPath)
   */
  public copyFileFromEnvExample = (
    from = this.envExamplePath,
    to = this.envPath,
  ) => {
    if (!fs.existsSync(to)) {
      fs.copyFileSync(from, to);
    }
  };
}
