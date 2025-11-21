import DB from "../../database/services/DB.js";

import {
  Collection,
  collect,
} from "@larascript-framework/larascript-collection";
import {
  MoveObjectToProperty,
  captureError,
} from "@larascript-framework/larascript-utils";
import { Document, Collection as MongoCollection, ObjectId } from "mongodb";
import Eloquent from "../../eloquent/Eloquent.js";
import EloquentException from "../../eloquent/exceptions/EloquentExpression.js";
import ModelNotFoundException from "../../eloquent/exceptions/ModelNotFoundException.js";
import { IEloquent, IEloquentExpression } from "../../eloquent/index.js";
import { IModel, ModelConstructor } from "../../model/index.js";
import { MongoDbAdapter } from "../adapters/index.js";
import AggregateExpression from "../builder/AggregateExpression/index.js";

/**
 * Represents a MongoDB document with an ObjectId _id field and model attributes.
 * Excludes the 'id' field from the model attributes and makes _id required.
 * @template Model The model type extending IModel
 */

export type ModelAttributesWithObjectId<Model extends IModel> = NonNullable<
  Omit<Model["attributes"], "id"> & { _id: ObjectId }
>;

export type DocumentWithId<Property extends string = "_id"> = Document & {
  [key in Property]: ObjectId;
};

/**
 * MongoDB-specific implementation of the Eloquent ORM.
 * Provides MongoDB-specific functionality for querying and manipulating documents.
 *
 * @template Model The model type extending IModel that this eloquent instance works with
 * @extends {Eloquent<Model, AggregateExpression, MongoDbAdapter>}
 *
 * @example
 * ```typescript
 * class UserModel extends Model {
 *   // Model definition
 * }
 *
 * const query = queryBuilder(UserModel)
 * const users = await query.where('age', '>', 18).get();
 * ```
 */
class MongoDbEloquent<Model extends IModel> extends Eloquent<
  Model,
  AggregateExpression,
  MongoDbAdapter
