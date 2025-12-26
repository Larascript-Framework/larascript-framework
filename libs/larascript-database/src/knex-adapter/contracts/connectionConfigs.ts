export type PostgresConnectionConfig = {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    pool?: {
        min: number;
        max: number;
        afterCreate?: (conn: unknown, done: unknown) => void
    }
}