import { AuthenticableUserModelAttributes, IAuthenticableUserModel, IAuthService, IUserCreationAttributes, IUserCreationService, IUserCreationServiceUpdateModelOptions } from "@larascript-framework/contracts/auth";
import { IModel } from "@larascript-framework/larascript-database";


export class UserCreationService implements IUserCreationService {

    constructor(private readonly authService: IAuthService) {}

    async create(attributes: IUserCreationAttributes) {
        const updatedAttributes = await this.updateAttributes(attributes, { RequirePassword: true });
        const model = this.authService.getUserFactory().create({
            ...this.getUserDefaultAttributes(),
            ...updatedAttributes,
        });
        return model as IAuthenticableUserModel;
    }

    async createAndSave(attributes: IUserCreationAttributes) {
        const model = await this.create(attributes);
        await (model as unknown as IModel).save();
        return model;
    }

    async updateModel(model: IAuthenticableUserModel) {
        const attributes = model.getAttributes();
        const updatedAttributes = await this.updateAttributes(attributes as IUserCreationAttributes, { RequirePassword: false });
        await model.fill(updatedAttributes);
        return model;
    }

    async updateAttributes(attributes: IUserCreationAttributes, updateOptions: IUserCreationServiceUpdateModelOptions = { RequirePassword: false }) {
        attributes = await this.hashPassword(attributes, updateOptions);
        attributes = await this.updateRolesAndGroups(attributes);
        attributes = await this.deletePasswordProperty(attributes);
        return { ...attributes }
    }

    private async deletePasswordProperty(attributes: IUserCreationAttributes): Promise<IUserCreationAttributes> {
        return { ...attributes, password: undefined as unknown as string }
    }

    private async hashPassword(attributes: IUserCreationAttributes, updateOptions: IUserCreationServiceUpdateModelOptions): Promise<IUserCreationAttributes> {
        const passwordIsDefined = typeof attributes.password !== "string" || attributes.password?.length === 0;

        if(!updateOptions.RequirePassword && !passwordIsDefined) {
            return attributes;
        }

        if(passwordIsDefined) {
            throw new Error("Password is required");
        }
        return { 
            ...attributes,
            hashedPassword: await this.authService.getJwt().hashPassword(attributes.password)
        }
    }

    private async updateRolesAndGroups(attributes: IUserCreationAttributes): Promise<IUserCreationAttributes> {
        const aclService = this.authService.acl();
        const defaultGroup = aclService.getDefaultGroup();
        const groups = aclService.getGroup(defaultGroup).roles;
        const roles = aclService.getGroup(defaultGroup).roles;
        return {
            ...attributes,
            aclGroups: groups,
            aclRoles: roles,
        }
    }

        /**
     * Retrieves the default attributes for a user.
     * @returns {IUserAttributes} The default user attributes.
     */
    getUserDefaultAttributes(): AuthenticableUserModelAttributes {
        return this.authService.getUserFactory().getDefinition() as AuthenticableUserModelAttributes
    }
}