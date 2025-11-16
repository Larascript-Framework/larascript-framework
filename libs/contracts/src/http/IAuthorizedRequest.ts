import { Request } from 'express';
import { IApiTokenModel, IUserModel } from '../auth/index.js';


export default interface IAuthorizedRequest extends Request {
    user?: IUserModel | null;
    apiToken?: IApiTokenModel | null;
}