> {
  /**
   * The query builder expression object
   */
  protected expression: AggregateExpression = new AggregateExpression();

  /**
   * The formatter instance
   */
  protected formatter = new MoveObjectToProperty();

  /**
   * Retrieves the MongoDB Collection instance for the model.
   * @param collectionName Optional collection name to use. If not provided, the model's table name will be used.
   * @returns The MongoDB Collection instance.
   * @throws Error if the model constructor is not set.
   */
  getMongoCollection(collectionName?: string): MongoCollection {
    const modelCtor = this.getModelCtor();
    if (!modelCtor) {
      throw new Error("Model constructor is not set");
    }
    if (!collectionName) {
      collectionName = modelCtor.getTable();
    }
    return this.getDatabaseAdapter().getDb().collection(collectionName);
  }

  /**
   * Normalizes document id to ObjectId
   * @param id The id to normalize
   * @returns The normalized ObjectId
   * @throws EloquentException if the id is invalid
   */
  normalizeId(id: unknown): ObjectId | string | number {
    if (id instanceof ObjectId) {
      return id;
    }
    if (typeof id === "string") {
      return ObjectId.createFromHexString(id);
    }
    if (typeof id === "number") {
      return ObjectId.createFromHexString(id.toString());
    }

    throw new EloquentException("Invalid document id");
  }

  /**
   * Denormalizes an id to an ObjectId
   * @param id The id to denormalize
   * @returns The denormalized ObjectId
   * @throws EloquentException if the id is invalid
   */
  denormalizeId(id: string | number | ObjectId): string {
    if (id instanceof ObjectId) {
      return id.toString();
    }
    if (typeof id === "string") {
      return id;
    }
    if (typeof id === "number") {
      return id.toString();
    }

    throw new EloquentException("Invalid document id");
  }

  /**
   * Normalizes MongoDB documents by converting _id fields to standard id format.
   * If the _id field is an ObjectId, it is converted to string.
   * The original _id field is removed from the document.
   * Also filters out columns not specified in the expression.
   *
   * @param documents - Single document or array of documents to normalize
   * @returns Array of normalized documents with standard id fields
   */
  denormalizeDocuments<T extends object = object>(documents: T | T[]): T[] {
    // Get the documents array
    let documentsArray = Array.isArray(documents) ? documents : [documents];

    // Normalize the documents
    documentsArray = documentsArray.map((document) => {
      const typedDocument = document as { _id?: unknown; id?: unknown };

      if (typedDocument._id) {
        typedDocument.id = this.denormalizeId(
          typedDocument._id as string | number | ObjectId,
        );
        delete typedDocument._id;
      }

      // Normalize ObjectId properties to string
      Object.keys(typedDocument).forEach((key) => {
        if (typedDocument[key] instanceof ObjectId) {
          typedDocument[key] = typedDocument[key].toString();
        }
      });

      return typedDocument as T;
    });

    // Filter out columns that are not specified in the expression
    const columnsArray = this.expression
      .getColumns()
      .map((option) => option.column)
      .filter((col) => col) as string[];
    documentsArray.map((document) => {
      columnsArray.forEach((column) => {
        if (typeof document[column] === "undefined") {
          delete document[column];
        }
      });
    });

    return documentsArray;
  }

  /*
   * Denormalizes document IDs by converting standard id fields back to MongoDB's _id format.
   * If the `id` field is a string, it is converted to ObjectId.
   * The original `id` field is removed from the document.
   *
   * @param document - The document to denormalize
   * @returns Document with MongoDB compatible _id field
   */
  normalizeDocuments<T extends object = object>(document: T | T[]): T[] {
    const documentsArray = Array.isArray(document) ? document : [document];

    return documentsArray.map((document) => {
      const typedDocument = document as { _id?: unknown; id?: unknown };

      // Check if the id should be converted to an ObjectId
      if (typedDocument.id) {
        if (this.idGeneratorFn) {
          typedDocument._id = typedDocument.id;
        } else {
          typedDocument._id = this.normalizeId(typedDocument.id);
        }
        delete typedDocument.id;
      }

      // Check if the _id should be converted to an ObjectId
      if (
        typedDocument._id &&
        typeof typedDocument._id === "string" &&
        ObjectId.isValid(typedDocument._id)
      ) {
        typedDocument._id = new ObjectId(typedDocument._id);
      }

      // Check each property if it should be converted to an ObjectId
      Object.keys(document).forEach((key) => {
        if (
          typeof document[key] === "string" &&
          ObjectId.isValid(document[key])
        ) {
          typedDocument[key] = new ObjectId(document[key]);
        }
      });

      return typedDocument as T;
    });
  }

  /**
   * Normalizes the id property to the MongoDB _id property.
   * @param property The property to normalize
   * @returns The normalized property
   */
  normalizeIdProperty(property: string): string {
    return property === "id" ? "_id" : property;
  }

  /**
   * Adds a join unwind stage to the pipeline
   * @param relatedTable The name of the related table to join
   */
  protected addJoinUnwindStage(path: string): void {
    this.expression.addPipelineStage([
      {
        $unwind: {
          path: `$${path}`,
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
  }

  /**
   * Prepares the join by adding the unwind stage, the column to the expression and the formatter option.
   * @param related The related model constructor
   * @param localColumn The local column to join on
   * @param relatedColumn The related column to join on
   * @param options The options for the join
   */
  protected prepareJoin(
    related: ModelConstructor<IModel>,
    localColumn: string,
    relatedColumn: string,
    targetProperty: string,
  ): void {
    if (typeof targetProperty !== "string" || targetProperty.length === 0) {
      throw new EloquentException("Target property is required for join");
    }

    localColumn = this.normalizeIdProperty(localColumn);
    relatedColumn = this.normalizeIdProperty(relatedColumn);

    // Add the unwind stage
    const path = Eloquent.getJoinAsPath(
      related.getTable(),
      localColumn,
      relatedColumn,
    );
    this.expression.addPipelineStage([
      {
        $unwind: {
          path: `$${path}`,
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    // Add the column to the expression
    this.expression.addColumn({
      column: Eloquent.getJoinAsPath(
        related.getTable(),
        localColumn,
        relatedColumn,
      ),
      tableName: this.useTable(),
    });

    // Add the formatter option (maps the related object to the target property)
    this.formatter.addOption(
      Eloquent.getJoinAsPath(related.getTable(), localColumn, relatedColumn),
      targetProperty,
    );
  }

  /**
   * Joins a related table to the current query.
   * @param relatedTable The name of the related table to join
   * @param localColumn The local column to join on
   * @param relatedColumn The related column to join on
   * @param targetProperty The target property to map the related object to
   * @returns The current query builder instance
   */
  join(
    related: ModelConstructor<IModel>,
    localColumn: string,
    relatedColumn: string,
    targetProperty: string,
  ): IEloquent<Model, IEloquentExpression<unknown>> {
    // Normalize the columns
    localColumn = this.normalizeIdProperty(localColumn);
    relatedColumn = this.normalizeIdProperty(relatedColumn);

    // Add the join to the expression
    super.join(related, localColumn, relatedColumn);

    // Prepare the join
    this.prepareJoin(related, localColumn, relatedColumn, targetProperty);

    return this as unknown as IEloquent<Model, IEloquentExpression<unknown>>;
  }

  leftJoin(
    related: ModelConstructor<IModel>,
    localColumn: string,
    relatedColumn: string,
    targetProperty: string,
  ): IEloquent<Model, IEloquentExpression<unknown>> {
    // Normalize the columns
    localColumn = this.normalizeIdProperty(localColumn);
    relatedColumn = this.normalizeIdProperty(relatedColumn);

    // Add the join to the expression
    super.leftJoin(related, localColumn, relatedColumn);

    // Prepare the join
    this.prepareJoin(related, localColumn, relatedColumn, targetProperty);

    return this as unknown as IEloquent<Model, IEloquentExpression<unknown>>;
  }

  rightJoin(
    related: ModelConstructor<IModel>,
    localColumn: string,
    relatedColumn: string,
    targetProperty: string,
  ): IEloquent<Model, IEloquentExpression<unknown>> {
    // Normalize the columns
    localColumn = this.normalizeIdProperty(localColumn);
    relatedColumn = this.normalizeIdProperty(relatedColumn);

    // Add the join to the expression
    super.rightJoin(related, localColumn, relatedColumn);

    // Prepare the join
    this.prepareJoin(related, localColumn, relatedColumn, targetProperty);

    return this as unknown as IEloquent<Model, IEloquentExpression<unknown>>;
  }

  fullJoin(
    related: ModelConstructor<IModel>,
    localColumn: string,
    relatedColumn: string,
    targetProperty: string,
  ): IEloquent<Model, IEloquentExpression<unknown>> {
    // Normalize the columns
    localColumn = this.normalizeIdProperty(localColumn);
    relatedColumn = this.normalizeIdProperty(relatedColumn);

    // Add the join to the expression
    super.join(related, localColumn, relatedColumn);

    // Prepare the join
    this.prepareJoin(related, localColumn, relatedColumn, targetProperty);

    return this as unknown as IEloquent<Model, IEloquentExpression<unknown>>;
  }

  /**
   * Executes a raw MongoDB aggregation query and returns the results.
   * @param aggregationPipeline - The aggregation pipeline to execute
   * @returns The results of the aggregation query
   */
  async raw<T = ModelAttributesWithObjectId<Model>[]>(
    aggregationPipeline?: object[],
  ): Promise<T> {
    return captureError<T>(
      async () => {
        // Get the pipeline
        if (!aggregationPipeline) {
          aggregationPipeline = this.expression.build();
        }

        if (DB.getInstance().databaseService().showLogs()) {
          DB.getInstance()
            .logger()
            ?.info(
              "[MongoDbEloquent.raw] aggregation (Collection: " +
                (this.modelCtor?.getTable() ?? "Unknown") +
                ")",
              JSON.stringify(aggregationPipeline),
            );
        }

        // Get the collection
        const collection = this.getMongoCollection();

        // Get the results
        return (await collection.aggregate(aggregationPipeline).toArray()) as T;
      },
      (...args) =>
        DB.getInstance()
          .logger()
          ?.error(...args),
    );
  }

  /**
   * Executes a MongoDB aggregation pipeline using the provided pipeline builder expression.
   * Normalizes the results and applies any configured formatters.
   *
   * @template T The expected return type, defaults to array of model attributes
   * @param {AggregateExpression} [expression] The pipeline builder expression to execute. If not provided, uses the instance's expression.
   * @returns {Promise<T>} A promise that resolves with the query results
   * @throws {QueryException} If the query execution fails
   * @private
   */
  async fetchRows<T = NonNullable<Model["attributes"]>[]>(
    expression: AggregateExpression = this.expression,
  ): Promise<T> {
    return await captureError<T>(
      async () => {
        // Get the previous expression
        const previousExpression = this.expression.clone();

        // Set the build type to select
        this.expression.setBuildTypeSelect();

        // Get the collection
        const collection = this.getMongoCollection();

        // Get the results
        const documents = await collection
          .aggregate(expression.build())
          .toArray();

        // Restore the previous expression
        this.setExpression(previousExpression);

        return this.formatResultsAsModels(documents) as T;
      },
      (...args) =>
        DB.getInstance()
          .logger()
          ?.error(...args),
    );
  }

  /**
   * Finds multiple documents in the database using the given filter.
   *
   * @param filter The filter to use for the query.
   * @returns A promise resolving to the found documents.
   */
  async findMany<T = NonNullable<Model["attributes"]>[]>(
    filter: object,
  ): Promise<T> {
    return await captureError<T>(
      async () => {
        this.expression.setBuildTypeSelect();

        const collection = this.getMongoCollection();

        const results = await collection.find(filter).toArray();

        return results as T;
      },
      (...args) =>
        DB.getInstance()
          .logger()
          ?.error(...args),
    );
  }

  /**
   * Finds a single document by its id.
   * @param id The id of the document to find
   * @returns A promise resolving to the found document, or null if not found
   */
  async find(id: string | number): Promise<Model | null> {
    let objectId: ObjectId | string | number;

    try {
      objectId = this.normalizeId(id);
    } catch (err) {
      objectId = id;
    }

    return await captureError<Model | null>(
      async () => {
        // Get the collection
        const collection = this.getMongoCollection();

        // Get the document
        const document = await collection.findOne({ _id: objectId } as object);

        if (!document) {
          return null;
        }

        return this.formatResultsAsModels([document])[0];
      },
      (...args) =>
        DB.getInstance()
          .logger()
          ?.error(...args),
    );
  }

  /**
   * Finds a single document by its id or throws an exception if not found.
   *
   * @param id The id of the document to find
   * @returns A promise resolving to the found document
   * @throws ModelNotFound if no document is found with the given id
   */
  async findOrFail(id: string | number): Promise<Model> {
    const document = await this.find(id);

    if (!document) {
      throw new ModelNotFoundException("Document not found");
    }

    return document;
  }

  /**
   * Gets the first document matching the current query conditions.
   * @returns Promise resolving to the first matching document or null if none found
   */
  async first(): Promise<Model | null> {
    return await captureError(
      async () => {
        // Get the previous expression
        const previousExpression = this.expression.clone();

        // Set the build type to select
        this.expression.setBuildTypeSelect();
        this.expression.setLimit(1);

        // Get the documents
        const documents = this.formatResultsAsModels(await this.raw());

        // Restore the previous expression
        this.setExpression(previousExpression);

        if (documents.length === 0) {
          return null;
        }

        return documents[0];
      },
      (...args) =>
        DB.getInstance()
          .logger()
          ?.error(...args),
    );
  }

  /**
   * Gets the first document matching the current query conditions or throws an exception if none found.
   * @returns Promise resolving to the first matching document
   * @throws ModelNotFound if no matching document is found
   */
  async firstOrFail(): Promise<Model> {
    const document = await this.first();

    if (!document) {
      throw new ModelNotFoundException("Document not found");
    }

    return document;
  }

  /**
   * Gets the last document matching the current query conditions.
   * @returns Promise resolving to the last matching document or null if none found
   */
  async last(): Promise<Model | null> {
    return await captureError(
      async () => {
        // Get the previous expression
        const previousExpression = this.expression.clone();

        // Set the build type to select
        this.expression.setBuildTypeSelect();

        // Get the documents
        const documents = await this.get();

        // Restore the previous expression
        this.setExpression(previousExpression);

        if (documents.isEmpty()) {
          return null;
        }

        return documents.last();
      },
      (...args) =>
        DB.getInstance()
          .logger()
          ?.error(...args),
    );
  }

  /**
   * Gets the last document matching the current query conditions or throws an exception if none found.
   * @returns Promise resolving to the last matching document
   * @throws ModelNotFound if no matching document is found
   */
  async lastOrFail(): Promise<Model> {
    const document = await this.last();

    if (!document) {
      throw new ModelNotFoundException("Document not found");
    }

    return document;
  }

  /**
   * Retrieves a collection of documents from the database using the query builder expression.
   * @returns A promise resolving to a collection of documents
   */
  async get(): Promise<Collection<Model>> {
    return await captureError(
      async () => {
        // Get the previous expression
        const previousExpression = this.expression.clone();

        // Set the build type to select
        this.expression.setBuildTypeSelect();

        // Fetch the documents, apply the distinct filters and normalize the documents
        const documents = await this.raw();

        // Apply the distinct filters and normalize the documents
        const results = this.formatResultsAsModels(
          await this.applyDistinctFilters(documents),
        );

        // Restore the previous expression
        this.setExpression(previousExpression);

        return collect<Model>(results);
      },
      (...args) =>
        DB.getInstance()
          .logger()
          ?.error(...args),
    );
  }

  /**
   * Formats the results by normalizing the documents, applying the formatter function, and grouping the prefixed properties.
   * @param results The results to format
   * @returns The formatted results
   */
  protected formatResultsAsModels(results: Document[]): Model[] {
    results = this.denormalizeDocuments(results);
    results = this.formatter.format(results);
    return super.formatResultsAsModels(results);
  }

  /**
   * Applies distinct filters to the documents.
   * @param documents The documents to apply the distinct filters to
   * @returns The documents with the distinct filters applied
   */
  protected async applyDistinctFilters(
    documents: Document[],
  ): Promise<Document[]> {
    if (
      !this.expression.getGroupBy() ||
      this.expression.getGroupBy()?.length === 0
    ) {
      return documents;
    }

    const results: Document[] = [];
    const collection = this.getMongoCollection();

    // Get the distinct columns
    const distinctColumns =
      this.expression.getGroupBy()?.map((option) => option.column) ?? [];

    // Apply the distinct filters on each column
    for (const column of distinctColumns) {
      const distinctValues: unknown[] = await collection.distinct(
        column,
        this.expression.buildMatchAsFilterObject() ?? {},
      );

      // Add the documents that match the distinct values
      distinctValues.forEach((distinctValue) => {
        results.push(
          documents.find(
            (document) => document[column] === distinctValue,
          ) as Document,
        );
      });
    }

    return results;
  }

  /**
   * Retrieves all documents from the database using the query builder expression.
   * @returns A promise resolving to a collection of documents
   */
  async all(): Promise<Collection<Model>> {
    return await captureError(
      async () => {
        // Get the previous expression
        const previousExpression = this.expression.clone();

        // Set the build type to select
        this.expression.setBuildTypeSelect();
        this.expression.setWhere(null);
        this.expression.setRawWhere(null);

        // Get the documents
        const documents = await this.raw(this.expression.build());

        // Restore the previous expression
        this.setExpression(previousExpression);

        return collect<Model>(this.formatResultsAsModels(documents));
      },
      (...args) =>
        DB.getInstance()
          .logger()
          ?.error(...args),
    );
  }

  /**
   * Inserts documents into the database and returns a collection of inserted models.
   * @param documents - The documents to insert
   * @returns A collection of inserted models
   */
  async insert(documents: object | object[]): Promise<Collection<Model>> {
    return captureError(
      async () => {
        // Get the collection
        const collection = this.getMongoCollection();

        // Denormalize the documents to be inserted
        const documentsArray = Array.isArray(documents)
          ? documents
          : [documents];

        // Apply the id generator function to the documents
        const normalizedDocuments = this.prepareInsertDocuments(documentsArray);

        // Insert the documents
        const inserted = await collection.insertMany(normalizedDocuments);

        // Get the inserted ids
        const insertedIds = Object.values(inserted.insertedIds);

        // Get the results for the inserted ids
        const results = await this.findMany({ _id: { $in: insertedIds } });

        return collect<Model>(this.formatResultsAsModels(results));
      },
      (...args) =>
        DB.getInstance()
          .logger()
          ?.error(...args),
    );
  }

  /**
   * Prepares the documents for insertion by normalizing the ids and converting ObjectId properties to ObjectId instances.
   * @param documentsArray - The array of documents to prepare
   * @returns The prepared array of documents
   */
  protected prepareInsertDocuments(documentsArray: object[]): object[] {
    // Apply the id generator function to the documents
    documentsArray = documentsArray.map((document) =>
      this.idGeneratorFn ? this.idGeneratorFn(document) : document,
    );

    // Normalize the documents
    documentsArray = this.normalizeDocuments(documentsArray);

    return documentsArray;
  }

  /**
   * Updates documents matching the current query conditions.
   * @param documents - Document or array of documents containing the update values
   * @returns Promise resolving to a collection of updated documents
   */
  async update(documents: object | object[]): Promise<Collection<Model>> {
    return captureError(
      async () => {
        const collection = this.getMongoCollection();

        // Get the match filter for the current expression
        const previousExpression = this.expression.clone();
        const matchFilter = this.expression.buildMatchAsFilterObject() ?? {};

        // Denormalize the documents to be updated
        const documentsArray = Array.isArray(documents)
          ? documents
          : [documents];
        const normalizedDocuments = this.normalizeDocuments(documentsArray);
        const normalizedDocumentsArray = Array.isArray(normalizedDocuments)
          ? normalizedDocuments
          : [normalizedDocuments];

        // Get the pre-update results for the match filter
        const preUpdateResults = await this.raw(
          new AggregateExpression()
            .setColumns([{ column: "_id" }])
            .setWhere(this.expression.getWhere())
            .setLimit(1000)
            .build(),
        );
        const preUpdateResultsDocumentIds = preUpdateResults.map(
          (document) => document._id,
        );

        // Update each document
        for (const document of normalizedDocumentsArray) {
          await collection.updateOne(matchFilter, { $set: document });
        }

        // Get the post-update results for the match filter
        const postUpdateResults = await this.findMany({
          _id: { $in: preUpdateResultsDocumentIds },
        });

        // Restore the previous expression
        this.setExpression(previousExpression);

        // Return the post-update results
        return collect<Model>(this.formatResultsAsModels(postUpdateResults));
      },
      (...args) =>
        DB.getInstance()
          .logger()
          ?.error(...args),
    );
  }

  /**
   * Updates all documents matching the current query conditions.
   * @param document - Document or array of documents containing the update values
   * @returns Promise resolving to a collection of updated documents
   */
  async updateAll(document: object): Promise<Collection<Model>> {
    return captureError(
      async () => {
        const collection = this.getMongoCollection();

        // Get the match filter for the current expression
        const previousExpression = this.expression.clone();
        const matchFilter = this.expression.buildMatchAsFilterObject() ?? {};

        // Denormalize the documents to be updated
        const normalizedDocument = this.normalizeDocuments(
          document,
        )?.[0] as object;

        // Build aggregate expression to get document IDs for update
        const preUpdateAggregation: object[] = new AggregateExpression()
          .setColumns([{ column: "_id" }])
          .setWhere(this.expression.getWhere())
          .setLimit(1000)
          .build();

        // Get the pre-update results for the match filter
        const preUpdateResults = await this.raw(preUpdateAggregation);
        const preUpdateResultsDocumentIds = preUpdateResults.map(
          (document) => document._id,
        );

        // Update each document
        await collection.updateMany(matchFilter, { $set: normalizedDocument });

        // Get the post-update results for the match filter
        const postUpdateResults = await this.findMany({
          _id: { $in: preUpdateResultsDocumentIds },
        });

        // Restore the previous expression
        this.setExpression(previousExpression);

        // Return the post-update results
        return collect<Model>(this.formatResultsAsModels(postUpdateResults));
      },
      (...args) =>
        DB.getInstance()
          .logger()
          ?.error(...args),
    );
  }

  /**
   * Deletes documents matching the current query conditions.
   * @returns Promise resolving to a collection of deleted documents
   */
  async delete(): Promise<IEloquent<Model, AggregateExpression>> {
    await captureError(
      async () => {
        // Get the collection
        const collection = this.getMongoCollection();

        const previousExpression = this.expression.clone();

        // Get the pre-delete results for the match filter
        const preDeleteResults = await this.raw(
          this.expression.setColumns([{ column: "_id" }]).build(),
        );
        const preDeleteResultsDocumentIds = preDeleteResults.map(
          (document) => document._id,
        );

        // Get the match filter for the current expression
        const deleteFilter = { _id: { $in: preDeleteResultsDocumentIds } };

        // Delete the documents
        await collection.deleteMany(deleteFilter);

        // Restore the previous expression
        this.setExpression(previousExpression);
      },
      (...args) =>
        DB.getInstance()
          .logger()
          ?.error(...args),
    );

    return this as unknown as IEloquent<Model, AggregateExpression>;
  }

  /**
   * Counts the number of documents matching the current query conditions.
   * @returns Promise resolving to the count of documents
   */
  async count(column: string = "_id"): Promise<number> {
    return await captureError(
      async () => {
        // Get the previous expression
        const previousExpression = this.expression.clone();

        // Get the match filter for the current expression
        const filter = this.expression.buildMatchAsFilterObject() ?? {};

        // Build the pipeline
        const pipeline = new AggregateExpression()
          .addPipeline([
            {
              $match: {
                ...filter,
                [column]: { $exists: true },
              },
            },
          ])
          .addPipeline([
            {
              $facet: {
                count: [
                  {
                    $group: {
                      _id: null,
                      count: { $sum: 1 },
                    },
                  },
                ],
              },
            },
          ])
          .getPipeline();

        const count = await this.fetchAggregationResult(pipeline, "count");

        // Restore the previous expression
        this.setExpression(previousExpression);

        return count;
      },
      (...args) =>
        DB.getInstance()
          .logger()
          ?.error(...args),
    );
  }

  /**
   * Calculates the minimum value of a column.
   * @param column - The column to calculate the minimum value of
   * @returns Promise resolving to the minimum value of the column
   */
  async min(column: string): Promise<number> {
    return await captureError(
      async () => {
        // Get the previous expression
        const previousExpression = this.expression.clone();

        // Get the match filter for the current expression
        const filter = this.expression.buildMatchAsFilterObject() ?? {};

        // Build the pipeline
        const pipeline = new AggregateExpression()
          .addPipeline([
            {
              $match: {
                ...filter,
                [column]: { $exists: true },
              },
            },
          ])
          .addPipeline([
            {
              $facet: {
                min: [
                  {
                    $group: {
                      _id: null,
                      min: { $min: `$${column}` },
                    },
                  },
                ],
              },
            },
          ])
          .getPipeline();

        const min = await this.fetchAggregationResult(pipeline, "min");

        // Restore the previous expression
        this.setExpression(previousExpression);

        return min;
      },
      (...args) =>
        DB.getInstance()
          .logger()
          ?.error(...args),
    );
  }

  /**
   * Calculates the maximum value of a column.
   * @param column - The column to calculate the maximum value of
   * @returns Promise resolving to the maximum value of the column
   */
  async max(column: string): Promise<number> {
    return await captureError(
      async () => {
        // Get the previous expression
        const previousExpression = this.expression.clone();

        // Get the match filter for the current expression
        const filter = this.expression.buildMatchAsFilterObject() ?? {};

        // Build the pipeline
        const pipeline = new AggregateExpression()
          .addPipeline([
            {
              $match: {
                ...filter,
                [column]: { $exists: true },
              },
            },
          ])
          .addPipeline([
            {
              $facet: {
                max: [
                  {
                    $group: {
                      _id: null,
                      max: { $max: `$${column}` },
                    },
                  },
                ],
              },
            },
          ])
          .getPipeline();

        const max = await this.fetchAggregationResult(pipeline, "max");

        // Restore the previous expression
        this.setExpression(previousExpression);

        return max;
      },
      (...args) =>
        DB.getInstance()
          .logger()
          ?.error(...args),
    );
  }

  /**
   * Calculates the sum of a column.
   * @param column - The column to calculate the sum of
   * @returns Promise resolving to the sum of the column
   */
  async sum(column: string): Promise<number> {
    return await captureError(
      async () => {
        // Get the previous expression
        const previousExpression = this.expression.clone();

        // Get the match filter for the current expression
        const filter = this.expression.buildMatchAsFilterObject() ?? {};

        // Build the pipeline
        const pipeline = new AggregateExpression()
          .addPipeline([
            {
              $match: {
                ...filter,
                [column]: { $exists: true },
              },
            },
          ])
          .addPipeline([
            {
              $facet: {
                sum: [
                  {
                    $group: {
                      _id: null,
                      sum: { $sum: `$${column}` },
                    },
                  },
                ],
              },
            },
          ])
          .getPipeline();

        const sum = await this.fetchAggregationResult(pipeline, "sum");

        // Restore the previous expression
        this.setExpression(previousExpression);

        return sum;
      },
      (...args) =>
        DB.getInstance()
          .logger()
          ?.error(...args),
    );
  }

  /**
   * Calculates the average of a column.
   * @param column - The column to calculate the average of
   * @returns Promise resolving to the average of the column
   */
  async avg(column: string): Promise<number> {
    return await captureError(
      async () => {
        // Get the previous expression
        const previousExpression = this.expression.clone();

        // Get the match filter for the current expression
        const filter = this.expression.buildMatchAsFilterObject() ?? {};

        // Build the pipeline
        const pipeline = new AggregateExpression()
          .addPipeline([
            {
              $match: {
                ...filter,
                [column]: { $exists: true },
              },
            },
          ])
          .addPipeline([
            {
              $facet: {
                avg: [
                  {
                    $group: {
                      _id: null,
                      avg: { $avg: `$${column}` },
                    },
                  },
                ],
              },
            },
          ])
          .getPipeline();

        const avg = await this.fetchAggregationResult(pipeline, "avg");

        // Restore the previous expression
        this.setExpression(previousExpression);

        return avg;
      },
      (...args) =>
        DB.getInstance()
          .logger()
          ?.error(...args),
    );
  }

  /**
   * Fetches the result of an aggregation pipeline stage.
   * @param aggregationPipeline - The aggregation pipeline to execute
   * @param targetProperty - The property to fetch from the result
   * @returns The result of the aggregation pipeline stage
   */
  protected async fetchAggregationResult(
    aggregationPipeline: object[],
    targetProperty: string = "aggregate_result",
  ): Promise<number> {
    return await captureError(
      async () => {
        // Get the results
        const results = await this.raw<{ [key: string]: number }>(
          aggregationPipeline,
        );

        // If the count is an empty array, return 0
        if (
          results?.[0]?.[targetProperty] &&
          results[0][targetProperty].length === 0
        ) {
          return 0;
        }

        // Get the aggregate result
        const aggregateResult =
          results?.[0]?.[targetProperty]?.[0]?.[targetProperty];

        if (typeof aggregateResult !== "number") {
          throw new EloquentException(
            `Aggregate result for '${targetProperty}' could not be found`,
          );
        }

        return aggregateResult;
      },
      (...args) =>
        DB.getInstance()
          .logger()
          ?.error(...args),
    );
  }

  /**
   * It's been decided that transactions should not be implemented for MongoDB.
   * This is due to the complicated setup required for MongoDB to support transactions, which
   * involves setting up MongoDB in a replica set.
   *
   * Transactions are supported in MongoDB, but it will require using the Mongo Client API directly.
   * @see https://www.mongodb.com/docs/manual/core/transactions/
   */
  transaction(): Promise<void> {
    throw new Error(
      "Eloquent Transaction not supported for MongoDB. Use the Mongo Client API instead. https://www.mongodb.com/docs/manual/core/transactions/",
    );
  }
}

export default MongoDbEloquent;
