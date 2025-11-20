import { createOutputPath } from "./createOutputPath.js";
import { deleteOutput } from "./deleteOutput.js";

export const clearOutputFiles = () => {
    deleteOutput();
    createOutputPath();
}