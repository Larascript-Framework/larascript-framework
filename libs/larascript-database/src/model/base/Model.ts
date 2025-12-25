import { Castable, TCastableType } from "@larascript-framework/cast-js";
import { TModelScope } from "@larascript-framework/contracts/database/model";
import { Collection } from "@larascript-framework/larascript-collection";
import {
  IObserver,
  IObserverEvent,
  ObserveConstructor,
} from "@larascript-framework/larascript-observer";
import { Str, TClassConstructor } from "@larascript-framework/larascript-utils";
import { IDatabaseSchema } from "../../database/index.js";
import DB from "../../database/services/DB.js";
import BaseRelationshipResolver from "../../eloquent/base/BaseRelationshipResolver.js";
import {
  IBelongsToOptions,
  IdGeneratorFn,
  IEloquent,
  IHasManyOptions,
  IRelationship,
} from "../../eloquent/index.js";
import BelongsTo from "../../eloquent/relational/BelongsTo.js";
import HasMany from "../../eloquent/relational/HasMany.js";
import {
  GetAttributesOptions,
  IModel,
  IModelAttributes,
  IModelEvents,
  IModelFactory,
  IModelFactoryConstructor,
  IModelLifeCycleEvent,
  ModelConstructor,
  ModelWithAttributes,
} from "../index.js";
import ProxyModelHandler from "../proxy/ProxyModelHandler.js";
import { ModelScopes } from "../utils/index.js";

/**
 * Abstract base class for database models.
 * Extends WithObserver to provide observation capabilities.
 * Implements IModel interface for consistent model behavior.
 *
 * @template Attributes Type extending IModelData, representing the structure of the model's data.
 */
