import { PostgresConnectionConfig } from "@/knex-adapter/contracts/connectionConfigs.js";

export class ParsePostgresConnectionUrl {
  static readonly pattern = new RegExp(
    /postgres:\/\/([^:]+):([^@]+)@([^:]+):([^\/]+)\/(.+)/,
  );

  public host!: string;

  public port!: number;

  public username!: string;

  public password!: string;

  public database!: string;

  constructor(options: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  }) {
    this.host = options.host;
    this.port = options.port;
    this.username = options.username;
    this.password = options.password;
    this.database = options.database;
  }

  /**
   * Parses a Postgres connection URL and returns a new instance of ParsePostgresConnectionUrl
   * @param connectionUrl The connection URL to parse
   * @returns A new instance of ParsePostgresConnectionUrl
   * @throws Error if the connection URL is invalid
   */
  static parse(connectionUrl: string) {
    const matches = this.pattern.exec(connectionUrl);

    if (!matches) {
      throw new Error("Invalid Postgres Connection URL");
    }

    return new ParsePostgresConnectionUrl({
      username: matches[1],
      password: matches[2],
      host: matches[3],
      port: parseInt(matches[4]),
      database: matches[5],
    });
  }

  /**
   * Returns a Postgres connection URL string based on the properties of the instance
   * @returns A Postgres connection URL string
   */
  toString() {
    return `postgres://${this.username}:${this.password}@${this.host}:${this.port}/${this.database}`;
  }

  getHost(): string {
    return this.host;
  }

  getPort(): number {
    return this.port;
  }

  getUsername(): string {
    return this.username;
  }

  getPassword(): string {
    return this.password;
  }

  getDatabase(): string {
    return this.database;
  }

  toObject(): PostgresConnectionConfig {
    return {
      host: this.host,
      port: this.port,
      username: this.username,
      password: this.password,
      database: this.database,
    }
  }
}

export default ParsePostgresConnectionUrl;
