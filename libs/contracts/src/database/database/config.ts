import { IDatabaseAdapter, IDatabaseAdapterConstructor } from "./adapter.js";

export interface IDatabaseGenericConnectionConfig<
  Adapter extends IDatabaseAdapter = IDatabaseAdapter,
> {
  connectionName: string;
  adapter: IDatabaseAdapterConstructor<Adapter>;
  options: ReturnType<Adapter["getConfig"]>;
}

export interface IDatabaseConfig {
  enableLogging?: boolean;
  onBootConnect?: boolean;
  defaultConnectionName: string;
  keepAliveConnections: string;
  connections: IDatabaseGenericConnectionConfig[];
}
