import { app } from "@/core/services/App.js";
import { MongoDbAdapter, PostgresAdapter } from "@larascript-framework/larascript-database";
import { HttpRouter, responseError } from "@larascript-framework/larascript-http";
import { Request, Response } from "express";
import { MongoClient } from "mongodb";
import { Sequelize } from "sequelize";

/**
 * Health check endpoint
 * 
 * This endpoint is used to check if the database connection is active
 * 
 * @param {Request} req
 * @param {Response} res
 */
export default new HttpRouter().group(router => {
    router.get('/health', async (req: Request, res: Response) => {

        try {
            const db = app('db');
            const adapter = db.getAdapter();
    
            // Check if the provider is MongoDB
            if (adapter as unknown instanceof MongoDbAdapter) {
                const mongoClient = (adapter as unknown as MongoDbAdapter).getClient();
                await (mongoClient as unknown as MongoClient).db().stats();
            }
    
            // Check if the provider is Postgres
            else if (adapter as unknown instanceof PostgresAdapter) {
                const pool = await (adapter as unknown as PostgresAdapter).getSequelize();
                await (pool as Sequelize).query('SELECT 1 as connected');
            }
        }
        catch (error) {
            // If there is an error, send the error response
            responseError(req, res, error as Error)
            return;
        }
    
        // If the database connection is active, send a success response
        res.send('OK')
    })

})
