import { IDatabaseAdapter } from "@/database/index.js";
import { TClassConstructor } from "@larascript-framework/larascript-utils";
import { IKnexPostgresConfig } from "./config.js";

export interface IKnexPostgresAdapter extends IDatabaseAdapter<IKnexPostgresConfig> {

} 

export interface IKnexPostgresAdapterConstructor
  extends TClassConstructor<IKnexPostgresAdapter> {
  new (connectionName: string, config: IKnexPostgresConfig): IKnexPostgresAdapter;
}