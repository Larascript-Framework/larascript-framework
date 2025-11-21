import {
  DataType,
  ModelAttributeColumnOptions,
  QueryInterfaceOptions,
  TableName,
} from "sequelize";

/**
 * Add a column to a table
 */
export type AddColumn = {
  /**
   * The key of the column to add
   */
  key: string;

  /**
   * The attribute to add
   */
  attribute: ModelAttributeColumnOptions | DataType;

  /**
   * Options for the query
   */
  options?: QueryInterfaceOptions;
};

/**
 * Remove a column from a table
 */
export type RemoveColumn = {
  /**
   * The attribute to remove
   */
  attribute: string;

  /**
   * Options for the query
   */
  options?: QueryInterfaceOptions;
};

/**
 * Change a column of a table
 */
export type ChangeColumn = {
  /**
   * The name of the column to change
   */
  attributeName: string;

  /**
   * The new attribute of the column
   */
  dataTypeOrOptions: DataType | ModelAttributeColumnOptions;

  /**
   * Options for the query
   */
  options?: QueryInterfaceOptions;
};

/**
 * Rename a column of a table
 */
export type renameColumn = {
  /**
   * The old name of the attribute to rename
   */
  attrNameBefore: string;

  /**
   * The new name of the attribute to rename
   */
  attrNameAfter: string;

  /**
   * Options for the query
   */
  options?: QueryInterfaceOptions;
};

/**
 * Add an index to a table
 */
export type AddIndex = {
  /**
   * The attributes to index
   */
  attributes: string[];

  /**
   * Options for the query
   */
  options?: QueryInterfaceOptions;
};

/**
 * Remove an index from a table
 */
export type RemoveIndex = {
  /**
   * The name of the index to remove
   */
  indexName: string;

  /**
   * Options for the query
   */
  options?: QueryInterfaceOptions;
};

/**
 * Options for altering a table
 */
export interface IAlterTableOptions {
  /**
   * The name of the table to alter
   */
  tableName: TableName;

  /**
   * Add a column to the table
   */
  addColumn?: AddColumn;

  /**
   * Remove a column from the table
   */
  removeColumn?: RemoveColumn;

  /**
   * Change a column of the table
   */
  changeColumn?: ChangeColumn;

  /**
   * Rename a column of the table
   */
  renameColumn?: renameColumn;

  /**
   * Add an index to the table
   */
  addIndex?: AddIndex;

  /**
   * Remove an index from the table
   */
  removeIndex?: RemoveIndex;
}
