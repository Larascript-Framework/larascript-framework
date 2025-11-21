export class JWTConfigException extends Error {
  constructor(message: string = "Invalid JWT settings") {
    super(message);
    this.name = "InvalidJwtSettingsException";
  }
}
