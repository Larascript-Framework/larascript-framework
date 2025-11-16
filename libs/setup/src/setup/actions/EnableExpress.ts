import { isTruthy } from "@larascript-framework/larascript-validator";
import QuestionData from "../DTOs/QuestionData.js";
import { IAction } from "../interfaces/IAction.js";
import { ISetupCommand } from "../interfaces/ISetupCommand.js";

export class EnableExpress implements IAction {

    async handle(ref: ISetupCommand, question: QuestionData): Promise<void> {
        const answer = question.getUserAnswerOrDefaultAnswer()
        let value: string = isTruthy(answer) ? 'true' : 'false'

        if(answer === null || answer?.length === 0) {
            ref.writeLine(`Using default answer: ${value}`)
        }

        await ref.env.updateValues({ EXPRESS_ENABLED: value });
    }

}

export default EnableExpress