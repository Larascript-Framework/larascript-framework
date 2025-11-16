export class ParseMongoDBConnectionString {
  host: string;

  port: number;

  username?: string;

  password?: string;

  database?: string;

  options: Map<string, string>;

  protocol: string;

  constructor({
    host,
    port,
    username,
    password,
    database,
    options = new Map(),
    protocol = "mongodb",
  }: {
    host: string;
    port: number;
    username?: string;
    password?: string;
    database?: string;
    options?: Map<string, string>;
    protocol?: string;
  }) {
    this.host = host;
    this.port = port;
    this.username = username;
    this.password = password;
    this.database = database;
    this.options = options;
    this.protocol = protocol;
  }

  /**
   * Parses a MongoDB connection string into its components
   * @param connectionString The MongoDB connection string to parse
   * @returns A new MongoDBConnectionString instance
   * @throws Error if the connection string is invalid
   */
  public static parse(connectionString: string): ParseMongoDBConnectionString {
    try {
      // Regular expression for MongoDB connection string
      const regex = new RegExp(
        /^(mongodb(?:\+srv)?):\/\/(?:([^:]+)(?::([^@]+))?@)?([^/:]+)(?::(\d+))?(?:\/([^?]+))?(?:\?(.*))?$/,
      );
      const matches = regex.exec(connectionString);

      if (!matches) {
        throw new Error("Invalid MongoDB connection string format");
      }

      const [
        ,
        protocol,
        username,
        password,
        host,
        port,
        database,
        queryString,
      ] = matches;

      // Parse options from query string
      const options = new Map<string, string>();
      if (queryString) {
        queryString.split("&").forEach((param) => {
          const [key, value] = param.split("=");
          if (key && value) {
            options.set(decodeURIComponent(key), decodeURIComponent(value));
          }
        });
      }

      return new ParseMongoDBConnectionString({
        host,
        port: port ? parseInt(port, 10) : 27017,
        username: username ? decodeURIComponent(username) : undefined,
        password: password ? decodeURIComponent(password) : undefined,
        database: database || undefined,
        options,
        protocol,
      });
    } catch (error) {
      throw new Error(
        `Failed to parse MongoDB connection string: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Converts the connection string components back to a URL string
   * @returns The formatted MongoDB connection string
   */
  public toString(): string {
    try {
      let connectionString = `${this.protocol}://`;

      // Add authentication if provided
      if (this.username) {
        connectionString += this.username;
        if (this.password) {
          connectionString += `:${this.password}`;
        }
        connectionString += "@";
      }

      // Add host and port
      connectionString += this.host;
      if (this.port && this.port !== 27017) {
        connectionString += `:${this.port}`;
      }

      // Add database if provided
      if (this.database) {
        connectionString += `/${this.database}`;
      }

      // Add options if any exist
      if (this.options.size > 0) {
        const queryString = Array.from(this.options.entries())
          .map(
            ([key, value]) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
          )
          .join("&");
        connectionString += `?${queryString}`;
      }

      return connectionString;
    } catch (error) {
      throw new Error(
        `Failed to stringify MongoDB connection: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  // Getter methods
  public getHost(): string {
    return this.host;
  }

  public getPort(): number {
    return this.port;
  }

  public getUsername(): string | undefined {
    return this.username;
  }

  public getPassword(): string | undefined {
    return this.password;
  }

  public getDatabase(): string | undefined {
    return this.database;
  }

  public getOptions(): Map<string, string> {
    return new Map(this.options);
  }

  public getProtocol(): string {
    return this.protocol;
  }
}

export default ParseMongoDBConnectionString;
