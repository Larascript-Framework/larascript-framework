import {
  Collection,
  collect,
} from "@larascript-framework/larascript-collection";
import {
  PrefixedPropertyGrouper,
  TClassConstructor,
  captureError,
  generateUuidV4,
} from "@larascript-framework/larascript-utils";
import * as _lodash from "lodash";
import pg, { QueryResult } from "pg";
import DB from "../../database/services/DB.js";
import Eloquent from "../../eloquent/Eloquent.js";
import EloquentException from "../../eloquent/exceptions/EloquentExpression.js";
import ModelNotFoundException from "../../eloquent/exceptions/ModelNotFoundException.js";
import UpdateException from "../../eloquent/exceptions/UpdateException.js";
import {
  IEloquent,
  IEloquentExpression,
  IdGeneratorFn,
  SetModelColumnsOptions,
  TransactionFn,
} from "../../eloquent/index.js";
import { IModel, ModelConstructor } from "../../model/index.js";
import { PostgresAdapter } from "../adapters/index.js";
import SqlExpression, {
  SqlRaw,
} from "../builder/ExpressionBuilder/SqlExpression.js";
import PostgresJsonNormalizer from "../normalizers/PostgresJsonNormalizer.js";

class PostgresEloquent<Model extends IModel> extends Eloquent<
  Model,
  SqlExpression
