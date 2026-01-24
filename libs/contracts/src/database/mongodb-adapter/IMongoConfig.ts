import { MongoClientOptions } from "mongodb";
import { IBaseAdapterConfig } from "../database/config.js";

export type IMongoConfig = IBaseAdapterConfig & {
  uri: string;
  options: MongoClientOptions & IBaseAdapterConfig['options'];
}
