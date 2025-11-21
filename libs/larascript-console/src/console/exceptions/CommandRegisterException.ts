export class CommandRegisterException extends Error {
  constructor(name: string, message?: string) {
    if (message) {
      super(message.replace("{name}", name));
    } else {
      super(
        `Command '${name}' could not be registered. A command with the same signature may already exist.`,
      );
    }
    this.name = "CommandRegisterException";
  }
}

export default CommandRegisterException;