import { IJSonWebToken } from "@larascript-framework/contracts/auth";
import { IFactory } from "@larascript-framework/contracts/larascript-core";

/**
 * Factory for creating JWT tokens.
 *
 * @class JWTTokenFactory
 */
export class JwtFactory implements IFactory<IJSonWebToken> {
  getDefinition(): unknown {
    return {
      uid: "",
      token: "",
    };
  }

  /**
   * Creates a new JWT token from a user ID and token.
   *
   * @param {string} userId - The user ID.
   * @param {string} token - The token.
   * @returns {IJSonWebToken} A new JWT token.
   */
  static createUserIdAndPayload(userId: string, token: string): IJSonWebToken {
    return new JwtFactory().create({
      uid: userId,
      token,
    });
  }

  create(attributes: IJSonWebToken): IJSonWebToken {
    return {
      uid: attributes.uid,
      token: attributes.token,
    };
  }
}
