import QuestionData from "../DTOs/QuestionData.js";
import InvalidDefaultCredentialsError from "../exceptions/InvalidDefaultCredentialsError.js";
import { IAction } from "../interfaces/IAction.js";
import { ISetupCommand } from "../interfaces/ISetupCommand.js";
import { SetupService } from "../services/SetupService.js";

export class SetupDefaultDatabase implements IAction {

    /**
     * Handle the action 
     * - Updates the .env DATABASE_DRIVER
     * @param ref 
     * @param question 
     */
    async handle(ref: ISetupCommand, question: QuestionData): Promise<any> {
        const adapterName = question.getUserAnswerOrDefaultAnswer() as string;

        if (adapterName === 'all') {
            return await this.updateEnvForAllDatabases(ref);
        }

        ref.writeLine('Updating .env');
        await this.updateEnv(adapterName, ref);
        await this.updateEnvDefaultConnection(adapterName, ref);
    }

    /**
     * Update the .env for all databases
     * @param ref 
     */
    private async updateEnvForAllDatabases(ref: ISetupCommand) {
        ref.writeLine('Updating .env for all databases');
        const adaptersNames = SetupService.getInstance().getDatabaseService().getAvailableAdaptersNames();

        for (const adapter of adaptersNames) {
            await this.updateEnv(adapter, ref);

        }
        await this.updateEnvDefaultConnection('postgres', ref);
        return;
    }

    /**
     * Update the .env for the default connection
     * @param adapterName 
     * @param ref 
     */
    async updateEnvDefaultConnection(adapterName: string, ref: ISetupCommand) {
        ref.env.copyFileFromEnvExample();

        const credentials = SetupService.getInstance().getDatabaseService().getDefaultCredentials(adapterName);

        if (!credentials) {
            throw new InvalidDefaultCredentialsError(`The default credentials are invalid or could not be found for adapter '${adapterName}'`);
        }

        const env: Record<string, string> = {
            DATABASE_DEFAULT_CONNECTION: adapterName,
        }
        await ref.env.updateValues(env);
    }

    /**
     * Update the .env
     * @param adapterName 
     * @param ref 
     */
    async updateEnv(adapterName: string, ref: ISetupCommand) {
        ref.env.copyFileFromEnvExample();

        const credentials = SetupService.getInstance().getDatabaseService().getDefaultCredentials(adapterName);

        if (!credentials) {
            throw new InvalidDefaultCredentialsError(`The default credentials are invalid or could not be found for adapter '${adapterName}'`);
        }

        const env: Record<string, string> = {}

        if (adapterName === 'postgres') {
            env.DATABASE_POSTGRES_CONNECTION = adapterName;
            env.DATABASE_POSTGRES_URI = credentials;
        }

        if (adapterName === 'mongodb') {
            env.DATABASE_MONGODB_CONNECTION = adapterName;
            env.DATABASE_MONGODB_URI = credentials;
        }

        await ref.env.updateValues(env);
    }

}

export default SetupDefaultDatabase