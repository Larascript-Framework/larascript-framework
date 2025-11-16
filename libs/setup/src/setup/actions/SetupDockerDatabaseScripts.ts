import { BaseSetupCommand } from "../base/BaseSetupCommand.js";
import QuestionData from "../DTOs/QuestionData.js";
import { ISetupCommand } from "../interfaces/ISetupCommand.js";
import { SetupService } from "../services/SetupService.js";

export class SetupDockerDatabaseScripts extends BaseSetupCommand {

    /**
     * Handle the action 
     * - Updates the package.json up script
     * @param ref 
     * @param question 
     */
    async handle(ref: ISetupCommand, question: QuestionData): Promise<any> {
        const dbType = question.getUserAnswerOrDefaultAnswer() as string;

        ref.writeLine('Updating package.json');
        await this.updatePackageJsonUpScript(dbType);
    }

    /**
     * Update the package.json up script
     * @param dbType 
     */
    async updatePackageJsonUpScript(dbType: string) {
        const packageJson = this.packageJson.getJsonSync();
        let dockerComposeNames: string[] = [];

        if(dbType === 'all') {
            dockerComposeNames = this.getComposerShortFileNames()
        }
        else {
            dockerComposeNames = [dbType]
        }

        const dbUp = this.buildDatabaseDirectionScript(dockerComposeNames, 'up');
        const dbDown = this.buildDatabaseDirectionScript(dockerComposeNames, 'down');

        packageJson.scripts['db:up'] = dbUp;
        packageJson.scripts['db:down'] = dbDown;

        await this.packageJson.writeFileContents(JSON.stringify(packageJson, null, 2));
    }

    /**
     * 
     * @param dockerComposeNames Example: ['network', 'mongodb', 'postgres']
     * @param dockerParameters Example: up --build -d
     * @returns 
     */
    private buildDatabaseDirectionScript(dockerComposeNames: string[], direction: 'up' | 'down') {
        let scriptValue = '';

        // Value will be either yarn, npm, or pnpm
        const packageManager = this.packageJson.getPackageManagerAsCommand();

        for(let i = 0; i < dockerComposeNames.length; i++) {
            const composeName = dockerComposeNames[i];
            scriptValue += `${packageManager} db:${composeName}:${direction} `;

            if(i < dockerComposeNames.length - 1) {
                scriptValue += '&& ';
            }
        }

        return scriptValue.trimEnd();
    }
    

    /**
     * Retrieves an array of short composer file names (e.g., ['mongodb', 'postgres'])
     * @returns {string[]}
     */
    private getComposerShortFileNames(): string[] {
        return SetupService.getInstance().getComposerShortFileNames();
    }

}

export default SetupDockerDatabaseScripts