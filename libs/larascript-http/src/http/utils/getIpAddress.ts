import { Request } from "express";

/**
 * Get the IP address of the request
 * @param req The request object
 * @returns The IP address of the request
 */
const getIpAddress = (req: Request): string => {
    return req.socket.remoteAddress as string
}


export default getIpAddress