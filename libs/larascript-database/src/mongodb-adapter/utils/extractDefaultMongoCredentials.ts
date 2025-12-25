import fs from "fs";
import DB from "../../database/services/DB.js";

/**
 * Extracts the default MongoDB credentials from the `docker-compose.mongodb.yml` file.
 */
export const extractDefaultMongoCredentials = (dockerComposeFilePath: string) => {
  try {
    const contents = fs.readFileSync(dockerComposeFilePath, "utf8");

    const pattern = /LARASCRIPT_DEFAULT_CREDENTIALS:\s?(.+)/;
    const match = pattern.exec(contents);

    if (match?.[1]) {
      return match?.[1];
    }
  } catch (err) {
    DB.getInstance().logger()?.error(err);
  }

  return null;
};
