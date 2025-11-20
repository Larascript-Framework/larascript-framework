/* eslint-disable no-undef */
import { clearOutputFiles } from '@/tests/larascript/test-helper/clearOutputFiles.js';
import { getOutputPath } from '@/tests/larascript/test-helper/getOutputPath.js';
import testHelper from '@/tests/testHelper.js';
import { describe } from '@jest/globals';
import { isTruthy } from '@larascript-framework/larascript-validator';
import { AppSetupCommand, CopyEnvExampleAction, GenerateAppKeyAction, GenerateJwtSecretAction, IAction, ISetupCommand, QuestionData, QuestionIDs, SetupDockerDatabaseScripts, SetupService, buildQuestionDTOs } from '@larascript-framework/setup';
import fs from 'fs';

describe('setup test suite', () => {
    let questionsArray: QuestionData[];
    let setupCommand: ISetupCommand;
    let userQuestion: QuestionData;

    beforeAll(async () => {
        clearOutputFiles();

        await testHelper.testBootApp();

        questionsArray = buildQuestionDTOs();
        setupCommand = new AppSetupCommand();
    })

    beforeEach(() => {
        clearOutputFiles();

        // Create the .env.example file
        fs.writeFileSync(getOutputPath('.env.example'),
            `TEST_ENV=test
DATABASE_DEFAULT_CONNECTION=
DATABASE_POSTGRES_CONNECTION=
DATABASE_POSTGRES_URI=
DATABASE_MONGODB_CONNECTION=
DATABASE_MONGODB_URI=
EXPRESS_ENABLED=
APP_PORT=
ENABLE_AUTH_ROUTES=`);
        // Copy the .env.example file to .env
        fs.copyFileSync(getOutputPath('.env.example'), getOutputPath('.env'));

        // Create the package.json file
        fs.writeFileSync(getOutputPath('package.json'), JSON.stringify({
            name: 'test',
            version: '1.0.0',
            scripts: {
                test: 'echo "test"'
            },
            dependencies: {
                'larascript-framework': 'latest'
            }
        }));
    })

    describe("answer types", () => {
        test("should match different yes answers", () => {
            expect(isTruthy('yes')).toBe(true);
            expect(isTruthy('y')).toBe(true);
        });
        test("should match different no answers", () => {
            expect(isTruthy('no')).toBe(false);
            expect(isTruthy('n')).toBe(false);
        });
    });

    describe("crypto service", () => {
        test('services should be defined', () => {
            const cryptoService = SetupService.getInstance().getCryptoService();
            const envService = SetupService.getInstance().getEnvService();
            const packageJsonService = SetupService.getInstance().getPackageJsonService();

            expect(cryptoService).toBeDefined();
            expect(envService).toBeDefined();
            expect(packageJsonService).toBeDefined();
        });

        test("should generate a random string (mocked)", () => {
            const cryptoService = SetupService.getInstance().getCryptoService();
            const randomString = cryptoService.generateBytesAsString(64);
            const randomString2 = cryptoService.generateBytesAsString(64);

            expect(randomString).toBeDefined();
            expect(randomString.length).toBeGreaterThanOrEqual(64);
            expect(randomString).not.toBe(randomString2);
        });
    });

    describe("copyEnvExample action", () => {
        test("should copy the .env.example file to .env with no answer required", async () => {

            // Delete the .env file if it exists
            if (fs.existsSync(getOutputPath('.env'))) {
                fs.unlinkSync(getOutputPath('.env'));
            }

            const questionDTO = questionsArray.find(questionDTO => questionDTO.id === QuestionIDs.copyEnvExample);
            const actionConstructor = questionDTO?.actionCtor as new () => IAction;

            expect(questionDTO).toBeDefined();
            expect(questionDTO?.actionCtor).toBe(CopyEnvExampleAction);

            const action = new actionConstructor();
            await action.handle(setupCommand);

            expect(fs.existsSync(getOutputPath('.env'))).toBe(true);
            expect(fs.readFileSync(getOutputPath('.env'), 'utf8')).toContain('TEST_ENV=test');
        });

    })

    describe("appKey action", () => {

        test("should generate a new app key using default value", async () => {

            // Create the .env file
            fs.writeFileSync(getOutputPath('.env'), 'APP_KEY=');

            const questionDTO = questionsArray.find(questionDTO => questionDTO.id === QuestionIDs.appKey);
            const actionConstructor = questionDTO?.actionCtor as new () => IAction;

            userQuestion = QuestionData.createAnswerNull(questionDTO!)

            expect(questionDTO).toBeDefined();
            expect(questionDTO?.actionCtor).toBe(GenerateAppKeyAction);

            const action = new actionConstructor();
            await action.handle(setupCommand, userQuestion);

            const pattern = /^APP_KEY=.{1,}$/;
            const envContents = fs.readFileSync(getOutputPath('.env'), 'utf8');
            const match = envContents.match(pattern);

            expect(fs.existsSync(getOutputPath('.env'))).toBe(true);
            expect(match?.[0]).toBeDefined();
        });

        test("should generate a new app key", async () => {

            // Create the .env file
            fs.writeFileSync(getOutputPath('.env'), 'APP_KEY=');

            const questionDTO = questionsArray.find(questionDTO => questionDTO.id === QuestionIDs.appKey);
            const actionConstructor = questionDTO?.actionCtor as new () => IAction;

            userQuestion = QuestionData.createAnsweredYes(questionDTO!)

            expect(questionDTO).toBeDefined();
            expect(questionDTO?.actionCtor).toBe(GenerateAppKeyAction);

            const action = new actionConstructor();
            await action.handle(setupCommand, userQuestion);

            const pattern = /^APP_KEY=.{1,}$/;
            const envContents = fs.readFileSync(getOutputPath('.env'), 'utf8');
            const match = envContents.match(pattern);

            expect(fs.existsSync(getOutputPath('.env'))).toBe(true);
            expect(match?.[0]).toBeDefined();
        });

        test("should not generate a new app key when answer is no", async () => {

            // Create the .env file
            fs.writeFileSync(getOutputPath('.env'), 'APP_KEY=');

            const questionDTO = questionsArray.find(questionDTO => questionDTO.id === QuestionIDs.appKey);
            const actionConstructor = questionDTO?.actionCtor as new () => IAction;

            userQuestion = QuestionData.createAnsweredNo(questionDTO!)

            expect(questionDTO).toBeDefined();
            expect(questionDTO?.actionCtor).toBe(GenerateAppKeyAction);

            const action = new actionConstructor();
            await action.handle(setupCommand, userQuestion);

            expect(fs.existsSync(getOutputPath('.env'))).toBe(true);
            expect(fs.readFileSync(getOutputPath('.env'), 'utf8')).toBe('APP_KEY=');
        });

    });

    describe("jwtSecret action", () => {

        test("should generate a new jwt secret using default value", async () => {
            // Create the .env file
            fs.writeFileSync(getOutputPath('.env'), 'JWT_SECRET=');

            const questionDTO = questionsArray.find(questionDTO => questionDTO.id === QuestionIDs.jwtSecret);
            const actionConstructor = questionDTO?.actionCtor as new () => IAction;

            userQuestion = QuestionData.createAnswerNull(questionDTO!)

            expect(questionDTO).toBeDefined();
            expect(questionDTO?.actionCtor).toBe(GenerateJwtSecretAction);

            const action = new actionConstructor();
            await action.handle(setupCommand, userQuestion);

            const pattern = /^JWT_SECRET=.{1,}$/;
            const envContents = fs.readFileSync(getOutputPath('.env'), 'utf8');
            const match = envContents.match(pattern);

            expect(fs.existsSync(getOutputPath('.env'))).toBe(true);
            expect(match?.[0]).toBeDefined();
        });

        test("should generate a new jwt secret", async () => {

            // Create the .env file
            fs.writeFileSync(getOutputPath('.env'), 'JWT_SECRET=');

            const questionDTO = questionsArray.find(questionDTO => questionDTO.id === QuestionIDs.jwtSecret);
            const actionConstructor = questionDTO?.actionCtor as new () => IAction;

            userQuestion = QuestionData.createAnsweredYes(questionDTO!)

            expect(questionDTO).toBeDefined();
            expect(questionDTO?.actionCtor).toBe(GenerateJwtSecretAction);

            const action = new actionConstructor();
            await action.handle(setupCommand, userQuestion);

            const pattern = /^JWT_SECRET=.{1,}$/;
            const envContents = fs.readFileSync(getOutputPath('.env'), 'utf8');
            const match = envContents.match(pattern);

            expect(fs.existsSync(getOutputPath('.env'))).toBe(true);
            expect(match?.[0]).toBeDefined();
        });


        test("should not generate a new jwt secret when answer is no", async () => {

            // Create the .env file
            fs.writeFileSync(getOutputPath('.env'), 'JWT_SECRET=');

            const questionDTO = questionsArray.find(questionDTO => questionDTO.id === QuestionIDs.jwtSecret);
            const actionConstructor = questionDTO?.actionCtor as new () => IAction;

            userQuestion = QuestionData.createAnsweredNo(questionDTO!)

            expect(questionDTO).toBeDefined();
            expect(questionDTO?.actionCtor).toBe(GenerateJwtSecretAction);

            const action = new actionConstructor();
            await action.handle(setupCommand, userQuestion);

            expect(fs.existsSync(getOutputPath('.env'))).toBe(true);
            expect(fs.readFileSync(getOutputPath('.env'), 'utf8')).toBe('JWT_SECRET=');
        });

        test("should not overwrite existing jwt secret when answer is no", async () => {

            // Create the .env file
            fs.writeFileSync(getOutputPath('.env'), 'JWT_SECRET=existing-secret');

            const questionDTO = questionsArray.find(questionDTO => questionDTO.id === QuestionIDs.jwtSecret);
            const actionConstructor = questionDTO?.actionCtor as new () => IAction;

            userQuestion = QuestionData.createAnsweredNo(questionDTO!)

            expect(questionDTO).toBeDefined();
            expect(questionDTO?.actionCtor).toBe(GenerateJwtSecretAction);

            const action = new actionConstructor();
            await action.handle(setupCommand, userQuestion);

            expect(fs.existsSync(getOutputPath('.env'))).toBe(true);
            expect(fs.readFileSync(getOutputPath('.env'), 'utf8')).toBe('JWT_SECRET=existing-secret');
        })
    });

    describe("selectDb action", () => {
        test("should select mongodb as a database", async () => {
            const questionDTO = questionsArray.find(questionDTO => questionDTO.id === QuestionIDs.selectDb);
            const actionConstructors = questionDTO?.actionCtors as unknown as new () => IAction[];

            userQuestion = QuestionData.createWithDefinedAnswer(questionDTO!, 'mongodb')

            expect(questionDTO).toBeDefined();
            expect(actionConstructors[0]).toBe(SetupDockerDatabaseScripts);

            const actionSetupDockerDatabaseScripts = new actionConstructors[0]();
            await actionSetupDockerDatabaseScripts.handle(setupCommand, userQuestion);

            const packageJson = SetupService.getInstance().getPackageJsonService().getJsonSync();

            expect(packageJson.scripts['db:up']).toBe('npm db:mongodb:up');
            expect(packageJson.scripts['db:down']).toBe('npm db:mongodb:down');

            const actionSetupDefaultDatabase = new actionConstructors[1]();
            await actionSetupDefaultDatabase.handle(setupCommand, userQuestion);

            const envContents = fs.readFileSync(getOutputPath('.env'), 'utf8');

            expect(envContents).toContain('DATABASE_DEFAULT_CONNECTION=mongodb');
            expect(envContents).toContain('DATABASE_MONGODB_CONNECTION=mongodb');
            expect(envContents).toContain('DATABASE_MONGODB_URI=mongodb://root:example@localhost:27017/app?authSource=admin');
        });

        test("should select postgres as a database", async () => {
            const questionDTO = questionsArray.find(questionDTO => questionDTO.id === QuestionIDs.selectDb);
            const actionConstructors = questionDTO?.actionCtors as unknown as new () => IAction[];

            userQuestion = QuestionData.createWithDefinedAnswer(questionDTO!, 'postgres')

            expect(questionDTO).toBeDefined();
            expect(actionConstructors[0]).toBe(SetupDockerDatabaseScripts);

            const actionSetupDockerDatabaseScripts = new actionConstructors[0]();
            await actionSetupDockerDatabaseScripts.handle(setupCommand, userQuestion);

            const packageJson = SetupService.getInstance().getPackageJsonService().getJsonSync();

            expect(packageJson.scripts['db:up']).toBe('npm db:postgres:up');
            expect(packageJson.scripts['db:down']).toBe('npm db:postgres:down');

            const actionSetupDefaultDatabase = new actionConstructors[1]();
            await actionSetupDefaultDatabase.handle(setupCommand, userQuestion);

            const envContents = fs.readFileSync(getOutputPath('.env'), 'utf8');

            expect(envContents).toContain('DATABASE_DEFAULT_CONNECTION=postgres');
            expect(envContents).toContain('DATABASE_POSTGRES_CONNECTION=postgres');
            expect(envContents).toContain('DATABASE_POSTGRES_URI=postgres://root:example@localhost:5432/app');
        });

        test("should select all databases", async () => {
            const questionDTO = questionsArray.find(questionDTO => questionDTO.id === QuestionIDs.selectDb);
            const actionConstructors = questionDTO?.actionCtors as unknown as new () => IAction[];

            userQuestion = QuestionData.createWithDefinedAnswer(questionDTO!, 'all')

            expect(questionDTO).toBeDefined();
            expect(actionConstructors[0]).toBe(SetupDockerDatabaseScripts);

            const actionSetupDockerDatabaseScripts = new actionConstructors[0]();
            await actionSetupDockerDatabaseScripts.handle(setupCommand, userQuestion);

            const packageJson = SetupService.getInstance().getPackageJsonService().getJsonSync();

            expect(packageJson.scripts['db:up']).toContain('npm db:postgres:up');
            expect(packageJson.scripts['db:up']).toContain('npm db:mongodb:up');
            expect(packageJson.scripts['db:down']).toContain('npm db:postgres:down');
            expect(packageJson.scripts['db:down']).toContain('npm db:mongodb:down');

            const actionSetupDefaultDatabase = new actionConstructors[1]();
            await actionSetupDefaultDatabase.handle(setupCommand, userQuestion);

            const envContents = fs.readFileSync(getOutputPath('.env'), 'utf8');

            expect(envContents).toContain('DATABASE_DEFAULT_CONNECTION=postgres');
            expect(envContents).toContain('DATABASE_POSTGRES_CONNECTION=postgres');
            expect(envContents).toContain('DATABASE_POSTGRES_URI=postgres://root:example@localhost:5432/app');
            expect(envContents).toContain('DATABASE_MONGODB_CONNECTION=mongodb');
            expect(envContents).toContain('DATABASE_MONGODB_URI=mongodb://root:example@localhost:27017/app?authSource=admin');
        });
    });

    describe("enableExpress action", () => {

        test("should enable express using default value", async () => {
            const questionDTO = questionsArray.find(questionDTO => questionDTO.id === QuestionIDs.enableExpress);
            const actionConstructor = questionDTO?.actionCtor as new () => IAction;

            userQuestion = QuestionData.createWithDefinedAnswer(questionDTO!)

            const actionEnableExpress = new actionConstructor();
            await actionEnableExpress.handle(setupCommand, userQuestion);

            const envContents = fs.readFileSync(getOutputPath('.env'), 'utf8');

            expect(envContents).toContain('EXPRESS_ENABLED=true');
        });

        test("should enable express", async () => {
            const questionDTO = questionsArray.find(questionDTO => questionDTO.id === QuestionIDs.enableExpress);
            const actionConstructor = questionDTO?.actionCtor as new () => IAction;

            userQuestion = QuestionData.createAnsweredYes(questionDTO!)

            const actionEnableExpress = new actionConstructor();
            await actionEnableExpress.handle(setupCommand, userQuestion);

            const envContents = fs.readFileSync(getOutputPath('.env'), 'utf8');

            expect(envContents).toContain('EXPRESS_ENABLED=true');
        });

        test("should disable express", async () => {
            const questionDTO = questionsArray.find(questionDTO => questionDTO.id === QuestionIDs.enableExpress);
            const actionConstructor = questionDTO?.actionCtor as new () => IAction;

            userQuestion = QuestionData.createAnsweredNo(questionDTO!)

            const actionEnableExpress = new actionConstructor();
            await actionEnableExpress.handle(setupCommand, userQuestion);

            const envContents = fs.readFileSync(getOutputPath('.env'), 'utf8');

            expect(envContents).toContain('EXPRESS_ENABLED=false');
        });

    });

    describe("appPort action", () => {
        test("should set the app port using default value", async () => {
            const questionDTO = questionsArray.find(questionDTO => questionDTO.id === QuestionIDs.appPort);
            const actionConstructor = questionDTO?.actionCtor as new () => IAction;

            userQuestion = QuestionData.createAnswerNull(questionDTO!)

            const action = new actionConstructor();
            await action.handle(setupCommand, userQuestion);

            const envContents = fs.readFileSync(getOutputPath('.env'), 'utf8');

            expect(envContents).toContain('APP_PORT=5000');
        })

        test("should set the app port using provided value", async () => {
            const questionDTO = questionsArray.find(questionDTO => questionDTO.id === QuestionIDs.appPort);
            const actionConstructor = questionDTO?.actionCtor as new () => IAction;

            userQuestion = QuestionData.createWithDefinedAnswer(questionDTO!, '3000')

            const action = new actionConstructor();
            await action.handle(setupCommand, userQuestion);

            const envContents = fs.readFileSync(getOutputPath('.env'), 'utf8');

            expect(envContents).toContain('APP_PORT=3000');
        })

        test("should use default value if provided value is invalid", async () => {
            const questionDTO = questionsArray.find(questionDTO => questionDTO.id === QuestionIDs.appPort);
            const actionConstructor = questionDTO?.actionCtor as new () => IAction;

            userQuestion = QuestionData.createWithDefinedAnswer(questionDTO!, 'invalid')

            const action = new actionConstructor();
            await action.handle(setupCommand, userQuestion);

            const envContents = fs.readFileSync(getOutputPath('.env'), 'utf8');

            expect(envContents).toContain('APP_PORT=5000');
        })
    });

    describe("enableAuthRoutes action", () => {
        test("should enable auth routes using default value", async () => {
            const questionDTO = questionsArray.find(questionDTO => questionDTO.id === QuestionIDs.enableAuthRoutes);
            const actionConstructor = questionDTO?.actionCtor as new () => IAction;

            userQuestion = QuestionData.createWithDefinedAnswer(questionDTO!, '')

            const actionEnableAuthRoutes = new actionConstructor();
            await actionEnableAuthRoutes.handle(setupCommand, userQuestion);

            const envContents = fs.readFileSync(getOutputPath('.env'), 'utf8');

            expect(envContents).toContain('ENABLE_AUTH_ROUTES=true');
        });

        test("should enable auth routes using default value", async () => {
            const questionDTO = questionsArray.find(questionDTO => questionDTO.id === QuestionIDs.enableAuthRoutes);
            const actionConstructor = questionDTO?.actionCtor as new () => IAction;

            userQuestion = QuestionData.createAnswerNull(questionDTO!)

            const actionEnableAuthRoutes = new actionConstructor();
            await actionEnableAuthRoutes.handle(setupCommand, userQuestion);

            const envContents = fs.readFileSync(getOutputPath('.env'), 'utf8');

            expect(envContents).toContain('ENABLE_AUTH_ROUTES=true');
        });

        test("should disable auth routes when answer is no", async () => {
            const questionDTO = questionsArray.find(questionDTO => questionDTO.id === QuestionIDs.enableAuthRoutes);
            const actionConstructor = questionDTO?.actionCtor as new () => IAction;

            userQuestion = QuestionData.createAnsweredNo(questionDTO!)

            const actionEnableAuthRoutes = new actionConstructor();
            await actionEnableAuthRoutes.handle(setupCommand, userQuestion);

            const envContents = fs.readFileSync(getOutputPath('.env'), 'utf8');

            expect(envContents).toContain('ENABLE_AUTH_ROUTES=false');
        });
    });
})