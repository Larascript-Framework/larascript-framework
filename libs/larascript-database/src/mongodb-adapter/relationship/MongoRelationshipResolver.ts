import BaseRelationshipResolver from "../../eloquent/base/BaseRelationshipResolver.js";
import { IRelationship } from "../../eloquent/index.js";

export class MongoRelationshipResolver extends BaseRelationshipResolver {
  /**
   * Gets the local key for the relationship.
   * @param relationship - The relationship to get the local key for.
   * @returns The local key for the relationship.
   */
  protected getLocalKey(relationship: IRelationship): string {
    const localKey = relationship.getLocalKey();

    if (localKey === "id") {
      return "_id";
    }

    return localKey;
  }

  /**
   * Gets the foreign key for the relationship.
   * @param relationship - The relationship to get the foreign key for.
   * @returns The foreign key for the relationship.
   */
  protected getForeignKey(relationship: IRelationship): string {
    const foreignKey = relationship.getForeignKey();

    if (foreignKey === "id") {
      return "_id";
    }

    return foreignKey;
  }
}

export default MongoRelationshipResolver;
