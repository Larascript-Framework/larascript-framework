import { Observer } from "@larascript-framework/larascript-observer";
import { Str } from "@larascript-framework/larascript-utils";
import { IMakeFileArguments } from "../interfaces/IMakeFileArguments.js";
import { IMakeOptions } from "../interfaces/IMakeOptions.js";

/**
 * ArgumentObserver is responsible for modifying the make file arguments
 * based on the options
 */
class ArgumentObserver<T extends IMakeFileArguments = IMakeFileArguments> extends Observer<IMakeFileArguments> {

    /**
     * Sets the argument name, depending on the options.startWithLowercase
     * @param data 
     * @param options 
     * @returns 
     */
    setName(data: T, options: IMakeOptions): T {
        if(!data.name) {
            throw new Error('Argument name cannot be empty')
        }

        if(options.startWithLowercase) {
            data.name = Str.startWithLowercase(data.name)
        }
        else {
            data.name = Str.startWithUppercase(data.name)
        }

        return data
    }

    /**
     * 
     * @param data 
     * @param options 
     * @returns 
     */
    setEndsWith(data: T, options: IMakeOptions): T {
        if(!data.name ) {
            throw new Error('Argument name cannot be empty')
        }
        if(typeof options.endsWith !== 'string') {
            return data
        }

        if(!data.name.toLowerCase().endsWith(options.endsWith.toLowerCase())) { 
            data.name = `${data.name}${options.endsWith}`
        }

        return data
    }

    /**
     * Sets the default collection name
     * @param data 
     * @param options 
     * @returns 
     */
    setDefaultCollection = (data: T): T => {

        if(!data.name) {
            throw new Error('Argument name cannot be empty')
        }

        if(!data.collection) {
            data.collection = Str.camelCase(Str.plural(data.name))
        }

        return data
    }

}

export default ArgumentObserver