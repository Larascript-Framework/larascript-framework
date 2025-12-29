export type KnexConfig = {
    log?: {
        info: (message: string) => void;
        warning: (message: string) => void;
        error: (message: string) => void;
        debug: (message: string) => void;
    }
}

export type KnexRawSql = {
    sql: string;
    bindings: unknown[];
}