import DB from "../../database/services/DB.js";
import { IModel, IModelAttributes } from "../../model/index.js";
import { IRelationship, TWhereClauseValue } from "../interfaces/index.js";
import GenericRelationship from "./GenericRelationship.js";

export class BelongsTo extends GenericRelationship {
  /**
   * Fetches data for a "belongs to" relationship.
   * @param model - The source model.
   * @param relationship - The relationship interface.
   * @param connection - The database connection name.
   * @returns The related document or null if not found.
   */
  static async fetchData<
    Attributes extends IModelAttributes = IModelAttributes,
    K extends keyof Attributes = keyof Attributes,
  >(
    model: IModel,
    relationship: IRelationship,
    connection?: string,
  ): Promise<Attributes[K] | null> {
    const localValue = model.getAttributeSync(
      relationship.getLocalKey(),
    ) as TWhereClauseValue;

    return (await DB.getInstance()
      .queryBuilder(relationship.getForeignModelCtor(), connection)
      .where(relationship.getForeignKey(), "=", localValue)
      .first()) as Attributes[K];
  }
}

export default BelongsTo;
