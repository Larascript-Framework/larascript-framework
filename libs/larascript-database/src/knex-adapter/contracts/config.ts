
// export interface IPostgresConfig extends IDatabaseGenericConnectionConfig<SequelizeOptions> {}

import { KnexConfig } from "./knex.js";

export type IKnexPostgresConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  dockerComposeFilePath: string;
  pool?: {
    min: number;
    max: number;
    afterCreate?: (conn: unknown, done: unknown) => void
  }
} & KnexConfig
