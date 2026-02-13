
// export interface IPostgresConfig extends IDatabaseGenericConnectionConfig<SequelizeOptions> {}

import { IBaseAdapterConfig } from "@/database/interfaces/index.js";
import { KnexConfig } from "./knex.js";

export type IKnexPostgresConnectionConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export type IKnexPostgresAdapterConfig = {
  connection: IKnexPostgresConnectionConfig;
  knexConfig: {
    pool?: {
      min: number;
      max: number;
      afterCreate?: (conn: unknown, done: unknown) => void
    } & KnexConfig;
  }
} & IBaseAdapterConfig
