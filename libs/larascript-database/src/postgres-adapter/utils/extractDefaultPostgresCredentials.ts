import fs from "fs";
import path from "path";

export const extractDefaultPostgresCredentials = () => {
  try {
    const dockerComposePath = path.resolve(
      process.cwd(),
      "docker/docker-compose.postgres.yml",
    );
    const contents = fs.readFileSync(dockerComposePath, "utf8");

    const pattern = /LARASCRIPT_DEFAULT_CREDENTIALS:\s?(.+)/;
    const match = pattern.exec(contents);

    if (match?.[1]) {
      return match?.[1];
    }
  } catch (err) {
    console.error(err);
  }

  return null;
};
