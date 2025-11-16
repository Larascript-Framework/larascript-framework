import { BaseCommand, CommandExecutionException } from "@larascript-framework/larascript-console";
import { Str } from "@larascript-framework/larascript-utils";
import { IMakeFileArguments } from "../interfaces/IMakeFileArguments.js";
import { IMakeOptions } from "../interfaces/IMakeOptions.js";
import ArgumentObserver from "../observers/ArgumentObserver.js";
import MakeFileService from "../services/MakeFileService.js";
import MakeServices from "../services/MakeServices.js";

const DefaultOptions: Partial<IMakeOptions> = {
    startWithLowercase: false
}

/**
 * Base logic for making a new file
 */
export class BaseMakeFileCommand extends BaseCommand {

    public keepProcessAlive = false;

    /**
     * Options for the make command
     */
    protected options!: IMakeOptions;

    /**
     * Service for creating a new file
     */
    protected makeFileService!: MakeFileService;

    /**
     * Observer for watching argument changes
     */
    protected argumentObserver!: ArgumentObserver;

    /**
     * Arguments for the make command
     */
    protected makeFileArguments!: IMakeFileArguments;

    /**
     * Constructor
     * @param options Options for the make command
     */
    constructor(options: IMakeOptions) {
        super();
        options = { ...DefaultOptions, ...options };
        this.signature = options.signature;
        this.description = options.description;
        this.options = options;
        this.argumentObserver = new ArgumentObserver();
    }

    /**
     * Prepare the arguments
     * 'name' converts to lower/uppercase depending on options
     * 'collection' is optional and automatically set based on the 'name' arguement
     */
    protected prepareArguments(): void {
        if (!this.getArguementByKey('name')?.value) {
            throw new CommandExecutionException('--name argument not specified');
        }

        this.makeFileArguments = {
            name: this.getArguementByKey('name')?.value as string,
            collection: this.getArguementByKey('collection')?.value
        }

        // Set a default collection, if required
        this.argumentObserver.onCustom('setDefaultCollection', this.makeFileArguments, this.options).then(data => this.makeFileArguments = data);

        // Set name the name (lower or upper depending on options)
        this.argumentObserver.onCustom('setName', this.makeFileArguments, this.options).then(data => this.makeFileArguments = data);

        // Ensure the file ends with the specified value
        this.argumentObserver.onCustom('setEndsWith', this.makeFileArguments, this.options).then(data => this.makeFileArguments = data);

        this.setOverwriteArg('name', this.makeFileArguments.name);

        if (this.makeFileArguments.collection) {
            this.setOverwriteArg('collection', this.makeFileArguments.collection);
        }
    }

    /**
     * Prepare the make file service
     */
    protected prepareMakeFileService(): void {
        this.makeFileService = new MakeFileService(this.options, this.makeFileArguments);
    }

    /**
     * Base logic for making a new file
     */
    async execute() {
        this.prepareArguments();
        this.prepareMakeFileService();

        // Get the template, inject the arguements
        const template = await this.getTemplateWithInjectedArguments();

        // Assuming every make command has a name argument
        const name = this.getArguementByKey('name')?.value as string;

        if (this.makeFileService.existsInTargetDirectory()) {
            throw new CommandExecutionException(`File already exists with name '${name}', full path: ${this.makeFileService.getTargetDirFullPath()}`);
        }

        // Write the new file
        this.makeFileService.writeContent(template);

        MakeServices.getInstance().getLoggerService()?.info(`Created ${this.options.makeType}: ` + this.makeFileService.getTargetDirFullPath());

        if(MakeServices.getInstance().getProcessExit()) {
            process.exit(0);
        }
    }

    /**
     * Get template contents with injected argument values
     */
    getTemplateWithInjectedArguments = async (): Promise<string> => {
        const { argsOptional = [] } = this.options

        // Fetch the template
        let contents = (await this.makeFileService.getTemplateContents())

        // Inject the arguements
        Object.keys(this.makeFileArguments).forEach(argumentKey => {
            let value = this.makeFileArguments[argumentKey];

            if (!value && !argsOptional.includes(argumentKey)) {
                throw new CommandExecutionException(`--${argumentKey} argument not specified`);
            }

            // Convert to safe method for class names and other places as code the name is used
            if (argumentKey === 'name') {
                value = Str.convertToSafeMethod(value)
            }

            // Inject the arguements
            const pattern = new RegExp('#' + argumentKey + '#', 'g');
            contents = contents.replace(pattern, value);
        });

        return contents
    }

    /**
     * Ensure a file always ends with the specified value
     * @param endsWith 
     */
    ensureFileEndsWith(endsWith: string) {
        let name = this.getArguementByKey('name')?.value;

        if (name && !name?.endsWith(endsWith)) {
            name = `${name}${endsWith}`;

            this.setOverwriteArg('name', name)
        }
    }

    public getMakeFileService(): MakeFileService {
        return this.makeFileService
    }

}

export default BaseMakeFileCommand;