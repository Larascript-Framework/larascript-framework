import { isTruthy } from "@larascript-framework/larascript-validator";
import QuestionData from "../DTOs/QuestionData.js";
import { IAction } from "../interfaces/IAction.js";
import { ISetupCommand } from "../interfaces/ISetupCommand.js";
import { SetupService } from "../services/SetupService.js";

export class GenerateJwtSecretAction implements IAction {

    async handle(ref: ISetupCommand, question: QuestionData): Promise<any> {
        const answer = question.getUserAnswerOrDefaultAnswer();
        let value: string = isTruthy(answer) ? 'true' : 'false'

        if(value === 'false') {
            return;
        }

        const secret = SetupService.getInstance().getCryptoService().generateBytesAsString(64);

        await ref.env.updateValues({ JWT_SECRET: secret });

        ref.writeLine('Successfully generated jwt secret!');
    }

}

export default GenerateJwtSecretAction