export default abstract class Model<Attributes extends IModelAttributes>
  implements IModel<Attributes>
{
  [key: string]: unknown;

  public static ID = "id";

  public static CREATED_AT = "createdAt";

  public static UPDATED_AT = "createdAt";

  /**
   * The ID generator function for the model.
   */
  protected idGeneratorFn: IdGeneratorFn | undefined;

  /**
   * The primary key field name for the model.
   * Defaults to 'id'.
   */
  public primaryKey: string = "id";

  /**
   * The actual data of the model.
   * Can be null if the model hasn't been populated.
   */
  public attributes: Attributes | null = null;

  /**
   * The original data of the model.
   * Can be null if the model hasn't been populated.
   */
  public original: Attributes | null = null;

  /**
   * List of fields that are allowed to be set on the model.
   * Acts as a whitelist for mass assignment.
   */
  public fields: string[] = [];

  /**
   * List of fields that should be excluded when retrieving data.
   * Only applied when excludeGuarded is set to true in getData options.
   */
  public guarded: string[] = [];

  /**
   * List of fields that should be treated as dates.
   * These fields will be automatically managed if timestamps is true.
   */
  public dates: string[] = ["createdAt", "updatedAt"];

  /**
   * Flag to enable automatic timestamp management.
   * When true, createdAt and updatedAt fields are automatically set.
   */
  public timestamps: boolean = true;

  /**
   * List of fields that should be treated as JSON.
   * These fields will be automatically stringified when saving to the database.
   */
  public json: string[] = [];

  /**
   * List of relationships associated with the model.
   */
  public relationships: string[] = [];

  /**
   * List of fields that should be encrypted.
   */
  public encrypted: string[] = [];

  /**
   * The name of the database connection to use.
   * Defaults to the application's default connection name.
   */
  public connection: string = DB.getInstance()
    .databaseService()
    .getDefaultConnectionName();

  /**
   * The name of the MongoDB collection associated with this model.
   * Must be set by child classes or will be automatically generated.
   */
  public table!: string;

  /**
   * The observer instance attached to this model.
   * If not set, observeWith must be called to define it.
   */
  public observer?: IObserver;

  /**
   * Custom observation methods for specific properties.
   * Key is the property name, value is the name of the custom observation method.
   */
  public observeProperties: Record<string, string> = {};

  /**
   * The castable instance for the model.
   */
  protected castable = new Castable({ returnNullOnException: true });

  /**
   * The casts for the model.
   */
  protected casts?: Record<string, TCastableType> = {};

  /**
   * The events for the model.
   */
  protected events?: IModelEvents = {};

  /**
   * The factory instance for the model.
   */
  protected factory!: IModelFactoryConstructor<IModel>;

  /**
   * Constructs a new instance of the Model class.
   *
   * @param {Attributes | null} data - Initial data to populate the model.
   */
  constructor(data: Attributes | null) {
    this.attributes = { ...data } as Attributes;
    this.original = { ...data } as Attributes;
    if (!this.table) {
      this.table = this.getDefaultTable();
    }
  }

  /**
   * Gets the document manager for database operations.
   *
   * @returns {IDocumentManager} The document manager instance.
   */
  setConnectionName(connectionName: string) {
    this.connection = connectionName;
  }

  /**
   * Retrieves the name of the database connection associated with the model.
   *
   * @returns {string} The connection name.
   */
  getConnectionName(): string {
    return this.connection;
  }

  /**
   * Gets the schema interface for the database.
   *
   * @returns {IDatabaseSchema} The schema interface.
   */
  getSchema(): IDatabaseSchema {
    return DB.getInstance().databaseService().schema(this.connection);
  }

  /**
   * Retrieves the current ID generator function for the query builder.
   *
   * @returns {IdGeneratorFn | undefined} The ID generator function.
   */
  getIdGeneratorFn(): IdGeneratorFn | undefined {
    return this.idGeneratorFn;
  }

  /**
   * Retrieves the list of properties that should be treated as JSON.
   * @returns {string[]} The list of JSON properties.
   */
  getJsonProperties(): string[] {
    return this.json;
  }

  /**
   * Creates a new instance of the model wrapped in a Proxy.
   *
   * This method uses the Proxy pattern to allow interception and customization of
   * property access and method calls on the model instance. It utilizes the ProxyModelHandler
   * to maintain proper 'this' context and provide additional features.
   *
   * @template Model Extends IModel, representing the type of the model to create.
   * @param {Model['attributes'] | null} data - The initial data to populate the model.
   * @returns {Model} A new instance of the model wrapped in a Proxy.
   */
  static create<Model extends IModel>(
    data: Partial<Model["attributes"]> | null = null,
  ): ModelWithAttributes<Model> {
    return new Proxy(
      new (this as unknown as TClassConstructor<Model>)(data),
      new ProxyModelHandler(),
    );
  }

  /**
   * Creates a new instance of the model without wrapping it in a Proxy.
   *
   * This method instantiates the model directly, bypassing the Proxy pattern.
   * Useful for internal operations or when proxy behavior is not needed.
   *
   * @template Model Extends IModel, representing the type of the model to create.
   * @param {Model['attributes'] | null} data - The initial data to populate the model.
   * @returns {Model} A new instance of the model.
   */
  static createWithoutProxy<Model extends IModel>(
    data: Partial<Model["attributes"]> | null = null,
  ): ModelWithAttributes<Model> {
    return new (this as unknown as TClassConstructor<Model>)(data);
  }

  /**
   * Retrieves the table name associated with the model.
   *
   * @returns {string} The table name associated with the model.
   */
  static getTable(): string {
    return this.create().useTableName();
  }

  /**
   * Retrieves the default table name for the model.
   * The default table name is determined by the name of the model class.
   * If the model class name ends with 'Model', it is removed.
   * The table name is then pluralized and lowercased.
   * @returns The default table name.
   */
  protected getDefaultTable() {
    let table = this.constructor.name;

    if (table.endsWith("Model")) {
      table = table.slice(0, -5);
    }

    return Model.formatTableName(table);
  }

  /**
   * Retrieves the name of the database connection associated with the model.
   *
   * @returns {string} The connection name.
   */
  static getConnection(): string {
    return this.create().getConnectionName();
  }

  /**
   * Retrieves the scopes associated with the model.
   * @returns {string[]} The scopes associated with the model.
   */
  static getScopes(
    scopes: TModelScope[] = ["all"],
    additionalScopes: string[] = [],
  ): string[] {
    return ModelScopes.getScopes(
      this as unknown as ModelConstructor,
      scopes,
      additionalScopes,
    );
  }

  /**
   * Retrieves the fields defined on the model.
   * The fields are the list of fields that are allowed to be set on the model.
   * This is used for mass assignment.
   * @returns The list of fields defined on the model.
   */
  static getFields(): string[] {
    return this.create().getFields();
  }

  /**
   * Retrieves the factory instance for the model.
   * @returns The factory instance for the model.
   */
  static factory(): IModelFactory<IModel> {
    return this.create().getFactory();
  }

  /**
   * Retrieves the relationships for the model.
   * @returns The relationships for the model.
   */
  static getRelationships(): string[] {
    return this.create().getRelationships();
  }

  /**
   * Retrieves the query builder for the model.
   * @returns The query builder for the model.
   */
  static query<Model extends IModel>(): IEloquent<Model> {
    return DB.getInstance().queryBuilder(
      this as unknown as ModelConstructor<Model>,
    ) as IEloquent<Model>;
  }

  /**
   * Retrieves the relationships for the model.
   * @returns The relationships for the model.
   */
  getRelationships(): string[] {
    return this.relationships;
  }

  /**
   * Retrieves the factory instance for the model.
   * @returns The factory instance for the model.
   */
  getFactory(): IModelFactory<IModel> {
    if (!this.factory) {
      throw new Error("Factory not set");
    }

    return new this.factory(this.constructor as ModelConstructor<IModel>);
  }

  /**
   * Sets the observer for this model instance.
   * The observer is responsible for handling events broadcasted by the model.
   * @param {IObserver} observer - The observer to set.
   * @returns {void}
   */
  setObserverConstructor(observerConstructor?: ObserveConstructor): void {
    if (typeof observerConstructor === "undefined") {
      this.observer = undefined;
    }
    this.observer = new (observerConstructor as ObserveConstructor)();
  }

  /**
   * Retrieves the observer instance for this model.
   * @returns {IObserver | undefined} The observer instance, or undefined if not set.
   */
  getObserver(): IObserver | undefined {
    return this.observer;
  }

  /**
   * Sets a custom observer method for a specific attribute.
   * When an `AttributeChange` event is triggered for the attribute,
   * the specified method will be called on the observer with the
   * event payload.
   * @param {string} attribute - The attribute to observe.
   * @param {string} method - The method to call on the observer.
   */
  setObserveProperty(attribute: string, method: string): void {
    this.observeProperties[attribute] = method;
  }

  /**
   * Calls the specified method on the observer with the given event and attributes.
   * If no observer is defined, returns the attributes unchanged.
   * @param {IObserverEvent} event - The event to call on the observer.
   * @param {Attributes} attributes - The attributes to pass to the observer.
   * @returns {Promise<Attributes>} The attributes returned by the observer, or the original attributes if no observer is defined.
   */
  protected async observeAttributes(
    event: IObserverEvent,
    attributes: Attributes | null,
  ): Promise<Attributes | null> {
    if (!this.observer) {
      return attributes;
    }

    return (await this.observer.on(event, attributes)) as Attributes | null;
  }

  /**
   * Observes changes to a specific property on the model using a custom observer method.
   * If an observer is defined and a custom method is set for the given property key in `observeProperties`,
   * the method is invoked with the model's attributes.
   *
   * @param {string} key - The key of the property to observe.
   * @returns {Promise<Attributes | null>} The attributes processed by the observer's custom method, or the original attributes if no observer or custom method is defined.
   */

  protected async observeProperty(key: string) {
    if (!this.observer) {
      return this.attributes;
    }

    // Check if this attribute key has been assigned a custom method
    if (Object.keys(this.observeProperties).includes(key)) {
      const observerMethod = this.observeProperties[key];
      this.attributes = await this.observer.onCustom(
        observerMethod,
        this.attributes,
      );
    }

    return this.attributes;
  }

  /**
   * Sets or retrieves the value of a specific attribute from the model's data.
   * If called with a single argument, returns the value of the attribute.
   * If called with two arguments, sets the value of the attribute.
   * If the value is not set, returns null.
   *
   * @template K Type of the attribute key.
   * @param {K} key - The key of the attribute to retrieve or set.
   * @param {any} [value] - The value to set for the attribute.
   * @returns {Attributes[K] | null | undefined} The value of the attribute or null if not found, or undefined if setting.
   */
  async attr<K extends keyof Attributes = keyof Attributes>(
    key: K,
    value?: unknown,
  ): Promise<Attributes[K] | null | undefined> {
    if (value === undefined) {
      return ((await this.getAttribute(key)) as Attributes[K]) ?? null;
    }

    await this.setAttribute(key, value);
    return undefined;
  }

  /**
   * Sets or retrieves the value of a specific attribute from the model's data.
   * If called with a single argument, returns the value of the attribute.
   * If called with two arguments, sets the value of the attribute synchronously.
   * If the value is not set, returns null.
   *
   * @template K Type of the attribute key.
   * @param {K} key - The key of the attribute to retrieve or set.
   * @param {any} [value] - The value to set for the attribute.
   * @returns {Attributes[K] | null | undefined} The value of the attribute or null if not found, or undefined if setting.
   */
  attrSync<K extends keyof Attributes = keyof Attributes>(
    key: K,
    value?: unknown,
  ): Attributes[K] | null | undefined {
    if (value === undefined) {
      return (this.getAttributeSync(key) as Attributes[K]) ?? null;
    }

    if (!this.attributeIsSettable(key as string)) {
      return;
    }
    if (this.attributes === null) {
      this.attributes = {} as Attributes;
    }
    if (this.casts?.[key as string]) {
      value = this.castable.getCast(
        value,
        this.casts[key as string] as TCastableType,
      ) as Attributes[K] | null;
    }
    if (this.attributes) {
      this.attributes[key] = value as Attributes[K];
    }

    return undefined;
  }

  /**
   * Sets the value of a specific attribute in the model's data.
   *
   * @template K Type of the attribute key.
   * @param {K} key - The key of the attribute to set.
   * @param {any} value - The value to set for the attribute.
   * @throws {Error} If the attribute is not in the allowed fields or if a date field is set with a non-Date value.
   */
  async setAttribute<K extends keyof Attributes = keyof Attributes>(
    key: K,
    value?: unknown,
  ): Promise<void> {
    this.attrSync(key, value);
    this.attributes = await this.observeProperty(key as string);
  }

  /**
   * Determines if an attribute can be set
   * @param key
   * @returns
   */
  protected attributeIsSettable(key: string) {
    return this.fields.includes(key) || this.relationships.includes(key);
  }

  /**
   * Retrieves the value of a specific attribute from the model's data.
   *
   * @template K Type of the attribute key.
   * @param {K} key - The key of the attribute to retrieve.
   * @returns {Attributes[K] | null} The value of the attribute or null if not found.
   */
  getAttributeSync<K extends keyof Attributes = keyof Attributes>(
    key: K,
  ): Attributes[K] | null {
    if (this.encrypted.includes(key as string)) {
      return (
        this.decryptAttributes({
          [key]: this.attributes?.[key],
        } as Attributes)?.[key] ?? null
      );
    }

    if (this.casts?.[key as string]) {
      return this.castable.getCast(
        this.attributes?.[key],
        this.casts[key as string] as TCastableType,
      ) as Attributes[K] | null;
    }

    return this.attributes?.[key] as Attributes[K] | null;
  }

  /**
   * Retrieves the value of a specific attribute from the model's data, or
   * fetches the relationship data if the attribute is a relationship.
   *
   * @template K Type of the attribute key.
   * @param {K} key - The key of the attribute to retrieve.
   * @returns {Attributes[K] | null} The value of the attribute or null if not found.
   */
  async getAttribute<K extends keyof Attributes = keyof Attributes>(
    key: K,
  ): Promise<Attributes[K] | null> {
    const relationsip = BaseRelationshipResolver.tryGetRelationshipInterface(
      this,
      key as string,
    );

    if (relationsip) {
      return await this.getRelationshipData(key, relationsip);
    }

    return this.getAttributeSync(key);
  }

  /**
   * Retrieves the value of a specific attribute from the model's data, or
   * fetches the relationship data if the attribute is a relationship.
   *
   * @template K Type of the attribute key.
   * @param {K} key - The key of the attribute to retrieve.
   * @returns {Attributes[K] | null} The value of the attribute or null if not found.
   */
  protected async getRelationshipData<
    K extends keyof Attributes = keyof Attributes,
  >(key: K, relationship?: IRelationship): Promise<Attributes[K] | null> {
    if (this.attributes?.[key]) {
      return this.attributes[key];
    }

    // Get the relationship interface
    if (!relationship) {
      relationship =
        BaseRelationshipResolver.resolveRelationshipInterfaceByModelRelationshipName(
          this.constructor as TClassConstructor<IModel>,
          key as string,
        );
    }

    // Get the relationship resolver
    const resolver = DB.getInstance()
      .databaseService()
      .getAdapter(this.connection)
      .getRelationshipResolver();

    // Set the attribute
    return (await resolver.resolveData<Attributes, K>(
      this,
      relationship,
      this.connection,
    )) as Attributes[K];
  }

  /**
   * Retrieves the entire model's data as an object.
   *
   * @returns {IModelAttributes | null} The model's data as an object, or null if no data is set.
   */
  getAttributes(options: { excludeGuarded?: boolean } = {}): Attributes | null {
    if (this.attributes === null) {
      return null;
    }

    let fetchedAttributes = { ...this.attributes } as Record<string, unknown>;

    // Add relationship data
    this.relationships.forEach(async (relationshipAttribute) => {
      fetchedAttributes[relationshipAttribute] = await this.getRelationshipData(
        relationshipAttribute,
      );
    });

    fetchedAttributes = this.decryptAttributes({
      ...fetchedAttributes,
    } as Attributes | null) as Record<string, unknown>;

    fetchedAttributes = this.castAttributes({
      ...fetchedAttributes,
    } as Attributes | null) as Record<string, unknown>;

    if (fetchedAttributes && options.excludeGuarded) {
      fetchedAttributes = Object.fromEntries(
        Object.entries(fetchedAttributes).filter(
          ([key]) => !this.guarded.includes(key),
        ),
      ) as Attributes;
    }

    return fetchedAttributes as Attributes;
  }

  /**
   * Retrieves the original value of a specific attribute from the model's original data.
   *
   * @template K Type of the attribute key.
   * @param {K} key - The key of the attribute to retrieve.
   * @returns {Attributes[K] | null} The original value of the attribute or null if not found.
   */
  getOriginal<K extends keyof Attributes = keyof Attributes>(
    key: K,
  ): Attributes[K] | null {
    return this.original?.[key] ?? null;
  }

  /**
   * Checks if the model is dirty.
   *
   * A model is considered dirty if any of its attributes have changed since the last time the model was saved.
   *
   * @returns {boolean} True if the model is dirty, false otherwise.
   */
  isDirty(): boolean {
    if (!this.original) {
      return false;
    }
    return Object.keys(this.getDirty() ?? {}).length > 0;
  }

  /**
   * Gets the dirty attributes.
   * @returns
   */
  getDirty(): Record<keyof Attributes, any> | null {
    const dirty = {} as Record<keyof Attributes, any>;

    Object.entries(this.attributes ?? ({} as object)).forEach(
      ([key, value]) => {
        try {
          if (
            typeof value === "object" &&
            JSON.stringify(value) !== JSON.stringify(this.original?.[key])
          ) {
            dirty[key as keyof Attributes] = value;
            return;
          }
        } catch (e) {}

        if (value !== this.original?.[key]) {
          dirty[key as keyof Attributes] = value;
        }
      },
    );

    return dirty;
  }

  /**
   * Retrieves the fields defined on the model.
   * The fields are the list of fields that are allowed to be set on the model.
   * This is used for mass assignment.
   * @returns The list of fields defined on the model.
   */
  getFields(): string[] {
    let fields = this.fields;

    if (!this.fields.includes(this.primaryKey)) {
      fields = [this.primaryKey, ...fields];
    }

    return fields;
  }

  /**
   * Retrieves the table name associated with the model.
   * The table name is determined by the value of the `table` property.
   * If the `table` property is not set, this method will throw a MissingTableException.
   * @returns The table name associated with the model.
   * @throws MissingTableException If the table name is not set.
   */
  useTableName(): string {
    if (!this.table || this.table?.length === 0) {
      return this.getDefaultTable();
    }
    return this.table;
  }

  /**
   * Retrieves the table name associated with the model.
   * The table name is pluralized and lowercased.
   * @param tableName - The name of the table to retrieve.
   * @returns The pluralized and lowercased table name.
   */
  public static formatTableName(tableName: string): string {
    return Str.plural(Str.snakeCase(tableName)).toLowerCase();
  }

  /**
   * Retrieves the connection name associated with the model.
   * This is achieved by instantiating the model and accessing its connection property.
   *
   * @returns {string} The connection name of the model.
   */
  public static getConnectionName(): string {
    return new (this as unknown as TClassConstructor<IModel>)(null).connection;
  }

  /**
   * Retrieves the primary key associated with the model.
   * This is achieved by instantiating the model and accessing its primaryKey property.
   *
   * @returns {string} The primary key associated with the model.
   */
  public static getPrimaryKey(): string {
    return new (this as unknown as TClassConstructor<IModel>)(null).primaryKey;
  }

  /**
   * Retrieves a query builder instance for the model.
   * The query builder is a fluent interface for querying the database associated with the model.
   * @returns {IEloquent<IModel>} The query builder instance.
   */
  private queryBuilder(): IEloquent<IModel> {
    return DB.getInstance().queryBuilder(
      this.constructor as unknown as ModelConstructor<IModel>,
      this.connection,
    );
  }

  /**
   * Casts the attributes of the model.
   *
   * @param {Attributes | null} attributes - The attributes to cast.
   * @returns {Attributes | null} The casted attributes.
   *
   * Note: Encrypted string values are not cast to avoid incorrect type casting.
   * This is because encrypted values are stored as strings and attempting to cast them
   * before decryption would result in incorrect types (e.g., null) since the encrypted
   * string format is not compatible with the target type. Only encrypted objects and arrays
   * are cast after they have been decrypted and parsed from JSON.
   */
  private castAttributes(attributes: Attributes | null): Attributes | null {
    if (!attributes) {
      return null;
    }

    // Reduce attributes into a casted Attributes object
    // Ignoring encrypted complex types (object, arrays)
    return Object.keys(attributes).reduce((acc, curr) => {
      const isEncryptedComplexType =
        this.encrypted.includes(curr) &&
        this.casts?.[curr] &&
        ["object", "array"].includes(this.casts?.[curr]) &&
        typeof this.casts?.[curr] === "string";

      if (isEncryptedComplexType) {
        acc[curr] = attributes[curr];
        return acc;
      }

      // Looks OK, cast
      if (this.casts?.[curr] && typeof this.casts[curr] === "string") {
        acc[curr] = this.castable.getCast(attributes[curr], this.casts?.[curr]);
        return acc;
      }

      acc[curr] = attributes[curr];
      return acc;
    }, {}) as Attributes | null;

    // return this.castable.getCastFromObject(attributesCopy as Record<string, unknown>, this.casts) as Attributes;
  }

  /**
   * Retrieves the primary key value of the model.
   *
   * @returns {string | undefined} The primary key value or undefined if not set.
   */
  getId(): string | undefined {
    return this.attributes?.[this.primaryKey] as string | undefined;
  }

  /**
   * Sets a timestamp on a Date field.
   *
   * @param {string} dateTimeField - The name of the date field to update.
   * @param {Date} [value=new Date()] - The date value to set.
   */
  async setTimestamp(dateTimeField: string, value: Date = new Date()) {
    if (!this.timestamps || !this.dates.includes(dateTimeField)) {
      return;
    }
    await this.setAttribute(dateTimeField, value as Attributes[string]);
  }

  /**
   * Fills the model with the provided data.
   *
   * @param {Partial<Attributes>} data - The data to fill the model with.
   */
  async fill(data: Partial<Attributes>): Promise<void> {
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) {
        continue;
      }

      await this.setAttribute(key, value);
    }
  }

  /**
   * Retrieves the entire model's data as an object.
   *
   * @returns {Promise<Attributes | null>} The model's data as an object, or null if no data is set.
   */
  async toObject(
    options: GetAttributesOptions = { excludeGuarded: true },
  ): Promise<Attributes | null> {
    let data = this.getAttributes();

    if (data && options.excludeGuarded) {
      data = Object.fromEntries(
        Object.entries(data).filter(([key]) => !this.guarded.includes(key)),
      ) as Attributes;
    }

    return data as Attributes;
  }

  /**
   * Refreshes the model's data from the database.
   *
   * @returns {Promise<Attributes | null>} The refreshed data or null if the model has no ID.
   */
  async refresh(): Promise<Attributes | null> {
    const id = this.getId();

    if (!id) return null;

    const result = await this.queryBuilder().find(id);
    const attributes = result ? await result.getAttributes() : null;
    const decryptedAttributes = await this.decryptAttributes(
      attributes as Attributes | null,
    );

    this.attributes = decryptedAttributes
      ? ({ ...decryptedAttributes } as Attributes)
      : null;
    this.original = { ...(this.attributes ?? {}) } as Attributes;

    return this.attributes as Attributes;
  }

  /**
   * Checks if an attribute should be encrypted
   * @param attribute
   * @returns
   */
  static isAttributeEncrypted(attribute: string): boolean {
    const encryptedArray = (this.createWithoutProxy()?.encrypted ??
      []) as string[];
    return encryptedArray.includes(attribute);
  }

  /**
   * Encrypts the attributes of the model.
   *
   * @param {Attributes} attributes - The attributes to encrypt.
   * @returns {Promise<Attributes>} The encrypted attributes.
   */
  encryptAttributes(attributes: Attributes | null): Attributes | null {
    const attributesCopy = (attributes ? { ...attributes } : null) as Record<
      string,
      unknown
    >;

    if (typeof attributesCopy !== "object") {
      return attributes;
    }

    this.encrypted.forEach((key) => {
      if (
        ["object", "array"].includes(this.casts?.[key] as string) &&
        typeof attributesCopy?.[key] === "object"
      ) {
        try {
          attributesCopy[key] = JSON.stringify(attributesCopy?.[key]);
        } catch (err) {}
      }

      if (
        typeof attributesCopy?.[key] !== "undefined" &&
        attributesCopy?.[key] !== null
      ) {
        try {
          (attributesCopy as object)[key] = DB.getInstance()
            .cryptoService()
            .encrypt((attributesCopy as object)[key]);
        } catch (e) {
          console.error(e);
        }
      }
    });

    return attributesCopy as Attributes;
  }

  /**
   * Decrypts the attributes of the model.
   *
   * @param {Attributes} attributes - The attributes to decrypt.
   * @returns {Promise<Attributes>} The decrypted attributes.
   */
  decryptAttributes(attributes: Attributes | null): Attributes | null {
    const attributesCopy = (attributes ? { ...attributes } : null) as Record<
      string,
      unknown
    >;

    if (typeof this.attributes !== "object") {
      return attributes;
    }

    this.encrypted.forEach((key) => {
      if (
        ["object", "array"].includes(this.casts?.[key] as string) &&
        typeof attributesCopy?.[key] === "string"
      ) {
        try {
          attributesCopy[key] = JSON.parse(
            DB.getInstance()
              .cryptoService()
              .decrypt(attributesCopy?.[key] as string),
          );
          return;
        } catch (err) {}
      }

      if (
        typeof attributesCopy?.[key] !== "undefined" &&
        attributesCopy?.[key] !== null
      ) {
        try {
          (attributesCopy as object)[key] = DB.getInstance()
            .cryptoService()
            .decrypt((attributesCopy as object)[key]);
        } catch (e) {
          console.error(e);
        }
      }
    });

    return attributesCopy as Attributes;
  }

  /**
   * Updates the model in the database.
   *
   * @returns {Promise<void>}
   */
  async update(): Promise<void> {
    if (!this.getId() || !this.attributes) return;

    const dirtyAttributes = this.getDirtyAttributes() as Attributes;
    const builder = this.queryBuilder();
    const normalizedIdProperty = builder.normalizeIdProperty(this.primaryKey);
    const encryptedAttributes = await this.encryptAttributes(dirtyAttributes);
    await builder
      .where(normalizedIdProperty, this.getId())
      .update({ ...encryptedAttributes });
  }

  /**
   * Gets the attributes that have been modified since the model was last saved.
   *
   * @returns {Partial<Attributes> | null} An object containing only the modified attributes, or null if no attributes exist
   */
  protected getDirtyAttributes(): Partial<Attributes> | null {
    if (!this.attributes) {
      return null;
    }

    const dirty = Object.keys(this.getDirty() ?? {});
    return Object.keys(this.attributes).reduce((acc, curr) => {
      const isRelationship = this.relationships.includes(curr);

      if (
        dirty.includes(curr) &&
        this.attributeIsSettable(curr) &&
        !isRelationship
      ) {
        acc[curr] = this.attributes?.[curr] ?? null;
      }
      return acc;
    }, {}) as Partial<Attributes>;
  }

  /**
   * Saves the model to the database.
   * Handles both insertion of new records and updates to existing ones.
   *
   * @returns {Promise<void>}
   */
  async save(): Promise<void> {
    if (this.attributes && !this.getId()) {
      // Observe the attributes
      this.attributes = await this.observeAttributes(
        "creating",
        this.attributes,
      );

      // Set the timestamps
      await this.setTimestamp("createdAt");
      await this.setTimestamp("updatedAt");

      // Emit the creating event
      await this.emit("creating", this.attributes);

      // Insert the model
      const encryptedAttributes = await this.encryptAttributes(this.attributes);
      this.attributes = (await (
        await this.queryBuilder().insert(encryptedAttributes as object)
      )
        .first()
        ?.toObject()) as Attributes;
      this.attributes = await this.refresh();
      this.attributes = await this.observeAttributes(
        "created",
        this.attributes,
      );

      // Emit the created event
      await this.emit("created", this.attributes);

      return;
    }

    // Emit the saving event
    await this.emit("updating", this.attributes);

    // Update the model
    this.attributes = await this.observeAttributes("updating", this.attributes);
    await this.setTimestamp("updatedAt");
    await this.update();

    // Refresh the model
    this.attributes = await this.refresh();
    this.attributes = await this.observeAttributes("updated", this.attributes);

    // Emit the updated event
    await this.emit("updated", this.attributes);

    // Set the original attributes
    this.original = { ...this.attributes } as Attributes;
  }

  /**
   * Deletes the model from the database.
   *
   * @returns {Promise<void>}
   */
  async delete(): Promise<void> {
    if (!this.attributes) return;

    const preDeletedAttributes = { ...this.attributes };

    // Emit the deleting event
    await this.emit("deleting", preDeletedAttributes);

    // Observe the attributes
    this.attributes = await this.observeAttributes("deleting", this.attributes);

    // Delete the model
    const builder = this.queryBuilder();
    const normalizedIdProperty = builder.normalizeIdProperty(this.primaryKey);
    await builder.where(normalizedIdProperty, this.getId()).delete();
    this.attributes = null;
    this.original = null;

    // Observe the attributes
    await this.observeAttributes("deleted", this.attributes);

    // Emit the deleted event
    await this.emit("deleted", preDeletedAttributes);
  }

  /**
   * Retrieves a related model based on a "belongs to" relationship.
   *
   * @template ForiegnModel The type of the related model.
   * @param {TClassConstructor<ForiegnModel>} foreignModel - The constructor of the related model.
   * @param {Omit<IBelongsToOptionsLegacy, 'foreignTable'>} options - Options for the relationship.
   * @returns {BelongsTo} An instance of the BelongsTo class for chaining.
   */
  belongsTo<ForiegnModel extends IModel = IModel>(
    foreignModel: ModelConstructor<ForiegnModel>,
    options: Omit<IBelongsToOptions, "foreignTable">,
  ): BelongsTo {
    return new BelongsTo(
      this.constructor as ModelConstructor<IModel>,
      foreignModel,
      options,
    );
  }

  /**
   * Retrieves a related model based on a "has many" relationship.
   *
   * @template ForiegnModel The type of the related model.
   * @param {TClassConstructor<ForiegnModel>} foreignModel - The constructor of the related model.
   * @param {Omit<IHasManyOptions, 'foreignTable'>} options - Options for the relationship.
   * @returns {HasMany} An instance of the HasMany class for chaining.
   */
  hasMany<ForiegnModel extends IModel = IModel>(
    foreignModel: ModelConstructor<ForiegnModel>,
    options: Omit<IHasManyOptions, "foreignTable">,
  ): HasMany {
    return new HasMany(
      this.constructor as ModelConstructor<IModel>,
      foreignModel,
      options,
    );
  }

  /**
   * Adds an event listener to the model.
   *
   * @param {IModelLifeCycleEvent} event - The event to listen to.
   * @param {EventConstructor} eventConstructor - The event constructor to add.
   */
  on(event: IModelLifeCycleEvent, eventConstructor: TClassConstructor): void {
    if (!this.events) {
      this.events = {};
    }

    this.events[event] = eventConstructor;
  }

  /**
   * Removes an event listener from the model.
   *
   * @param {IModelLifeCycleEvent} event - The event to remove the listener from.
   */
  off(event: IModelLifeCycleEvent): void {
    if (this.events?.[event]) {
      this.events[event] = undefined;
    }
  }

  /**
   * Emits an event for the model.
   *
   * @param {IModelLifeCycleEvent} event - The event to emit.
   * @param {...any[]} args - The arguments to pass to the event.
   */
  protected async emit(
    event: IModelLifeCycleEvent,
    ...args: any[]
  ): Promise<void> {
    if (typeof this.events?.[event] === "function") {
      await DB.getInstance().dispatcher(new this.events[event](...args));
    }
  }

  /**
   * Loads the relationships for the model.
   *
   * @returns {Promise<void>}
   */
  async loadRelationships({
    only = [],
    loadAsAttributes = false,
    excludeGuarded = false,
  }: {
    only?: string[];
    loadAsAttributes?: boolean;
    excludeGuarded?: boolean;
  }): Promise<IModel<IModelAttributes>> {
    if (!this.attributes) {
      return this;
    }

    const relationshipsArray =
      only.length === 0
        ? this.relationships
        : this.relationships.filter((r) => only.includes(r));

    for (const attr of relationshipsArray) {
      let data = await this.getRelationshipData(attr as keyof Attributes);

      if (loadAsAttributes && data instanceof Collection) {
        data = data
          .toArray()
          .map((m) => m.getAttributes({ excludeGuarded })) as Awaited<
          Attributes[keyof Attributes]
        >;
      }

      if (loadAsAttributes && data instanceof Model) {
        data = data.getAttributes({ excludeGuarded });
      }

      await this.setAttribute(attr as keyof Attributes, data);
    }

    return this;
  }
}