> {
  /**
   * The default ID generator function for the query builder.
   */
  protected defaultIdGeneratorFn: IdGeneratorFn | null =
    generateUuidV4 as IdGeneratorFn;

  /**
   * The query builder expression object
   */
  protected expression: SqlExpression = new SqlExpression();

  /**
   * The query builder client
   */
  protected pool!: pg.PoolClient | pg.Pool;

  /**
   * The formatter to use when formatting the result rows to objects
   */
  protected formatter: PrefixedPropertyGrouper = new PrefixedPropertyGrouper();

  constructor() {
    super();
    this.expression.setUuidCast(this.defaultIdGeneratorFn === generateUuidV4);
  }

  /**
   * Sets the query builder client to the given value.
   * This is useful if you have an existing client you want to reuse
   * for multiple queries.
   * @param client The client to use for queries.
   * @returns {this} The PostgresEloquent instance for chaining.
   */
  setPool(client: pg.Pool) {
    this.pool = client;
  }

  /**
   * Resets the bindings array to an empty array.
   * This is useful if you intend to reuse the same query builder instance
   * for multiple queries.
   * @returns {this} The PostgresEloquent instance for chaining.
   */
  protected resetBindingValues() {
    this.expression.bindingsUtility.reset();
  }

  /**
   * Normalizes the documents by wrapping array values in a special format for Postgres.
   *
   * When inserting JSON arrays directly into Postgres, it can throw a "malformed array literal" error
   * because Postgres expects arrays in a specific format. To prevent this, we wrap array values in an
   * object with a special property (e.g. { ArrayValues: [...] }) before stringifying. This allows
   * Postgres to properly parse the JSON string containing arrays.
   *
   * @param documents The documents to normalize
   * @returns The normalized documents
   */
  normalizeDocuments<T extends object = object>(documents: T[]): T[] {
    const postgresJsonNormalizer = new PostgresJsonNormalizer();
    const jsonProperties = this.modelCtor?.create().getJsonProperties() ?? [];
    return documents.map((document) =>
      postgresJsonNormalizer.documentsAsSafePostgresArray(
        document,
        jsonProperties,
      ),
    ) as T[];
  }

  /**
   * Denormalizes the documents by parsing the JSON properties
   *
   * When retrieving JSON arrays from Postgres, they are wrapped in a special format (e.g. { ArrayValues: [...] })
   * that was used during normalization to prevent the "malformed array literal" error. This method unwraps those
   * array values back to their original format by removing the wrapper object and extracting the array.
   *
   * @param documents The documents to denormalize
   * @returns The denormalized documents
   */
  denormalizeDocuments<T extends object = object>(documents: T[]): T[] {
    const postgresJsonNormalizer = new PostgresJsonNormalizer();
    const jsonProperties = this.modelCtor?.create().getJsonProperties() ?? [];
    return documents.map((document) =>
      postgresJsonNormalizer.documentsAsUnsafePostgresArray(
        document,
        jsonProperties,
      ),
    ) as T[];
  }

  /**
   * Prepares the join by adding the related columns to the query builder and the formatter.
   * @param related The related table to join
   * @param localColumn The local column to join on
   * @param relatedColumn The related column to join on
   * @param options The options for the join
   */
  protected prepareJoin(
    related: ModelConstructor<IModel>,
    localColumn: string,
    relatedColumn: string,
    targetProperty: string,
  ) {
    if (typeof targetProperty !== "string" || targetProperty.length === 0) {
      throw new Error("Target property is required for join");
    }

    // Generate an arbitrary property name for the join
    // Example: 'users_department_id'
    const arbitraryProperty = Eloquent.getJoinAsPath(
      related.getTable(),
      localColumn,
      relatedColumn,
    );

    // Add all the columns from the foreign model to the query builder
    // This will be used in the query builder to select the columns from the foreign model
    this.setModelColumns(related, {
      columnPrefix: `${arbitraryProperty}_`,
      targetProperty: targetProperty,
    });

    // Add the source property to the formatter to format the result rows to objects with the target property
    // This will be used in the formatter to format the result rows to objects with the target property
    this.formatter.addOption(arbitraryProperty, targetProperty);
  }

  /**
   * Joins a related table to the current query.
   * @param related The related table to join
   * @param localColumn The local column to join on
   * @param relatedColumn The related column to join on
   * @param options The options for the join
   * @returns The current query builder instance
   */
  join(
    related: ModelConstructor<IModel>,
    localColumn: string,
    relatedColumn: string,
    targetProperty: string,
  ): IEloquent<Model, IEloquentExpression<unknown>> {
    super.join(related, localColumn, relatedColumn);
    this.prepareJoin(related, localColumn, relatedColumn, targetProperty);
    return this as unknown as IEloquent<Model, IEloquentExpression<unknown>>;
  }

  /**
   * Adds a left join to the query builder.
   * @param related The related table to join
   * @param localColumn The local column to join on
   * @param relatedColumn The related column to join on
   * @param options The options for the join
   * @returns The current query builder instance
   */
  leftJoin(
    related: ModelConstructor<IModel>,
    localColumn: string,
    relatedColumn: string,
    targetProperty: string,
  ): IEloquent<Model, IEloquentExpression<unknown>> {
    super.leftJoin(related, localColumn, relatedColumn);
    this.prepareJoin(related, localColumn, relatedColumn, targetProperty);
    return this as unknown as IEloquent<Model, IEloquentExpression<unknown>>;
  }

  /**
   * Adds a right join to the query builder.
   * @param related The related table to join
   * @param localColumn The local column to join on
   * @param relatedColumn The related column to join on
   * @param options The options for the join
   * @returns The current query builder instance
   */
  rightJoin(
    related: ModelConstructor<IModel>,
    localColumn: string,
    relatedColumn: string,
    targetProperty: string,
  ): IEloquent<Model, IEloquentExpression<unknown>> {
    super.rightJoin(related, localColumn, relatedColumn);
    this.prepareJoin(related, localColumn, relatedColumn, targetProperty);
    return this as unknown as IEloquent<Model, IEloquentExpression<unknown>>;
  }

  /**
   * Adds a full join to the query builder.
   * @param related The related table to join
   * @param localColumn The local column to join on
   * @param relatedColumn The related column to join on
   * @param options The options for the join
   * @returns The current query builder instance
   */
  fullJoin(
    related: ModelConstructor<IModel>,
    localColumn: string,
    relatedColumn: string,
    targetProperty: string,
  ): IEloquent<Model, IEloquentExpression<unknown>> {
    super.fullJoin(related, localColumn, relatedColumn);
    this.prepareJoin(related, localColumn, relatedColumn, targetProperty);
    return this as unknown as IEloquent<Model, IEloquentExpression<unknown>>;
  }

  /**
   * Adds a cross join to the query builder.
   * @param related The related table to join
   * @returns The current query builder instance
   */
  crossJoin(
    related: ModelConstructor<IModel>,
  ): IEloquent<Model, IEloquentExpression<unknown>> {
    super.crossJoin(related);
    return this as unknown as IEloquent<Model, IEloquentExpression<unknown>>;
  }

  /**
   * Sets the ID generator function for the query builder.
   *
   * If no ID generator function is provided, the default ID generator function
   * will be used, which generates a UUID v4 string.
   *
   * @param {IdGeneratorFn} [idGeneratorFn] - The ID generator function to use.
   * @returns {this} The PostgresEloquent instance for chaining.
   */
  setIdGenerator(
    idGeneratorFn: IdGeneratorFn = this.defaultIdGeneratorFn as IdGeneratorFn,
  ): IEloquent<Model, SqlExpression> {
    this.idGeneratorFn = idGeneratorFn;
    return this as unknown as IEloquent<Model, SqlExpression>;
  }

  /**
   * Sets the model columns for the query builder.
   * If a model constructor is provided, the model's columns will be used.
   * If a prefix is provided, the columns will be prefixed with the given string.
   * If `options.targetProperty` is provided, the columns will be formatted to
   * access the property of the model under the given key.
   * @param {TClassConstructor<IModel>} [modelCtor] - The model constructor to use for retrieving the columns.
   * @param {string} [prefix] - The prefix to add to the columns.
   * @param {SetModelColumnOptions} [options] - Options object containing the targetProperty to format the columns with.
   * @returns {this} The PostgresEloquent instance for chaining.
   */
  setModelColumns(
    modelCtor?: TClassConstructor<IModel>,
    options?: SetModelColumnsOptions,
  ): IEloquent<Model, SqlExpression> {
    super.setModelColumns(modelCtor, options);
    return this as unknown as IEloquent<Model>;
  }

  /**
   * Executes a SQL expression using the connected PostgreSQL client.
   *
   * @param {SqlExpression} expression - The SQL expression builder instance containing the query to execute.
   * @returns {Promise<T>} A promise that resolves with the query result.
   * @private
   */
  async execute<T = QueryResult>(
    expression: SqlExpression = this.expression,
  ): Promise<T> {
    const sql = expression.build<string>();
    const values = expression.getBindingValues();

    return await this.raw<T>(sql, values);
  }

  /**
   * Sets a raw select expression for the query builder.
   *
   * This method can be used to set a custom select expression on the query builder.
   * The expression will be used as the SELECT clause for the query.
   *
   * @param {string} value - The raw select expression to set.
   * @param {unknown[]} [bindings] - The bindings to use for the expression.
   * @returns {IEloquent<Model, IEloquentExpression<unknown>>} The query builder instance.
   */
  selectRaw<T = string>(
    value: T,
    bindings?: unknown,
  ): IEloquent<Model, IEloquentExpression<unknown>> {
    this.validateSqlRaw(value);
    return super.selectRaw<SqlRaw>({ sql: value as string, bindings });
  }

  /**
   * Adds a raw where clause to the query builder.
   *
   * This method allows the use of a raw SQL expression for the where clause in the query.
   * It is useful for complex queries where the standard query builder methods are insufficient.
   *
   * @param {T} value - The raw SQL expression to use for the where clause.
   * @param {unknown} [bindings] - The bindings to use with the raw SQL expression.
   * @returns {IEloquent<Model, IEloquentExpression<unknown>>} The query builder instance for chaining.
   */
  whereRaw<T = string>(
    value: T,
    bindings?: unknown,
  ): IEloquent<Model, IEloquentExpression<unknown>> {
    this.validateSqlRaw(value);
    return super.whereRaw<SqlRaw>({ sql: value as string, bindings });
  }

  /**
   * Formats the result rows to models
   * @param results The result rows to format
   * @returns The formatted models
   */
  protected formatResultsAsModels(results: object[]): Model[] {
    results = this.denormalizeDocuments(results);
    results = this.formatter.format(results);
    results = super.formatResultsAsModels(results);
    return results as Model[];
  }

  /**
   * Executes a SQL expression using the connected PostgreSQL client.
   *
   * This method builds the SQL query from the given expression and executes it using the connected PostgreSQL client.
   * The result of the query is returned as a promise.
   *
   * @param {SqlExpression} [expression] - The SQL expression builder instance containing the query to execute. If not provided, the query builder's expression instance is used.
   * @returns {Promise<T>} A promise that resolves with the query result.
   * @throws {QueryException} If the query execution fails.
   * @private
   * @deprecated Use execute() instead
   */
  async fetchRows<T = QueryResult>(
    expression: SqlExpression = this.expression,
  ): Promise<T> {
    const results = await this.execute(expression);
    results.rows = this.formatResultsAsModels(results.rows as object[]);
    return results as T;
  }

  /**
   * Retrieves the PostgreSQL client instance connected to the database.
   * This is a protected method, intended to be used by subclasses of PostgresEloquent.
   * @returns {pg.Client} The PostgreSQL client instance.
   */
  protected getPool(): pg.Pool | pg.PoolClient {
    if (this.pool) {
      return this.pool;
    }

    return DB.getInstance().databaseService().postgres().getPool();
  }

  /**
   * Executes a raw SQL query using the connected PostgreSQL client.
   *
   * @param expression The SQL query to execute.
   * @param bindings The bindings to use for the query.
   * @returns A promise that resolves with the query result.
   */
  async raw<T = QueryResult>(
    expression: string,
    bindings?: unknown[],
  ): Promise<T> {
    if (DB.getInstance().databaseService().showLogs()) {
      DB.getInstance().logger()?.info("[Postgres] raw", expression, bindings);
    }

    const results = await this.getPool().query(expression, bindings);

    if (DB.getInstance().databaseService().showLogs()) {
      DB.getInstance()
        .logger()
        ?.info("[Postgres] count", results?.rows?.length);
    }

    this.expression.bindingsUtility.reset();

    return results as T;
  }

  /**
   * Find a model by its id
   *
   * @param id The id of the model to find
   * @returns A promise resolving to the found model, or null if not found
   */
  async find(id: string | number): Promise<Model | null> {
    return await captureError<Model | null>(
      async () => {
        this.expression.setBuildTypeSelect();

        const res = await this.fetchRows(
          this.expression.setWhere([]).where("id", "=", id),
        );

        return res.rows[0] ?? null;
      },
      (...args) =>
        DB.getInstance()
          .logger()
          ?.error(...args),
    );
  }

  /**
   * Find or fail if no document found
   * @param id The id of the document to find
   * @returns The found model or throws a ModelNotFound exception
   * @throws ModelNotFound
   */
  async findOrFail(id: string | number): Promise<Model> {
    const result = await this.find(id);

    if (!result) {
      throw new ModelNotFoundException();
    }

    return result;
  }

  /**
   * Retrieves the first document from the query builder or throws a ModelNotFound exception
   * if no documents are found.
   *
   * @returns A promise resolving to the first document found or throwing a ModelNotFound
   * exception if none were found.
   * @throws ModelNotFound
   */
  async firstOrFail(): Promise<Model> {
    const result = await this.first();

    if (!result) {
      throw new ModelNotFoundException();
    }

    return result;
  }

  /**
   * Retrieves the first document from the query builder or null if no documents
   * are found.
   *
   * @returns A promise resolving to the first document found or null if none
   * were found.
   */
  async first(): Promise<Model | null> {
    return await captureError<Model | null>(
      async () => {
        this.expression.setBuildTypeSelect();

        const previousLimit = this.expression.getOffsetLimit();

        const result = await this.execute(
          this.expression.setOffsetAndLimit({ limit: 1 }),
        );

        const models = await this.formatResultsAsModels(result.rows);

        // Reset the limit to the previous value
        this.expression.setOffsetAndLimit(previousLimit);

        return models[0] ?? null;
      },
      (...args) =>
        DB.getInstance()
          .logger()
          ?.error(...args),
    );
  }

  /**
   * Retrieves the last document from the query builder or throws a ModelNotFound exception
   * if no documents are found.
   *
   * @returns A promise resolving to the last document found or throwing a ModelNotFound
   * exception if none were found.
   * @throws ModelNotFound
   */
  async lastOrFail(): Promise<Model> {
    const result = await this.last();

    if (!result) {
      throw new ModelNotFoundException();
    }

    return result;
  }

  /**
   * Retrieves the last document from the query builder or null if no documents
   * are found.
   *
   * @returns A promise resolving to the last document found or null if none
   * were found.
   */
  async last(): Promise<Model | null> {
    return await captureError<Model | null>(
      async () => {
        this.expression.setBuildTypeSelect();

        const models = await this.fetchRows();

        if (models.rows.length === 0) {
          return null;
        }

        return models.rows[models.rows.length - 1] ?? null;
      },
      (...args) =>
        DB.getInstance()
          .logger()
          ?.error(...args),
    );
  }

  /**
   * Executes the query built by the query builder and retrieves a collection
   * of documents matching the specified query criteria.
   *
   * @returns A promise resolving to a collection of documents.
   */
  async get(): Promise<Collection<Model>> {
    return await captureError(
      async () => {
        this.expression.setBuildTypeSelect();

        const res = await this.fetchRows();

        this.resetBindingValues();

        return collect<Model>(res.rows);
      },
      (...args) =>
        DB.getInstance()
          .logger()
          ?.error(...args),
    );
  }

  /**
   * Retrieves all documents from the query builder without any pagination.
   *
   * This method is similar to {@link get}, but it will not apply any
   * pagination to the query. It is useful when you need to retrieve all
   * documents from the database without any limit.
   *
   * @returns A promise resolving to a collection of documents.
   */
  async all(): Promise<Collection<Model>> {
    return await captureError(
      async () => {
        this.expression.setBuildTypeSelect();

        const res = await this.fetchRows(
          this.expression.setWhere([]).setOffsetAndLimit(null),
        );

        return collect<Model>(res.rows);
      },
      (...args) =>
        DB.getInstance()
          .logger()
          ?.error(...args),
    );
  }

  /**
   * Inserts one or multiple documents into the database.
   *
   * @param documents The document(s) to be inserted.
   * @returns A promise resolving to a collection of the inserted documents.
   */
  async insert(documents: object | object[]): Promise<Collection<Model>> {
    return await captureError(
      async () => {
        // Store the previous expression
        const previousExpression = this.expression.clone() as SqlExpression;

        // Convert documents to array
        const documentsArray = Array.isArray(documents)
          ? documents
          : [documents];
        const normalizedDocuments = this.normalizeDocuments(documentsArray);
        const results: unknown[] = [];

        for (const document of normalizedDocuments) {
          // Reset the expression
          this.setExpression(previousExpression);

          const documentWithId = this.documentWithGeneratedId<Model>(document);

          // Execute the insert query
          const res = await this.execute(
            this.expression.setBuildTypeInsert(documentWithId as object),
          );

          // Add the result to the results array
          results.push(res.rows[0]);
        }

        // Reset the expression
        this.setExpression(previousExpression);

        return collect<Model>(this.formatResultsAsModels(results as object[]));
      },
      (...args) =>
        DB.getInstance()
          .logger()
          ?.error(...args),
    );
  }

  /**
   * Updates one or multiple documents in the database.
   *
   * @param documents The document(s) to be updated.
   * @returns A promise resolving to a collection of the updated documents.
   */
  async update(documents: object | object[]): Promise<Collection<Model>> {
    return await captureError(
      async () => {
        const documentsArray: object[] = Array.isArray(documents)
          ? documents
          : [documents];

        if (documentsArray.length === 0) {
          throw new UpdateException();
        }

        for (const document of documentsArray) {
          await this.clone().execute(
            this.expression.setBuildTypeUpdate(document),
          );
        }

        // Reset the binding values
        this.resetBindingValues();

        return await this.get();
      },
      (...args) =>
        DB.getInstance()
          .logger()
          ?.error(...args),
    );
  }

  /**
   * Updates multiple documents in the database without any where clause.
   *
   * @param documents The documents to be updated.
   * @returns A promise resolving to a collection of the updated documents.
   */
  async updateAll(documents: object | object[]): Promise<Collection<Model>> {
    this.expression.setWhere([]);
    return await this.update(documents);
  }

  /**
   * Deletes records from the database based on the current query builder state.
   *
   * @returns {Promise<IEloquent<Model>>} A promise that resolves to the query builder instance
   * for chaining after the deletion operation.
   *
   * @throws {DeleteException} Throws an exception if the query builder state is invalid.
   */
  async delete(): Promise<IEloquent<Model, SqlExpression>> {
    return await captureError(
      async () => {
        const previousExpression = this.expression.clone() as SqlExpression;

        this.expression.setBuildTypeDelete();

        await this.execute();

        this.setExpression(previousExpression);

        return this as unknown as IEloquent<Model, SqlExpression>;
      },
      (...args) =>
        DB.getInstance()
          .logger()
          ?.error(...args),
    );
  }

  /**
   * Executes a count query to retrieve the number of documents matching the
   * query criteria.
   *
   * @returns A promise resolving to the count of the documents.
   */
  async count(column: string | null = null): Promise<number> {
    return await this.fetchAggregateResultNumber(
      `COUNT(${column ?? "*"}) AS aggregate_result`,
    );
  }

  /**
   * Calculates the minimum of the specified column and returns it as a Promise.
   *
   * @param {string} column The column to calculate the minimum for.
   * @returns {Promise<number>} A promise resolving to the minimum of the specified column.
   */
  async min(column: string): Promise<number> {
    return await this.fetchAggregateResultNumber(
      `MIN(${column}) AS aggregate_result`,
    );
  }

  /**
   * Calculates the maximum of the specified column and returns it as a Promise.
   *
   * @param {string} column The column to calculate the maximum for.
   * @returns {Promise<number>} A promise resolving to the maximum of the specified column.
   */

  async max(column: string): Promise<number> {
    return await this.fetchAggregateResultNumber(
      `MAX(${column}) AS aggregate_result`,
    );
  }

  /**
   * Calculates the average of the specified column and returns it as a Promise.
   *
   * @param {string} column The column to calculate the average for.
   * @returns {Promise<number>} A promise resolving to the average of the specified column.
   */
  async avg(column: string): Promise<number> {
    return await this.fetchAggregateResultNumber(
      `AVG(${column}) AS aggregate_result`,
    );
  }

  /**
   * Calculates the sum of the specified column and returns it as a Promise.
   *
   * @param {string} column - The column to calculate the sum for.
   * @returns {Promise<number>} A promise resolving to the sum of the specified column.
   */
  async sum(column: string): Promise<number> {
    return await this.fetchAggregateResultNumber(
      `SUM(${column}) AS aggregate_result`,
    );
  }

  /**
   * Executes a database transaction, allowing a series of operations to be
   * executed with rollback capability in case of errors.
   *
   * @param {TransactionFn} callbackFn - The function to execute within the transaction.
   * It receives a query instance to perform database operations.
   * @returns {Promise<void>} A promise that resolves once the transaction completes.
   * @throws {Error} Throws an error if the transaction fails, in which case a rollback is performed.
   */
  async transaction(callbackFn: TransactionFn<Model>): Promise<void> {
    let boundPgClient!: pg.PoolClient;

    try {
      const pool = this.getDatabaseAdapter<PostgresAdapter>().getPool();
      const pgClient = await pool.connect();
      // Bind all methods
      boundPgClient = _lodash.bindAll(pgClient, ["query", "release"]);

      // Begin the transaction
      await boundPgClient.query("BEGIN");

      // Execute the callback function
      const cloneEloquentBound = this.clone.bind(this);
      const clonedEloquent =
        cloneEloquentBound() as unknown as PostgresEloquent<Model>;

      // Set the pool
      clonedEloquent.setPool(boundPgClient as unknown as pg.Pool);

      // Override clone to ensure it uses the bound pool
      await callbackFn(clonedEloquent as unknown as IEloquent<Model>);

      // Commit the transaction
      await boundPgClient.query("COMMIT");
    } catch (err) {
      // Rollback the transaction
      if (boundPgClient) {
        await boundPgClient.query("ROLLBACK");
      }
      throw err;
    } finally {
      // Close the client
      if (boundPgClient) {
        boundPgClient.release();
      }
    }
  }

  /**
   * Executes a raw query to retrieve a single number from the database
   * and returns it as a Promise.
   *
   * @param {string} selectRaw The raw SQL to execute.
   * @param {string} [targetProperty] The property to retrieve from the result.
   * @returns {Promise<number>} A promise resolving to the result of the query.
   * @throws {EloquentException} If the query result is null or undefined.
   * @private
   */
  protected async fetchAggregateResultNumber(
    selectRaw: string,
    targetProperty: string = "aggregate_result",
  ): Promise<number> {
    return await captureError(
      async () => {
        const previousExpression = this.expression.clone() as SqlExpression;

        this.expression.setBuildTypeSelect();
        this.selectRaw(selectRaw);
        this.distinct(null);
        this.orderBy(null);
        this.offset(null);

        const res = await this.execute();

        const result = res.rows?.[0]?.[targetProperty] ?? null;

        if (!result) {
          throw new EloquentException(`${targetProperty} is null`);
        }

        this.setExpression(previousExpression);

        return parseFloat(result);
      },
      (...args) =>
        DB.getInstance()
          .logger()
          ?.error(...args),
    );
  }

  /**
   * Sets the distinct columns for the query builder.
   *
   * @param {string|string[]} [columns] The columns to set for distinct.
   * @returns {this} The query builder instance.
   */
  distinct(columns: string[] | string | null): IEloquent<Model, SqlExpression> {
    const columnsArray = Array.isArray(columns) ? columns : [columns];
    this.expression.setDistinctColumns(
      columnsArray.map((column) => ({ column })),
    );
    return this as unknown as IEloquent<Model>;
  }

  /**
   * Validates a SQL raw value.
   *
   * @param {unknown} value The value to validate.
   * @throws {EloquentException} If the value is not a string.
   * @private
   */
  protected validateSqlRaw(value: unknown): void {
    if (typeof value === "string") {
      return;
    }
    throw new EloquentException(
      "Invalid SQL raw value. Expected a string. Received: " + typeof value,
    );
  }
}

export default PostgresEloquent;
