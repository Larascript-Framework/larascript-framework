export class UninitializedContainerError extends Error {
  constructor(name: string) {
    super(`Container '${name}' has not been initalized`);
    this.name = "UninitializedContainerError";
  }
}
