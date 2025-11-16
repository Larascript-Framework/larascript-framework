import { Request } from "express";
import IAuthorizedRequest from "./IAuthorizedRequest.js";
import { IRequestIdentifiable } from "./IRequestIdentifable.js";
import { ISecurityRequest } from "./ISecurity.js";
import { IValidatorRequest } from "./IValidatorRequest.js";
import { TUploadedFile } from "./UploadedFile.js";

/**
 * TBaseRequest combines multiple request interfaces to create a comprehensive request type.
 * It extends Express's Request and includes:
 * - Authorization capabilities (IAuthorizedRequest)
 * - Request validation (IValidatorRequest) 
 * - Security features (ISecurityRequest)
 * - Request identification (IRequestIdentifiable)
 */
export type TBaseRequest = Request & IAuthorizedRequest & IValidatorRequest & ISecurityRequest & IRequestIdentifiable & { files: TUploadedFile | TUploadedFile[] | undefined };