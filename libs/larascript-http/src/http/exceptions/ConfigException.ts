export class ConfigException extends Error {

    constructor(message: string = 'Config Exception') {
        super(message);
        this.name = 'ConfigException';
    }

}

export default ConfigException;