import { TClassConstructor } from "@larascript-framework/larascript-utils";
import DB from "../../database/services/DB.js";
import { IEloquent } from "../../eloquent/index.js";
import { IModel } from "../../model/index.js";
import BaseRelationshipResolver from "../base/BaseRelationshipResolver.js";

class With {
  constructor(
    protected eloquent: IEloquent,

    protected relationshipName: string,
  ) {}

  /**
   * Applies the relationship to the Eloquent expression. This method is responsible for updating the Eloquent expression
   * with the relationship details. It will join the relationship table with the local table using the relationship
   * instance's getForeignModelCtor and getLocalModelCtor methods to retrieve the foreign table and the local table
   * respectively. The join type is a left join. The relationship's getLocalKey and getForeignKey methods are used to
   * specify the join columns.
   * @return {IEloquent<Model, Attributes>} The Eloquent instance.
   */
  updateEloquent() {
    const eloquent = this.eloquent.clone();

    const resolver = DB.getInstance()
      .databaseService()
      .getAdapter()
      .getRelationshipResolver();

    const relationshipInterface =
      BaseRelationshipResolver.resolveRelationshipInterfaceByModelRelationshipName(
        eloquent.getModelCtor() as TClassConstructor<IModel>,
        this.relationshipName,
      );

    return resolver.attachEloquentRelationship(
      eloquent,
      relationshipInterface,
      this.relationshipName,
    );
  }
}

export default With;
