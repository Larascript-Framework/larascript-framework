export class CommandNotFoundException extends Error {
  constructor(message: string = "Command not found") {
    super(message);
    this.name = "CommandNotFoundException";
  }
}

export default CommandNotFoundException;