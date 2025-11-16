
/**
 * List of question IDs
 * Value: Should match the property in .env
 * Value can also be any arbitrary string if it belongs to a statement
 */
export const QuestionIDs = {
    selectDb: 'SELECT_DB',
    selectDefaultDb: 'SELECT_DEFAULT_DB',
    copyEnvExample: 'COPY_ENV_EXAMPLE',
    appPort: 'APP_PORT',
    appKey: 'APP_KEY',
    enableExpress: 'ENABLE_EXPRESS',
    enableAuthRoutes: 'ENABLE_AUTH_ROUTES',
    enableAuthRoutesAllowCreate: 'ENABLE_AUTH_ROUTES_ALLOW_CREATE',
    jwtSecret: 'JWT_SECRET',
    mongodbDefaultUri: 'MONGODB_DEFAULT_URI'
} as const;