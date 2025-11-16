/* eslint-disable no-unused-vars */
export interface IHasConfigConcern<TConfig extends unknown = unknown>
{
    getConfig<T = TConfig>(): T;
    
    setConfig(config: TConfig): void;
}