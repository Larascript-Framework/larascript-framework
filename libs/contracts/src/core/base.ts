/* eslint-disable no-unused-vars */

export type FactoryConstructor<Data> = {
    new (...args: any[]): IFactory<Data>
}

export interface IFactory<Data> {
    create(...args: any[]): Data;
    getDefinition(): unknown;
}