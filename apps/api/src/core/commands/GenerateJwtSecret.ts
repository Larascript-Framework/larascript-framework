import { app } from "@/core/services/App.js";
import { BaseCommand } from "@larascript-framework/larascript-console";

class GenerateJwtSecret extends BaseCommand {

    signature = 'auth:generate-jwt-secret';

    async execute() {

        this.input.writeLine('--- Generate JWT Secret ---');
        const answer = await this.input.askQuestion('Re-generate JWT Secret? This will update your .env file. (y/n)')
        

        if (answer !== 'y') {
            return;
        }

        const secret = require('crypto').randomBytes(64).toString('hex');

        await app('envService').updateValues({ JWT_SECRET: secret });

        this.input.writeLine('Successfully generated jwt secret!');
    }

}

export default GenerateJwtSecret