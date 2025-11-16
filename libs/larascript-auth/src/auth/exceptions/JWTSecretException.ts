export class JWTSecretException extends Error {
  constructor(
    message: string = 'Invalid JWT Secret. Use "yarn dev auth:generate-jwt-secret --no-db" to generate a new secret',
  ) {
    super(message);
    this.name = "InvalidJWTSecret";
  }
}
