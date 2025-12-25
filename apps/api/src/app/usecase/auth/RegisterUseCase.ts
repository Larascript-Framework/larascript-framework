import { UserAttributes } from "@/app/models/auth/User.js";
import CreateUserValidator from "@/app/validators/user/CreateUserValidator.js";
import { app } from "@/core/services/App.js";
import { auth } from "@/core/services/AuthService.js";
import { cryptoService } from "@/core/services/CryptoService.js";
import {
  IUserAttributes,
  IUserModel,
} from "@larascript-framework/larascript-auth";
import {
  IModel,
  IModelAttributes,
} from "@larascript-framework/larascript-database";
import {
  ApiResponse,
  HttpContext,
} from "@larascript-framework/larascript-http";
import {
  IValidatorResult,
  ValidatorResult,
} from "@larascript-framework/larascript-validator";

export type RegisterUseCaseResponse = ApiResponse<
  UserAttributes | { errors?: string[] | object }
>;

/**
 * RegisterUseCase handles new user registration
 *
 * This class is responsible for:
 * - Validating user registration data via configured validator
 * - Creating new user records with hashed passwords
 * - Assigning default groups and roles to new users
 * - Saving user data to the configured user repository
 *
 */
class RegisterUseCase {
  /**
   * Handle the register use case
   * @param context The HTTP context
   * @returns The API response
   */
  async handle(context: HttpContext): Promise<RegisterUseCaseResponse> {
    const apiResponse = new ApiResponse();
    const validationResult = await this.validate(context);

    if (validationResult.fails()) {
      return apiResponse.setCode(422).setData({
        errors: validationResult.errors(),
      }) as RegisterUseCaseResponse;
    }

    if (
      this.validateUserAndPasswordPresent(context, apiResponse).getCode() !==
      200
    ) {
      return apiResponse as RegisterUseCaseResponse;
    }

    const createdUser = await this.createUser(context);
    const userAttributes = await (createdUser as unknown as IModel).toObject({
      excludeGuarded: true,
    });

    return apiResponse
      .setData(userAttributes)
      .setCode(201) as RegisterUseCaseResponse;
  }

  /**
   * Create a user
   * @param context The HTTP context
   * @returns The user
   */
  async createUser(context: HttpContext): Promise<IUserModel> {
    const basicAclService = app("acl");
    const groups = [basicAclService.getDefaultGroup().name];
    const roles = basicAclService
      .getGroupRoles(basicAclService.getDefaultGroup())
      .map((role) => role.name);
    const allowedFields = (
      auth()
        .getUserFactory()
        .create({} as IUserAttributes) as unknown as IModel
    ).getFields();

    const userAttributes = {
      email: context.getBody().email,
      hashedPassword: cryptoService().hash(context.getBody().password),
      groups,
      roles,
      ...context.getBody(),
    };

    // Reduce attributes to only allowed fields
    const userAttributesReduced = this.reduceAttributesOnlyAllowed(
      userAttributes,
      allowedFields,
    );

    // Create and save the user
    const user = auth()
      .getUserFactory()
      .create(userAttributesReduced as unknown as IUserAttributes);
    await (user as unknown as IModel).save();

    return user;
  }

  /**
   * Reduce attributes and keeps only allowed fields
   */
  protected reduceAttributesOnlyAllowed(
    data: IModelAttributes,
    allowedFields: string[],
  ): IModelAttributes {
    return Object.keys(data).reduce((acc, curr) => {
      const attribute = curr as string;

      if (allowedFields.includes(attribute)) {
        acc[attribute] = data[curr];
      }

      return acc;
    }, {}) as IModelAttributes;
  }

  /**
   * Validate the user and password are present
   * @param context The HTTP context
   * @param apiResponse The API response
   * @returns The API response
   */
  validateUserAndPasswordPresent(
    context: HttpContext,
    apiResponse: ApiResponse,
  ): ApiResponse {
    const {
      email = null,

      password = null,
    } = context.getBody();

    if (!email || !password) {
      apiResponse.setCode(422).setData({
        errors: [
          {
            message: "Email and password are required",
          },
        ],
      });
    }

    return apiResponse;
  }

  /**
   * Validate the request body
   * @param context The HTTP context
   * @returns The validation result
   */

  async validate(context: HttpContext): Promise<IValidatorResult<any>> {
    // TODO: this should be provided abstractly
    const validatorConstructor = CreateUserValidator;

    if (!validatorConstructor) {
      return ValidatorResult.passes();
    }

    const validator = new validatorConstructor();
    return await validator.validate(context.getBody());
  }
}

export default RegisterUseCase;
