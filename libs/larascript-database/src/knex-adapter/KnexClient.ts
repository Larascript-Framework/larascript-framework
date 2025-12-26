import knex, { Knex } from "knex";
import { PostgresConnectionConfig } from "./contracts/connectionConfigs.js";
import { KnexConfig } from "./contracts/knex.js";

export class KnexClient {

    private constructor(private knexClient: Knex) 
    {}

    public static createPostgresClient({ host, port, username, password, database, pool, ...rest }: PostgresConnectionConfig & KnexConfig): KnexClient {
        return new KnexClient(
            knex({
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
        );
    }

    public knex(): Knex
    {
        return this.knexClient
    }
}