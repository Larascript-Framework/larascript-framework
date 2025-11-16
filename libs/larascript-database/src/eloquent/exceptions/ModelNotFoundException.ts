export default class ModelNotFoundException extends Error {
  constructor(message: string = "Model not found") {
    super(message);
    this.name = "ModelNotFound";
  }
}
