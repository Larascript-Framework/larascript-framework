import { ActionCtor } from "../interfaces/IAction.js";

type ApplicableOnly = {
    ifId: string,
    answerIncludes: string[]
}

type Props = {
    id: string;
    question?: string | null;
    statement?: string | null;
    defaultValue?: string | null;
    previewText?: string | null;
    answer?: string | null;
    actionCtor?: ActionCtor | null;
    actionCtors?: ActionCtor[] | null;
    acceptedAnswers?: string[] | null;
    applicableOnly?: ApplicableOnly | null
}


/**
 * Data Transfer Object for questions in the setup process
 */
export class QuestionData {

    /**
     * Unique identifier for the question
     */
    public id: string;

    /**
     * The question that will be asked to the user
     */
    public question: string | null;

    /**
     * The statement to be displayed to the user. If this is null, question will be used.
     */
    public statement: string | null;

    /**
     * The text to be displayed as the preview for the question.
     * If this is not set, the question or statement will be used.
     */
    public previewText: string | null;

    /**
     * The default value of the answer. If the user does not answer, this will be used.
     */
    public defaultValue: string | null;
 
    /**
     * The answer given by the user. If null, the default value will be used.
     */
    public answer: string | null = null;

    /**
     * The action constructor to be used for the answer of this question.
     */
    public actionCtor: ActionCtor | null = null;

    /**
     * The action constructors to be used for the answer of this question.
     */
    public actionCtors: ActionCtor[] | null = null;

    /**
     * The accepted answers for this question. If not set, the user will be reprompted.
     */
    public acceptedAnswers: string[] | null = null;

    /**
     * The conditions under which this question should be asked.
     * If not set, the question will be asked regardless of the previous answers.
     */
    public applicableOnly: ApplicableOnly | null = null

    /**
     * Constructor for the QuestionDTO
     * @param {Props} props The properties for the QuestionDTO
     */
    constructor({
        id,
        question = null,
        statement = null,
        previewText = null,
        defaultValue = null,
        answer = null,
        actionCtor = null,
        actionCtors = null,
        acceptedAnswers = null,
        applicableOnly = null
    }: Props) {
        if(typeof question !== 'string' && typeof statement !== 'string') {
            throw new Error('Missing question or statement')
        }

        this.id = id;
        this.question = question;
        this.statement = statement;
        this.previewText = previewText;
        this.defaultValue = defaultValue;
        this.answer = answer;
        this.actionCtor = actionCtor;
        this.actionCtors = actionCtors;
        this.acceptedAnswers = acceptedAnswers;
        this.applicableOnly = applicableOnly
    }

    /**
     * Creates a new QuestionDTO with the answer of 'y'.
     * @param id The id of the question.
     * @returns {QuestionData} The new QuestionDTO.
     */
    static createAnsweredYes(questionDTO: QuestionData): QuestionData {
        return new QuestionData({
            ...questionDTO,
            answer: 'yes'
        })
    }

    /**
     * Creates a new QuestionDTO with the answer of 'no'.
     * @param questionDTO The QuestionDTO to create a new QuestionDTO from.
     * @returns {QuestionData} The new QuestionDTO.
     */
    static createAnsweredNo(questionDTO: QuestionData): QuestionData {
        return new QuestionData({
            ...questionDTO,
            answer: 'no'
        })
    }

    /**
     * Creates a new QuestionDTO with the given answer.
     * @param id The id of the question.
     * @param answer The answer to the question.
     * @returns {QuestionData} The new QuestionDTO.
     */
    static createWithDefinedAnswer(questionDTO: QuestionData, answer: string | null = null): QuestionData {
        return new QuestionData({
            ...questionDTO,
            answer
        })
    }

    /**
     * Creates a new QuestionDTO with the given answer.
     * @param id The id of the question.
     * @param answer The answer to the question.
     * @returns {QuestionData} The new QuestionDTO.
     */
    static createAnswerNull(questionDTO: QuestionData): QuestionData {
        return new QuestionData({
            ...questionDTO,
            answer: null
        })
    }

    /**
     * Creates a new QuestionDTO with the answer of the given QuestionDTO.
     * @param questionDTO The QuestionDTO to create a new QuestionDTO from.
     * @returns {QuestionData} The new QuestionDTO.
     */
    withQuestionDTO(questionDTO: QuestionData): QuestionData {
        return new QuestionData({
            ...questionDTO,
            answer: questionDTO.getUserAnswerOrDefaultAnswer()
        })
    }



    /**
     * Gets the text of the question. If the question is null, the statement is used.
     * @returns {string} The text of the question
     */
    public getText(): string {
        if(this.question) {
            return this.question
        }
        return this.statement as string
    }

    /**
     * Gets the answer of the question. If the answer is null, the default value is used.
     * @returns {string | null} The answer of the question
     */
    public getUserAnswerOrDefaultAnswer(): string | null {
        if(this.answer === null || this.answer?.length === 0) {
            return this.defaultValue
        }
        return this.answer
    }

    /**
     * Gets the preview text of the question. If the previewText is null, the question or statement is used.
     * @returns {string | null} The preview text of the question
     */
    public getPreviewText(): string | null {
        if(!this.previewText) {
            return this.getText()
        }
        return this.previewText
    }

}

export default QuestionData
