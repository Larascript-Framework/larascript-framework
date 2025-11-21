import { IJSonWebToken } from "@larascript-framework/contracts/auth";
import jwt from "jsonwebtoken";

/**
 * Decodes a JWT token using the provided secret.
 *
 * @param {string} secret - The secret to use to decode the token.
 * @param {string} token - The JWT token to decode.
 * @returns {IJSonWebToken} The decoded token.
 */
export const decodeJwt = (secret: string, token: string): IJSonWebToken => {
  return jwt.verify(token, secret) as IJSonWebToken;
};
