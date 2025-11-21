import { isTruthy } from "@larascript-framework/larascript-validator";
import QuestionData from "../DTOs/QuestionData.js";
import { IAction } from "../interfaces/IAction.js";
import { ISetupCommand } from "../interfaces/ISetupCommand.js";
import { SetupService } from "../services/SetupService.js";

export class GenerateAppKeyAction implements IAction {

    async handle(ref: ISetupCommand, question: QuestionData): Promise<any> {
        const answer = question.getUserAnswerOrDefaultAnswer();
        let value: string = isTruthy(answer) ? 'true' : 'false'

        if(value === 'false') {
            return;
        }

        const appKey = SetupService.getInstance().getCryptoService().generateAppKey()

        await ref.env.updateValues({ APP_KEY: appKey });

        ref.writeLine('Successfully generated app key!');
    }

}

export default GenerateAppKeyAction