import { ModelConstructor } from "../database/model/index.js";
import { IResourceRepository } from "./IResourceRepository.js";

export type TDataSourceModelConstructor = {
    modelConstructor?: ModelConstructor;
}

export type TDataSourceRepository = {
    repository?: IResourceRepository;
}

export type TDataSource = TDataSourceModelConstructor | TDataSourceRepository;