import AppPort from "../actions/AppPort.js";
import AuthEnableRoutes from "../actions/AuthEnableRoutes.js";
import CopyEnvExampleAction from "../actions/CopyEnvExampleAction.js";
import EnableExpress from "../actions/EnableExpress.js";
import GenerateAppKeyAction from "../actions/GenerateAppKeyAction.js";
import GenerateJwtSecretAction from "../actions/GenerateJwtSecretAction.js";
import SetupDefaultDatabase from "../actions/SetupDefaultDatabase.js";
import SetupDockerDatabaseScripts from "../actions/SetupDockerDatabaseScripts.js";
import { QuestionIDs } from "../consts/QuestionConsts.js";
import QuestionData from "../DTOs/QuestionData.js";
import { SetupService } from "../services/SetupService.js";

const ENV_OVERWRITE_WARNING = 'This step will overwrite your .env file.';
const acceptedAnswersBoolean = ['yes', 'no', 'y', 'n', ''];

export const acceptedDatabaseAdaptersAnswers = (() => {
    return ['all', '', ...SetupService.getInstance().getComposerShortFileNames()]
});

export const buildQuestionDTOs = (): QuestionData[] => {
    return [
        new QuestionData({
            id: QuestionIDs.copyEnvExample,
            statement: `The .env.example file will be copied to .env if no .env file exists.`,
            previewText: 'Setup Environment File',
            actionCtor: CopyEnvExampleAction
        }),
        new QuestionData({
            id: QuestionIDs.appKey,
            question: `Would you like to generate a new app key? ${ENV_OVERWRITE_WARNING}`,
            previewText: 'Generate New App Key',
            defaultValue: 'yes',
            acceptedAnswers: acceptedAnswersBoolean,
            actionCtor: GenerateAppKeyAction,
        }),
        new QuestionData({
            id: QuestionIDs.jwtSecret,
            question: `Would you like to generate a new JWT secret? ${ENV_OVERWRITE_WARNING}`,
            previewText: 'Generate New JWT Secret',
            defaultValue: 'yes',
            acceptedAnswers: acceptedAnswersBoolean,
            actionCtor: GenerateJwtSecretAction,
        }),
        new QuestionData({
            id: QuestionIDs.selectDb,
            question: `Select database docker containers to setup (options: all, mongodb, postgres). ${ENV_OVERWRITE_WARNING}`,
            previewText: 'Select Database Adapters',
            defaultValue: 'all',
            acceptedAnswers: acceptedDatabaseAdaptersAnswers(),
            actionCtors: [SetupDockerDatabaseScripts, SetupDefaultDatabase]
        }),
        new QuestionData({
            id: QuestionIDs.selectDefaultDb,
            question: `Please select your primary database system (mongodb/postgres). ${ENV_OVERWRITE_WARNING}`,
            previewText: 'Set Primary Database',
            defaultValue: 'postgres',
            acceptedAnswers: ['mongodb', 'postgres', ''],
            actionCtor: SetupDefaultDatabase,
            applicableOnly: {
                ifId: QuestionIDs.selectDb,
                answerIncludes: ['all']
            }
        }),
        new QuestionData({
            id: QuestionIDs.enableExpress,
            question: `Would you like to enable the Express server? (yes/no) ${ENV_OVERWRITE_WARNING}`,
            previewText: 'Enable Express Server',
            defaultValue: 'yes',
            acceptedAnswers: acceptedAnswersBoolean,
            actionCtor: EnableExpress,
        }),
        new QuestionData({
            id: QuestionIDs.appPort,
            question: `Which port should the application listen on? ${ENV_OVERWRITE_WARNING}`,
            previewText: 'Set Server Port',
            defaultValue: '5000',
            applicableOnly: {
                ifId: QuestionIDs.enableExpress,
                answerIncludes: ['yes', 'y'],
            },
            actionCtor: AppPort,
        }),
        new QuestionData({
            id: QuestionIDs.enableAuthRoutes,
            question: `Would you like to enable authentication routes? (yes/no) ${ENV_OVERWRITE_WARNING}`,
            previewText: 'Enable Authentication',
            defaultValue: 'yes',
            acceptedAnswers: acceptedAnswersBoolean,
            applicableOnly: {
                ifId: QuestionIDs.enableExpress,
                answerIncludes: ['yes', 'y']
            },
            actionCtor: AuthEnableRoutes
        }),
        new QuestionData({
            id: QuestionIDs.enableAuthRoutesAllowCreate,
            question: `Should users be allowed to create new accounts? (yes/no) ${ENV_OVERWRITE_WARNING}`,
            previewText: 'Allow User Registration',
            defaultValue: 'yes',
            acceptedAnswers: acceptedAnswersBoolean,
            applicableOnly: {
                ifId: QuestionIDs.enableExpress,
                answerIncludes: ['yes', 'y']
            }
        }),
    ]
}

export default buildQuestionDTOs