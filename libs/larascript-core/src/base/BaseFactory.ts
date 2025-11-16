import { faker } from "@faker-js/faker";
import { IFactory } from "@larascript-framework/contracts/larascript-core";

/**
 * Abstract base class for factories that create instances of a specific model.
 *
 * @template Model The type of model to create.
 * @template Data The type of data to pass to the model constructor.
 */
export abstract class BaseFactory<Data> implements IFactory<Data> {

    /**
     * The faker instance to use.
     */
    protected faker = faker;

    /**
     * Get the definition of the model.
     * 
     * @returns The definition of the model.
     */
    abstract getDefinition(): unknown;

    /**
     * Creates a new instance of the model.
     *
     * @param data The data to pass to the model constructor.
     * @returns A new instance of the model.

     */
    create(data?: Data): Data {
        const definition = this.getDefinition()

        return {
            ...(typeof definition === 'object' ? definition : {}),
            ...(data ?? {})
        } as Data;
    }

    /**
     * Creates a new instance of the model with the given data.
     */
    createWithData(data: Data): Data {
        return { ...data } as Data;
    }

}
