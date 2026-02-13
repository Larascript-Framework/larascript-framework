import knex, { Knex } from "knex";
import { PostgresConnectionConfig } from "./contracts/connectionConfigs.js";
import { KnexConfig } from "./contracts/knex.js";

export class KnexConnectionClientBuilder {
    public static createPostgresClient({ host, port, username, password, database, pool, ...rest }: PostgresConnectionConfig & KnexConfig): Knex {
        return knex({
            client: 'pg',
            connection: {
                host,
                port: port,
                user: username,
                password,
                database,
                pool: pool
            },
            ...rest
        })
    }
}