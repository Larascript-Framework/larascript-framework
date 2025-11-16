export default class EloquentRelationshipException extends Error {
  constructor(message: string = "Eloquent Relationship Exception") {
    super(message);
    this.name = "EloquentRelationshipException";
  }
}
