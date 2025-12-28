import { IDatabaseAdapter } from "@/database/index.js";
import { TClassConstructor } from "@larascript-framework/larascript-utils";
import { IKnexPostgresAdapterConfig } from "./config.js";

export interface IKnexPostgresAdapter extends IDatabaseAdapter<IKnexPostgresAdapterConfig> {

} 

export interface IKnexPostgresAdapterConstructor
  extends TClassConstructor<IKnexPostgresAdapter> {
  new (connectionName: string, config: IKnexPostgresAdapterConfig): IKnexPostgresAdapter;
}