export default class MigrationError extends Error {

    constructor(message: string = 'Migration error') {
        super(message);
        this.name = 'MigrationError';
    }

}