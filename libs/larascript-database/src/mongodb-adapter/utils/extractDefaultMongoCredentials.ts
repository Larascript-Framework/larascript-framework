import fs from "fs";
import path from "path";
import DB from "../../database/services/DB.js";

/**
 * Extracts the default MongoDB credentials from the `docker-compose.mongodb.yml` file.
 */
export const extractDefaultMongoCredentials = () => {
  try {
    const dockerComposePath = path.resolve(
      process.cwd(),
      "docker/docker-compose.mongodb.yml",
    );
    const contents = fs.readFileSync(dockerComposePath, "utf8");

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
