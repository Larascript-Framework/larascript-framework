import path from "path";

export const postgresDockerComposeFilePath = () => path.resolve(
    process.cwd(),
    "../../libs/larascript-database/docker/docker-compose.postgres.yml",
  )