import { Request } from "express";

export interface IRequestIdentifiable extends Request {
    id: string;
}
