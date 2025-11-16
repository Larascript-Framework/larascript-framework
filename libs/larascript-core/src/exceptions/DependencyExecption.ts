export class DependencyExecption extends Error {
  constructor(message: string = "Dependency Exception") {
    super(message);
    this.name = "DependencyExecption";
  }
}
