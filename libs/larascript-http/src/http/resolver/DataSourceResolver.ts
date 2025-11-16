import { TDataSourceRepository, TRouteResourceOptions } from "@larascript-framework/contracts/http"
import RouteConfigException from "../exceptions/RouteConfigException.js"
import { DatabaseResourceRepository } from "../resources/repository/DatabaseResourceRepository.js"

/**
 * Data source resolver.
 * 
 * This class is used to resolve the datasource as a repository.
 */
export class DataSourceResolver {

    static resolveDatasourceAsRepository({ datasource }: TRouteResourceOptions): TDataSourceRepository {

        if(!datasource) {
            throw new RouteConfigException('Datasource is not set')
        }

        const resolvedDatasource = {
            repository: undefined,
        } as TDataSourceRepository
        
        // Model provided, use the database resource repository
        if('modelConstructor' in datasource) {
            resolvedDatasource.repository = new DatabaseResourceRepository({
                modelConstructor: datasource.modelConstructor!,
            })
        }

        // Repository provided, use the repository provided
        if('repository' in datasource) {
            resolvedDatasource.repository = datasource.repository
        }

        // Misconfiguration
        if(!resolvedDatasource.repository) {
            throw new RouteConfigException('No repository method provided. Expected "modelConstructor" or "repository".')
        }

        return resolvedDatasource
    }
}