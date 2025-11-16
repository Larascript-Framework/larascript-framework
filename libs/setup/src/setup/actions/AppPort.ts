import QuestionData from "../DTOs/QuestionData.js";
import { IAction } from "../interfaces/IAction.js";
import { ISetupCommand } from "../interfaces/ISetupCommand.js";

export class AppPort implements IAction {

    async handle(ref: ISetupCommand, question: QuestionData): Promise<void> {
        const answer = question.getUserAnswerOrDefaultAnswer()
        let port = 5000

        if(answer === null || answer?.length === 0) {
            ref.writeLine(`Using default port: ${port}`)
        }

        if(isNaN(parseInt(answer ?? ''))) {
            ref.writeLine(`Invalid port: ${answer}, using default port: ${port}`)
        }
        else if (answer) {
            port = parseInt(answer)
        }

        await ref.env.updateValues({ APP_PORT: port.toString() });
    }

}

export default AppPort