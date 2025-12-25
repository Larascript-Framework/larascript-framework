import { Options as SequelizeOptions } from "sequelize/types/sequelize";
import { IBaseAdapterConfig } from "../database/config.js";

// export interface IPostgresConfig extends IDatabaseGenericConnectionConfig<SequelizeOptions> {}

export type IPostgresConfig = IBaseAdapterConfig & {
  uri: string;
  options: SequelizeOptions & IBaseAdapterConfig['options'];
};
