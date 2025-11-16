import { MongoClientOptions } from "mongodb";

export interface IMongoConfig extends MongoClientOptions {
  uri: string;
  options: MongoClientOptions;
}
