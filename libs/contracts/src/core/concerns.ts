export interface IHasConfigConcern<TConfig = unknown> {
  getConfig<T = TConfig>(): T;

  setConfig(config: TConfig): void;
}
