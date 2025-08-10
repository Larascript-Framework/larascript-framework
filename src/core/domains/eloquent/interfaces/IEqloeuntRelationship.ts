/* eslint-disable no-unused-vars */
import { Collection } from "@ben-shepherd/larascript-collection-bundle";
import { IEloquent, IRelationship } from "@src/core/domains/eloquent/interfaces/IEloquent";
import { IModel, IModelAttributes } from "@src/core/domains/models/interfaces/IModel";

export interface IRelationshipResolver<Model extends IModel = IModel> {
    resolveData<Attributes extends IModelAttributes = IModelAttributes, K extends keyof Attributes = keyof Attributes>(model: Model, relationship: IRelationship, connection: string): Promise<Attributes[K] | Collection<Attributes[K] | null>>;
    attachEloquentRelationship(eloquent: IEloquent, relationship: IRelationship, relationshipName: string): IEloquent;
}

export interface IRelationshipResolverConstructor<Model extends IModel = IModel> {
    new (connection: string): IRelationshipResolver<Model>;
}