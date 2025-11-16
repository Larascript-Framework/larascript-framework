import jwt, { SignOptions } from "jsonwebtoken";

/**
 * Creates a JWT token
 * @param secret The secret to sign the token with
 * @param data The data to be stored in the token
 * @param expiresIn The time until the token expires (default is 1 hour)
 * @returns The created JWT token as a string
 */
export const createJwt = (
  secret: string,
  data: object,
  expiresIn: string = "1h",
): string => {
  return jwt.sign(data, secret, { expiresIn } as SignOptions);
};
