import { IPackageJsonService } from '@ben-shepherd/larascript-core';
import DatabaseAdapter from '@src/core/domains/database/services/DatabaseAdapter';
import QuestionDTO from '@src/core/domains/setup/DTOs/QuestionDTO';
import { IAction } from '@src/core/domains/setup/interfaces/IAction';
import { ISetupCommand } from '@src/core/domains/setup/interfaces/ISetupCommand';
import { app } from '@src/core/services/App';

class SetupDockerDatabaseScripts implements IAction {

    protected packageJson!: IPackageJsonService;

    constructor() {
        this.packageJson = app('packageJsonService');
    }

    /**
     * Handle the action 
     * - Updates the package.json up script
     * @param ref 
     * @param question 
     */
    async handle(ref: ISetupCommand, question: QuestionDTO): Promise<any> {
        const dbType = question.getAnswer() as string;

        ref.writeLine('Updating package.json');
        await this.updatePackageJsonUpScript(dbType);
    }

    /**
     * Update the package.json up script
     * @param dbType 
     */
    async updatePackageJsonUpScript(dbType: string) {
        const packageJson = await this.packageJson.getJson();
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

        for(let i = 0; i < dockerComposeNames.length; i++) {
            const composeName = dockerComposeNames[i];
            scriptValue += `yarn db:${composeName}:${direction} `;

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
        return DatabaseAdapter.getComposerShortFileNames();
    }

}

export default SetupDockerDatabaseScripts