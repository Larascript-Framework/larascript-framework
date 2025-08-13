import QuestionDTO from "@src/core/domains/setup/DTOs/QuestionDTO";
import { IAction } from "@src/core/domains/setup/interfaces/IAction";
import { ISetupCommand } from "@src/core/domains/setup/interfaces/ISetupCommand";
import { cryptoService } from "@src/core/services/CryptoService";

class GenerateAppKeyAction implements IAction {

    async handle(ref: ISetupCommand, question: QuestionDTO): Promise<any> {
        const answerIsYes = question.getAnswer() === 'y' || question.getAnswer() === 'yes';

        if(!answerIsYes) {
            return;
        }

        const appKey = cryptoService().generateAppKey()

        await ref.env.updateValues({ APP_KEY: appKey });

        ref.writeLine('Successfully generated app key!');
    }

}

export default GenerateAppKeyAction