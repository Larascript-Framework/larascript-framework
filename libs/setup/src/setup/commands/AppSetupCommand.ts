import QuestionData from "../DTOs/QuestionData.js";
import { BaseSetupCommand } from "../index.js";
import buildQuestionDTOs from "../utils/buildQuestionDTOs.js";
/**
 * Command to run the setup process
 */
export class AppSetupCommand extends BaseSetupCommand {

    /**
     * The command signature
     */
    public signature = 'app:setup';

    /**
     * The command description
     */
    public description = 'Runs the app setup process.';

    /**
     * The questions to ask the user
     */
    protected questions!: QuestionData[];

    /**
     * Writes a line to the console
     * @param text 
     */
    writeLine = (text: string = '') => {
        this.input.writeLine(text);
    }

    /**
     * Executes the command
     */
    async execute() {
        let count = 1;

        this.input.clearScreen();
        this.writeLine('--- Larascript Setup ---');
        this.writeLine();
        this.writeLine('Setup Preview:');

        this.questions = buildQuestionDTOs();
        this.questions.forEach(question => {
            this.writeLine(`- ${question.getPreviewText()}`);
        });

        this.writeLine();
        await this.input.waitForEnter('When ready, press Enter to continue');
        
        for(const i in this.questions) {
            const question = this.questions[i];
            
            this.input.clearScreen()
            
            await this.processQuestionDTO(count, question)

            count++;
            this.questions[parseInt(i)] = question
        }
 
        this.input.clearScreen();

        this.writeLine('');
        this.writeLine('  ╔═══════════════════════════════════════╗');
        this.writeLine('  ║          SETUP COMPLETE! 🎉           ║');
        this.writeLine('  ╚═══════════════════════════════════════╝');
        this.writeLine('');
        this.writeLine('         🚀 Ready for takeoff! 🚀');
        this.writeLine('');
        this.writeLine('  ⭐️ Happy coding! May your code be bug-free ⭐️');
        this.writeLine('');
        this.writeLine('      Why did the programmer quit his job?');
        this.writeLine('       Because he didn\'t get arrays! 📊');
        this.writeLine('');
    }

    /**
     * Determines if a question should be processed
     * @param question 
     * @param previousQuestion 
     * @returns 
     */
    questionIsApplicable = (question: QuestionData): boolean =>{

        if(!question.applicableOnly) {
            return true;
        }
        
        const ifId = question.applicableOnly.ifId;
        const ifIdQuestion = this.questions.find(q => q.id === ifId) as QuestionData;
        const matchesAnswer = question.applicableOnly.answerIncludes.includes(ifIdQuestion.getUserAnswerOrDefaultAnswer() as string)

        if(!matchesAnswer) {
            return false;
        }

        return true;
    }

    /**
     * Processes questions, statements and actions
     * 
     * @param question 
     */
    processQuestionDTO = async (count: number, question: QuestionData) =>{

        if(!this.questionIsApplicable(question)) {
            return;
        }

        await this.processStatement(count, question);
        await this.processQuestion(count, question);
        await this.processAction(question);
        await this.processMultipleActions(question);
    }

    /**
     * Writes a statement to the console
     * 
     * @param question 
     * @returns 
     */
    processStatement = async (count: number, question: QuestionData) => {
        if (!question.statement) {
            return;
        }

        this.writeLine(`[${count}]: ${question.getText()}`);
        this.writeLine();
        await this.input.waitForEnter();
    }

    /**
     * Asks a question to the user
     * 
     * @param question 
     * @returns 
     */
    processQuestion = async (count: number, question: QuestionData) => {
        if (question.statement) {
            return;
        }

        this.writeLine(`[${count}]: ${question.getText()}`);

        if (question.defaultValue) {
            this.writeLine(`Default: ${question.defaultValue}`);
        }

        question.answer = await this.input.askQuestion('');

        if (question.acceptedAnswers && !question.acceptedAnswers.includes(question.answer)) {
            this.writeLine(`Unexpected answer. Please try again.`);
            await this.input.waitForEnter();
            return await this.processQuestion(count, question);
        }

        const value: string = this.input.normalizeAnswer(question.answer, question.defaultValue ?? '');

        await this.env.updateValues({ [question.id]: value });
    }
    
    /**
     * Runs the action
     * 
     * @param question 
     * @returns 
     */
    processAction = async (question: QuestionData) => {
        if (!question.actionCtor) {
            return;
        }

        const action = new question.actionCtor();
        await action.handle(this, question);
    }

    /**
     * Runs multiple actions
     * 
     * @param question 
     * @returns 
     */
    processMultipleActions = async (question: QuestionData) => {
        if (!question.actionCtors) {
            return;
        }

        for (const actionCtor of question.actionCtors) {
            const action = new actionCtor();
            await action.handle(this, question);
        }
    }

}

export default AppSetupCommand
