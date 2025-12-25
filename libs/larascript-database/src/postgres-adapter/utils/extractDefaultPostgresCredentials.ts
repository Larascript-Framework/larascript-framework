import fs from "fs";
import path from "path";

export const extractDefaultPostgresCredentials = (
  dockerComposeFilePath: string,
) => {
  try {
    const dockerComposePath = path.resolve(
      process.cwd(),
      dockerComposeFilePath,
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
