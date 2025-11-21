import { Options as SequelizeOptions } from "sequelize/types/sequelize";

// export interface IPostgresConfig extends IDatabaseGenericConnectionConfig<SequelizeOptions> {}

export type IPostgresConfig = {
  uri: string;
  options: SequelizeOptions;
};
