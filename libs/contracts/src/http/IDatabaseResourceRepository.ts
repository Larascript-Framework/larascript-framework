import { IModel, ModelConstructor } from "../database/model/model.t.js";
import { IResourceData, IResourceRepository, IResourceRepositoryConfig } from "./IResourceRepository.js";

export type DatabaseResourceRepositoryConfig<M extends IModel = IModel> = IResourceRepositoryConfig & {
    modelConstructor: ModelConstructor<M>;
}

export type IDatabaseResourceRepository<M extends IModel = IModel> = IResourceRepository<IResourceData, DatabaseResourceRepositoryConfig<M>>;
