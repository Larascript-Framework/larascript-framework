import { isTruthy } from "@larascript-framework/larascript-validator";
import QuestionData from "../DTOs/QuestionData.js";
import { IAction } from "../interfaces/IAction.js";
import { ISetupCommand } from "../interfaces/ISetupCommand.js";

export class AuthEnableRoutes implements IAction {

    async handle(ref: ISetupCommand, question: QuestionData): Promise<void> {
        const answer = question.getUserAnswerOrDefaultAnswer()
        let value: string = isTruthy(answer) ? 'true' : 'false'

        if(value === 'false') {
            value = 'false';
        }

        await ref.env.updateValues({ ENABLE_AUTH_ROUTES: value });
    }

}

export default AuthEnableRoutes