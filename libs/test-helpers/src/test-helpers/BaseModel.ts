/**
 * Base interface for model attributes that all models should extend.
 * Provides common fields like id, createdAt, and updatedAt.
 */
export interface BaseModelAttributes {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface defining the contract for a base model.
 * Provides methods to access and modify model attributes.
 *
 * @template Attributes - The type of attributes that extend BaseModelAttributes
 */
export interface IBaseModel<
  Attributes extends BaseModelAttributes = BaseModelAttributes,
> {
  attributes: Attributes;
  setAttributes(attributes: Attributes): void;
  getAttributes(): Attributes;
  getId(): string;
  getCreatedAt(): Date;
  getUpdatedAt(): Date;
}

/**
 * Constructor type for base models.
 *
 * @template T - The type of the base model that extends IBaseModel
 */
export interface IBaseModelConstructor<T extends IBaseModel> {
  new (attributes?: T["attributes"]): T;
}

/**
 * Base class for all models in the system.
 * Provides common functionality for managing model attributes and metadata.
 *
 * @template Attributes - The type of attributes that extend BaseModelAttributes
 *
 * @example
 * ```typescript
 * interface UserAttributes extends BaseModelAttributes {
 *   name: string;
 *   email: string;
 * }
 *
 * class User extends BaseModel<UserAttributes> {
 *   constructor(attributes: UserAttributes) {
 *     super(attributes);
 *   }
 * }
 *
 * const user = new User({
 *   id: '1',
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * });
 * ```
 */
export class BaseModel<
  Attributes extends BaseModelAttributes = BaseModelAttributes,
> implements IBaseModel<Attributes>
{
  attributes!: Attributes;

  constructor(attributes: Attributes = {} as Attributes) {
    this.attributes = attributes;
  }

  setAttributes(attributes: Attributes): void {
    this.attributes = attributes;
  }

  getAttributes(): Attributes {
    return this.attributes;
  }

  getId(): string {
    return this.attributes.id;
  }

  getCreatedAt(): Date {
    return this.attributes.createdAt;
  }

  getUpdatedAt(): Date {
    return this.attributes.updatedAt;
  }
}
